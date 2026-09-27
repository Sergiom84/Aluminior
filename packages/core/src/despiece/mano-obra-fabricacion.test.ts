import { describe, expect, it } from 'vitest'
import { minutosFabricacion, type ConceptoManoObraCatalogo, type ElementoManoObra } from './mano-obra-fabricacion.ts'

const concepto = (c: Partial<ConceptoManoObraCatalogo> & Pick<ConceptoManoObraCatalogo, 'codigo'>): ConceptoManoObraCatalogo => ({
  minutos: 0, articulo: 'MO', modulo: null, articuloAsociado: null, componenteAsociado: null,
  grupoAsociado: null, conIncrementos: false, ...c,
})
const conceptos = [
  concepto({ codigo: 'M8', minutos: 12, modulo: '8' }),
  concepto({ codigo: 'M15', minutos: 7, modulo: '15' }),
  concepto({ codigo: 'FIJO', minutos: 9, articuloAsociado: 'ART-FIJO' }),
  concepto({ codigo: 'APERTURA', minutos: 0 }),
  concepto({ codigo: 'TRAV', minutos: 5, componenteAsociado: '18' }),
]
const elemento = (e: Partial<ElementoManoObra>): ElementoManoObra => ({
  modulo: null, articuloPlantilla: 'X', componente: null, grupo: null, cantidad: 1, ...e,
})

describe('minutosFabricacion', () => {
  it('suma módulos por su cantidad y conceptos asociados a artículo', () => {
    const r = minutosFabricacion({
      elementos: [elemento({ modulo: '8' }), elemento({ modulo: '15', cantidad: 2 }), elemento({ modulo: '99' }),
        elemento({ articuloPlantilla: 'ART-FIJO' })],
      conceptos, conceptosApertura: ['APERTURA'],
    })
    expect(r.incidencias).toEqual([])
    expect(r.lineas).toEqual([
      { articulo: 'MO', minutos: 12, concepto: 'M8' },
      { articulo: 'MO', minutos: 14, concepto: 'M15' },
      { articulo: 'MO', minutos: 9, concepto: 'FIJO' },
    ])
  })
  it('informa de lo no contrastado en lugar de inventar minutos', () => {
    const r = minutosFabricacion({
      elementos: [elemento({ componente: '18' }), elemento({ modulo: '8' })],
      conceptos: [...conceptos.filter(c => c.codigo !== 'M8'), concepto({ codigo: 'M8', minutos: 12, modulo: '8', conIncrementos: true }),
        concepto({ codigo: 'CON-TIEMPO', minutos: 30 })],
      conceptosApertura: ['CON-TIEMPO', 'NO-EXISTE'],
    })
    expect(r.lineas).toEqual([])
    expect(r.incidencias).toEqual([
      'mano de obra TRAV: asociación por componente sin contrastar',
      'mano de obra M8: incrementos por medida sin contrastar',
      'mano de obra CON-TIEMPO de la apertura sin contrastar',
      'concepto de mano de obra NO-EXISTE ausente',
    ])
  })
  it('añade el tiempo de catálogo por cada elemento TMG y su cantidad', () => {
    const r = minutosFabricacion({
      elementos: [elemento({ grupo: 'TMG', cantidad: 2 }), elemento({ grupo: 'TMG', cantidad: 1 }), elemento({ grupo: 'TMP' })],
      conceptos: [concepto({ codigo: 'TRAV-MARCO', minutos: 7, grupoAsociado: 'TMG' })], conceptosApertura: [],
    })
    expect(r).toEqual({ lineas: [
      { articulo: 'MO', minutos: 14, concepto: 'TRAV-MARCO' },
      { articulo: 'MO', minutos: 7, concepto: 'TRAV-MARCO' },
    ], incidencias: [] })
  })
  it('coexiste con los módulos sin duplicar el adicional ni emitir por cantidad cero', () => {
    const r = minutosFabricacion({
      elementos: [elemento({ modulo: '8' }), elemento({ grupo: 'TMG' }), elemento({ grupo: 'TMG', cantidad: 0 })],
      conceptos: [...conceptos, concepto({ codigo: 'TRAV-MARCO', minutos: 7, grupoAsociado: 'TMG', componenteAsociado: '!' })],
      conceptosApertura: [],
    })
    expect(r).toEqual({ lineas: [
      { articulo: 'MO', minutos: 12, concepto: 'M8' },
      { articulo: 'MO', minutos: 7, concepto: 'TRAV-MARCO' },
    ], incidencias: [] })
  })
  it('conserva el bloqueo de incrementos en el concepto por TMG', () => {
    const r = minutosFabricacion({ elementos: [elemento({ grupo: 'TMG' })],
      conceptos: [concepto({ codigo: 'TRAV-MARCO', minutos: 7, grupoAsociado: 'TMG', conIncrementos: true })], conceptosApertura: [],
    })
    expect(r).toEqual({ lineas: [], incidencias: ['mano de obra TRAV-MARCO: incrementos por medida sin contrastar'] })
  })
  it.each([
    { grupoAsociado: 'TMP' },
    { grupoAsociado: 'TMG', modulo: '8' },
    { grupoAsociado: 'TMG', articuloAsociado: 'OTRO' },
    { grupoAsociado: 'TMG', componenteAsociado: '17M' },
  ])('mantiene bloqueadas otras asociaciones o selectores combinados %o', cambios => {
    const r = minutosFabricacion({ elementos: [elemento({ grupo: cambios.grupoAsociado })],
      conceptos: [concepto({ codigo: 'NO-CONTRASTADO', minutos: 7, ...cambios })], conceptosApertura: [],
    })
    expect(r).toEqual({ lineas: [], incidencias: ['mano de obra NO-CONTRASTADO: asociación por grupo sin contrastar'] })
  })
})
