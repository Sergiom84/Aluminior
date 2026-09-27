import { expect, it } from 'vitest'
import { firmaPiezasCatalogo as firma } from './firma-piezas-catalogo.ts'

it('distingue cantidades próximas aunque tolera diferencias de medida inferiores a 0,1 mm', () => {
  expect(firma([['A', '1.01', 100, null]])).not.toEqual(firma([['A', 1.04, 100, null]]))
  expect(firma([['A', '1.01', 100.001, null]])).toEqual(firma([['A', 1.01, 100.004, null]]))
  expect(firma([['A', 1, null, null]])).not.toEqual(firma([['A', 1, 0, null]]))
})
it.each([null, undefined, NaN, Infinity, '', 'incorrecto'])('rechaza cantidad inválida %s', cantidad => {
  expect(() => firma([['A', cantidad, null, null]])).toThrow(/no finito/)
})
it.each([NaN, Infinity, ''])('rechaza medida inválida %s en lugar de volverla ausencia', medida => {
  expect(() => firma([['A', 1, medida, null]])).toThrow(/no finito/)
})
