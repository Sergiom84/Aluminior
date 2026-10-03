import { describe, expect, it } from 'vitest'
import { precioConComision } from './comision.ts'

describe('precioConComision', () => {
  it('multiplica el precio de línea por 1 + comisión y redondea a céntimos', () => {
    expect(precioConComision('905.62', '-10')).toBe('815.06')
    expect(precioConComision('796.22', '10')).toBe('875.84')
    expect(precioConComision('100.00', '5')).toBe('105.00')
    expect(precioConComision('786.98', '-50')).toBe('393.49')
  })
  it('sin comisión deja el precio y rechaza un factor negativo', () => {
    expect(precioConComision('12.345', null)).toBe('12.35')
    expect(precioConComision('12.30', '0')).toBe('12.30')
    expect(() => precioConComision('10', '-150')).toThrow()
  })
})
