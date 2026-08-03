/**
 * La GUARDA del dinero (T.59): "todo o sin valorar", y la identidad de valoración.
 *
 * Protege dos invariantes del camino del dinero:
 *  1. Una línea con cualquier componente sin resolver NO se valora (null, nunca
 *     un total parcial ni cero). Regla 3.
 *  2. `valorarDespiece` cumple ImporteTotal = precio × cantidad_facturable (la
 *     identidad medida en T.55: UD por unidades, ML por metros), y si falta un
 *     precio lo reporta en `sinPrecio` sin inventar un cero.
 */
import { describe, it, expect } from 'vitest'
import { lineaValorable } from './guarda.ts'
import { valorarDespiece, type DatosArticuloPrecio } from './calcular.ts'
import type { PiezaCortada } from '../despiece/calcular.ts'

const pieza = (articuloCodigo: string, cantidad: number, largoMm: number | null): PiezaCortada => ({
  articuloCodigo, cantidad, largoMm,
  formula: null, tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null,
  funcion: null, incidencia: null,
})
const art = (codigo: string, tipoMetraje: string, precio: number | null): DatosArticuloPrecio => ({
  codigo, tipoMetraje, precio, metrajeMinimo: null, metrajeMultiploLargo: null,
})

describe('lineaValorable (guarda todo-o-sin-valorar)', () => {
  it('valora cuando no hay piezas sin medida ni artículos sin precio', () => {
    const v = lineaValorable({ incalculables: 0, sinPrecio: [] })
    expect(v.valorable).toBe(true)
    expect(v.motivos).toEqual([])
  })

  it('NO valora si hay piezas sin medida (y nombra las variables que faltan)', () => {
    const v = lineaValorable({ incalculables: 2, sinPrecio: [], variablesFaltantes: ['FI', 'TD'] })
    expect(v.valorable).toBe(false)
    expect(v.motivos[0]).toBe('2 piezas sin medida (faltan FI, TD)')
  })

  it('NO valora si algún artículo no tiene precio en la tarifa', () => {
    const v = lineaValorable({ incalculables: 0, sinPrecio: ['GM4735'] })
    expect(v.valorable).toBe(false)
    expect(v.motivos).toEqual(['1 artículos sin precio en la tarifa'])
  })

  it('acumula ambos motivos cuando faltan medida Y precio', () => {
    const v = lineaValorable({ incalculables: 1, sinPrecio: ['A', 'B'] })
    expect(v.valorable).toBe(false)
    expect(v.motivos).toHaveLength(2)
  })
})

describe('lineaValorable con mano de obra', () => {
  const sano = { incalculables: 0, sinPrecio: [] }

  it('valora cuando la mano de obra resuelve', () => {
    const v = lineaValorable({
      ...sano,
      manoObra: [{ concepto: 'COLOCACION', motivoCodigo: null, motivoCosteCodigo: null }],
    })
    expect(v.valorable).toBe(true)
    expect(v.motivos).toEqual([])
    expect(v.advertencias).toEqual([])
  })

  // Los cuatro motivos de VENTA tumban la línea. Un total sin la mano de obra
  // se cobraría de menos, y un cero parecería trabajo regalado.
  it.each([
    ['SIN_PVP', 'mano de obra de colocación sin precio en la tarifa'],
    ['PVP_CERO', 'mano de obra de colocación a precio cero en la tarifa'],
    ['PVP_NEGATIVO', 'mano de obra de colocación con precio negativo en el catálogo'],
    ['IMPORTE_FUERA_RANGO', 'mano de obra de colocación con un importe fuera de rango'],
  ] as const)('NO valora con %s', (motivoCodigo, texto) => {
    const v = lineaValorable({
      ...sano,
      manoObra: [{ concepto: 'COLOCACION', motivoCodigo, motivoCosteCodigo: null }],
    })
    expect(v.valorable).toBe(false)
    expect(v.motivos).toEqual([texto])
  })

  // Los cuatro motivos de COSTE no tumban nada: no cambian lo que se cobra.
  // Pero se registran, porque callarlos dejaría el margen mal sin que se note.
  it.each([
    ['SIN_COSTE', 'mano de obra de fabricación adicional sin coste en el catálogo'],
    ['COSTE_AMBIGUO',
      'mano de obra de fabricación adicional con varios costes distintos y ninguno del acabado aplicado'],
    ['COSTE_NEGATIVO', 'mano de obra de fabricación adicional con coste negativo en el catálogo'],
    ['COSTE_FUERA_RANGO',
      'mano de obra de fabricación adicional con un coste total fuera de rango'],
  ] as const)('valora igual con %s, pero lo advierte', (motivoCosteCodigo, texto) => {
    const v = lineaValorable({
      ...sano,
      manoObra: [{
        concepto: 'FABRICACION_ADICIONAL', motivoCodigo: null, motivoCosteCodigo,
      }],
    })
    expect(v.valorable).toBe(true)
    expect(v.motivos).toEqual([])
    expect(v.advertencias).toEqual([texto])
  })

  it('distingue los dos conceptos y acumula sus motivos', () => {
    const v = lineaValorable({
      ...sano,
      manoObra: [
        { concepto: 'FABRICACION_ADICIONAL', motivoCodigo: 'SIN_PVP', motivoCosteCodigo: null },
        { concepto: 'COLOCACION', motivoCodigo: 'PVP_CERO', motivoCosteCodigo: 'SIN_COSTE' },
      ],
    })
    expect(v.valorable).toBe(false)
    expect(v.motivos).toEqual([
      'mano de obra de fabricación adicional sin precio en la tarifa',
      'mano de obra de colocación a precio cero en la tarifa',
    ])
    expect(v.advertencias).toEqual(['mano de obra de colocación sin coste en el catálogo'])
  })

  it('un problema de coste no rescata ni tumba la venta del otro concepto', () => {
    const v = lineaValorable({
      ...sano,
      manoObra: [
        { concepto: 'FABRICACION_ADICIONAL', motivoCodigo: null, motivoCosteCodigo: 'COSTE_AMBIGUO' },
        { concepto: 'COLOCACION', motivoCodigo: null, motivoCosteCodigo: null },
      ],
    })
    expect(v.valorable).toBe(true)
    expect(v.advertencias).toHaveLength(1)
  })
})

describe('valorarDespiece — identidad del dinero', () => {
  it('UD: importe = precio × unidades', () => {
    const r = valorarDespiece([pieza('MO', 2, null)], new Map([['MO', art('MO', 'UD', 10)]]))
    expect(r.importe).toBe(20)
    expect(r.completa).toBe(true)
    expect(r.sinPrecio).toEqual([])
  })

  it('ML: importe = precio × metros consumidos (largo×cantidad)', () => {
    const r = valorarDespiece([pieza('GM306', 3, 1000)], new Map([['GM306', art('GM306', 'ML', 5)]]))
    expect(r.importe).toBe(15) // 3 piezas × 1 m × 5 €/m
    expect(r.completa).toBe(true)
  })

  it('sin precio: NO inventa cero; lo reporta y el importe queda incompleto', () => {
    const r = valorarDespiece(
      [pieza('GM306', 1, 1000), pieza('SINPVP', 1, 1000)],
      new Map([['GM306', art('GM306', 'ML', 5)], ['SINPVP', art('SINPVP', 'ML', null)]]),
    )
    expect(r.sinPrecio).toEqual(['SINPVP'])
    expect(r.completa).toBe(false)
    // La guarda convierte este caso en "sin valorar":
    expect(lineaValorable({ incalculables: 0, sinPrecio: r.sinPrecio }).valorable).toBe(false)
  })
})
