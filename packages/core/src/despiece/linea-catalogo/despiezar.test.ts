import { describe, expect, it } from 'vitest'
import { despiezarLineaCatalogo } from './despiezar.ts'
import type { ArticuloCatalogo, CatalogoLinea, FilaPlantillaCatalogo } from './tipos.ts'
import type { ReglaAsociacion } from '../asociaciones/tipos.ts'
import type { ArticuloTarifado } from '../../precios/importe-fila.ts'

// Catálogo sintético con la forma de una corredera de dos hojas; valores inventados.
const fila = (f: Partial<FilaPlantillaCatalogo> & Pick<FilaPlantillaCatalogo, 'id' | 'articulo'>): FilaPlantillaCatalogo => ({
  componente: null, funcion: null, cantidad: 1, posicionTrabajo: null, tipoHoja: '-1', mano: null, hoja: 0, disVidrio: null,
  referenciaLargo: null, referenciaAncho: null, formulaLargo: 'L', formulaAncho: null, formulaReferenciaLargo: null,
  formulaReferenciaAncho: null, grupo: null, grupoIzquierdo: null, grupoDerecho: null, grupoSuperior: null,
  grupoInferior: null, gruposAdicionales: [], perfilAdicional: null, ...f,
})
const hoja = (n: number, base: number): FilaPlantillaCatalogo[] => [
  fila({ id: base, articulo: 'G-HH', componente: '23', funcion: 'HH', tipoHoja: '10', hoja: n, referenciaLargo: 3,
    formulaLargo: '(A)/2', formulaReferenciaLargo: '(REF)/2', grupo: 'HH', grupoIzquierdo: 'MV', grupoDerecho: 'MV', posicionTrabajo: 'A' }),
  fila({ id: base + 1, articulo: 'G-HV', componente: '21', funcion: 'HV', tipoHoja: '10', hoja: n, referenciaLargo: 1,
    formulaReferenciaLargo: 'REF', grupo: 'HVL', grupoIzquierdo: 'MH', grupoDerecho: 'MH', posicionTrabajo: 'L' }),
  fila({ id: base + 2, articulo: 'G-INF', componente: 'EHC', funcion: 'infEHC', tipoHoja: '10', hoja: n, referenciaLargo: base + 1,
    formulaReferenciaLargo: 'REF' }),
  fila({ id: base + 3, articulo: 'G-CRISTAL', componente: '1', tipoHoja: '10', referenciaLargo: base + 1, referenciaAncho: base,
    formulaAncho: '(A)/2', formulaReferenciaLargo: 'REF', formulaReferenciaAncho: 'REF', grupo: 'C',
    grupoIzquierdo: 'HVL', grupoDerecho: 'HVL', grupoSuperior: 'HH', grupoInferior: 'HH' }),
]
const plantillas: Record<string, FilaPlantillaCatalogo[]> = {
  CORR: [
    fila({ id: 1, articulo: 'G-MV', componente: '12', funcion: 'MV', grupo: 'MV', grupoIzquierdo: 'E', grupoDerecho: 'E', posicionTrabajo: 'L' }),
    fila({ id: 3, articulo: 'G-MH', componente: '10', funcion: 'MH', formulaLargo: 'A', grupo: 'MH', grupoIzquierdo: 'MV', grupoDerecho: 'MV', posicionTrabajo: 'A' }),
    fila({ id: 5, articulo: 'G-MO', componente: '39', funcion: 'infMOmof', tipoHoja: '0', disVidrio: '8' }),
    ...hoja(1, 10), ...hoja(2, 20),
  ],
  UNION: [fila({ id: 0, articulo: 'TUBO', funcion: 'UNION1' }), fila({ id: 0, articulo: 'MO', cantidad: 5, formulaLargo: null })],
}
const articulos: Record<string, Partial<ArticuloCatalogo>> = {
  'G-MV': { generico: true, componente: '12' }, 'G-MH': { generico: true, componente: '10' }, 'G-HH': { generico: true, componente: '23' },
  'G-HV': { generico: true, componente: '21' }, 'G-INF': { generico: true, componente: 'EHC', tipoMetraje: 'ML' },
  'G-MO': { generico: true, componente: '39', tipoMetraje: 'UD' }, 'G-CRISTAL': { generico: true, componente: '1', tipoMetraje: 'M2' },
  MARCO: {}, HOJA: {}, RODAMIENTO: {}, FELPUDO: {}, CIERRE: { tipoMetraje: 'UD' }, MO: { tipoMetraje: 'UD' }, TUBO: {},
  VIDRIO: { tipoMetraje: 'M2', grosorAcristalar: 16, dobleAcristalamiento: true },
}
const precios: Record<string, number> = { MARCO: 10, HOJA: 8, RODAMIENTO: 6, FELPUDO: 1, CIERRE: 4, MO: 0.5, TUBO: 3, VIDRIO: 50 }
const asociaciones: Record<string, ReglaAsociacion[]> = {
  HERR: [
    { id: 'a1', conjunto: 'HERR', articulo: 'FELPUDO', cantidad: 2, acabado: '---A', intervalo: 0, medidaMin: 0, medidaMax: 0,
      unidadesMin: 0, unidadesMax: 0, tipoMedida: 'C', descuento: 0, formulaLargo: null, formulaAncho: null, soloUna: false,
      componente: '21', grupo: '!', grupoAsociacion: null, modulos: null, articuloPrincipal: null, opcion: null, formulaOpcion: null,
      apertura: 0, mano: null, posicionTrabajo: null, asociadoA: 'HOJA LATERAL' },
    { id: 'a2', conjunto: 'HERR', articulo: 'CIERRE', cantidad: 1, acabado: '---A', intervalo: 0, medidaMin: 0, medidaMax: 0,
      unidadesMin: 0, unidadesMax: 0, tipoMedida: 'C', descuento: 0, formulaLargo: null, formulaAncho: null, soloUna: false,
      componente: 'EHC', grupo: '!', grupoAsociacion: null, modulos: null, articuloPrincipal: null, opcion: '1', formulaOpcion: null,
      apertura: 0, mano: null, posicionTrabajo: null, asociadoA: 'CIERRE' },
  ],
}

function catalogo(cambios: Partial<CatalogoLinea> = {}): CatalogoLinea {
  return {
    plantilla: e => plantillas[e] ?? [],
    esAccesorio: e => e === 'UNION',
    articulo: c => articulos[c] ? { codigo: c, tipoMetraje: 'ML', componente: null, grosorAcristalar: 0, dobleAcristalamiento: false, generico: false, ...articulos[c] } : null,
    serie: c => c === 'S' ? { codigo: 'S', herrajes: { '2HC': 'HERR' }, manoObra: { '2HC': 'MO2' }, tablaHojas: 'T1', tablaFijos: 'T1', grosorMaximoSimple: 10, grosorMaximoDoble: 18 } : null,
    resolverComponente: (_s, c, v) => ({ '12': 'MARCO', '10': 'MARCO', '21': 'HOJA', [`23.${v}`]: 'RODAMIENTO', '39': '0' } as Record<string, string>)[c] ?? (c === '23' ? (v === '2' ? 'RODAMIENTO' : null) : null),
    descuentos: () => [
      { grupoPrincipal: 'E', grupo: 'MV', tipoHoja: 'G', mm: 0 }, { grupoPrincipal: 'MV', grupo: 'MH', tipoHoja: 'G', mm: 20 },
      { grupoPrincipal: 'MV', grupo: 'HH', tipoHoja: '2HC', mm: 0 }, { grupoPrincipal: 'MH', grupo: 'HVL', tipoHoja: 'G', mm: 25 },
      { grupoPrincipal: 'HH', grupo: 'C', tipoHoja: 'G', mm: 40 }, { grupoPrincipal: 'HVL', grupo: 'C', tipoHoja: '2HC', mm: 30 },
    ],
    nombreTipoHoja: id => id === '10' ? 't2HC' : null,
    asociaciones: c => asociaciones[c] ?? [],
    opciones: c => c === 'HERR' ? [{ conjunto: 'HERR', opcion: '1', porDefecto: true }] : [],
    gruposAsociacion: () => new Map(),
    tablaAcristalamiento: () => [{ posicion: '*', junquillo: '0', juntaExterior: null, juntaInterior: null, grosor: 99 }],
    conceptosManoObra: () => [{ codigo: 'M8', minutos: 20, articulo: 'MO', modulo: '8', articuloAsociado: null, componenteAsociado: null, grupoAsociado: null, conIncrementos: false },
      { codigo: 'MO2', minutos: 0, articulo: 'MO', modulo: null, articuloAsociado: null, componenteAsociado: null, grupoAsociado: null, conIncrementos: false }],
    tarifa: (c): ArticuloTarifado | null => articulos[c] ? {
      tipoMetraje: articulos[c]!.tipoMetraje ?? 'ML', pvp: precios[c] ?? null, multiploLargoCm: c === 'VIDRIO' ? 6 : 0,
      multiploAnchoCm: c === 'VIDRIO' ? 6 : 0, minimo: c === 'VIDRIO' ? 0.5 : 0, incrementos: [],
    } : null,
    ...cambios,
  }
}
const entrada = { estructura: 'CORR', serie: 'S', anchoMm: 1200, altoMm: 1300, vidrio: 'VIDRIO', acabado: 'L', acabadoAccesorios: 'UNI', opcionesGuardadas: [] }

describe('despiezarLineaCatalogo', () => {
  it('compone perfiles, asociados, vidrio y mano de obra y suma importes por fila', () => {
    const r = despiezarLineaCatalogo(catalogo(), entrada)
    expect(r.incidencias).toEqual([])
    const resumen = r.filas.map(f => `${f.origen}:${f.articulo}:${f.cantidad}:${f.largoMm ?? '-'}:${f.anchoMm ?? '-'}:${f.importe}`)
    expect(resumen).toEqual([
      'plantilla:MARCO:1:1300:-:13', 'plantilla:MARCO:1:1160:-:11.6',
      'plantilla:RODAMIENTO:1:580:-:3.48', 'plantilla:HOJA:1:1250:-:10',
      'plantilla:RODAMIENTO:1:580:-:3.48', 'plantilla:HOJA:1:1250:-:10',
      'asociado:FELPUDO:2:1250:-:2.5', 'asociado:FELPUDO:2:1250:-:2.5',
      'asociado:CIERRE:1:-:-:4', 'asociado:CIERRE:1:-:-:4',
      'vidrio:VIDRIO:1:1170:520:32.5', 'vidrio:VIDRIO:1:1170:520:32.5',
      'mano-obra:MO:20:-:-:10',
    ])
    expect(r.importe).toBe(139.56)
  })
  it('separa perfiles y accesorios y respeta el acabado explícito de la asociación', () => {
    const base = catalogo()
    const conAcabados = catalogo({
      asociaciones: c => c === 'HERR' ? [
        ...asociaciones.HERR!,
        { ...asociaciones.HERR![1]!, id: 'perfil', acabado: '---P' },
        { ...asociaciones.HERR![1]!, id: 'fijo', acabado: 'FIJO' },
      ] : [],
      tarifa: (c, acabado) => ({ ...base.tarifa(c, acabado)!, pvp: acabado === 'ACC' ? 2 : 1 }),
    })
    const r = despiezarLineaCatalogo(conAcabados, { ...entrada, acabado: 'PER', acabadoAccesorios: 'ACC' })
    expect(r.incidencias).toEqual([])
    expect(r.filas.filter(f => f.origen === 'plantilla').every(f => f.acabado === 'PER')).toBe(true)
    expect(r.filas.filter(f => ['vidrio', 'mano-obra'].includes(f.origen)).every(f => f.acabado === 'ACC')).toBe(true)
    expect(new Set(r.filas.filter(f => f.articulo === 'CIERRE').map(f => f.acabado))).toEqual(new Set(['ACC', 'PER', 'FIJO']))
    expect(r.filas.filter(f => f.articulo === 'CIERRE' && f.acabado === 'ACC').map(f => f.importe)).toEqual([2, 2])
    const estandar = despiezarLineaCatalogo(conAcabados, { ...entrada, estructura: 'UNION', acabado: 'PER', acabadoAccesorios: 'ACC' })
    expect(estandar.filas.map(f => f.acabado)).toEqual(['PER', 'ACC'])
  })
  it('elige el perfil de vidrio simple por el rango de grosor de la serie', () => {
    const simple = catalogo({ articulo: c => c === 'VIDRIO' ? { codigo: c, tipoMetraje: 'M2', componente: null, grosorAcristalar: 6, dobleAcristalamiento: false, generico: false } : catalogo().articulo(c) })
    const r = despiezarLineaCatalogo(simple, entrada)
    expect(r.importe).toBeNull()
    expect(r.incidencias).toContain('la serie no resuelve el componente 23 (G-HH)')
  })
  it('valora una estructura estándar sin asociaciones de serie', () => {
    const r = despiezarLineaCatalogo(catalogo(), { ...entrada, estructura: 'UNION', anchoMm: 0, altoMm: 2000 })
    expect(r.filas.map(f => [f.articulo, f.cantidad, f.largoMm, f.importe])).toEqual([['TUBO', 1, 2000, 6], ['MO', 5, null, 2.5]])
    expect(r.importe).toBe(8.5)
  })
  it('añade el ajuste manual de fabricación y no da total si falta un precio', () => {
    const r = despiezarLineaCatalogo(catalogo(), { ...entrada, minutosFabricacionAdicionales: 60 })
    expect(r.filas.at(-1)).toMatchObject({ articulo: 'MO', cantidad: 60, importe: 30 })
    const sinPrecio = despiezarLineaCatalogo(catalogo({ tarifa: c => c === 'FELPUDO' ? { tipoMetraje: 'ML', pvp: null, multiploLargoCm: 0, multiploAnchoCm: 0, minimo: 0, incrementos: [] } : catalogo().tarifa(c, '') }), entrada)
    expect(sinPrecio.importe).toBeNull()
    expect(sinPrecio.incidencias).toContain('FELPUDO: sin PVP en la tarifa')
  })
})
