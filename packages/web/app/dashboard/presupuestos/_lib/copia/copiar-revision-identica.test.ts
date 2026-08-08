import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `copiarComoRevision` sólo delega en `copiarIdentica` con la estrategia
 * fija correcta (T.72.2). El resto del comportamiento —autorización, UUID,
 * fecha, error genérico, revalidación— se prueba una única vez en
 * `copia-identica.test.ts`, compartida con `copiarComoNuevo`.
 */
const copiarIdentica = vi.fn()
vi.mock('./copia-identica.ts', () => ({ copiarIdentica }))

const { copiarComoRevision } = await import('./copiar-revision-identica.ts')

describe('copiarComoRevision', () => {
  beforeEach(() => { copiarIdentica.mockReset() })

  it('fija MISMO_NUMERO_NUEVA_REVISION y delega el id tal cual', async () => {
    copiarIdentica.mockResolvedValue({ ok: true, presupuestoId: 'nuevo-id' })

    const resultado = await copiarComoRevision('un-id')

    expect(copiarIdentica).toHaveBeenCalledWith('MISMO_NUMERO_NUEVA_REVISION', 'un-id')
    expect(resultado).toEqual({ ok: true, presupuestoId: 'nuevo-id' })
  })

  it('sólo acepta el id del presupuesto: ningún otro parámetro en su firma', () => {
    expect(copiarComoRevision.length).toBe(1)
  })
})
