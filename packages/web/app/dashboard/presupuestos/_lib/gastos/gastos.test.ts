import { describe, expect, it } from 'vitest'
import { esquemaGastos } from './esquema.ts'
import { comisionSumada, mismaComision } from './gastos-documento.ts'

const id = '00000000-0000-4000-8000-000000000001'
const parse = (comisionPorc: unknown, sumarComision?: string) =>
  esquemaGastos.safeParse({ presupuestoId: id, comisionPorc, ...(sumarComision ? { sumarComision } : {}) })

describe('pestaña Gastos: comisión', () => {
  it('normaliza el porcentaje con signo y lee la casilla', () => {
    expect(parse('10', 'on')).toMatchObject({ success: true, data: { comisionPorc: '10.00', sumarComision: true } })
    expect(parse('-50')).toMatchObject({ success: true, data: { comisionPorc: '-50.00', sumarComision: false } })
    expect(parse('')).toMatchObject({ success: true, data: { comisionPorc: '0.00' } })
    expect(parse('5.5')).toMatchObject({ success: true, data: { comisionPorc: '5.50' } })
  })

  it('rechaza coma decimal, más de dos decimales y -100 o menos', () => {
    for (const valor of ['5,5', '1.234', '-100', '-150', '1000', 'diez']) expect(parse(valor).success).toBe(false)
  })

  it('solo suma la comisión con la casilla marcada y distinta de cero', () => {
    expect(comisionSumada({ comisionPorc: '10.00', sumarComision: true })).toBe('10.00')
    expect(comisionSumada({ comisionPorc: '10.00', sumarComision: false })).toBeNull()
    expect(comisionSumada({ comisionPorc: '0.00', sumarComision: true })).toBeNull()
  })

  it('compara comisiones como decimales', () => {
    expect(mismaComision('10', '10.00')).toBe(true)
    expect(mismaComision(null, null)).toBe(true)
    expect(mismaComision('10.00', null)).toBe(false)
    expect(mismaComision('-5.00', '5.00')).toBe(false)
  })
})
