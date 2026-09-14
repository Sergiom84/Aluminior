import { describe, expect, it } from 'vitest'
import { totalLineaCerramiento } from './total-cerramiento.ts'

describe('cantidad material y mano de obra total de línea', () => {
  it.each([['2', '311.66'], ['3', '452.49']])('cantidad %s aplica una sola hora manual', (cantidad, importe) => {
    expect(totalLineaCerramiento({ completo: true, importe: '140.83' }, cantidad,
      [{ completo: true, importe: '30.00' }])).toEqual({ completo: true, importe })
  })
  it('no convierte una ausencia material ni manual en subtotal comercial', () => {
    expect(totalLineaCerramiento({ completo: false, importe: null }, '2', [])).toEqual({ completo: false, importe: null })
    expect(totalLineaCerramiento({ completo: true, importe: '140.83' }, '2',
      [{ completo: false, importe: null }])).toEqual({ completo: false, importe: null })
  })
  it('conserva cero legítimo y rechaza cantidades inválidas', () => {
    expect(totalLineaCerramiento({ completo: true, importe: '0' }, '2', [])).toEqual({ completo: true, importe: '0.00' })
    for (const cantidad of ['0', '-1', 'NaN']) expect(() => totalLineaCerramiento({ completo: true, importe: '10' }, cantidad, [])).toThrow()
  })
  it('un céntimo manual no se pierde al repartirlo entre tres unidades', () => {
    expect(totalLineaCerramiento({ completo: true, importe: '140.83' }, '3',
      [{ completo: true, importe: '0.01' }])).toEqual({ completo: true, importe: '422.50' })
  })
  it('coste mantiene cuatro decimales y mano de obra total de línea', () => {
    expect(totalLineaCerramiento({ completo: true, importe: '53.6720' }, '2',
      [{ completo: true, importe: '15.00' }], 4)).toEqual({ completo: true, importe: '122.3440' })
  })
})
