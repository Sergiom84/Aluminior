import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `copiarComoNuevo` sólo delega en `copiarIdentica` con la estrategia fija
 * correcta (T.72.2). El resto del comportamiento se prueba una única vez en
 * `copia-identica.test.ts`, compartida con `copiarComoRevision`.
 */
const copiarIdentica = vi.fn()
vi.mock('./copia-identica.ts', () => ({ copiarIdentica }))

const { copiarComoNuevo } = await import('./copiar-como-nuevo.ts')

describe('copiarComoNuevo', () => {
  beforeEach(() => { copiarIdentica.mockReset() })

  it('fija NUEVO_NUMERO y delega el id tal cual', async () => {
    copiarIdentica.mockResolvedValue({ ok: true, presupuestoId: 'nuevo-id' })

    const resultado = await copiarComoNuevo('un-id')

    expect(copiarIdentica).toHaveBeenCalledWith('NUEVO_NUMERO', 'un-id')
    expect(resultado).toEqual({ ok: true, presupuestoId: 'nuevo-id' })
  })

  it('sólo acepta el id del presupuesto: ningún otro parámetro en su firma', () => {
    expect(copiarComoNuevo.length).toBe(1)
  })
})
