/**
 * Pruebas de CARACTERIZACIÓN del coste del acristalamiento.
 *
 * Describen lo que hacía dentro de `acciones.ts` antes de extraerlo (T.69.3),
 * incluidas las dos diferencias con el despiece que NO se han igualado: el largo
 * obligatorio también en los artículos por unidades, y los ángulos siempre a
 * null. Igualarlas cambiaría costes ya persistidos y necesita su propia unidad.
 *
 * Lo único que cambia de comportamiento en T.69.3 es el desempate del coste, y
 * eso se prueba en `coste-articulos.test.ts`.
 */
import { describe, expect, it } from 'vitest'
import type { DatosArticuloPrecio } from '@aluminior/core/precios'
import type { PiezaCortada } from '@aluminior/core/despiece'
import { prepararPiezasAcristalamiento } from './coste-acristalamiento.ts'

const pieza = (
  articuloCodigo: string,
  cantidad: number,
  largoMm: number | null,
  extra: Partial<PiezaCortada> = {},
): PiezaCortada => ({
  articuloCodigo, cantidad, largoMm,
  formula: null, tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null,
  funcion: null, incidencia: null,
  ...extra,
})

const articulo = (codigo: string, tipoMetraje: string): DatosArticuloPrecio => ({
  codigo, tipoMetraje, precio: null, metrajeMinimo: null, metrajeMultiploLargo: null,
})

const mapaDe = (...arts: DatosArticuloPrecio[]) => new Map(arts.map((a) => [a.codigo, a]))
const costesDe = (...pares: [string, number | null][]) => new Map(pares)

describe('cálculo del coste total', () => {
  it('ML cobra metros: coste × largo/1000 × cantidad', () => {
    const [p] = prepararPiezasAcristalamiento({
      piezas: [pieza('J1', 2, 1015)],
      mapa: mapaDe(articulo('J1', 'ML')),
      costePorArticulo: costesDe(['J1', 2.7]),
    })
    expect(p.costeUnitario).toBe('2.7')
    expect(p.costeTotal).toBe('5.481')
  })

  it('por unidades cobra coste × cantidad, sin mirar el largo', () => {
    const [p] = prepararPiezasAcristalamiento({
      piezas: [pieza('J1', 7, 3000)],
      mapa: mapaDe(articulo('J1', 'UD')),
      costePorArticulo: costesDe(['J1', 0.5]),
    })
    expect(p.costeTotal).toBe('3.5')
  })

  /**
   * DIFERENCIA REAL con el despiece, conservada.
   *
   * Aquí el largo condiciona AMBAS ramas: sin largo no hay coste total aunque
   * el artículo se cobre por unidades. En el despiece, un UD sin largo sí se
   * costea. No se iguala en esta extracción: cambiaría costes ya persistidos.
   */
  it('sin largo no hay coste total, tampoco por unidades', () => {
    const preparadas = prepararPiezasAcristalamiento({
      piezas: [pieza('J1', 2, null), pieza('J2', 2, null)],
      mapa: mapaDe(articulo('J1', 'ML'), articulo('J2', 'UD')),
      costePorArticulo: costesDe(['J1', 2.7], ['J2', 2.7]),
    })
    expect(preparadas.map((p) => p.costeTotal)).toEqual([null, null])
    // El coste unitario sí se conserva en ambos: se sabe lo que vale el
    // artículo, lo que falta es cuánto se consume.
    expect(preparadas.map((p) => p.costeUnitario)).toEqual(['2.7', '2.7'])
  })

  it('M2 sin superficie no se costea por unidades', () => {
    const preparadas = prepararPiezasAcristalamiento({
      piezas: [pieza('A', 3, 1000), pieza('B', 3, 1000)],
      mapa: mapaDe(articulo('A', 'M2'), articulo('B', '?')),
      costePorArticulo: costesDe(['A', 1.1], ['B', 1.1]),
    })
    expect(preparadas.map((p) => p.costeTotal)).toEqual([null, '3.3'])
  })

  it('un artículo fuera del mapa conserva coste desconocido', () => {
    const [p] = prepararPiezasAcristalamiento({
      piezas: [pieza('DESCONOCIDO', 3, 1000)],
      mapa: mapaDe(),
      costePorArticulo: costesDe(['DESCONOCIDO', 1.1]),
    })
    expect(p.costeTotal).toBeNull()
  })

  it('sin coste no hay coste total, ni cero', () => {
    const [p] = prepararPiezasAcristalamiento({
      piezas: [pieza('J1', 2, 1000)],
      mapa: mapaDe(articulo('J1', 'ML')),
      costePorArticulo: costesDe(['J1', null]),
    })
    expect(p.costeUnitario).toBeNull()
    expect(p.costeTotal).toBeNull()
  })

  it('un artículo sin entrada de coste se trata igual que sin coste', () => {
    const [p] = prepararPiezasAcristalamiento({
      piezas: [pieza('J1', 2, 1000)],
      mapa: mapaDe(articulo('J1', 'ML')),
      costePorArticulo: costesDe(),
    })
    expect(p.costeTotal).toBeNull()
  })
})

describe('forma de las filas', () => {
  /**
   * DIFERENCIA REAL con el despiece, conservada: los ángulos se escriben
   * siempre a `null`, aunque la pieza los traiga.
   *
   * Es lo que hacía la implementación anterior, y esta prueba lo fija. Por qué
   * lo hacía NO está medido: puede ser que el original no detalle los ángulos
   * de juntas y junquillos, o puede ser un descuido. Hasta tener evidencia, se
   * conserva sin explicarlo.
   */
  it('descarta los ángulos de la pieza', () => {
    const [p] = prepararPiezasAcristalamiento({
      piezas: [pieza('J1', 2, 1015, {
        anguloIzquierdo: 45, anguloDerecho: 45, funcion: 'JUNQ',
      })],
      mapa: mapaDe(articulo('J1', 'ML')),
      costePorArticulo: costesDe(['J1', null]),
    })
    expect(p).toEqual({
      articuloCodigo: 'J1',
      cantidad: '2',
      largoCorteMm: '1015',
      anguloIzquierdo: null,
      anguloDerecho: null,
      funcion: 'JUNQ',
      costeUnitario: null,
      costeTotal: null,
    })
  })

  // Una fila por pieza, en el mismo orden: dos juntas del mismo artículo con
  // largos distintos son dos filas, sin agregar.
  it('conserva orden y cantidad de piezas, sin agrupar', () => {
    const preparadas = prepararPiezasAcristalamiento({
      piezas: [pieza('J1', 2, 1000, { funcion: 'JEXT' }), pieza('J1', 2, 500, { funcion: 'JINT' })],
      mapa: mapaDe(articulo('J1', 'ML')),
      costePorArticulo: costesDe(['J1', 2]),
    })
    expect(preparadas).toHaveLength(2)
    expect(preparadas.map((p) => p.funcion)).toEqual(['JEXT', 'JINT'])
    expect(preparadas.map((p) => p.costeTotal)).toEqual(['4', '2'])
  })

  it('sin piezas no devuelve nada', () => {
    expect(prepararPiezasAcristalamiento({
      piezas: [], mapa: mapaDe(), costePorArticulo: costesDe(),
    })).toEqual([])
  })
})

/**
 * Aritmética en `number`, conservada tal cual, igual que en el despiece. La
 * deuda está declarada en el módulo: pasar a decimal exacto mueve costes ya
 * persistidos y necesita medición propia.
 */
describe('redondeo, tal como está', () => {
  it('redondea a cuatro decimales', () => {
    const [p] = prepararPiezasAcristalamiento({
      piezas: [pieza('J1', 1, 333)],
      mapa: mapaDe(articulo('J1', 'ML')),
      costePorArticulo: costesDe(['J1', 0.3333]),
    })
    // 0,3333 × 0,333 × 1 = 0,1109889 exacto -> 0,111
    expect(p.costeTotal).toBe('0.111')
  })

  it('conserva cuatro decimales cuando los hay', () => {
    const [p] = prepararPiezasAcristalamiento({
      piezas: [pieza('J1', 3, 1234)],
      mapa: mapaDe(articulo('J1', 'ML')),
      costePorArticulo: costesDe(['J1', 1.2345]),
    })
    expect(p.costeTotal).toBe('4.5701')
  })

  it('no formatea a escala fija: los ceros finales no se escriben', () => {
    const [p] = prepararPiezasAcristalamiento({
      piezas: [pieza('J1', 2, 1000)],
      mapa: mapaDe(articulo('J1', 'UD')),
      costePorArticulo: costesDe(['J1', 1.5]),
    })
    expect(p.costeTotal).toBe('3')
  })
})
