import { describe, expect, it } from 'vitest'
import { alturaCajonCompacto, medidasConCompacto } from './compacto.ts'

// Tabla de la captura 5.1.2.13.1-005 del CHM.
const tramos = [
  { altoCajonMm: 155, desdeMm: 0, hastaMm: 1650 },
  { altoCajonMm: 170, desdeMm: 1651, hastaMm: 2200 },
  { altoCajonMm: 184, desdeMm: 2201, hastaMm: 2700 },
  { altoCajonMm: 200, desdeMm: 2701, hastaMm: 3250 },
]

describe('altura de cajón del compacto', () => {
  it('elige el tramo por la altura de la estructura, con límites incluidos', () => {
    expect(alturaCajonCompacto(tramos, 1200)).toBe(155)
    expect(alturaCajonCompacto(tramos, 1650)).toBe(155)
    expect(alturaCajonCompacto(tramos, 1651)).toBe(170)
    expect(alturaCajonCompacto(tramos, 3250)).toBe(200)
  })

  it('sin tramo aplicable no propone altura', () => {
    expect(alturaCajonCompacto(tramos, 3300)).toBeNull()
    expect(alturaCajonCompacto([], 1000)).toBeNull()
  })

  it('reproduce la configuración del vídeo: 155 hasta 1,60 m y 185 por encima', () => {
    const javi = [{ altoCajonMm: 155, desdeMm: 0, hastaMm: 1600 }, { altoCajonMm: 185, desdeMm: 1601, hastaMm: 9999 }]
    expect(alturaCajonCompacto(javi, 1500)).toBe(155)
    expect(alturaCajonCompacto(javi, 2100)).toBe(185)
  })
})

describe('reparto del hueco entre compacto y ventana (CHM 5.1.2.13.1.1)', () => {
  it('descontando el cajón: hueco 1000x1000 da ventana 1000x845', () => {
    expect(medidasConCompacto({ anchoHuecoMm: 1000, altoHuecoMm: 1000, altoCajonMm: 155, descontarCajon: true }))
      .toEqual({ compacto: { anchoMm: 1000, altoMm: 1000 }, ventana: { anchoMm: 1000, altoMm: 845 } })
  })

  it('sin descontar: compacto 1000x1155 y ventana 1000x1000', () => {
    expect(medidasConCompacto({ anchoHuecoMm: 1000, altoHuecoMm: 1000, altoCajonMm: 155, descontarCajon: false }))
      .toEqual({ compacto: { anchoMm: 1000, altoMm: 1155 }, ventana: { anchoMm: 1000, altoMm: 1000 } })
  })

  it('el descuento vertical adicional se resta a la ventana', () => {
    const medidas = medidasConCompacto({
      anchoHuecoMm: 1000, altoHuecoMm: 1000, altoCajonMm: 155, descontarCajon: true, descuentoAdicionalMm: 10,
    })
    expect(medidas.ventana.altoMm).toBe(835)
  })
})
