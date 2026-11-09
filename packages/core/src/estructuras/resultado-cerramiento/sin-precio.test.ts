import { describe, expect, it } from 'vitest'
import { diagnosticosSinPrecio, pendientesDePrecio } from './sin-precio.ts'
import type { ResultadoOrigenCerramiento } from './tipos.ts'

const origen = (diagnosticos: ResultadoOrigenCerramiento['diagnosticos']) =>
  ({ diagnosticos }) as unknown as ResultadoOrigenCerramiento

describe('piezas sin precio en el resultado', () => {
  it('guarda cada pieza como diagnóstico no bloqueante y las agrupa por artículo y acabado', () => {
    const guia = { articulo: 'PSG100', acabado: 'L', tipoMetraje: 'ML', cantidad: 1, largoMm: 1045, anchoMm: null }
    const d = diagnosticosSinPrecio([guia, guia])
    expect(d.every(x => x.codigo === 'SIN_PRECIO' && !x.bloqueante && x.ambito === 'VENTA')).toBe(true)
    const otro = diagnosticosSinPrecio([{ ...guia, articulo: 'VX', tipoMetraje: 'M2', anchoMm: 500 }])
    const pendientes = pendientesDePrecio({ origenes: [
      origen([...d, { codigo: 'MATERIAL_INCOMPLETO', ambito: 'VENTA', bloqueante: true, detalle: 'PSG100: sin PVP' }]),
      origen([...otro, { codigo: 'SIN_PRECIO', ambito: 'VENTA', bloqueante: false, detalle: '{roto' }]),
    ] })
    expect(pendientes).toEqual([
      { articulo: 'PSG100', acabado: 'L', tipoMetraje: 'ML', filas: [
        { cantidad: 1, largoMm: 1045, anchoMm: null }, { cantidad: 1, largoMm: 1045, anchoMm: null }] },
      { articulo: 'VX', acabado: 'L', tipoMetraje: 'M2', filas: [{ cantidad: 1, largoMm: 1045, anchoMm: 500 }] },
    ])
    expect(diagnosticosSinPrecio(undefined)).toEqual([])
  })
})
