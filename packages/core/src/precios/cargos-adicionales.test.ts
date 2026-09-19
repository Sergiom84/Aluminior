import { describe, expect, it } from 'vitest'
import {
  metrajeCargo, precioCargoTrasRecalculo, totalCargos, valorarCargo, type CargoAdicional,
} from './cargos-adicionales.ts'

const cargo = (extra: Partial<CargoAdicional>): CargoAdicional => ({
  articuloCodigo: 'X', tipoMetraje: 'UD', cantidad: '1', largoMm: null, anchoMm: null,
  precio: '1.00', respetarPrecio: false, ...extra,
})

describe('cargos adicionales de la línea (CHM 5.3.1.3.2.2, VCargosAd)', () => {
  it('por unidades: metraje = cantidad e importe = metraje x precio (55 x 0,85)', () => {
    expect(valorarCargo(cargo({ cantidad: '55', precio: '0.85' })))
      .toEqual({ completo: true, metraje: '55.000', importe: '46.75' })
  })

  it('por metro lineal: metraje = cantidad x largo (1 x 4000 mm a 7,34)', () => {
    expect(valorarCargo(cargo({ tipoMetraje: 'ML', largoMm: '4000', precio: '7.34' })))
      .toEqual({ completo: true, metraje: '4.000', importe: '29.36' })
  })

  it('ejemplo del manual: rectangular de 250 cm', () => {
    expect(metrajeCargo(cargo({ tipoMetraje: 'ML', cantidad: '2', largoMm: '2500' }))).toEqual({ metraje: '5.000' })
  })

  it('sin cantidad el original pone 0 y el cargo vale 0, no queda sin valorar', () => {
    expect(valorarCargo(cargo({ cantidad: null, precio: '12.00' })))
      .toEqual({ completo: true, metraje: '0.000', importe: '0.00' })
    expect(valorarCargo(cargo({ cantidad: '', precio: '12.00' })).completo).toBe(true)
  })

  it('sin precio no se valora en cero', () => {
    expect(valorarCargo(cargo({ precio: null }))).toMatchObject({ completo: false, importe: null })
  })

  it('ML sin largo y M2 quedan incompletos: sin regla verificada no se inventa metraje', () => {
    expect(valorarCargo(cargo({ tipoMetraje: 'ML' })).completo).toBe(false)
    expect(valorarCargo(cargo({ tipoMetraje: 'M2', largoMm: '1000', anchoMm: '1000' })).completo).toBe(false)
  })

  it('Total Cargos suma los importes y se invalida si falta cualquiera', () => {
    const buenos = [cargo({ cantidad: '55', precio: '0.85' }), cargo({ tipoMetraje: 'ML', largoMm: '4000', precio: '7.34' })]
    expect(totalCargos(buenos)).toEqual({ completo: true, importe: '76.11', incidencias: [] })
    expect(totalCargos([])).toEqual({ completo: true, importe: '0.00', incidencias: [] })
    const conHueco = totalCargos([...buenos, cargo({ articuloCodigo: 'SINP', precio: null })])
    expect(conHueco.completo).toBe(false)
    expect(conHueco.importe).toBeNull()
    expect(conHueco.incidencias).toEqual(['SINP: sin precio en esta tarifa'])
  })

  it('Respetar PVP conserva el precio manual al recalcular', () => {
    expect(precioCargoTrasRecalculo(cargo({ precio: '9.99', respetarPrecio: true }), '12.00')).toBe('9.99')
    expect(precioCargoTrasRecalculo(cargo({ precio: '9.99' }), '12.00')).toBe('12.00')
  })
})
