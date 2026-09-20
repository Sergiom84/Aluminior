import { describe, expect, it, vi } from 'vitest'
import { crearEnvioFormulario } from './envio-formulario.ts'

const fallo = { ok: false, errores: {}, mensaje: 'fallo' }
describe('envío y reintento de formulario', () => {
  it('ignora doble clic/Enter mientras espera, reutiliza UUID tras error y lo renueva tras éxito', async () => {
    let resolver!: (r: { ok: boolean }) => void
    const recibidos: string[] = []
    const accion = vi.fn(async (_: { ok: boolean } | null, datos: FormData) => {
      recibidos.push(String(datos.get('solicitudId')))
      return new Promise<{ ok: boolean }>(resolve => { resolver = resolve })
    })
    let n = 0
    const enviar = crearEnvioFormulario<{ ok: boolean } | null>(accion, fallo, true, () => `id-${++n}`)
    const primero = enviar(null, new FormData())
    expect(await enviar(null, new FormData())).toBeUndefined()
    expect(accion).toHaveBeenCalledTimes(1)
    resolver(fallo)
    expect(await primero).toEqual(fallo)
    const reintento = enviar(fallo, new FormData())
    resolver({ ok: true })
    await reintento
    const siguiente = enviar(null, new FormData())
    resolver({ ok: true })
    await siguiente
    expect(recibidos).toEqual(['id-1', 'id-1', 'id-2'])
  })

  it('libera el bloqueo tras rechazo de transporte sin perder la identidad del alta', async () => {
    const ids: unknown[] = []
    const accion = vi.fn(async (_: { ok: boolean } | null, datos: FormData) => {
      ids.push(datos.get('solicitudId'))
      if (ids.length === 1) throw new Error('respuesta perdida')
      return { ok: true }
    })
    const enviar = crearEnvioFormulario<{ ok: boolean } | null>(accion, fallo, true, () => 'estable')
    expect(await enviar(null, new FormData())).toEqual(fallo)
    expect(await enviar(fallo, new FormData())).toEqual({ ok: true })
    expect(ids).toEqual(['estable', 'estable'])
  })
})
