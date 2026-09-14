import { describe, expect, it } from 'vitest'
import { prepararValoracionVidrio } from './valoracion-vidrio.ts'

describe('J01 — vidrio con oráculo numérico independiente', () => {
  it('1194,5×594,5 mm → 120×60 cm → 0,72 m²; dos a 25 €/m² = 36 €', () => {
    const r = prepararValoracionVidrio({ vidrioCodigo: '__J01_V',
      cristales: [{ largoMm: 1194.5, anchoMm: 594.5, cantidad: 2 }],
      reglasMetraje: { multiploLargoCm: 1, multiploAnchoCm: 1, metrajeMinimo: 0.5 },
      precioM2: 25, costeM2: 8,
    })
    expect(r.importe).toBe(36)
    expect(r.piezas).toEqual([{ articuloCodigo: '__J01_V', cantidad: '2', largoCorteMm: '1194.5',
      anchoCorteMm: '594.5', anguloIzquierdo: null, anguloDerecho: null, funcion: 'VIDRIO',
      costeUnitario: '8', costeTotal: '11.52' }])
  })
  it('dos cristales de 0,06 m² tienen cada uno mínimo 0,5 m²: 25 €', () => {
    const r = prepararValoracionVidrio({ vidrioCodigo: '__J01_V',
      cristales: [{ largoMm: 300, anchoMm: 200, cantidad: 2 }],
      reglasMetraje: { multiploLargoCm: 1, multiploAnchoCm: 1, metrajeMinimo: 0.5 },
      precioM2: 25, costeM2: null,
    })
    expect(r.importe).toBe(25)
    expect(r.piezas[0].costeTotal).toBeNull()
  })
})
