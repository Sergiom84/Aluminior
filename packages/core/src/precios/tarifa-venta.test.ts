import { describe, expect, it } from 'vitest'
import {
  admitirTarifaEnVentas,
  exigirTarifaModificable,
  permitirActualizacionTarifa,
  type TarifaVenta,
} from './tarifa-venta.ts'

// Datos sintéticos. El código 99 y el nombre no corresponden a ninguna tarifa
// real del taller: los nombres y códigos que se usan de verdad son un dato del
// titular que todavía no tenemos.
const tarifa = (parcial: Partial<TarifaVenta> = {}): TarifaVenta => ({
  codigo: 99,
  nombre: 'TARIFA DE PRUEBA',
  validaParaVentas: true,
  bloqueada: false,
  ...parcial,
})

describe('tarifa de venta como registro', () => {
  it('admite en ventas la tarifa marcada como válida', () => {
    const t = tarifa()
    expect(admitirTarifaEnVentas(t)).toEqual({ estado: 'ADMITIDA', tarifa: t })
  })

  // Sin la marca, la tarifa puede ser perfectamente la de coste. Rechazarla con
  // motivo es lo que impide venderla a precio de compra sin que nadie lo vea.
  it('rechaza con motivo la tarifa que no vale para ventas', () => {
    expect(admitirTarifaEnVentas(tarifa({ validaParaVentas: false }))).toEqual({
      estado: 'RECHAZADA',
      motivo: 'TARIFA_NO_VALIDA_PARA_VENTAS',
      codigo: 99,
    })
  })

  it('el bloqueo no impide vender, sólo reescribir', () => {
    const bloqueada = tarifa({ bloqueada: true })
    expect(admitirTarifaEnVentas(bloqueada).estado).toBe('ADMITIDA')
    expect(permitirActualizacionTarifa(bloqueada)).toEqual({
      estado: 'DENEGADA',
      motivo: 'TARIFA_BLOQUEADA',
      codigo: 99,
    })
  })

  it('permite actualizar la tarifa desbloqueada', () => {
    const t = tarifa()
    expect(permitirActualizacionTarifa(t)).toEqual({ estado: 'PERMITIDA', tarifa: t })
  })

  it('la guarda dura revienta sobre una tarifa bloqueada y calla sobre una libre', () => {
    expect(() => exigirTarifaModificable(tarifa({ bloqueada: true }))).toThrow(/bloqueada/)
    expect(() => exigirTarifaModificable(tarifa())).not.toThrow()
  })
})
