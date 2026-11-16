import { beforeEach, describe, expect, it, vi } from 'vitest'
import { crearConfiguracionCerramiento, plantillaDiseno } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { comisionDeLineas } from '../gastos/index.ts'
import { prepararManoObra } from '../mano-obra/index.ts'
import { prepararAltaCerramiento } from './alta-cerramiento.ts'
import { AVISO_FI_SIN_VALORAR, prepararLineaValorada } from './preparar-linea-valorada.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'

vi.mock('./valorar-cerramiento.ts', () => ({ valorarCerramiento: vi.fn() }))
vi.mock('../mano-obra/index.ts', () => ({ prepararManoObra: vi.fn() }))
vi.mock('../gastos/index.ts', () => ({ comisionDeLineas: vi.fn() }))

const entrada = {
  presupuestoId: '00000000-0000-4000-8000-000000000001',
  tarifa: 1, cantidad: 2, horasFabricacion: '0', horasColocacion: '9',
}

function alta1Ofi() {
  const configuracion = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!)
  const alta = prepararAltaCerramiento({
    configuracionSerializada: JSON.stringify(configuracion),
    serieCodigo: 'SERIE-SINTETICA', vidrioCodigo: 'VIDRIO-SINTETICO',
    acabadoCodigo: 'ACABADO-SINTETICO', varianteAcristalamiento: '2',
  })
  if (!alta.ok) throw new Error('Fixture inválido')
  return alta.alta
}

/** `execute` atiende la sonda de tablas; `select` solo entra si esa sonda dice que existen. */
function cliente(catalogoCargado: boolean) {
  let sondas = 0
  const execute = vi.fn(async () => {
    sondas += 1
    if (sondas === 1) return [{ ok: catalogoCargado }]
    return [{ tabla: 'public.lineas_cerramiento_resultados' }]
  })
  const limit = vi.fn(async () => (catalogoCargado ? [{ codigo: 'QA' }] : []))
  const from = vi.fn(() => ({ limit }))
  const select = vi.fn(() => ({ from }))
  return { execute, select, limit }
}

describe('valoración pendiente para FI explícito', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('sin catálogo de despiece conserva FI_PENDIENTE y no valora', async () => {
    const doble = cliente(false)

    const resultado = await prepararLineaValorada(
      doble as unknown as ClienteEscritura,
      alta1Ofi(),
      entrada,
    )

    expect(doble.limit).not.toHaveBeenCalled()
    expect(valorarCerramiento).not.toHaveBeenCalled()
    expect(resultado).toEqual({
      estado: 'FI_PENDIENTE', manoObra: [],
      importes: { precioUnitario: null, total: null, valoracionCompleta: false },
      aviso: AVISO_FI_SIN_VALORAR,
    })
  })

  it('con catálogo de despiece cargado no bloquea la 1OFI estándar en FI_PENDIENTE', async () => {
    const doble = cliente(true)
    vi.mocked(valorarCerramiento).mockResolvedValue({
      ventaMateriales: { completo: true, importe: '544.50' }, origenes: [],
    } as unknown as Awaited<ReturnType<typeof valorarCerramiento>>)
    vi.mocked(prepararManoObra).mockResolvedValue({ estado: 'SIN_HORAS' })
    vi.mocked(comisionDeLineas).mockResolvedValue(null)

    const resultado = await prepararLineaValorada(
      doble as unknown as ClienteEscritura,
      alta1Ofi(),
      entrada,
    )

    expect(valorarCerramiento).toHaveBeenCalledOnce()
    expect(resultado.estado).toBe('VALORADA')
    expect(resultado.estado).not.toBe('FI_PENDIENTE')
  })
})
