/**
 * Variante de perfil de hoja por grosor de vidrio (CHM 5.1.2.12.3.2).
 * Casos tomados del catálogo de EMP0016: ELEGANTPVC declara rango simple 9 mm
 * y PAN16 mide 16 mm sin marca de doble acristalamiento, de modo que la marca
 * y el rango dan resultados distintos y el rango es el que manda.
 */
import { describe, expect, it } from 'vitest'
import { varianteSegunGrosor } from './linea-catalogo/index.ts'

const PAN16 = { grosorAcristalar: 16, dobleAcristalamiento: false }
const V420AGS4 = { grosorAcristalar: 28, dobleAcristalamiento: true }
const CHA2X11C = { grosorAcristalar: 1, dobleAcristalamiento: false }

describe('variante de acristalamiento', () => {
  it('con rango de serie decide el grosor, no la marca de doble acristalamiento', () => {
    const elegantpvc = { grosorMaximoSimple: 9 }
    expect(varianteSegunGrosor(elegantpvc, PAN16)).toBe('2')
    expect(varianteSegunGrosor(elegantpvc, V420AGS4)).toBe('2')
    expect(varianteSegunGrosor(elegantpvc, CHA2X11C)).toBe('1')
  })

  it('el límite del rango entra en la variante simple', () => {
    expect(varianteSegunGrosor({ grosorMaximoSimple: 16 }, PAN16)).toBe('1')
    expect(varianteSegunGrosor({ grosorMaximoSimple: 15.999 }, PAN16)).toBe('2')
  })

  it('sin rango declarado manda la marca de doble acristalamiento', () => {
    expect(varianteSegunGrosor({ grosorMaximoSimple: 0 }, PAN16)).toBe('1')
    expect(varianteSegunGrosor({ grosorMaximoSimple: 0 }, V420AGS4)).toBe('2')
  })

  it('sin vidrio conserva la variante doble', () => {
    expect(varianteSegunGrosor({ grosorMaximoSimple: 9 }, null)).toBe('2')
    expect(varianteSegunGrosor({ grosorMaximoSimple: 0 }, null)).toBe('2')
  })
})
