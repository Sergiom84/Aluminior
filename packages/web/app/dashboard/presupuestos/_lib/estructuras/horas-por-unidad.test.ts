import { describe, expect, it } from 'vitest'
import { minutosDeHoras, piezasHorasSinValorar } from './horas-por-unidad.ts'

describe('horas manuales por unidad', () => {
  it('convierte horas a minutos exactos', () => {
    expect(minutosDeHoras('6.07')).toBe(364.2)
    expect(minutosDeHoras('1.5')).toBe(90)
    expect(minutosDeHoras('0')).toBe(0)
    expect(minutosDeHoras('')).toBe(0)
    expect(minutosDeHoras(null)).toBe(0)
  })

  it('da una fila MO y otra MOCOL por unidad, sin coste', () => {
    expect(piezasHorasSinValorar({ horasFabricacion: '1', horasColocacion: '6.07' })).toEqual([
      expect.objectContaining({ articuloCodigo: 'MO', funcion: 'MO', cantidad: '60', acabadoCodigo: 'UNI',
        costeUnitario: null, costeTotal: null }),
      expect.objectContaining({ articuloCodigo: 'MOCOL', funcion: 'MOCOL', cantidad: '364.2', acabadoCodigo: 'UNI',
        costeUnitario: null, costeTotal: null }),
    ])
  })

  it('omite el concepto a cero y respeta el acabado de accesorios', () => {
    expect(piezasHorasSinValorar({ horasFabricacion: '0', horasColocacion: '2', acabadoAccesoriosCodigo: 'ACC' }))
      .toEqual([expect.objectContaining({ articuloCodigo: 'MOCOL', cantidad: '120', acabadoCodigo: 'ACC' })])
    expect(piezasHorasSinValorar({ horasFabricacion: '0.00', horasColocacion: null })).toEqual([])
  })
})
