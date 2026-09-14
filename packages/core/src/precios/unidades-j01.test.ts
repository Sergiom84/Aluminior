import { describe, expect, it } from 'vitest'
import { valorarDespiece, type DatosArticuloPrecio } from './calcular.ts'
import { lineaValorable } from './guarda.ts'
import type { PiezaCortada } from '../despiece/calcular.ts'

const pieza = (codigo: string, cantidad: number, largoMm: number | null): PiezaCortada => ({
  articuloCodigo: codigo, cantidad, largoMm, formula: null, tipoCorte: null,
  anguloIzquierdo: null, anguloDerecho: null, funcion: null, incidencia: null,
})
const articulo = (codigo: string, tipoMetraje: string, precio: number | null): DatosArticuloPrecio => ({
  codigo, tipoMetraje, precio, metrajeMinimo: null, metrajeMultiploLargo: null,
})

describe('J01 — unidades y metraje independientes', () => {
  it('dos cortes de 1250 mm a 12,40 €/m son 31 €, sin fraccionar Cdad', () => {
    const r = valorarDespiece([pieza('__J01_ML', 2, 1250)],
      new Map([['__J01_ML', articulo('__J01_ML', 'ML', 12.4)]]))
    expect(r).toMatchObject({ importe: 31, completa: true, sinPrecio: [], sinMedida: [] })
    expect(r.lineas[0].cantidadFacturable).toBe(2.5)
  })

  it.each([null, 0, -1, Number.NaN])('ML con largo %s no produce un cero valorado', (largo) => {
    const r = valorarDespiece([pieza('__J01_ML', 2, largo)],
      new Map([['__J01_ML', articulo('__J01_ML', 'ML', 12.4)]]))
    expect(r).toMatchObject({ completa: false, sinMedida: ['__J01_ML'], sinPrecio: [] })
    expect(r.lineas[0]).toMatchObject({ cantidadFacturable: null, importe: null })
    expect(lineaValorable({ incalculables: 0, sinPrecio: r.sinPrecio, sinMedida: r.sinMedida }))
      .toMatchObject({ valorable: false, motivos: ['1 artículos sin medidas suficientes para calcular el metraje'] })
  })

  it('un corte con largo no oculta otro sin largo del mismo artículo', () => {
    const r = valorarDespiece([pieza('__J01_ML', 1, 1250), pieza('__J01_ML', 1, null)],
      new Map([['__J01_ML', articulo('__J01_ML', 'ML', 12.4)]]))
    expect(r.completa).toBe(false)
    expect(r.lineas[0].importe).toBeNull()
  })

  it('M2 sin ancho no se convierte en unidades y conserva el subtotal sólo como diagnóstico', () => {
    const r = valorarDespiece([pieza('__J01_M2', 2, 1250), pieza('__J01_UD', 2, null)],
      new Map([
        ['__J01_M2', articulo('__J01_M2', 'M2', 25)],
        ['__J01_UD', articulo('__J01_UD', 'UD', 20)],
      ]))
    expect(r).toMatchObject({ importe: 40, completa: false, sinMedida: ['__J01_M2'], sinPrecio: [] })
    expect(r.lineas[0]).toMatchObject({ importe: null, cantidadFacturable: null, incidencia: 'superficie no disponible para valorar por m²' })
    expect(lineaValorable({ incalculables: 0, sinPrecio: r.sinPrecio, sinMedida: r.sinMedida }).valorable).toBe(false)
  })

  it('ausencia simultánea de medida y PVP conserva ambos diagnósticos', () => {
    const r = valorarDespiece([pieza('__J01_M2', 2, 1250)],
      new Map([['__J01_M2', articulo('__J01_M2', 'M2', null)]]))
    expect(r).toMatchObject({ completa: false, sinMedida: ['__J01_M2'], sinPrecio: ['__J01_M2'] })
  })
})
