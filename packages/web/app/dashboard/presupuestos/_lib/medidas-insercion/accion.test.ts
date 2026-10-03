import { beforeEach, it, expect, vi } from 'vitest'
const d = vi.hoisted(() => ({ usuario: vi.fn(), guardar: vi.fn(), revalidar: vi.fn() }))
vi.mock('../usuario-actual.ts', () => ({ usuarioActual: d.usuario }))
vi.mock('./preferencia.ts', () => ({ guardarPreferenciaMedidas: d.guardar }))
vi.mock('@aluminior/db', () => ({ crearDb: () => ({ sintetica: true }) }))
vi.mock('next/cache', () => ({ revalidatePath: d.revalidar }))
import { cambiarPreferenciaMedidas } from '../medidas-insercion-action.ts'
beforeEach(() => vi.resetAllMocks())
it('exige sesión antes de guardar o revalidar', async () => {
  d.usuario.mockResolvedValue(null)
  expect((await cambiarPreferenciaMedidas('documento', 'MODELO')).ok).toBe(false)
  expect(d.guardar).not.toHaveBeenCalled()
  expect(d.revalidar).not.toHaveBeenCalled()
})
it('los errores de persistencia no revalidan; el éxito revalida sólo el presupuesto', async () => {
  d.usuario.mockResolvedValue('qa@aluminior.test')
  d.guardar.mockResolvedValue({ ok: false, mensaje: 'No se pudo guardar' })
  expect((await cambiarPreferenciaMedidas('documento', 'COPIAR_PRIMERA')).ok).toBe(false)
  expect(d.revalidar).not.toHaveBeenCalled()
  d.guardar.mockResolvedValue({ ok: true })
  expect((await cambiarPreferenciaMedidas('documento', 'PREGUNTAR')).ok).toBe(true)
  expect(d.revalidar).toHaveBeenCalledExactlyOnceWith('/dashboard/presupuestos/documento')
})
