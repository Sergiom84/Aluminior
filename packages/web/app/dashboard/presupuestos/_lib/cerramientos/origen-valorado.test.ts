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
  it.each(['1e-7', '1.01000000000000001', '99999999.990000001'])('conserva %s como diagnóstico sin excepción ni redondeo silencioso', valor => {
    const r = completarCostesOrigen(origen(), [pieza('PRECISION', '1', valor)] as never)
    expect(r.piezas[0].largoCorteMm).toBeNull()
    expect(r.coste).toEqual({ completo: false, importe: null })
    expect(r.diagnosticos).toContainEqual(expect.objectContaining({
      ambito: 'FABRICACION', bloqueante: true, detalle: expect.stringContaining(valor),
    }))
  })
  it('conserva la precisión exacta compatible y bloquea el corte periódico sin redondearlo', () => {
    const r = completarCostesOrigen(origen(), [
      pieza('EXACTA', '1', '1200.25'), pieza('TERCIO', '1', '363.3333333333333'),
    ] as never)
    expect(r.piezas.map(p => p.largoCorteMm)).toEqual(['1200.25', null])
    expect(r.coste).toEqual({ completo: false, importe: null })
    expect(r.diagnosticos).toContainEqual(expect.objectContaining({
      ambito: 'FABRICACION', bloqueante: true,
      detalle: expect.stringContaining('363.3333333333333'),
    }))
  })
  it('omite una pieza de cantidad 0 sin alterar el coste', () => {
    const r = completarCostesOrigen(origen(), [pieza('A', '2', '1200'), pieza('MO', '0', null)] as never)
    expect(r.piezas.map((p) => p.articuloCodigo)).toEqual(['A'])
    expect(r.coste).toEqual({ completo: true, importe: '1.0000' })
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
