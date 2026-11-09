import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('../../../_lib/precios-manuales-action.ts', () => ({ ponerPreciosLinea: vi.fn() }))
const { leerPrecio } = await import('./dialogo-precios.tsx')
const { PreciosPendientes, firmaPendiente } = await import('./precios-pendientes.tsx')

const linea = {
  lineaId: 'l1', articuloLinea: '1O',
  piezas: [{ articulo: 'PSG100', descripcion: 'GUIA PARA RECOGEDOR 100mm', acabado: 'L', unidadCatalogo: 'ML',
    unidades: ['ML' as const, 'UD' as const], filas: [{ cantidad: 1, largoMm: 1045, anchoMm: null }] }],
}

describe('piezas sin precio', () => {
  it('lee precios con coma, con punto decimal y con miles', () => {
    expect(leerPrecio('12,50')).toBe(12.5)
    expect(leerPrecio('12.5')).toBe(12.5)
    expect(leerPrecio('1.250,75')).toBe(1250.75)
    expect(leerPrecio(' 3 € ')).toBe(3)
    expect(leerPrecio('0')).toBeNull()
    expect(leerPrecio('-2')).toBeNull()
    expect(leerPrecio('abc')).toBeNull()
    expect(leerPrecio('')).toBeNull()
  })

  it('avisa por línea con la pieza que falta y ofrece ponerle precio', () => {
    const html = renderToStaticMarkup(createElement(PreciosPendientes, {
      presupuestoId: 'p', tarifa: 1, lineas: [linea], editable: true }))
    expect(html).toContain('PSG100 sin precio')
    expect(html).toContain('Poner precio')
    const soloLectura = renderToStaticMarkup(createElement(PreciosPendientes, {
      presupuestoId: 'p', tarifa: 1, lineas: [linea], editable: false }))
    expect(soloLectura).not.toContain('Poner precio')
    expect(renderToStaticMarkup(createElement(PreciosPendientes, { presupuestoId: 'p', tarifa: 1, lineas: [], editable: true }))).toBe('')
  })

  it('la firma cambia si cambian las piezas pendientes', () => {
    const otra = { ...linea, piezas: [...linea.piezas, { ...linea.piezas[0]!, articulo: 'PSG90' }] }
    expect(firmaPendiente(linea)).not.toBe(firmaPendiente(otra))
  })
})
