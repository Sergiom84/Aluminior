import { afterEach, expect, it, vi } from 'vitest'
import { esResultadoCerramiento } from '@aluminior/core/estructuras'
import { valorarDespiece } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import { valorarEstructura } from '../estructuras/valorar-estructura.ts'
import { partidasValoracion } from '../estructuras/partidas-valoracion.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'

vi.mock('../estructuras/valorar-estructura.ts', () => ({ valorarEstructura: vi.fn() }))
vi.mock('../estructuras/catalogo-despiece/cargado.ts', () => ({ catalogoDespieceCargado: async () => false }))
afterEach(() => vi.clearAllMocks())

it.each([null, 'Aviso sintético del motor'])('conserva el bloqueo de metraje no representable con aviso %s', async aviso => {
  const valor = valorarDespiece([{ articuloCodigo: 'P', cantidad: 1.001, largoMm: 1000.01,
    formula: '1000.01', funcion: 'MV', tipoCorte: null, anguloIzquierdo: null,
    anguloDerecho: null, incidencia: null }], new Map([['P', {
    codigo: 'P', tipoMetraje: 'ML', precio: 1000000, metrajeMinimo: null, metrajeMultiploLargo: null,
  }]]))
  const partidas = partidasValoracion(valor.lineas, { tarifa: 9, acabadoCodigo: 'L' },
    'MATERIALES', [{ articuloCodigo: 'P', acabadoCodigo: 'L', precio: '1000000' }])
  expect(valor.importe).toBe(1001010.01)
  expect(partidas[0].cantidadFacturable).toBeNull()
  vi.mocked(valorarEstructura).mockResolvedValue({ ok: true, descripcion: 'Sintético',
    precioUnitario: valor.importe, aviso, motor: 'anterior', partidas,
    piezas: [{ articuloCodigo: 'P', cantidad: '1.001', largoCorteMm: '1000.01' }],
    acristalamiento: [], opcionesHerraje: [],
  })
  const resultado = await valorarCerramiento({} as ClienteEscritura, {
    configuracion: { version: 1, modulos: [{ id: 'm1', estructuraCodigo: '0', anchoMm: 1000, altoMm: 1200 }], uniones: [] },
    serieCodigo: 'S', acabadoCodigo: 'L', vidrioCodigo: null, varianteAcristalamiento: '1', tarifa: 9,
  })
  expect(esResultadoCerramiento(resultado)).toBe(true)
  expect(resultado.ventaMateriales).toEqual({ completo: false, importe: null })
  expect(resultado.origenes[0].diagnosticos).toContainEqual(expect.objectContaining({
    ambito: 'VENTA', bloqueante: true, detalle: 'Partidas de venta incompletas',
  }))
  if (aviso) expect(resultado.origenes[0].diagnosticos).toContainEqual(expect.objectContaining({
    codigo: 'AVISO_VALORACION', ambito: 'VENTA', bloqueante: false, detalle: aviso,
  }))
})
