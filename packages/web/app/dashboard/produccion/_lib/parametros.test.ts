import { expect, it } from 'vitest'
import { parametrosProduccion } from './parametros'

it.each([
  [{ barra: 'abc' }, 'Barra: indica una medida válida en mm'],
  [{ barra: '' }, 'Barra: indica una medida válida en mm'],
  [{ barra: '0' }, 'Barra: la medida debe ser mayor que cero en mm'],
  [{ kerf: '-1' }, 'Kerf: la medida debe ser cero o mayor en mm'],
  [{ inicial: 'NaN' }, 'Saneamiento inicial: indica una medida válida en mm'],
  [{ final: 'Infinity' }, 'Saneamiento final: indica una medida válida en mm'],
] as const)('error de campo operativo para %j', (consulta, mensaje) => {
  expect(() => parametrosProduccion(consulta)).toThrow(mensaje)
})

it('conserva la restricción de barra agotada y los parámetros decimales válidos', () => {
  expect(() => parametrosProduccion({ barra: '6000', inicial: '6000' })).toThrow('El saneamiento agota la longitud de barra')
  expect(parametrosProduccion({ barra: '6000.5', kerf: '0.25', inicial: '30', final: '30' }))
    .toEqual({ longitudBarraMm: 6000.5, kerfMm: 0.25, saneamientoInicialMm: 30, saneamientoFinalMm: 30 })
})
