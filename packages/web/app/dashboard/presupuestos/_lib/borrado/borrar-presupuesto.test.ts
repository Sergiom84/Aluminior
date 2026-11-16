import { describe, expect, it, vi } from 'vitest'
import {
  borrarPresupuesto, type DependenciasBorrado, type PresupuestoBloqueado, type RepositorioBorrado,
} from './borrar-presupuesto.ts'

const ID = '11111111-1111-4111-8111-111111111111'

function falsas(opciones: {
  usuario?: string | null
  fila?: PresupuestoBloqueado | null
  borrado?: boolean
} = {}) {
  const repositorio = {
    bloquear: vi.fn<RepositorioBorrado['bloquear']>(async () =>
      opciones.fila === undefined ? { numero: 260012, revision: 0, serie: 'A', estado: 'PENDIENTE' } : opciones.fila),
    borrar: vi.fn<RepositorioBorrado['borrar']>(async () => opciones.borrado ?? true),
  }
  const enTransaccion = vi.fn(async (trabajo: (r: RepositorioBorrado) => Promise<unknown>) => trabajo(repositorio))
  const dependencias: DependenciasBorrado = {
    usuarioActual: vi.fn(async () => (opciones.usuario === undefined ? 'operador@aluminior' : opciones.usuario)),
    enTransaccion: enTransaccion as DependenciasBorrado['enTransaccion'],
  }
  return { dependencias, repositorio, enTransaccion }
}

describe('borrarPresupuesto', () => {
  it('borra un presupuesto pendiente, con la fila bloqueada antes, en una transacción', async () => {
    const { dependencias, repositorio, enTransaccion } = falsas()

    const resultado = await borrarPresupuesto(dependencias, ID)

    expect(resultado).toEqual({ ok: true, numero: 260012, revision: 0, serie: 'A' })
    expect(enTransaccion).toHaveBeenCalledTimes(1)
    expect(repositorio.bloquear).toHaveBeenCalledWith(ID)
    expect(repositorio.borrar).toHaveBeenCalledWith(ID)
    expect(repositorio.bloquear.mock.invocationCallOrder[0])
      .toBeLessThan(repositorio.borrar.mock.invocationCallOrder[0]!)
  })

  it('rechaza sin sesión y no abre transacción', async () => {
    const { dependencias, enTransaccion, repositorio } = falsas({ usuario: null })

    expect(await borrarPresupuesto(dependencias, ID))
      .toEqual({ ok: false, motivo: 'SIN_SESION', mensaje: 'Sesión no válida' })
    expect(enTransaccion).not.toHaveBeenCalled()
    expect(repositorio.borrar).not.toHaveBeenCalled()
  })

  it.each(['ACEPTADO', 'RECHAZADO', 'ANULADO'])('rechaza un presupuesto %s sin borrar', async (estado) => {
    const { dependencias, repositorio } = falsas({ fila: { numero: 260012, revision: 1, serie: 'A', estado } })

    const resultado = await borrarPresupuesto(dependencias, ID)

    expect(resultado).toMatchObject({ ok: false, motivo: 'ESTADO_NO_BORRABLE' })
    if (!resultado.ok) expect(resultado.mensaje).toContain(estado)
    expect(repositorio.borrar).not.toHaveBeenCalled()
  })

  it('id inexistente: no encontrado y sin borrar', async () => {
    const { dependencias, repositorio } = falsas({ fila: null })

    expect(await borrarPresupuesto(dependencias, ID)).toMatchObject({ ok: false, motivo: 'NO_ENCONTRADO' })
    expect(repositorio.borrar).not.toHaveBeenCalled()
  })

  it('si el DELETE no afecta a ninguna fila no informa de éxito', async () => {
    const { dependencias } = falsas({ borrado: false })

    expect(await borrarPresupuesto(dependencias, ID)).toMatchObject({ ok: false, motivo: 'NO_ENCONTRADO' })
  })

  it.each(['', 'no-es-uuid', `${ID} OR 1=1`])('rechaza un id mal formado (%j) sin consultar sesión ni base', async (id) => {
    const { dependencias, enTransaccion } = falsas()

    expect(await borrarPresupuesto(dependencias, id)).toMatchObject({ ok: false, motivo: 'ID_INVALIDO' })
    expect(dependencias.usuarioActual).not.toHaveBeenCalled()
    expect(enTransaccion).not.toHaveBeenCalled()
  })
})
