/**
 * Pruebas de CARACTERIZACIÓN del coste del despiece.
 *
 * No describen lo que el coste debería hacer: describen lo que hacía dentro de
 * `acciones.ts` antes de extraerlo (T.69.2), incluida la aritmética en `number`
 * y los casos que nadie eligió a propósito. Su trabajo es que la extracción no
 * cambie ninguna cifra sin que se note, y servir de red cuando se decida pasar
 * a decimal exacto: entonces estas expectativas dirán exactamente qué cambia y
 * en cuántos casos.
 */
import { describe, expect, it } from 'vitest'
import type { DatosArticuloPrecio } from '@aluminior/core/precios'
import type { PiezaCortada } from '@aluminior/core/despiece'
import { prepararPiezasDespiece } from './coste-despiece.ts'

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

describe('piezas preparadas para persistir', () => {
  it('ML cobra metros: coste × largo/1000 × cantidad', () => {
    const [p] = prepararPiezasDespiece({
      piezas: [pieza('A', 2, 1015)],
      mapa: mapaDe(articulo('A', 'ML')),
      costePorArticulo: costesDe(['A', 2.7]),
    })
    expect(p.costeUnitario).toBe('2.7')
    expect(p.costeTotal).toBe('5.481')
  })

  it('UD cobra unidades: coste × cantidad, ignorando el largo', () => {
    const [p] = prepararPiezasDespiece({
      piezas: [pieza('A', 7, 3000)],
      mapa: mapaDe(articulo('A', 'UD')),
      costePorArticulo: costesDe(['A', 0.5]),
    })
    expect(p.costeTotal).toBe('3.5')
  })

  // Cualquier metraje que no sea ML se cobra por unidades. M2 incluido: el
  // despiece no tiene ancho por pieza, así que no puede calcular superficie.
  it('M2 sin superficie conserva coste desconocido', () => {
    const preparadas = prepararPiezasDespiece({
      piezas: [pieza('A', 3, 1000), pieza('B', 3, 1000)],
      mapa: mapaDe(articulo('A', 'M2'), articulo('B', '?')),
      costePorArticulo: costesDe(['A', 1.1], ['B', 1.1]),
    })
    expect(preparadas.map((p) => p.costeTotal)).toEqual([null, '3.3'])
  })

  it('ML sin largo queda sin coste total, no en cero', () => {
    const [p] = prepararPiezasDespiece({
      piezas: [pieza('A', 2, null)],
      mapa: mapaDe(articulo('A', 'ML')),
      costePorArticulo: costesDe(['A', 2.7]),
    })
    // El coste unitario SÍ se conserva: se sabe lo que vale el artículo,
    // lo que no se sabe es cuánto se consume.
    expect(p.costeUnitario).toBe('2.7')
    expect(p.costeTotal).toBeNull()
  })

  it('sin coste no hay coste total, ni cero', () => {
    const [p] = prepararPiezasDespiece({
      piezas: [pieza('A', 2, 1000)],
      mapa: mapaDe(articulo('A', 'ML')),
      costePorArticulo: costesDe(['A', null]),
    })
    expect(p.costeUnitario).toBeNull()
    expect(p.costeTotal).toBeNull()
  })

  it('un artículo sin entrada de coste se trata igual que sin coste', () => {
    const [p] = prepararPiezasDespiece({
      piezas: [pieza('A', 2, 1000)],
      mapa: mapaDe(articulo('A', 'ML')),
      costePorArticulo: costesDe(),
    })
    expect(p.costeTotal).toBeNull()
  })

  /**
   * Rama accidental de la función pura. NO es un fallo productivo demostrado.
   *
   * Si el artículo no está en el mapa, `art?.tipoMetraje` es `undefined` y cae
   * en la rama de unidades: el largo se ignora. Sale del encadenamiento
   * opcional, no de una decisión.
   *
   * Con el esquema productivo esa combinación **no es alcanzable**: el mapa se
   * construye leyendo `articulos` por los códigos del despiece, así que un
   * artículo ausente del mapa no existe en `articulos`; y `articulos_coste`
   * tiene clave ajena a `articulos.codigo`, luego tampoco puede tener coste. Sin
   * coste, `costeTotal` sería `null` y esta rama no se ejecuta.
   *
   * Se fija igualmente porque la función es pura y admite esa entrada: importa
   * ante datos inconsistentes, un doble de prueba mal construido o un cambio
   * futuro del esquema que relajara la clave ajena.
   */
  it('un artículo ausente del mapa conserva coste desconocido', () => {
    const [p] = prepararPiezasDespiece({
      piezas: [pieza('DESCONOCIDO', 3, 1000)],
      mapa: mapaDe(),
      costePorArticulo: costesDe(['DESCONOCIDO', 1.1]),
    })
    expect(p.costeTotal).toBeNull()
  })

  // No agrega: dos cortes del mismo artículo dan dos filas, cada una con su
  // largo. Es lo contrario de `valorarDespiece`, que agrupa para aplicar
  // mínimos y múltiplos al elemento entero.
  it('no agrupa las piezas repetidas del mismo artículo', () => {
    const preparadas = prepararPiezasDespiece({
      piezas: [pieza('A', 2, 1000), pieza('A', 1, 500)],
      mapa: mapaDe(articulo('A', 'ML')),
      costePorArticulo: costesDe(['A', 2]),
    })
    expect(preparadas).toHaveLength(2)
    expect(preparadas.map((p) => p.costeTotal)).toEqual(['4', '1'])
  })

  it('copia el resto de la pieza como texto, conservando los nulos', () => {
    const [p] = prepararPiezasDespiece({
      piezas: [pieza('A', 2, 1015, {
        anguloIzquierdo: 45, anguloDerecho: null, funcion: 'MV',
      })],
      mapa: mapaDe(articulo('A', 'ML')),
      costePorArticulo: costesDe(['A', null]),
    })
    expect(p).toEqual({
      articuloCodigo: 'A',
      cantidad: '2',
      largoCorteMm: '1015',
      anguloIzquierdo: '45',
      anguloDerecho: null,
      funcion: 'MV',
      costeUnitario: null,
      costeTotal: null,
    })
  })

  it('sin piezas no devuelve nada', () => {
    expect(prepararPiezasDespiece({
      piezas: [], mapa: mapaDe(), costePorArticulo: costesDe(),
    })).toEqual([])
  })
})

/**
 * La aritmética es en `number` y se conserva TAL CUAL.
 *
 * Se sabe que la coma flotante desvía el último dígito —es lo que T.68 corrigió
 * en la mano de obra— pero cambiarla aquí mueve cifras de coste ya persistidas.
 * Estas expectativas fijan lo que el sistema produce HOY; el día que se pase a
 * decimal exacto dirán exactamente qué cambia.
 */
describe('redondeo y coma flotante, tal como están', () => {
  it('redondea a cuatro decimales', () => {
    const [p] = prepararPiezasDespiece({
      piezas: [pieza('A', 1, 333)],
      mapa: mapaDe(articulo('A', 'ML')),
      costePorArticulo: costesDe(['A', 0.3333]),
    })
    // 0,3333 × 0,333 × 1 = 0,1109889 exacto -> 0,111
    expect(p.costeTotal).toBe('0.111')
  })

  it('conserva cuatro decimales cuando los hay', () => {
    const [p] = prepararPiezasDespiece({
      piezas: [pieza('A', 3, 1234)],
      mapa: mapaDe(articulo('A', 'ML')),
      costePorArticulo: costesDe(['A', 1.2345]),
    })
    expect(p.costeTotal).toBe('4.5701')
  })

  // El producto crudo es 0,30000000000000004 y 3,3000000000000003: el redondeo
  // a cuatro decimales absorbe el residuo binario en estos casos. Que lo absorba
  // SIEMPRE no está demostrado, y por eso el cambio a decimal exacto necesita
  // su propia medición antes de tocar nada.
  it('el redondeo absorbe el residuo binario en los casos probados', () => {
    const preparadas = prepararPiezasDespiece({
      piezas: [pieza('A', 1, 3000), pieza('B', 3, null)],
      mapa: mapaDe(articulo('A', 'ML'), articulo('B', 'UD')),
      costePorArticulo: costesDe(['A', 0.1], ['B', 1.1]),
    })
    expect(preparadas.map((p) => p.costeTotal)).toEqual(['0.3', '3.3'])
  })

  it('no formatea a escala fija: los ceros finales no se escriben', () => {
    const [p] = prepararPiezasDespiece({
      piezas: [pieza('A', 2, null)],
      mapa: mapaDe(articulo('A', 'UD')),
      costePorArticulo: costesDe(['A', 1.5]),
    })
    // `numeric(_,4)` de la columna lo normalizará al guardarlo; lo que sale de
    // aquí es `String(number)`, no un decimal con escala.
    expect(p.costeTotal).toBe('3')
  })
})
