import { describe, expect, it } from 'vitest'
import type { ResultadoOrigenCerramiento } from '@aluminior/core/estructuras'
import { completarCostesOrigen } from './origen-valorado.ts'

const origen = (): ResultadoOrigenCerramiento => ({
  origen: { tipo: 'MODULO', id: 'modulo-1' }, codigo: '0', serieCodigo: 'S', acabadoCodigo: 'L',
  vidrioCodigo: null, varianteAcristalamiento: '2', reglaMaterial: 'estructura:0',
  venta: { completo: true, importe: '10.00' }, coste: { completo: false, importe: null },
  piezas: [], partidasValoracion: [], acristalamiento: [], opcionesHerraje: [], diagnosticos: [],
})
const pieza = (articuloCodigo: string, cantidad: string, largoCorteMm: string | null) => ({
  articuloCodigo, cantidad, largoCorteMm, anchoCorteMm: null, costeUnitario: '1', costeTotal: '1',
})

describe('piezas del snapshot desde el catálogo real', () => {
  // Contrato main/Mac: el snapshot guarda centésimas; venta y coste no se recalculan.
  it.each([
    ['1.01000000000000001', '1.01'], ['99999999.990000001', '99999999.99'],
  ])('serializa %s como %s conservando precio y coste', (valor, esperado) => {
    const r = completarCostesOrigen(origen(), [pieza('PRECISION', '1', valor)] as never)
    expect(r.piezas[0].largoCorteMm).toBe(esperado)
    expect(r.venta).toEqual({ completo: true, importe: '10.00' })
    expect(r.coste).toEqual({ completo: true, importe: '1.0000' })
    expect(r.diagnosticos).toEqual([])
  })
  it('una medida en notación exponencial que redondea a cero bloquea fabricación sin lanzar', () => {
    const r = completarCostesOrigen(origen(), [pieza('PRECISION', '1', '1e-7')] as never)
    expect(r.piezas[0].largoCorteMm).toBeNull()
    expect(r.venta).toEqual({ completo: true, importe: '10.00' })
    expect(r.coste).toEqual({ completo: false, importe: null })
    expect(r.diagnosticos).toContainEqual(expect.objectContaining({
      ambito: 'FABRICACION', bloqueante: true, detalle: expect.stringContaining('1e-7'),
    }))
  })
  it('conserva la medida exacta y representa el corte periódico a centésimas sin recalcular costes', () => {
    const r = completarCostesOrigen(origen(), [
      pieza('EXACTA', '1', '1200.25'), pieza('TERCIO', '1', '363.3333333333333'),
    ] as never)
    expect(r.piezas.map(p => p.largoCorteMm)).toEqual(['1200.25', '363.33'])
    expect(r.venta).toEqual({ completo: true, importe: '10.00' })
    expect(r.coste).toEqual({ completo: true, importe: '2.0000' })
    expect(r.diagnosticos).toEqual([])
  })
  it('omite una pieza de cantidad 0 sin alterar el coste', () => {
    const r = completarCostesOrigen(origen(), [pieza('A', '2', '1200'), pieza('MO', '0', null)] as never)
    expect(r.piezas.map((p) => p.articuloCodigo)).toEqual(['A'])
    expect(r.coste).toEqual({ completo: true, importe: '1.0000' })
  })

  it('serializa cortes calculados a centésimas sin recalcular venta ni coste', () => {
    const o = origen()
    const r = completarCostesOrigen(o, [{ ...pieza('PERFIL-SINTETICO', '1', '812.34999847'), anchoCorteMm: '423.125' }] as never)
    expect(r.piezas[0]).toMatchObject({ largoCorteMm: '812.35', anchoCorteMm: '423.13', costeTotal: '1' })
    expect(r.venta).toEqual({ completo: true, importe: '10.00' })
    expect(r.coste).toEqual({ completo: true, importe: '1.0000' })
  })

  it('una medida que redondea a cero sigue siendo desconocida y bloquea fabricación', () => {
    const r = completarCostesOrigen(origen(), [pieza('MINIMO-SINTETICO', '1', '0.004')] as never)
    expect(r.piezas[0].largoCorteMm).toBeNull()
    expect(r.diagnosticos.some(d => d.ambito === 'FABRICACION' && d.bloqueante)).toBe(true)
  })

  it('guarda un corte de 0 mm como medida desconocida y bloquea fabricación', () => {
    const r = completarCostesOrigen(origen(), [pieza('62', '1', '0')] as never)
    expect(r.piezas[0].largoCorteMm).toBeNull()
    expect(r.diagnosticos).toContainEqual(expect.objectContaining({
      codigo: 'COBERTURA_INCOMPLETA', ambito: 'FABRICACION', bloqueante: true,
    }))
    expect(r.coste.completo).toBe(false)
  })
})
