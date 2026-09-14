import { beforeEach, expect, it, vi } from 'vitest'

const dobles = vi.hoisted(() => ({ usuario: vi.fn(), articulo: vi.fn(), cabecera: vi.fn(), revalidar: vi.fn() }))
vi.mock('../usuario-actual', () => ({ usuarioActual: dobles.usuario }))
vi.mock('../articulos/edicion/editar', () => ({ actualizarArticulo: dobles.articulo }))
vi.mock('../cabecera/editar', () => ({ actualizarCabecera: dobles.cabecera }))
vi.mock('@aluminior/db', () => ({ crearDb: () => ({ sintetica: true }) }))
vi.mock('next/cache', () => ({ revalidatePath: dobles.revalidar }))
import { editarArticulo } from '../editar-articulo-action'
import { editarCabecera } from '../editar-cabecera-action'

beforeEach(() => vi.resetAllMocks())
it.each(['articulo', 'cabecera'] as const)('%s exige sesión antes de llamar a la escritura', async tipo => {
  dobles.usuario.mockResolvedValue(null)
  const accion = tipo === 'articulo' ? editarArticulo : editarCabecera
  expect(await accion(null, new FormData())).toEqual({ ok: false, errores: {}, mensaje: 'Sesión no válida' })
  expect(dobles.articulo).not.toHaveBeenCalled()
  expect(dobles.cabecera).not.toHaveBeenCalled()
  expect(dobles.revalidar).not.toHaveBeenCalled()
})
it.each(['articulo', 'cabecera'] as const)('%s conserva campos para validación estricta y revalida sólo al guardar', async tipo => {
  const accion = tipo === 'articulo' ? editarArticulo : editarCabecera
  const servicio = tipo === 'articulo' ? dobles.articulo : dobles.cabecera
  const datos = new FormData(); datos.set('presupuestoId', 'documento'); datos.set('total', 'manipulado')
  dobles.usuario.mockResolvedValue('usuario@aluminior.test')
  servicio.mockResolvedValue({ ok: false, errores: {}, mensaje: 'Rechazado' })
  expect((await accion(null, datos))?.ok).toBe(false)
  expect(servicio).toHaveBeenCalledWith({ sintetica: true }, { presupuestoId: 'documento', total: 'manipulado' })
  expect(dobles.revalidar).not.toHaveBeenCalled()
  servicio.mockResolvedValue({ ok: true, mensaje: 'Guardado' })
  await accion(null, datos)
  expect(dobles.revalidar.mock.calls).toEqual([['/dashboard/presupuestos/documento'], ['/dashboard/presupuestos']])
})
