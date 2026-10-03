import { describe, expect, it } from 'vitest'
import { importeFila, type ArticuloTarifado } from './importe-fila.ts'

const articulo = (a: Partial<ArticuloTarifado>): ArticuloTarifado => ({
  tipoMetraje: 'UD', pvp: 2, multiploLargoCm: 0, multiploAnchoCm: 0, minimo: 0, incrementos: [], ...a,
})

describe('importeFila', () => {
  it('UD por cantidad y ML por metros de pieza a dos decimales', () => {
    expect(importeFila({ cantidad: 3, largoMm: null, anchoMm: null }, articulo({ pvp: 1.25 }))).toEqual({ metraje: 3, precio: 1.25, importe: 3.75, incidencia: null })
    // 0,50225 m -> 0,50 ; 1,257 m -> 1,26 (redondeo por pieza, no del total)
    expect(importeFila({ cantidad: 4, largoMm: 502.25, anchoMm: null }, articulo({ tipoMetraje: 'ML', pvp: 1.81 })).importe).toBe(3.62)
    expect(importeFila({ cantidad: 2, largoMm: 1257, anchoMm: null }, articulo({ tipoMetraje: 'ML', pvp: 1.81 })).importe).toBe(4.56)
  })
  it('M2 con múltiplos en cm, mínimo e incrementos por metraje y por lado mayor', () => {
    const vidrio = articulo({
      tipoMetraje: 'M2', pvp: 10, multiploLargoCm: 6, multiploAnchoCm: 6, minimo: 0.7,
      incrementos: [
        { tipo: 'MET', desde: 2, hasta: 2.99, porcentaje: 8 },
        { tipo: 'MED', desde: 2500, hasta: 99999, porcentaje: 30 },
      ],
    })
    expect(importeFila({ cantidad: 1, largoMm: 1176.5, anchoMm: 439.5 }, vidrio)).toEqual({ metraje: 0.7, precio: 10, importe: 7, incidencia: null })
    // 1500 x 1400 -> 1,5 x 1,44 = 2,16 m2 ; +8 %
    expect(importeFila({ cantidad: 1, largoMm: 1500, anchoMm: 1400 }, vidrio).importe).toBe(23.33)
    // 2600 x 400 -> 2,64 x 0,42 = 1,11 m2 ; lado mayor 2600 -> +30 %
    expect(importeFila({ cantidad: 1, largoMm: 2600, anchoMm: 400 }, vidrio).importe).toBe(14.43)
  })
  it('el incremento va al precio a céntimos, no al metraje', () => {
    const laminar = articulo({ tipoMetraje: 'M2', pvp: 215.33, incrementos: [{ tipo: 'MED', desde: 2400, hasta: 99999, porcentaje: 40 }] })
    // 2414 x 2506 -> 6,05 m2 ; 215,33 + 40 % = 301,46 ; 1823,83 (incrementar el metraje daría 1823,85)
    expect(importeFila({ cantidad: 1, largoMm: 2414, anchoMm: 2506 }, laminar)).toEqual({ metraje: 6.05, precio: 301.46, importe: 1823.83, incidencia: null })
  })
  it('sin PVP o sin medida no hay importe', () => {
    expect(importeFila({ cantidad: 1, largoMm: 1000, anchoMm: null }, articulo({ tipoMetraje: 'ML', pvp: null }))).toMatchObject({ importe: null, incidencia: 'sin PVP en la tarifa' })
    expect(importeFila({ cantidad: 1, largoMm: null, anchoMm: null }, articulo({ tipoMetraje: 'ML' })).incidencia).toBe('sin largo')
    expect(importeFila({ cantidad: 1, largoMm: 1000, anchoMm: null }, articulo({ tipoMetraje: 'M2' })).incidencia).toBe('sin superficie')
    expect(importeFila({ cantidad: 1, largoMm: 1000, anchoMm: null }, null).importe).toBeNull()
    expect(importeFila({ cantidad: 1, largoMm: 1000, anchoMm: null }, articulo({ tipoMetraje: 'ML', minimo: 1 })).importe).toBeNull()
  })
})
