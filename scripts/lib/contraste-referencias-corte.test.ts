import { describe, expect, it } from 'vitest'
import { contrastarReferencias, type PiezaReferencia } from './contraste-referencias-corte'

const pieza = (datos: Partial<PiezaReferencia> = {}): PiezaReferencia => ({
  documento: 'sintetico', estructura: 'a', id: '1', referencia: null,
  formula: null, largo: 900, descuentoInicio: 0, descuentoFin: 0, ...datos,
})

describe('contraste retrospectivo de referencias de corte', () => {
  it('aplica descuentos negativos después de la división de REF', () => {
    const resultado = contrastarReferencias([
      pieza(), pieza({ id: '2', referencia: '1', formula: 'REF/2', largo: 454,
        descuentoInicio: -2, descuentoFin: -2 }),
    ])
    expect(resultado[0]).toMatchObject({ estado: 'comparada', esperado: 454, diferencia: 0 })
  })
  it('separa documentos y estructuras con los mismos identificadores', () => {
    const resultado = contrastarReferencias([
      pieza(), pieza({ documento: 'otro', largo: 200 }),
      pieza({ estructura: 'b', largo: 400 }),
      pieza({ id: '2', referencia: '1', formula: 'REF', largo: 900 }),
    ])
    expect(resultado[0]).toMatchObject({ estado: 'comparada', esperado: 900 })
  })
  it('no convierte referencias ausentes ni ambiguas en medidas', () => {
    const hija = pieza({ id: '2', referencia: '1', formula: 'REF' })
    expect(contrastarReferencias([hija])[0]?.estado).toBe('ausente')
    expect(contrastarReferencias([pieza(), pieza(), hija])[0]?.estado).toBe('ambigua')
  })
  it('no inventa variables, ni sustituye datos inválidos por cero', () => {
    const hija = pieza({ id: '2', referencia: '1', formula: 'REF-A' })
    expect(contrastarReferencias([pieza(), hija])[0]?.estado).toBe('formula-no-resuelta')
    expect(contrastarReferencias([pieza({ largo: NaN }), hija])[0]?.estado).toBe('dato-invalido')
  })
})
