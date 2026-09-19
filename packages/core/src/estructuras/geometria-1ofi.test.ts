import { describe, expect, it } from 'vitest'

import { resolverGeometriaFi1Ofi } from './geometria-1ofi.js'

describe('resolverGeometriaFi1Ofi', () => {
  it.each([
    { anchoMm: 900, altoMm: 1500, fiMm: 300, ejeY: 1200 },
    { anchoMm: 900, altoMm: 1800, fiMm: 300, ejeY: 1500 },
    { anchoMm: 900, altoMm: 1800, fiMm: 400, ejeY: 1400 },
  ])(
    'sitúa el eje en $ejeY para $anchoMm x $altoMm con FI $fiMm',
    ({ anchoMm, altoMm, fiMm, ejeY }) => {
      const resultado = resolverGeometriaFi1Ofi(anchoMm, altoMm, fiMm)

      expect(resultado).toEqual({
        valido: true,
        dimensionesExteriores: { anchoMm, altoMm },
        origen: 'superior-izquierda',
        ejeY,
        fiMm,
        referenciaFi: {
          desde: 'exterior-inferior-marco-contenedor',
          hasta: 'eje-horizontal-travesano',
        },
      })
    },
  )

  it('conserva FI como distancia absoluta desde el exterior inferior', () => {
    const resultado = resolverGeometriaFi1Ofi(900, 1800, 400)

    expect(resultado.valido).toBe(true)
    if (resultado.valido) {
      expect(resultado.dimensionesExteriores.altoMm - resultado.ejeY).toBe(400)
    }
  })

  it('no altera ejeY al cambiar solo el ancho', () => {
    const estrecho = resolverGeometriaFi1Ofi(900, 1800, 400)
    const ancho = resolverGeometriaFi1Ofi(1250, 1800, 400)

    expect(estrecho.valido && estrecho.ejeY).toBe(1400)
    expect(ancho.valido && ancho.ejeY).toBe(1400)
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, '900', null])(
    'rechaza el ancho exterior inválido %s',
    (anchoMm) => {
      expect(resolverGeometriaFi1Ofi(anchoMm, 1800, 400)).toEqual({
        valido: false,
        motivo: 'ancho-invalido',
      })
    },
  )

  it.each([0, -1, Number.NaN, Number.NEGATIVE_INFINITY, '1800', null])(
    'rechaza el alto exterior inválido %s',
    (altoMm) => {
      expect(resolverGeometriaFi1Ofi(900, altoMm, 400)).toEqual({
        valido: false,
        motivo: 'alto-invalido',
      })
    },
  )

  it('rechaza FI ausente sin aplicar un valor por defecto', () => {
    expect(resolverGeometriaFi1Ofi(900, 1800)).toEqual({
      valido: false,
      motivo: 'fi-ausente',
    })
  })

  it.each([null, '400', Number.NaN, Number.POSITIVE_INFINITY])(
    'rechaza FI no numérico o no finito %s',
    (fiMm) => {
      expect(resolverGeometriaFi1Ofi(900, 1800, fiMm)).toEqual({
        valido: false,
        motivo: 'fi-invalido',
      })
    },
  )

  it.each([0, -1, 1800, 1801])('rechaza FI fuera del interior del alto: %s', (fiMm) => {
    expect(resolverGeometriaFi1Ofi(900, 1800, fiMm)).toEqual({
      valido: false,
      motivo: 'fi-fuera-de-rango',
    })
  })

  it('conserva valores decimales sin redondearlos', () => {
    const resultado = resolverGeometriaFi1Ofi(900.5, 1800.75, 400.25)

    expect(resultado).toMatchObject({
      valido: true,
      dimensionesExteriores: { anchoMm: 900.5, altoMm: 1800.75 },
      ejeY: 1400.5,
      fiMm: 400.25,
    })
  })
})
