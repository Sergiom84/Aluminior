import { describe, expect, it } from 'vitest'
import { clasificarHija, diferenciasPiezas, importeConPreciosFactura, type HijaFactura } from './contraste-despiece-facturas.ts'
import type { FilaDespieceCatalogo } from '../../packages/core/src/despiece/linea-catalogo/tipos.ts'

// Datos sintéticos.
const hija = (h: Partial<HijaFactura>): HijaFactura => ({ articulo: 'A', funcion: '', cantidad: 1, largoMm: 0, anchoMm: 0, importe: 1, precio: 1, ...h })
const motor = (f: Partial<FilaDespieceCatalogo>): FilaDespieceCatalogo => ({
  origen: 'asociado', articulo: 'A', acabado: 'UNI', cantidad: 1, largoMm: null, anchoMm: null, funcion: null, metraje: 1, importe: 1, ...f,
})

describe('contraste de despiece con facturas', () => {
  it('separa avisos, entradas de línea, filas sin importe y material', () => {
    expect(clasificarHija(hija({ articulo: '135', importe: 0, precio: 0 }), 'UD')).toBe('aviso')
    expect(clasificarHija(hija({ articulo: 'MOCOL' }), 'UD')).toBe('extra')
    expect(clasificarHija(hija({ funcion: 'TAPDE' }), 'ML')).toBe('extra')
    expect(clasificarHija(hija({ articulo: 'PSM001' }), 'M2')).toBe('extra')
    expect(clasificarHija(hija({ cantidad: 0, importe: 0 }), 'UD')).toBe('sin-material')
    expect(clasificarHija(hija({ articulo: '0' }), 'UD')).toBe('sin-material')
    expect(clasificarHija(hija({}), 'UD')).toBe('material')
  })
  it('compara piezas por artículo, cantidad y largo solo en artículos por metro', () => {
    const porMetro = (a: string) => a === 'P'
    expect(diferenciasPiezas([motor({ articulo: 'P', largoMm: 1000.04 }), motor({ articulo: 'U', cantidad: 2 })],
      [hija({ articulo: 'P', largoMm: 1000 }), hija({ articulo: 'U', cantidad: 2, largoMm: 55 })], porMetro)).toEqual([])
    expect(diferenciasPiezas([motor({ articulo: 'P', largoMm: 900 })], [hija({ articulo: 'P', largoMm: 1000 })], porMetro))
      .toEqual(['+1 P|1|900', '-1 P|1|1000'])
  })
  it('revalora con el precio unitario de la factura para aislar diferencias de tarifa', () => {
    expect(importeConPreciosFactura([motor({ articulo: 'P', metraje: 1.26, importe: 99 })], [hija({ articulo: 'P', precio: 1.81 })])).toBe(2.28)
    expect(importeConPreciosFactura([motor({ metraje: null })], [])).toBeNull()
  })
})
