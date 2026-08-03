import { describe, expect, it } from 'vitest'
import { resolverCosteCatalogo } from './coste-catalogo.ts'

const fila = (acabadoCodigo: string, coste: string) => ({ acabadoCodigo, coste })

describe('desempate del coste de catálogo', () => {
  it('sin filas, no hay coste', () => {
    expect(resolverCosteCatalogo([], 'UNI')).toEqual({ estado: 'SIN_COSTE' })
    expect(resolverCosteCatalogo([], null)).toEqual({ estado: 'SIN_COSTE' })
  })

  it('usa la fila del acabado aplicado cuando existe', () => {
    const filas = [fila('UNI', '0.5000'), fila('L', '0.7500')]
    expect(resolverCosteCatalogo(filas, 'L')).toEqual({ estado: 'RESUELTO', coste: '0.7500' })
    expect(resolverCosteCatalogo(filas, 'UNI')).toEqual({ estado: 'RESUELTO', coste: '0.5000' })
  })

  // Varias filas no son varios candidatos: si todas valen lo mismo no hay nada
  // que desempatar, y exigir acabado dejaría sin coste un artículo que sí lo
  // tiene. Es el caso real medido: los seis artículos de mano de obra con coste
  // tienen una sola fila, acabado UNI, 0,5000.
  it('usa el coste único cuando no hay fila del acabado aplicado', () => {
    const filas = [fila('UNI', '0.5000'), fila('L', '0.5000')]
    expect(resolverCosteCatalogo(filas, 'ANOD')).toEqual({ estado: 'RESUELTO', coste: '0.5000' })
    expect(resolverCosteCatalogo(filas, null)).toEqual({ estado: 'RESUELTO', coste: '0.5000' })
  })

  it('no elige cuando hay costes distintos y ninguno del acabado aplicado', () => {
    const filas = [fila('UNI', '0.5000'), fila('L', '0.7500')]
    expect(resolverCosteCatalogo(filas, 'ANOD')).toEqual({ estado: 'AMBIGUO' })
    expect(resolverCosteCatalogo(filas, null)).toEqual({ estado: 'AMBIGUO' })
  })

  // `0.5` y `0.5000` son el mismo coste. Compararlos como texto los haría
  // parecer dos candidatos y daría un AMBIGUO falso, que deja sin margen un
  // artículo perfectamente resuelto.
  it('compara por valor, no por texto', () => {
    const filas = [fila('UNI', '0.5'), fila('L', '0.5000'), fila('ANOD', '0.50')]
    expect(resolverCosteCatalogo(filas, null)).toEqual({ estado: 'RESUELTO', coste: '0.5000' })
  })

  it('normaliza a la escala de la columna', () => {
    expect(resolverCosteCatalogo([fila('UNI', '0.5')], 'UNI'))
      .toEqual({ estado: 'RESUELTO', coste: '0.5000' })
  })

  it('no mira más allá del acabado aplicado cuando éste tiene filas', () => {
    // Aunque el resto del artículo sea unánime, manda el acabado aplicado.
    const filas = [fila('UNI', '0.9000'), fila('L', '0.5000'), fila('ANOD', '0.5000')]
    expect(resolverCosteCatalogo(filas, 'UNI')).toEqual({ estado: 'RESUELTO', coste: '0.9000' })
  })
})

/**
 * `articulos_coste` tiene una fila por `(artículo, proveedor, acabado)`: el
 * mismo acabado puede venir repetido con proveedores distintos. Quedarse con la
 * primera fila hacía que el margen dependiera del plan de la consulta —sin
 * `ORDER BY` PostgreSQL no promete orden—, así que el mismo presupuesto podía
 * costar dos cosas distintas.
 */
describe('varios proveedores para el mismo acabado', () => {
  const invertir = <T>(xs: readonly T[]) => [...xs].reverse()

  it('resuelve cuando los proveedores coinciden en el coste', () => {
    const filas = [fila('UNI', '0.5000'), fila('UNI', '0.5000')]
    expect(resolverCosteCatalogo(filas, 'UNI')).toEqual({ estado: 'RESUELTO', coste: '0.5000' })
    expect(resolverCosteCatalogo(invertir(filas), 'UNI'))
      .toEqual({ estado: 'RESUELTO', coste: '0.5000' })
  })

  it('coinciden aunque estén escritos con distinta escala', () => {
    const filas = [fila('UNI', '0.5'), fila('UNI', '0.5000')]
    expect(resolverCosteCatalogo(filas, 'UNI')).toEqual({ estado: 'RESUELTO', coste: '0.5000' })
    expect(resolverCosteCatalogo(invertir(filas), 'UNI'))
      .toEqual({ estado: 'RESUELTO', coste: '0.5000' })
  })

  it('NO elige uno cuando los proveedores discrepan', () => {
    const filas = [fila('UNI', '0.5000'), fila('UNI', '0.9000')]
    expect(resolverCosteCatalogo(filas, 'UNI')).toEqual({ estado: 'AMBIGUO' })
    expect(resolverCosteCatalogo(invertir(filas), 'UNI')).toEqual({ estado: 'AMBIGUO' })
  })

  // El resultado no puede depender del orden en que la consulta devuelva las
  // filas. Se comprueba sobre todas las permutaciones de un caso pequeño.
  it('da el mismo resultado en cualquier orden', () => {
    const filas = [fila('UNI', '0.5000'), fila('UNI', '0.9000'), fila('L', '0.5000')]
    const permutaciones = [
      [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
    ]
    for (const orden of permutaciones) {
      const mezcladas = orden.map((i) => filas[i])
      expect(resolverCosteCatalogo(mezcladas, 'UNI')).toEqual({ estado: 'AMBIGUO' })
      expect(resolverCosteCatalogo(mezcladas, 'L'))
        .toEqual({ estado: 'RESUELTO', coste: '0.5000' })
      // Sin acabado aplicable, el fallback global también discrepa.
      expect(resolverCosteCatalogo(mezcladas, 'ANOD')).toEqual({ estado: 'AMBIGUO' })
    }
  })

  it('el fallback global mira TODAS las filas, no una por acabado', () => {
    // Antes se deduplicaba por acabado quedándose con la primera, y este caso
    // devolvía 0,5000: un coste elegido a dedo entre dos proveedores.
    const filas = [fila('L', '0.5000'), fila('L', '0.9000'), fila('ANOD', '0.5000')]
    expect(resolverCosteCatalogo(filas, 'UNI')).toEqual({ estado: 'AMBIGUO' })
  })
})
