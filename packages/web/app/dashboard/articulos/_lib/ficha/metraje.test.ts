import { describe, expect, it } from 'vitest'
import { camposMetraje, siguienteCodigoNumerico } from './metraje.ts'

describe('camposMetraje', () => {
  it('ML deshabilita solo el múltiplo de ancho', () => {
    expect(camposMetraje('ML')).toMatchObject({ multiploAncho: false, multiploLargo: true, unidadPeso: 'Kg./ML' })
  })

  it('Unidades deshabilita los múltiplos y pesa por unidad', () => {
    expect(camposMetraje('UD')).toMatchObject({ multiploAncho: false, multiploLargo: false, unidadPeso: 'Kg./UD' })
  })

  it('M2 habilita ambos múltiplos y mide el mínimo en M2', () => {
    expect(camposMetraje('M2')).toMatchObject({ multiploAncho: true, multiploLargo: true, unidadMinimo: 'M2' })
  })
})

describe('siguienteCodigoNumerico', () => {
  it('propone el siguiente al mayor numérico, como Productor (1000 → 1001)', () => {
    expect(siguienteCodigoNumerico('1000')).toBe('1001')
  })

  it('empieza en 1 si no hay códigos numéricos', () => {
    expect(siguienteCodigoNumerico(null)).toBe('1')
  })
})
