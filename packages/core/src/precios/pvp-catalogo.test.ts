/**
 * El contrato de T.73, y sobre todo lo que YA NO se permite.
 *
 * El bloque «nunca cobra el precio de otro acabado» es el que da sentido a la
 * unidad: si alguien restaura el `ORDER BY ... acabado_codigo LIMIT 1` que había
 * en SQL, esas pruebas caen. Las demás describen el contrato positivo.
 */
import { describe, expect, it } from 'vitest'
import {
  resolverPorAcabado, resolverPvpCatalogo, type FilaPvpCatalogo,
} from './pvp-catalogo.ts'
import { resolverCosteCatalogo } from './coste-catalogo.ts'

const fila = (acabadoCodigo: string, precio: string): FilaPvpCatalogo => ({ acabadoCodigo, precio })
const invertir = (filas: readonly FilaPvpCatalogo[]): FilaPvpCatalogo[] => [...filas].reverse()

describe('sin filas', () => {
  it('no hay precio', () => {
    expect(resolverPvpCatalogo([], 'BLA')).toEqual({ estado: 'SIN_PRECIO' })
    expect(resolverPvpCatalogo([], null)).toEqual({ estado: 'SIN_PRECIO' })
  })
})

describe('el acabado exacto decide', () => {
  it('gana sobre el genérico y sobre el resto', () => {
    const filas = [fila('AAA', '10'), fila('UNI', '20'), fila('BLA', '30')]
    expect(resolverPvpCatalogo(filas, 'BLA')).toEqual({ estado: 'RESUELTO', precio: '30.0000' })
  })

  it('decide él solo: si sus filas difieren es AMBIGUO, sin caer al genérico', () => {
    // El genérico es unánime y está disponible; aun así no se usa. El acabado
    // aplicado es la respuesta, y su respuesta es «hay dos».
    const filas = [fila('BLA', '30'), fila('BLA', '31'), fila('UNI', '20')]
    expect(resolverPvpCatalogo(filas, 'BLA')).toEqual({ estado: 'AMBIGUO' })
  })

  it('un acabado repetido con el mismo precio no es ambiguo', () => {
    const filas = [fila('BLA', '30'), fila('BLA', '30.0000')]
    expect(resolverPvpCatalogo(filas, 'BLA')).toEqual({ estado: 'RESUELTO', precio: '30.0000' })
  })
})

describe('el genérico, sólo si no hay exacto', () => {
  it('UNI resuelve cuando el acabado de la línea no está', () => {
    const filas = [fila('AAA', '10'), fila('UNI', '20')]
    expect(resolverPvpCatalogo(filas, 'BLA')).toEqual({ estado: 'RESUELTO', precio: '20.0000' })
  })

  it("'*' y la cadena vacía son el mismo genérico que UNI", () => {
    expect(resolverPvpCatalogo([fila('*', '20')], 'BLA'))
      .toEqual({ estado: 'RESUELTO', precio: '20.0000' })
    expect(resolverPvpCatalogo([fila('', '20')], 'BLA'))
      .toEqual({ estado: 'RESUELTO', precio: '20.0000' })
  })

  it('tres escrituras del genérico con el mismo precio son un solo precio', () => {
    const filas = [fila('UNI', '20'), fila('*', '20.00'), fila('', '20.0000')]
    expect(resolverPvpCatalogo(filas, 'BLA')).toEqual({ estado: 'RESUELTO', precio: '20.0000' })
  })

  it('dos precios genéricos incompatibles BLOQUEAN', () => {
    const filas = [fila('UNI', '20'), fila('*', '25')]
    expect(resolverPvpCatalogo(filas, 'BLA')).toEqual({ estado: 'AMBIGUO' })
  })

  it('una línea cuyo acabado ES el genérico no lo consulta dos veces', () => {
    // 'UNI' entra por el paso 1. Si no hay fila, no hay un paso 2 que mirar:
    // sería el mismo conjunto vacío.
    expect(resolverPvpCatalogo([fila('AAA', '10')], 'UNI')).toEqual({ estado: 'SIN_PRECIO' })
    expect(resolverPvpCatalogo([fila('*', '20')], 'UNI'))
      .toEqual({ estado: 'RESUELTO', precio: '20.0000' })
  })
})

describe('nunca cobra el precio de otro acabado', () => {
  it('sin exacto ni genérico NO hay precio, aunque haya filas', () => {
    // El criterio viejo devolvía 7 aquí: 'BBB' precede a 'CCC'.
    const filas = [fila('CCC', '9'), fila('BBB', '7')]
    expect(resolverPvpCatalogo(filas, 'BLA')).toEqual({ estado: 'SIN_PRECIO' })
  })

  it('tampoco cuando esos acabados ajenos coinciden en precio', () => {
    // Unánimes, pero de productos que no son el que se vende. `coste-catalogo`
    // sí los aceptaría; el PVP no.
    const filas = [fila('CCC', '7'), fila('BBB', '7')]
    expect(resolverPvpCatalogo(filas, 'BLA')).toEqual({ estado: 'SIN_PRECIO' })
  })

  it("un acabado alfabéticamente anterior a '*' no le gana", () => {
    // '!ZZ' (0x21) precede a '*' (0x2A): con el criterio viejo ganaba el 3.
    const filas = [fila('!ZZ', '3'), fila('*', '4')]
    expect(resolverPvpCatalogo(filas, 'BLA')).toEqual({ estado: 'RESUELTO', precio: '4.0000' })
  })

  it('sin acabado en la línea sólo vale el genérico', () => {
    expect(resolverPvpCatalogo([fila('AAA', '2'), fila('*', '6')], null))
      .toEqual({ estado: 'RESUELTO', precio: '6.0000' })
    expect(resolverPvpCatalogo([fila('AAA', '2'), fila('BBB', '6')], null))
      .toEqual({ estado: 'SIN_PRECIO' })
  })
})

describe('el orden de las filas no cambia el resultado', () => {
  it.each([
    ['exacto gana', [fila('AAA', '10'), fila('UNI', '20'), fila('BLA', '30')], 'BLA'],
    ['genérico gana', [fila('AAA', '10'), fila('UNI', '20')], 'BLA'],
    ['genéricos incompatibles', [fila('UNI', '20'), fila('*', '25')], 'BLA'],
    ['ajenos no valen', [fila('CCC', '9'), fila('BBB', '7')], 'BLA'],
    ['exacto ambiguo', [fila('BLA', '30'), fila('BLA', '31')], 'BLA'],
  ] as const)('%s', (_caso, filas, acabado) => {
    expect(resolverPvpCatalogo(filas, acabado)).toEqual(resolverPvpCatalogo(invertir(filas), acabado))
  })
})

describe('comparación por valor, no por texto', () => {
  it('la escala de la BD no crea ambigüedad falsa', () => {
    const filas = [fila('UNI', '20'), fila('*', '20.0'), fila('', '20.00')]
    expect(resolverPvpCatalogo(filas, 'BLA')).toEqual({ estado: 'RESUELTO', precio: '20.0000' })
  })

  it('el precio sale siempre en la escala de la columna', () => {
    expect(resolverPvpCatalogo([fila('BLA', '30')], 'BLA'))
      .toEqual({ estado: 'RESUELTO', precio: '30.0000' })
  })

  it('un precio cero es un precio, no una ausencia', () => {
    expect(resolverPvpCatalogo([fila('BLA', '0')], 'BLA'))
      .toEqual({ estado: 'RESUELTO', precio: '0.0000' })
  })

  it('los espacios del acabado no lo convierten en otro acabado', () => {
    expect(resolverPvpCatalogo([fila('  ', '20')], 'BLA'))
      .toEqual({ estado: 'RESUELTO', precio: '20.0000' })
  })
})

describe('el criterio no depende de la escala ni del nombre del importe', () => {
  const v = (acabadoCodigo: string, valor: string) => ({ acabadoCodigo, valor })

  it('devuelve el valor en la escala que se le pide', () => {
    expect(resolverPorAcabado([v('BLA', '30')], 'BLA', 2))
      .toEqual({ estado: 'RESUELTO', valor: '30.00' })
    expect(resolverPorAcabado([v('BLA', '30')], 'BLA', 4))
      .toEqual({ estado: 'RESUELTO', valor: '30.0000' })
  })

  it('lo que a una escala es ambiguo, a otra más corta puede no serlo', () => {
    // No es un defecto: la escala es la de la columna, y dos valores que la
    // columna no puede distinguir son el mismo valor persistido.
    const filas = [v('UNI', '8.001'), v('*', '8.002')]
    expect(resolverPorAcabado(filas, 'BLA', 4)).toEqual({ estado: 'AMBIGUO' })
    expect(resolverPorAcabado(filas, 'BLA', 2)).toEqual({ estado: 'RESUELTO', valor: '8.00' })
  })
})

describe('por qué el coste del vidrio no usa resolverCosteCatalogo', () => {
  // Fija la diferencia que justifica tener dos criterios. Si alguien unifica
  // los dos módulos, esta prueba dice qué se rompe al hacerlo.
  const acabados = [{ acabadoCodigo: 'AAA', coste: '5' }, { acabadoCodigo: '*', coste: '8' }]

  it('resolverCosteCatalogo no conoce el comodín y lo declara ambiguo', () => {
    expect(resolverCosteCatalogo(acabados, 'BLA')).toEqual({ estado: 'AMBIGUO' })
  })

  it('el criterio por acabado lo resuelve al genérico', () => {
    const filas = acabados.map((f) => ({ acabadoCodigo: f.acabadoCodigo, valor: f.coste }))
    expect(resolverPorAcabado(filas, 'BLA', 4)).toEqual({ estado: 'RESUELTO', valor: '8.0000' })
  })
})
