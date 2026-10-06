import { describe, expect, it } from 'vitest'
import { costeDobleAcristalamiento, parsearComposicion, type TarifaDobleAcristalamiento } from './index.ts'

describe('composición del doble acristalamiento', () => {
  it('separa exterior, cámara, gas e interior', () => {
    expect(parsearComposicion('DOBLE ACRISTALAMIENTO CARGLASS 4/20 ARGON/GUARDIAN SUN 4')).toEqual({
      exterior: 'CARGLASS 4', camaraMm: 20, argon: true, interior: 'GUARDIAN SUN 4',
    })
    expect(parsearComposicion('DOBLE ACRISTALAMIENTO 4/16/4')).toEqual({
      exterior: '4', camaraMm: 16, argon: false, interior: '4',
    })
  })

  it('admite vidrios con barra en el nombre a ambos lados', () => {
    expect(parsearComposicion('DOBLE ACRISTALAMIENTO PARSOL GRIS/BRONCE 6/12/LAMINAR 5+5 GRIS/BRONCE')).toEqual({
      exterior: 'PARSOL GRIS/BRONCE 6', camaraMm: 12, argon: false, interior: 'LAMINAR 5+5 GRIS/BRONCE',
    })
  })

  it('no reconoce vidrios simples ni cámaras sueltas', () => {
    expect(parsearComposicion('CARGLASS 4mm')).toBeNull()
    expect(parsearComposicion('CAMARA 16 ARGON')).toBeNull()
  })
})

const tarifa: TarifaDobleAcristalamiento = {
  base: '20.00',
  camaras: { 16: { sinGas: '0' }, 20: { sinGas: '1.25' }, 24: { sinGas: '3', argon: '9' } },
  argonM2: '4.50',
  vidrios: { '4': '0', 'CARGLASS 4': '10.25', 'LAMINAR 4+4 GRIS/BRONCE': null },
}
const comp = (exterior: string, camaraMm: number, argon: boolean, interior: string) =>
  ({ exterior, camaraMm, argon, interior })

describe('coste por componentes', () => {
  it('suma base, cámara y los dos vidrios', () => {
    expect(costeDobleAcristalamiento(comp('4', 16, false, '4'), tarifa)).toEqual({ estado: 'CALCULADO', coste: '20.00' })
    expect(costeDobleAcristalamiento(comp('CARGLASS 4', 20, false, 'CARGLASS 4'), tarifa))
      .toEqual({ estado: 'CALCULADO', coste: '41.75' })
  })

  it('el argón usa el suplemento de la cámara o el uniforme', () => {
    expect(costeDobleAcristalamiento(comp('4', 20, true, '4'), tarifa)).toEqual({ estado: 'CALCULADO', coste: '25.75' })
    expect(costeDobleAcristalamiento(comp('4', 24, true, '4'), tarifa)).toEqual({ estado: 'CALCULADO', coste: '29.00' })
    const sinArgon = { ...tarifa, argonM2: undefined }
    expect(costeDobleAcristalamiento(comp('4', 20, true, '4'), sinArgon))
      .toMatchObject({ estado: 'SIN_COSTE', motivo: 'ARGON_NO_TARIFADO' })
  })

  it('no inventa precio de un vidrio a consultar, ausente o de una cámara sin tarifa', () => {
    expect(costeDobleAcristalamiento(comp('LAMINAR 4+4 GRIS/BRONCE', 16, false, '4'), tarifa))
      .toEqual({ estado: 'SIN_COSTE', motivo: 'VIDRIO_A_CONSULTAR', detalle: 'LAMINAR 4+4 GRIS/BRONCE' })
    expect(costeDobleAcristalamiento(comp('4', 16, false, 'REFLEX 5'), tarifa))
      .toMatchObject({ estado: 'SIN_COSTE', motivo: 'VIDRIO_NO_TARIFADO' })
    expect(costeDobleAcristalamiento(comp('4', 8, false, '4'), tarifa))
      .toMatchObject({ estado: 'SIN_COSTE', motivo: 'CAMARA_NO_TARIFADA' })
  })

  it('no confunde propiedades heredadas con vidrios tarifados', () => {
    expect(costeDobleAcristalamiento(comp('toString', 16, false, '4'), tarifa))
      .toMatchObject({ estado: 'SIN_COSTE', motivo: 'VIDRIO_NO_TARIFADO' })
  })
})
