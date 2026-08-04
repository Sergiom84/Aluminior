/**
 * Desempate del coste de catálogo, compartido por despiece y acristalamiento.
 *
 * El grueso viene de las pruebas que acompañaban a `coste-despiece` (T.69.2),
 * sin cambiar una aserción: la función es la misma, ahora en su propio módulo.
 * Se añaden los casos del CAMBIO INTENCIONAL de T.69.3, que es lo único que
 * altera comportamiento en esta unidad.
 */
import { describe, expect, it } from 'vitest'
import { costePorArticuloDe, type FilaCosteArticulo } from './coste-articulos.ts'

const fila = (
  articuloCodigo: string, acabadoCodigo: string, coste: string,
): FilaCosteArticulo => ({ articuloCodigo, acabadoCodigo, coste })

const invertir = <T>(xs: readonly T[]) => [...xs].reverse()

describe('coste elegido por artículo', () => {
  it('agrupa por artículo y aplica el desempate compartido', () => {
    const costes = costePorArticuloDe(
      [fila('A', 'UNI', '0.5000'), fila('B', 'L', '1.2500')], 'L',
    )
    expect(costes.get('A')).toBe(0.5)
    expect(costes.get('B')).toBe(1.25)
  })

  // Ni el despiece ni el acristalamiento distinguen «sin coste» de «ambiguo»:
  // los dos son null. La mano de obra sí, y por eso el resolutor de core
  // devuelve tres estados en vez de un valor opcional.
  it('colapsa el coste ambiguo a null', () => {
    const costes = costePorArticuloDe(
      [fila('A', 'L', '0.5000'), fila('A', 'ANOD', '0.9000')], null,
    )
    expect(costes.get('A')).toBeNull()
  })

  it('un artículo sin filas no entra en el mapa', () => {
    expect(costePorArticuloDe([], 'L').has('A')).toBe(false)
  })

  // `resolverCosteCatalogo` normaliza a la escala de la columna y aquí se
  // convierte a number: `0.5000` acaba siendo `0.5`, y así se persiste.
  it('convierte a number, perdiendo los ceros de escala', () => {
    expect(costePorArticuloDe([fila('A', 'UNI', '0.5000')], 'UNI').get('A')).toBe(0.5)
  })
})

/**
 * CAMBIO INTENCIONAL de T.69.3.
 *
 * El bloque del acristalamiento conservaba el desempate antiguo: por cada
 * acabado se quedaba con la PRIMERA fila que llegara. La clave de
 * `articulos_coste` es `(artículo, proveedor, acabado)`, así que un acabado
 * puede venir repetido con proveedores distintos, y la consulta no lleva
 * `ORDER BY`: PostgreSQL no promete orden, luego el coste elegido —y el margen
 * que se persiste— podía cambiar entre dos ejecuciones idénticas.
 *
 * Ahora manda el mismo criterio que despiece y mano de obra: si los proveedores
 * de ese acabado coinciden, resuelve; si discrepan, es ambiguo y no se elige.
 *
 * ALCANCE REAL: la medición de T.68 sobre el catálogo de producción encontró
 * CERO pares `(artículo, acabado)` con varias filas —27.817 filas, 17.023
 * artículos—. La corrección es defensiva y no mueve ningún coste de hoy;
 * protege de un dato que el esquema permite y que el catálogo aún no tiene.
 */
describe('varios proveedores para el mismo artículo y acabado', () => {
  it('resuelve cuando coinciden, en cualquier orden', () => {
    const filas = [fila('A', 'UNI', '0.5000'), fila('A', 'UNI', '0.5000')]
    expect(costePorArticuloDe(filas, 'UNI').get('A')).toBe(0.5)
    expect(costePorArticuloDe(invertir(filas), 'UNI').get('A')).toBe(0.5)
  })

  it('coinciden aunque el catálogo los escriba con distinta escala', () => {
    const filas = [fila('A', 'UNI', '0.5'), fila('A', 'UNI', '0.5000')]
    expect(costePorArticuloDe(filas, 'UNI').get('A')).toBe(0.5)
    expect(costePorArticuloDe(invertir(filas), 'UNI').get('A')).toBe(0.5)
  })

  // Lo que antes devolvía 0.5 o 0.9 según el orden de la consulta.
  it('NO elige uno cuando discrepan: ambiguo, sin coste', () => {
    const filas = [fila('A', 'UNI', '0.5000'), fila('A', 'UNI', '0.9000')]
    expect(costePorArticuloDe(filas, 'UNI').get('A')).toBeNull()
    expect(costePorArticuloDe(invertir(filas), 'UNI').get('A')).toBeNull()
  })

  it('da el mismo resultado en cualquier permutación', () => {
    const filas = [
      fila('A', 'UNI', '0.5000'), fila('A', 'UNI', '0.9000'), fila('A', 'L', '0.5000'),
    ]
    const permutaciones = [
      [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
    ]
    for (const orden of permutaciones) {
      const mezcladas = orden.map((i) => filas[i])
      expect(costePorArticuloDe(mezcladas, 'UNI').get('A')).toBeNull()
      expect(costePorArticuloDe(mezcladas, 'L').get('A')).toBe(0.5)
      // Sin fila del acabado aplicado, el fallback global también discrepa.
      expect(costePorArticuloDe(mezcladas, 'ANOD').get('A')).toBeNull()
    }
  })

  // El fallback global mira TODAS las filas. El desempate antiguo deduplicaba
  // por acabado quedándose con la primera, y aquí habría devuelto 0.5: un coste
  // elegido a dedo entre dos proveedores.
  it('el fallback global no deduplica por acabado', () => {
    const filas = [
      fila('A', 'L', '0.5000'), fila('A', 'L', '0.9000'), fila('A', 'ANOD', '0.5000'),
    ]
    expect(costePorArticuloDe(filas, 'UNI').get('A')).toBeNull()
  })
})
