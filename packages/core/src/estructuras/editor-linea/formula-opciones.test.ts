import { describe, expect, it } from 'vitest'
import { evaluarFormulaOpciones, parsearFormulaOpciones } from './formula-opciones.ts'

const cumple = (texto: string, marcadas: string[]) =>
  evaluarFormulaOpciones(parsearFormulaOpciones(texto)!, new Set(marcadas))

describe('fórmulas de opciones de herraje (CHM 5.1.2.12.7.7.2)', () => {
  it('sin fórmula no hay condición', () => {
    expect(parsearFormulaOpciones('')).toBeNull()
    expect(parsearFormulaOpciones(null)).toBeNull()
    expect(parsearFormulaOpciones('  ')).toBeNull()
  })

  it('una opción suelta: o11', () => {
    expect(cumple('o11', ['11'])).toBe(true)
    expect(cumple('o11', ['12'])).toBe(false)
  })

  it('+ es un O lógico: o12+o13', () => {
    expect(cumple('o12+o13', ['13'])).toBe(true)
    expect(cumple('o12+o13', ['11'])).toBe(false)
  })

  it('* es un Y lógico: o11*o20', () => {
    expect(cumple('o11*o20', ['11'])).toBe(false)
    expect(cumple('o11*o20', ['11', '20'])).toBe(true)
  })

  it('paréntesis del ejemplo del manual: (o12*o21)+(o13*o21)', () => {
    expect(cumple('(o12*o21)+(o13*o21)', ['12', '21'])).toBe(true)
    expect(cumple('(o12*o21)+(o13*o21)', ['13', '21'])).toBe(true)
    expect(cumple('(o12*o21)+(o13*o21)', ['12', '13'])).toBe(false)
  })

  it('las formas reales de la exportación (oN+oM+oK) se leen', () => {
    expect(cumple('o4+o508+o509', ['509'])).toBe(true)
    expect(cumple('o926+o927', ['925'])).toBe(false)
  })

  it('un texto mal formado lanza en vez de evaluar a ciegas', () => {
    for (const malo of ['11', 'o', 'o11+', '(o11', 'o11)', 'o11 x o12']) {
      expect(() => parsearFormulaOpciones(malo), malo).toThrow()
    }
  })
})
