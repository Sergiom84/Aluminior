import { describe, expect, it } from 'vitest'
import { construirAmbitos, type ElementoPlantilla } from './ambitos.ts'
import { evaluarAsociaciones } from './evaluar.ts'
import { opcionesMarcadas } from './opciones.ts'
import type { ReglaAsociacion } from './tipos.ts'

// Datos sintéticos con la forma de una corredera de dos hojas y un fijo.
const regla = (parcial: Partial<ReglaAsociacion> & Pick<ReglaAsociacion, 'id' | 'conjunto' | 'articulo'>): ReglaAsociacion => ({
  cantidad: 1, acabado: '---A', intervalo: 0, medidaMin: 0, medidaMax: 0, unidadesMin: 0, unidadesMax: 0,
  tipoMedida: 'C', descuento: 0, formulaLargo: null, formulaAncho: null, soloUna: false, componente: '!',
  grupo: '!', grupoAsociacion: null, modulos: null, articuloPrincipal: null, opcion: null, formulaOpcion: null,
  apertura: 0, mano: null, posicionTrabajo: null, asociadoA: 'X', ...parcial,
})

const corredera: ElementoPlantilla[] = [
  { componente: '12', grupo: 'MV', cantidad: 1, medidaMm: 1300, articulo: 'MARCO-V', funcion: 'MV', posicionTrabajo: 'L', hoja: 0, tipoHoja: '-1' },
  { componente: '12', grupo: 'MV', cantidad: 1, medidaMm: 1300, articulo: 'MARCO-V', funcion: 'MV', posicionTrabajo: 'L', hoja: 0, tipoHoja: '-1' },
  { componente: '10', grupo: 'MH', cantidad: 1, medidaMm: 1000, articulo: 'MARCO-I', funcion: 'MH', posicionTrabajo: 'A', hoja: 0, tipoHoja: '-1' },
  ...[1, 2].flatMap((hoja): ElementoPlantilla[] => [
    { componente: '21', grupo: 'HVL', cantidad: 1, medidaMm: 1250, articulo: 'HOJA-L', funcion: 'HV', posicionTrabajo: 'L', hoja, tipoHoja: '10' },
    { componente: '22', grupo: 'HVC', cantidad: 1, medidaMm: 1250, articulo: 'HOJA-C', funcion: 'HV', posicionTrabajo: 'L', hoja, tipoHoja: '10' },
    { componente: 'EHH', grupo: 'HH', cantidad: 1, medidaMm: 500, funcion: 'infEHH', hoja, tipoHoja: '10' },
  ]),
]

const ambitosCorredera = () => construirAmbitos({
  serie: 'SERIE', esAccesorio: false, anchoMm: 1040, altoMm: 1300, elementos: corredera,
  conjuntoHerraje: t => t === '10' ? 'HERR2' : null,
}).ambitos

const porMetro = new Set(['FELPUDO', 'EMBELLECEDOR'])
const esPorMetro = (a: string) => a === 'DESCONOCIDO' ? null : porMetro.has(a)

describe('evaluarAsociaciones', () => {
  it('emite una fila por elemento, con la medida del elemento en artículos por metro', () => {
    const reglas = new Map([['HERR2', [
      regla({ id: '1', conjunto: 'HERR2', articulo: 'FELPUDO', cantidad: 2, componente: '21' }),
      regla({ id: '2', conjunto: 'HERR2', articulo: 'FELPUDO', cantidad: 4, componente: 'EHH' }),
    ]]])
    const r = evaluarAsociaciones({ ambitos: ambitosCorredera(), reglas, opciones: new Map(), gruposAsociacion: new Map(), esPorMetro })
    expect(r.incidencias).toEqual([])
    expect(r.asociados.map(a => [a.articulo, a.cantidad, a.largoMm])).toEqual([
      ['FELPUDO', 2, 1250], ['FELPUDO', 2, 1250], ['FELPUDO', 4, 500], ['FELPUDO', 4, 500],
    ])
  })

  it('evalúa la serie contra el marco y los virtuales, y el herraje contra sus hojas', () => {
    const reglas = new Map([
      ['SERIE', [
        regla({ id: 's1', conjunto: 'SERIE', articulo: 'KIT', componente: '10' }),
        regla({ id: 's2', conjunto: 'SERIE', articulo: 'KIT-HOJA', componente: '21' }),
        regla({ id: 's3', conjunto: 'SERIE', articulo: 'PATILLA', componente: 'A', unidadesMin: 2 }),
      ]],
      ['HERR2', [regla({ id: 'h1', conjunto: 'HERR2', articulo: 'CIERRE', componente: '10' })]],
    ])
    const r = evaluarAsociaciones({ ambitos: ambitosCorredera(), reglas, opciones: new Map(), gruposAsociacion: new Map(), esPorMetro })
    expect(r.asociados.map(a => [a.articulo, a.cantidad])).toEqual([['KIT', 1], ['PATILLA', 2]])
  })

  it('las uniones no reciben asociaciones de la serie', () => {
    const { ambitos } = construirAmbitos({
      serie: 'SERIE', esAccesorio: true, anchoMm: 0, altoMm: 1300, elementos: [], conjuntoHerraje: () => null,
    })
    expect(ambitos).toEqual([])
  })

  it('aplica opciones, apertura, descuento y una sola vez', () => {
    const reglas = new Map([
      ['SERIE', [
        regla({ id: 'a', conjunto: 'SERIE', articulo: 'EMBELLECEDOR', componente: '12', opcion: '13', descuento: 21.5, soloUna: true, acabado: '---P' }),
        regla({ id: 'b', conjunto: 'SERIE', articulo: 'EMBELLECEDOR', componente: '12', opcion: '15', descuento: 27, soloUna: true }),
      ]],
      ['HERR2', [
        regla({ id: 'c', conjunto: 'HERR2', articulo: 'RUEDA', componente: 'EHH', cantidad: 2, apertura: 10, opcion: '2' }),
        regla({ id: 'd', conjunto: 'HERR2', articulo: 'RUEDA-PUERTA', componente: 'EHH', cantidad: 2, apertura: 16, opcion: '2' }),
      ]],
    ])
    const opciones = opcionesMarcadas(['SERIE', 'HERR2'], [
      { conjunto: 'SERIE', opcion: '13', porDefecto: true }, { conjunto: 'SERIE', opcion: '15', porDefecto: false },
      { conjunto: 'HERR2', opcion: '2', porDefecto: true },
    ], [])
    const r = evaluarAsociaciones({ ambitos: ambitosCorredera(), reglas, opciones, gruposAsociacion: new Map(), esPorMetro })
    expect(r.asociados.map(a => [a.articulo, a.cantidad, a.largoMm, a.acabado])).toEqual([
      ['EMBELLECEDOR', 1, 1278.5, '---P'], ['RUEDA', 2, null, '---A'], ['RUEDA', 2, null, '---A'],
    ])
  })

  it('la selección guardada de un conjunto sustituye a los valores por defecto', () => {
    const opciones = opcionesMarcadas(['SERIE', 'HERR2'],
      [{ conjunto: 'SERIE', opcion: '13', porDefecto: true }, { conjunto: 'HERR2', opcion: '2', porDefecto: true }],
      [{ conjunto: 'SERIE', opcion: '13', marcada: false }, { conjunto: 'SERIE', opcion: '15', marcada: true }])
    expect([...opciones.get('SERIE')!]).toEqual(['15'])
    expect([...opciones.get('HERR2')!]).toEqual(['2'])
  })

  it('cuenta la cantidad del elemento y resuelve grupos de asociación', () => {
    const elementos: ElementoPlantilla[] = [
      { componente: '58', cantidad: 4, medidaMm: 1200, funcion: 'infHAesc', hoja: 0, tipoHoja: '-1' },
      { componente: '12', cantidad: 1, medidaMm: 1200, articulo: 'PERFIL-M', funcion: 'MV', posicionTrabajo: 'L', hoja: 0, tipoHoja: '-1' },
      { componente: '12', cantidad: 1, medidaMm: 1200, articulo: 'PERFIL-M', funcion: 'MV', posicionTrabajo: 'L', hoja: 0, tipoHoja: '-1' },
      { componente: '11', cantidad: 1, medidaMm: 800, articulo: 'PERFIL-M', funcion: 'MH', posicionTrabajo: 'A', hoja: 0, tipoHoja: '-1' },
      { componente: '10', cantidad: 1, medidaMm: 800, articulo: 'PERFIL-M', funcion: 'MH', posicionTrabajo: 'A', hoja: 0, tipoHoja: '-1' },
    ]
    const { ambitos } = construirAmbitos({ serie: 'S', esAccesorio: false, anchoMm: 800, altoMm: 1200, elementos, conjuntoHerraje: () => null })
    const reglas = new Map([['S', [
      regla({ id: '1', conjunto: 'S', articulo: 'ESC-ALIN', componente: '58' }),
      regla({ id: '2', conjunto: 'S', articulo: 'ESC-HOJA', componente: '58', cantidad: 2, articuloPrincipal: 'PERFIL-M', posicionTrabajo: 'A' }),
      regla({ id: '3', conjunto: 'S', articulo: 'ESC-OTRA', componente: '58', cantidad: 2, articuloPrincipal: 'OTRO' }),
      regla({ id: '4', conjunto: 'S', articulo: 'JUNTA', grupoAsociacion: 'MT' }),
    ]]])
    const r = evaluarAsociaciones({
      ambitos, reglas, opciones: new Map(), esPorMetro: a => a === 'JUNTA',
      gruposAsociacion: new Map([['ESC', new Set(['58', '59'])], ['MT', new Set(['10', '11', '12'])]]),
    })
    expect(r.incidencias).toEqual([])
    expect(r.asociados.map(a => [a.articulo, a.cantidad, a.largoMm])).toEqual([
      ['ESC-ALIN', 4, null], ['ESC-HOJA', 2, null], ['ESC-HOJA', 2, null],
      ['JUNTA', 1, 1200], ['JUNTA', 1, 1200], ['JUNTA', 1, 800], ['JUNTA', 1, 800],
    ])
  })

  it('elige el tramo por la medida del propio elemento y filtra por mano', () => {
    const elementos: ElementoPlantilla[] = [
      { componente: 'OBC', cantidad: 1, medidaMm: 540, mano: 'D', hoja: 1, tipoHoja: '6' },
    ]
    const { ambitos } = construirAmbitos({ serie: 'S', esAccesorio: false, anchoMm: 600, altoMm: 1200, elementos, conjuntoHerraje: () => 'OB' })
    const reglas = new Map([['OB', [
      regla({ id: '1', conjunto: 'OB', articulo: 'COMPAS-C', componente: 'OBC', medidaMin: 325, medidaMax: 545, mano: 'D' }),
      regla({ id: '2', conjunto: 'OB', articulo: 'COMPAS-L', componente: 'OBC', medidaMin: 546, medidaMax: 795, mano: 'D' }),
      regla({ id: '3', conjunto: 'OB', articulo: 'COMPAS-I', componente: 'OBC', medidaMin: 325, medidaMax: 545, mano: 'I' }),
    ]]])
    const r = evaluarAsociaciones({ ambitos, reglas, opciones: new Map(), gruposAsociacion: new Map(), esPorMetro: () => false })
    expect(r.asociados.map(a => a.articulo)).toEqual(['COMPAS-C'])
  })

  it('no emite reglas sin destino ni artículo 0, y bloquea lo no contrastado o desconocido', () => {
    const reglas = new Map([['HERR2', [
      regla({ id: 'x', conjunto: 'HERR2', articulo: 'NADA', asociadoA: '', opcion: null }),
      regla({ id: 'y', conjunto: 'HERR2', articulo: '0', componente: '21' }),
      regla({ id: 'z', conjunto: 'HERR2', articulo: 'FELPUDO', componente: '21', formulaLargo: 'L-HM-20' }),
      regla({ id: 'w', conjunto: 'HERR2', articulo: 'DESCONOCIDO', componente: '22' }),
      regla({ id: 'v', conjunto: 'HERR2', articulo: 'X', grupoAsociacion: 'ZZ' }),
      regla({ id: 'u', conjunto: 'HERR2', articulo: 'FELPUDO', componente: '99', intervalo: 250 }),
    ]]])
    const r = evaluarAsociaciones({ ambitos: ambitosCorredera(), reglas, opciones: new Map(), gruposAsociacion: new Map(), esPorMetro })
    expect(r.asociados).toEqual([])
    expect(r.incidencias).toEqual([
      'asociación z (FELPUDO): fórmula de largo sin contrastar',
      'asociación w: artículo DESCONOCIDO ausente del catálogo',
      'asociación v: grupo ZZ sin definición',
    ])
  })

  it('no filtra por medida un elemento sin corte: lo informa', () => {
    const elementos: ElementoPlantilla[] = [{ componente: 'OBC', cantidad: 1, medidaMm: null, hoja: 1, tipoHoja: '6' }]
    const { ambitos } = construirAmbitos({ serie: 'S', esAccesorio: false, anchoMm: 600, altoMm: 1200, elementos, conjuntoHerraje: () => 'OB' })
    const reglas = new Map([['OB', [regla({ id: '1', conjunto: 'OB', articulo: 'C', componente: 'OBC', medidaMin: 325, medidaMax: 545 })]]])
    const r = evaluarAsociaciones({ ambitos, reglas, opciones: new Map(), gruposAsociacion: new Map(), esPorMetro: () => false })
    expect(r.asociados).toEqual([])
    expect(r.incidencias).toEqual(['asociación 1: elemento sin medida para filtrar C'])
  })

  it('informa del grupo de hojas sin código de herraje', () => {
    const r = construirAmbitos({ serie: 'S', esAccesorio: false, anchoMm: 1, altoMm: 1, elementos: corredera, conjuntoHerraje: () => null })
    expect(r.incidencias).toEqual(['la serie S no tiene código de herraje para el tipo de hoja 10'])
  })
})
