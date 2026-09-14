import { expect, it } from 'vitest'
import { valorarDespiece } from '@aluminior/core/precios'
import { etapasVentaCerramiento } from '@aluminior/core/estructuras'
import { partidasValoracion } from './partidas-valoracion.ts'

it('100 mm y 200 mm conservan 0,3 m facturables pese al ruido binario de la suma', () => {
  const valor = valorarDespiece([100, 200].map(largoMm => ({ articuloCodigo: 'P', cantidad: 1,
    largoMm, formula: null, funcion: 'MV', tipoCorte: null, anguloIzquierdo: null,
    anguloDerecho: null, incidencia: null })), new Map([['P', { codigo: 'P',
      tipoMetraje: 'ML', precio: 10, metrajeMinimo: null, metrajeMultiploLargo: null }]]))
  expect(valor.lineas[0].cantidadFacturable).toBe(0.30000000000000004)
  const partidas = partidasValoracion(valor.lineas, { tarifa: 9, acabadoCodigo: 'L' },
    'MATERIALES', [{ articuloCodigo: 'P', acabadoCodigo: 'L', precio: '10' }])
  expect(partidas[0]).toMatchObject({ cantidadFacturable: '0.300000', importeExacto: '3.0000000000', incidencia: null })
  expect(Number(etapasVentaCerramiento(partidas)?.total)).toBe(valor.importe)
})

it('metraje con ocho decimales no se redondea para entrar en snapshot v1', () => {
  const valor = valorarDespiece([{ articuloCodigo: 'P', cantidad: 1.001, largoMm: 1000.01,
    formula: '1000.01', funcion: 'UNION', tipoCorte: null,
    anguloIzquierdo: null, anguloDerecho: null, incidencia: null }],
  new Map([['P', { codigo: 'P', tipoMetraje: 'ML', precio: 1000000,
    metrajeMinimo: null, metrajeMultiploLargo: null }]]))
  expect(valor.importe).toBe(1001010.01)
  const partidas = partidasValoracion(valor.lineas, { tarifa: 9, acabadoCodigo: 'L' },
    'MATERIALES', [{ articuloCodigo: 'P', acabadoCodigo: 'L', precio: '1000000' }])
  expect(partidas[0].cantidadFacturable).toBeNull()
  expect(partidas[0].importeExacto).toBeNull()
  expect(partidas[0].incidencia).toContain('sin pérdida de precisión')
  expect(etapasVentaCerramiento(partidas)).toBeNull()
  expect(Math.round(1.00101 * 1000000 * 100) / 100).toBe(1001010)
})

it('conserva grupos y redondeo heredado, sin redondear una suma cruda global', () => {
  const filasCapturadas = [{ articuloCodigo: 'P', acabadoCodigo: 'L', precio: '1.0040' }]
  const partida = () => partidasValoracion([{ articuloCodigo: 'P', tipoMetraje: 'UD',
    cantidadFacturable: 1, precioUnitario: 1.004, importe: 1.004, incidencia: null }],
  { tarifa: 9, acabadoCodigo: 'L' }, 'MATERIALES', filasCapturadas)
  expect(partida()[0]).toMatchObject({ precioUnitario: '1.0040', importeExacto: '1.0040000000' })
  const grupos = ['MATERIALES', 'VIDRIO', 'ACRISTALAMIENTO'] as const
  const etapas = etapasVentaCerramiento(grupos.map((grupoValoracion, ordinal) => ({
    ...partida()[0], grupoValoracion, ordinal,
  })))
  expect(etapas).toEqual({ materiales: '1.00', conVidrio: '2.00', acristalamiento: '1.00', total: '3.00' })
})
