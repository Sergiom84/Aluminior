import { describe, expect, it } from 'vitest'
import { minutosTravesanosTmp, permiteTmpEnLinea } from './mano-obra-tmp.ts'
import { minutosFabricacion, type ConceptoManoObraCatalogo, type ElementoManoObra } from './mano-obra-fabricacion.ts'

const concepto = (c: Partial<ConceptoManoObraCatalogo> = {}): ConceptoManoObraCatalogo => ({
  codigo: 'SINTETICO-A', minutos: 7, articulo: 'MO', modulo: null, articuloAsociado: null,
  componenteAsociado: '!', grupoAsociado: 'TMP', conIncrementos: false,
  categoria: '00001', familiaAsociada: '001', serieAsociada: '*', asociado: true, ...c,
})
const conceptos = [concepto(), concepto({ codigo: 'SINTETICO-C', categoria: '00002', minutos: 11,
  componenteAsociado: '16', grupoAsociado: '!' })]
const elemento = (e: Partial<ElementoManoObra> = {}): ElementoManoObra => ({
  modulo: null, articuloPlantilla: 'ART-SINTETICO', componente: '16', grupo: 'TMP', cantidad: 1, ...e,
})
const elementos = [elemento(), elemento({ cantidad: 2 })]
const contexto = { tipoPerfiles: 'A', familia: '001', serie: 'SERIE-SINTETICA' }
const calcular = (c: Partial<Parameters<typeof minutosTravesanosTmp>[0]> = {}) => minutosTravesanosTmp({ elementos, conceptos, contexto, ...c })

describe('TMP/16 con metadatos explícitos', () => {
  it.each([['A', 'SINTETICO-A', 21], ['C', 'SINTETICO-C', 33]])('selecciona %s y agrega por concepto', (tipoPerfiles, codigo, minutos) => {
    expect(calcular({ contexto: { ...contexto, tipoPerfiles: String(tipoPerfiles) } })).toEqual({ resuelto: true,
      lineas: [{ articulo: 'MO', concepto: codigo, minutos }], conceptosTratados: ['SINTETICO-A', 'SINTETICO-C'], incidencias: [] })
  })
  it('no cuenta dos veces un elemento coincidente por componente y grupo', () => {
    expect(calcular({ elementos: [elemento()] }).lineas).toEqual([{ articulo: 'MO', concepto: 'SINTETICO-A', minutos: 7 }])
  })
  it('admite cantidad cero acreditada sin fabricar una fila', () => {
    expect(calcular({ elementos: [elemento({ cantidad: 0 })] })).toMatchObject({ resuelto: true, lineas: [], incidencias: [] })
  })
  it.each([-1, NaN, Infinity])('rechaza cantidad %s sin aportación parcial', cantidad => {
    expect(calcular({ elementos: [...elementos, elemento({ cantidad })] })).toMatchObject({ resuelto: false, lineas: [], conceptosTratados: [] })
  })
  it.each([
    { tipoPerfiles: null }, { tipoPerfiles: undefined }, { tipoPerfiles: 'PVC' }, { familia: null },
    { familia: 'OTRA' }, { serie: '' },
  ])('requiere contexto suficiente %o', cambios => {
    expect(calcular({ contexto: { ...contexto, ...cambios } }).resuelto).toBe(false)
  })
  it.each([
    { categoria: undefined }, { categoria: '00003' }, { familiaAsociada: undefined }, { familiaAsociada: 'OTRA' },
    { serieAsociada: undefined }, { serieAsociada: 'SERIE-SINTETICA' }, { asociado: undefined }, { asociado: false },
    { conIncrementos: true }, { minutos: NaN }, { minutos: -1 }, { minutos: Infinity }, { articulo: '' },
    { modulo: '8' }, { articuloAsociado: 'ART-SINTETICO' }, { componenteAsociado: '16' },
  ])('no resuelve una regla incompleta o no contrastada %o', cambio => {
    const r = calcular({ conceptos: [concepto(cambio), conceptos[1]!] })
    expect(r).toMatchObject({ resuelto: false, lineas: [], conceptosTratados: [] })
    expect(r.incidencias).toHaveLength(1)
  })
  it.each([
    [], [conceptos[1]!], [...conceptos, conceptos[0]!], [...conceptos, concepto({ codigo: 'OTRO' })],
    [...conceptos, { ...conceptos[1]!, codigo: 'OTRO-C' }],
  ].map(reglas => ({ reglas })))('rechaza selección ausente, repetida o ambigua %#', ({ reglas }) => {
    expect(calcular({ conceptos: reglas }).resuelto).toBe(false)
  })
  it.each([{ grupo: 'TMG' }, { componente: '15' }, { modulo: '8' }])('no extrapola elementos %o', cambios => {
    expect(calcular({ elementos: [elemento(cambios)] }).resuelto).toBe(false)
  })
  it('coexiste con módulos y conserva el bloqueo TFF', () => {
    const modulo = concepto({ codigo: 'MODULO', modulo: '8', grupoAsociado: null, minutos: 13 })
    const tff = concepto({ codigo: 'TFF', componenteAsociado: '15', grupoAsociado: null, minutos: 5 })
    const r = minutosFabricacion({ elementos: [...elementos, elemento({ componente: null, grupo: null, modulo: '8' }),
      elemento({ componente: '15', grupo: 'TFF' })], conceptos: [...conceptos, modulo, tff], conceptosApertura: [], contextoTmp: contexto })
    expect(r.lineas).toEqual([{ articulo: 'MO', minutos: 21, concepto: 'SINTETICO-A' }, { articulo: 'MO', minutos: 13, concepto: 'MODULO' }])
    expect(r.incidencias).toEqual(['mano de obra TFF: asociación por componente sin contrastar'])
  })
  it('sin contexto conserva los bloqueos actuales', () => {
    const r = minutosFabricacion({ elementos, conceptos, conceptosApertura: [] })
    expect(r.lineas).toEqual([])
    expect(r.incidencias).toHaveLength(2)
  })
})

describe('cobertura documental de línea', () => {
  it.each(['GMA350', 'GMA65OPT'])('permite solo estándar explícito de %s', serie => {
    expect(permiteTmpEnLinea({ estructura: '03V', serie, disenoEspecifico: false })).toBe(true)
  })
  it.each([
    { estructura: '03H' }, { estructura: '06' }, { estructura: 'CFT' }, { estructura: 'C2FI' },
    { serie: 'GMA50' }, { disenoEspecifico: true }, { disenoEspecifico: undefined },
  ])('no extiende la evidencia %o', cambio => {
    expect(permiteTmpEnLinea({ estructura: '03V', serie: 'GMA350', disenoEspecifico: false, ...cambio })).toBe(false)
  })
})
