import { describe, expect, it } from 'vitest'
import { booleanoConocido, configuracionPrecioTabla } from './precio-en-tabla.ts'

describe('configuración explícita de precio en tabla', () => {
  it.each(['True', 'TRUE', 'TrUe', 'true', ' true ', '-1', '1'])('reconoce %s como true', valor => {
    expect(booleanoConocido(valor)).toBe(true)
  })
  it.each(['False', 'FALSE', 'FaLsE', 'false', ' false ', '0'])('reconoce %s como false', valor => {
    expect(booleanoConocido(valor)).toBe(false)
  })
  it.each([undefined, '', ' ', 'ilegible', 'Sí', 'yes', '2', '-2', '1,0'])('conserva %s como desconocido', valor => {
    expect(booleanoConocido(valor)).toBeNull()
  })
  it('las mayúsculas no desactivan el precio por tabla ni ninguna de sus restricciones', () => {
    expect(configuracionPrecioTabla({ PrecioTablaSN: 'TRUE', ptNoMedInfSN: 'TRUE', ptNoMedSupSN: 'TRUE',
      ptSoloMedTablaAnchoSN: 'TRUE', ptSoloMedTablaLargoSN: 'TRUE', ptNoPVPCeroSN: 'TRUE' }))
      .toEqual({ precio_en_tabla: true, politicas_precio_tabla: { noMedidasInferiores: true,
        noMedidasSuperiores: true, soloMedidasAncho: true, soloMedidasLargo: true, noPrecioCero: true } })
  })
  it('conserva separadamente restricciones conocidas y desconocidas', () => {
    expect(configuracionPrecioTabla({ PrecioTablaSN: 'TrUe', ptNoMedInfSN: 'FaLsE', ptNoMedSupSN: 'TRUE' }))
      .toEqual({ precio_en_tabla: true, politicas_precio_tabla: { noMedidasInferiores: false,
        noMedidasSuperiores: true, soloMedidasAncho: null, soloMedidasLargo: null, noPrecioCero: null } })
  })
})
