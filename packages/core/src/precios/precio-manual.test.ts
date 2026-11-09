import { describe, expect, it } from 'vitest'
import {
  fusionarPreciosManuales, metrajeEnUnidad, preciosManualesValidos, tarifaConPrecioManual, unidadesPosibles,
} from './precio-manual.ts'

const tarifaSinPvp = { tipoMetraje: 'ML', pvp: null, minimo: 0, multiploLargoCm: 0, multiploAnchoCm: 0, incrementos: [] }

describe('precios manuales', () => {
  it('valida unidad, precio positivo y un solo precio por artículo y acabado', () => {
    expect(preciosManualesValidos(undefined)).toBe(true)
    expect(preciosManualesValidos([{ articulo: 'PSG100', acabado: 'L', unidad: 'ML', precio: 12.5 }])).toBe(true)
    expect(preciosManualesValidos([{ articulo: 'PSG100', acabado: 'L', unidad: 'KG', precio: 12.5 }])).toBe(false)
    expect(preciosManualesValidos([{ articulo: 'PSG100', acabado: 'L', unidad: 'ML', precio: 0 }])).toBe(false)
    expect(preciosManualesValidos([{ articulo: ' ', acabado: 'L', unidad: 'ML', precio: 1 }])).toBe(false)
    expect(preciosManualesValidos([
      { articulo: 'PSG100', acabado: 'L', unidad: 'ML', precio: 1 }, { articulo: 'psg100', acabado: 'l', unidad: 'UD', precio: 2 },
    ])).toBe(false)
    expect(preciosManualesValidos('PSG100')).toBe(false)
  })

  it('sustituye el precio del mismo artículo y acabado y conserva los demás', () => {
    const actuales = [{ articulo: 'A', acabado: 'L', unidad: 'ML' as const, precio: 1 }, { articulo: 'B', acabado: 'L', unidad: 'UD' as const, precio: 2 }]
    expect(fusionarPreciosManuales(actuales, [{ articulo: 'a', acabado: 'l', unidad: 'M2', precio: 3 }])).toEqual([
      { articulo: 'A', acabado: 'L', unidad: 'M2', precio: 3 }, { articulo: 'B', acabado: 'L', unidad: 'UD', precio: 2 },
    ])
  })

  it('solo aplica el manual cuando la tarifa existe y no tiene PVP', () => {
    const manual = { articulo: 'A', acabado: 'L', unidad: 'UD' as const, precio: 5 }
    expect(tarifaConPrecioManual(tarifaSinPvp, manual)).toMatchObject({ manual: true, tarifa: { tipoMetraje: 'UD', pvp: 5 } })
    expect(tarifaConPrecioManual({ ...tarifaSinPvp, pvp: 9 }, manual)).toMatchObject({ manual: false, tarifa: { pvp: 9 } })
    expect(tarifaConPrecioManual(null, manual)).toEqual({ tarifa: null, manual: false })
    expect(tarifaConPrecioManual(tarifaSinPvp, undefined).manual).toBe(false)
  })

  it('ofrece las unidades que se pueden medir y calcula metros, m² o piezas', () => {
    const guias = [{ cantidad: 1, largoMm: 1045, anchoMm: null }, { cantidad: 1, largoMm: 1045, anchoMm: null }]
    expect(unidadesPosibles(guias)).toEqual(['ML', 'UD'])
    expect(unidadesPosibles([{ cantidad: 1, largoMm: 1000, anchoMm: 500 }])).toEqual(['ML', 'M2', 'UD'])
    expect(unidadesPosibles([{ cantidad: 4, largoMm: null, anchoMm: null }])).toEqual(['UD'])
    expect(metrajeEnUnidad(guias, 'ML', 12.5)).toEqual({ metraje: 2.1, importe: 26.26 })
    expect(metrajeEnUnidad(guias, 'UD', 3)).toEqual({ metraje: 2, importe: 6 })
    expect(metrajeEnUnidad(guias, 'M2', 3)).toBeNull()
  })
})
