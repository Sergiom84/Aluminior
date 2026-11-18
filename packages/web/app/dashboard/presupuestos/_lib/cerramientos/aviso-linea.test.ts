import { describe, expect, it } from 'vitest'
import { CODIGO_SIN_PRECIO } from '@aluminior/core/estructuras'
import { avisoVisibleLinea, filtrarAvisoMotor } from './aviso-linea.ts'

const VIDRIO = 'vidrio de 28 mm por encima del rango de doble acristalamiento de la serie'
const CERO = 'sin PVP en su acabado, valorado a 0 € como en Productor: PSESQCOM en VS'
const COSTE = { codigo: 'COSTE_INCOMPLETO', ambito: 'COSTE', detalle: 'Faltan costes o materiales necesarios para este origen' }
const motor = (...partes: string[]) => ({ codigo: 'AVISO_VALORACION', ambito: 'VENTA', detalle: `Valorado con avisos: ${partes.join('; ')}.` })
const modulo = (id: string, ...diagnosticos: { codigo: string; ambito: string; detalle: string }[]) =>
  ({ origen: { tipo: 'MODULO', id }, diagnosticos })
const union = (id: string, ...diagnosticos: { codigo: string; ambito: string; detalle: string }[]) =>
  ({ origen: { tipo: 'UNION', id }, diagnosticos })

describe('aviso visible de la línea de cerramiento', () => {
  it('mirador 260289: sin vidrio de 28 mm ni costes, y el aviso a 0 € una vez para las dos uniones', () => {
    const aviso = avisoVisibleLinea([
      modulo('modulo-1', motor(VIDRIO), COSTE), modulo('modulo-2', motor(VIDRIO), COSTE),
      modulo('modulo-3', motor(VIDRIO), COSTE), modulo('modulo-4', motor(VIDRIO), COSTE),
      union('union-1', motor(CERO), COSTE), union('union-3', motor(CERO), COSTE),
    ])
    expect(aviso).toBe(`UNION union-1, union-3: Valorado con avisos: ${CERO}.`)
  })

  it('una línea sin nada que revisar no lleva aviso', () => {
    expect(avisoVisibleLinea([modulo('modulo-1', motor(VIDRIO), COSTE)])).toBeNull()
  })

  it('conserva los bloqueos de venta y quita las piezas sin precio, que tienen su propia ventana', () => {
    const aviso = avisoVisibleLinea([
      modulo('modulo-1', { codigo: 'MATERIAL_INCOMPLETO', ambito: 'VENTA', detalle: 'GM487: sin PVP' },
        { codigo: CODIGO_SIN_PRECIO, ambito: 'VENTA', detalle: 'pieza' }),
    ], ['Colocación sin tarifa'])
    expect(aviso).toBe('MODULO modulo-1: GM487: sin PVP; Colocación sin tarifa')
  })

  it('del aviso del motor solo quita la parte del vidrio', () => {
    expect(filtrarAvisoMotor(`Valorado con avisos: ${VIDRIO}; tipo de hoja X leído por nombre.`))
      .toBe('Valorado con avisos: tipo de hoja X leído por nombre.')
    expect(filtrarAvisoMotor(`Valorado con avisos: ${VIDRIO}.`)).toBeNull()
    expect(filtrarAvisoMotor('Importe incompleto: PSESQCOM: sin PVP en la tarifa.'))
      .toBe('Importe incompleto: PSESQCOM: sin PVP en la tarifa.')
  })

  it('el mismo texto en módulo y unión no se mezcla', () => {
    const d = { codigo: 'X', ambito: 'VENTA', detalle: 'algo' }
    expect(avisoVisibleLinea([modulo('m1', d), union('u1', d)])).toBe('MODULO m1: algo; UNION u1: algo')
  })
})
