import { describe, expect, it } from 'vitest'
import { resolverPrecioArticulo, type FilaPrecioArticulo } from './valorar-articulo.ts'

const filas: FilaPrecioArticulo[] = [
  { acabadoCodigo: 'BLA', precio: '12.3400' },
  { acabadoCodigo: 'MAD', precio: '99.9900' },
]

describe('resolverPrecioArticulo', () => {
  it('elige sólo el acabado exacto aunque otro precio actúe como señuelo', () => {
    expect(resolverPrecioArticulo(filas, 'BLA', 1))
      .toEqual({ precio: '12.3400', acabadoAplicado: 'BLA' })
    expect(resolverPrecioArticulo(filas, 'MAD', 1))
      .toEqual({ precio: '99.9900', acabadoAplicado: 'MAD' })
  })

  it('sin acabado no escoge el primero alfabéticamente', () => {
    expect(resolverPrecioArticulo(filas, null, 1)).toEqual({
      precio: null,
      aviso: 'Importe incompleto: elige un acabado con precio para este artículo.',
    })
  })

  it('un acabado ausente queda sin valorar aunque existan otros', () => {
    expect(resolverPrecioArticulo(filas, 'NEG', 3)).toEqual({
      precio: null,
      aviso: 'Importe incompleto: el artículo no tiene precio para el acabado NEG en la tarifa 3.',
    })
  })

  it('usa UNI como precio contractual independiente del acabado', () => {
    const generica = [{ acabadoCodigo: 'UNI', precio: '7.5000' }, ...filas]
    expect(resolverPrecioArticulo(generica, null, 2))
      .toEqual({ precio: '7.5000', acabadoAplicado: 'UNI' })
    expect(resolverPrecioArticulo(generica, 'NEG', 2))
      .toEqual({ precio: '7.5000', acabadoAplicado: 'UNI' })
  })

  it('acepta el comodín histórico y prioriza el exacto sobre él', () => {
    const conComodin = [{ acabadoCodigo: '*', precio: '5.0000' }, ...filas]
    expect(resolverPrecioArticulo(conComodin, null, 1))
      .toEqual({ precio: '5.0000', acabadoAplicado: '*' })
    expect(resolverPrecioArticulo(conComodin, 'MAD', 1))
      .toEqual({ precio: '99.9900', acabadoAplicado: 'MAD' })
  })

  it('no arbitra entre dos genéricos incompatibles', () => {
    expect(resolverPrecioArticulo([
      { acabadoCodigo: '*', precio: '5.0000' },
      { acabadoCodigo: 'UNI', precio: '6.0000' },
    ], null, 4)).toEqual({
      precio: null,
      aviso: 'Importe incompleto: la tarifa 4 contiene precios genéricos incompatibles para el artículo.',
    })
  })

  it('preserva un cero real como precio valorado', () => {
    expect(resolverPrecioArticulo([
      { acabadoCodigo: 'UNI', precio: '0.0000' },
    ], null, 2)).toEqual({ precio: '0.0000', acabadoAplicado: 'UNI' })
  })

  it('distingue una tarifa vacía de un precio cero', () => {
    expect(resolverPrecioArticulo([], null, 9)).toEqual({
      precio: null,
      aviso: 'Importe incompleto: el artículo no tiene precio en la tarifa 9.',
    })
  })

  describe('criterio compartido con el resto de la línea (T.73)', () => {
    it('la cadena vacía es genérica, igual que en el despiece', () => {
      // Antes de unificar, aquí `''` no estaba en ACABADOS_GENERICOS: el mismo
      // artículo se valoraba en una línea de estructura y quedaba sin precio en
      // una línea de artículo suelto.
      expect(resolverPrecioArticulo([{ acabadoCodigo: '', precio: '4.0000' }], 'NEG', 1))
        .toEqual({ precio: '4.0000', acabadoAplicado: '' })
    })

    it('la escala de la BD no crea genéricos incompatibles falsos', () => {
      // '5' y '5.0000' son el mismo precio. Se comparan como decimal exacto, no
      // con Number(), que es lo que decimal.ts prohíbe para importes.
      expect(resolverPrecioArticulo([
        { acabadoCodigo: 'UNI', precio: '5' },
        { acabadoCodigo: '*', precio: '5.0000' },
      ], null, 1)).toEqual({ precio: '5', acabadoAplicado: 'UNI' })
    })

    it('el precio devuelto es el texto de la fila, sin normalizar a la escala', () => {
      expect(resolverPrecioArticulo([{ acabadoCodigo: 'UNI', precio: '7.5' }], null, 1))
        .toEqual({ precio: '7.5', acabadoAplicado: 'UNI' })
    })

    it('entre genéricos empatados gana UNI, no el orden de las filas', () => {
      const filas = [
        { acabadoCodigo: '*', precio: '5.0000' },
        { acabadoCodigo: 'UNI', precio: '5.0000' },
      ]
      expect(resolverPrecioArticulo(filas, null, 1))
        .toEqual({ precio: '5.0000', acabadoAplicado: 'UNI' })
      expect(resolverPrecioArticulo([...filas].reverse(), null, 1))
        .toEqual({ precio: '5.0000', acabadoAplicado: 'UNI' })
    })

    it('sigue sin cobrar el precio de otro acabado', () => {
      expect(resolverPrecioArticulo([
        { acabadoCodigo: 'BBB', precio: '7.0000' },
        { acabadoCodigo: 'CCC', precio: '9.0000' },
      ], 'BLA', 1)).toEqual({
        precio: null,
        aviso: 'Importe incompleto: el artículo no tiene precio para el acabado BLA en la tarifa 1.',
      })
    })
  })
})
