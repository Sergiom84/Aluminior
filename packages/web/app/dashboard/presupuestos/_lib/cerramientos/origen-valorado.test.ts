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
