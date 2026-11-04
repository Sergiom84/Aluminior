import { describe, expect, it } from 'vitest'
import { formatoMedida } from './formato-medida.ts'

describe('formato de medida de la descripción', () => {
  it('agrupa también las cuatro cifras y deja un decimal con coma', () => {
    expect(formatoMedida(970)).toBe('970,0')
    expect(formatoMedida(1200)).toBe('1.200,0')
    expect(formatoMedida(1999.5)).toBe('1.999,5')
    expect(formatoMedida(12000)).toBe('12.000,0')
    expect(formatoMedida(0)).toBe('0,0')
  })

  it('no convierte una medida ausente en cero', () => {
    expect(() => formatoMedida(Number.NaN)).toThrow(/finito/)
  })
})
