import { describe, expect, it } from 'vitest'
import { metrajeSuperficie } from './metraje-superficie.ts'

const sinRegla = { multiploAnchoCm: null, multiploLargoCm: null, minimo: null }

describe('metraje por M2', () => {
  it('redondea la superficie a 2 decimales (1200 x 1045 = 1,254 -> 1,25)', () => {
    expect(metrajeSuperficie(1200, 1045, sinRegla)).toBe('1.25')
    expect(metrajeSuperficie(1000, 1005, sinRegla)).toBe('1.01')
  })

  it('aplica el mínimo después de redondear (COM001: 1,44 -> 1,50)', () => {
    expect(metrajeSuperficie(1200, 1200, { multiploAnchoCm: 5, multiploLargoCm: 5, minimo: '1.5' })).toBe('1.50')
    expect(metrajeSuperficie(1500, 1500, { ...sinRegla, minimo: '1.5' })).toBe('2.25')
  })

  it('lleva cada dimensión al múltiplo en cm hacia arriba', () => {
    expect(metrajeSuperficie(1210, 1000, { ...sinRegla, multiploAnchoCm: 5 })).toBe('1.25')
    expect(metrajeSuperficie(1000, 1201, { ...sinRegla, multiploLargoCm: 10 })).toBe('1.30')
  })

  it('rechaza medidas que no son enteros positivos', () => {
    expect(() => metrajeSuperficie(0, 1000, sinRegla)).toThrow()
    expect(() => metrajeSuperficie(1000.5, 1000, sinRegla)).toThrow()
  })
})
