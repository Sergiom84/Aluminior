import { beforeEach, describe, expect, it, vi } from 'vitest'

const { bloquearMock, actualizarTotalesMock } = vi.hoisted(() => ({
  bloquearMock: vi.fn(),
  actualizarTotalesMock: vi.fn(async () => undefined),
}))

vi.mock('../lineas/con-presupuesto-bloqueado.ts', () => ({
  conPresupuestoBloqueado: async (_db: unknown, _id: string, fn: (tx: unknown, cab: unknown) => unknown) => {
    const cab = bloquearMock()
    const set = vi.fn(() => ({ where: vi.fn(async () => undefined) }))
    const tx = { update: vi.fn(() => ({ set })) }
    return fn(tx, cab)
  },
}))

vi.mock('../totales.ts', () => ({
  actualizarTotales: actualizarTotalesMock,
}))

import { confirmarGuardadoPresupuesto, registrarPagoPresupuesto } from './acciones-presupuesto.ts'

const ID = '00000000-0000-4000-8000-000000000001'

describe('guardar y pagar presupuesto', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('rechaza identificadores inválidos y métodos desconocidos', async () => {
    expect(await confirmarGuardadoPresupuesto({} as never, 'no-uuid')).toEqual({ ok: false, mensaje: 'Presupuesto no válido' })
    expect(await registrarPagoPresupuesto({} as never, {
      presupuestoId: ID, metodoPago: 'BIZUM' as never, usuario: 'u@test.es',
    })).toEqual({ ok: false, mensaje: 'Método de pago no válido' })
  })

  it('guarda un presupuesto pendiente y recalcula totales', async () => {
    bloquearMock.mockReturnValue({ id: ID, estado: 'PENDIENTE', formaPago: null })
    const res = await confirmarGuardadoPresupuesto({} as never, ID)
    expect(res.ok).toBe(true)
    expect(actualizarTotalesMock).toHaveBeenCalledOnce()
  })

  it('pasa de PENDIENTE a ABONADO con METALICO o TRANSFERENCIA y rechaza si ya no está pendiente', async () => {
    bloquearMock.mockReturnValue({ id: ID, estado: 'PENDIENTE', formaPago: null })
    expect(await registrarPagoPresupuesto({} as never, {
      presupuestoId: ID, metodoPago: 'METALICO', usuario: 'usuario02@test.es',
    })).toEqual({ ok: true, estado: 'ABONADO', metodoPago: 'METALICO' })

    bloquearMock.mockReturnValue({ id: ID, estado: 'ABONADO', formaPago: '01-CONTADO' })
    expect(await registrarPagoPresupuesto({} as never, {
      presupuestoId: ID, metodoPago: 'TRANSFERENCIA', usuario: 'usuario02@test.es',
    })).toEqual({ ok: false, mensaje: 'El presupuesto ya está ABONADO' })
  })
})
