import { describe, expect, it } from 'vitest'
import { eur, fmtMedidas, fmtNumero } from './formato'

describe('formato español del PDF', () => {
  it('medidas como la descripción de Productor, con miles y un decimal', () => {
    expect(fmtMedidas(970, 1999.5)).toBe('970,0 × 1.999,5')
    expect(fmtMedidas(1200, 1200)).toBe('1.200,0 × 1.200,0')
  })

  it('importes con punto de miles también en cuatro cifras', () => {
    // Intl separa el símbolo con espacio duro (U+00A0).
    expect(eur.format(1391.88)).toBe('1.391,88\u00a0€')
    expect(eur.format(514.31)).toBe('514,31\u00a0€')
    expect(eur.format(12345.6)).toBe('12.345,60\u00a0€')
  })

  it('cantidades y horas con coma decimal y sin ceros de relleno', () => {
    expect(fmtNumero('2.5')).toBe('2,5')
    expect(fmtNumero('1')).toBe('1')
    expect(fmtNumero('1250')).toBe('1.250')
    expect(fmtNumero(0.125)).toBe('0,125')
  })
})
