import { expect, it } from 'vitest'
import { calcularDespunte } from './despunte.ts'
import { optimizarCorte } from './optimizar.ts'

it('plan5940 compra6000 sin falsear longitud aprovechable ni cargos', () => {
  const plan = optimizarCorte([{ longitud: 5000, cantidad: 1 }], { longitudBarra: 5940 })
  const resultado = calcularDespunte([{ perfil: 'P', plan, precioMetroLineal: '4', longitudBarraCompradaMm: 6000 }], { modo: 'LINEA_APARTE' })
  expect(plan.longitudBarra).toBe(5940)
  expect(resultado).toMatchObject({ costePerfilesYCortes: '20.00', costeBarras: '24.00', importeDespunte: '4.00', mlBarras: '6.0000' })
})
it('omitir longitud comprada conserva contrato anterior', () => {
  const plan = optimizarCorte([{ longitud: 5000, cantidad: 1 }], { longitudBarra: 6000 })
  expect(calcularDespunte([{ perfil: 'P', plan, precioMetroLineal: '4' }], { modo: 'LINEA_APARTE' }))
    .toEqual(calcularDespunte([{ perfil: 'P', plan, precioMetroLineal: '4', longitudBarraCompradaMm: 6000 }], { modo: 'LINEA_APARTE' }))
})
it.each([0, -1, NaN, Infinity, 5900])('rechaza barra comprada inválida %s', longitudBarraCompradaMm => {
  const plan = optimizarCorte([{ longitud: 5000, cantidad: 1 }], { longitudBarra: 5940 })
  expect(() => calcularDespunte([{ perfil: 'P', plan, precioMetroLineal: '4', longitudBarraCompradaMm }], { modo: 'LINEA_APARTE' })).toThrow('barra comprada')
})
