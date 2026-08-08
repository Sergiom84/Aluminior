import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `copiarIdentica`, en sus caminos de guarda y de error (T.72.2). Es la
 * implementación interna compartida por `copiarComoRevision` y
 * `copiarComoNuevo`: se prueba UNA vez aquí, parametrizada por estrategia
 * donde importa demostrar que el comportamiento es el mismo para las dos.
 * Las pruebas de cada acción sólo comprueban que delega con la estrategia
 * correcta (`copiar-revision-identica.test.ts`, `copiar-como-nuevo.test.ts`).
 */
vi.useFakeTimers()
vi.setSystemTime(new Date('2026-08-08T10:00:00.000Z'))

const usuarioActual = vi.fn()
const crearDb = vi.fn(() => ({ marcador: 'db-simulada' }))
const copiarPresupuesto = vi.fn()
const revalidatePath = vi.fn()

vi.mock('../usuario-actual.ts', () => ({ usuarioActual }))
vi.mock('@aluminior/db', () => ({ crearDb, schema: new Proxy({}, { get: () => ({}) }) }))
vi.mock('./copiar-presupuesto.ts', () => ({ copiarPresupuesto }))
vi.mock('next/cache', () => ({ revalidatePath }))

const { copiarIdentica } = await import('./copia-identica.ts')
const { fechaLocalMadrid } = await import('../fecha-local.ts')

const ID_VALIDO = '11111111-1111-4111-8111-111111111111'
const ESTRATEGIAS = ['MISMO_NUMERO_NUEVA_REVISION', 'NUEVO_NUMERO'] as const

describe('copiarIdentica', () => {
  beforeEach(() => {
    usuarioActual.mockReset()
    crearDb.mockClear()
    copiarPresupuesto.mockReset()
    revalidatePath.mockClear()
  })

  it('UUID inválido: no consulta autenticación ni base', async () => {
    const resultado = await copiarIdentica('MISMO_NUMERO_NUEVA_REVISION', 'no-es-un-uuid')

    expect(resultado).toEqual({ ok: false, error: 'Presupuesto no válido' })
    expect(usuarioActual).not.toHaveBeenCalled()
    expect(crearDb).not.toHaveBeenCalled()
    expect(copiarPresupuesto).not.toHaveBeenCalled()
  })

  it('sesión ausente: no crea Db ni llama a copiarPresupuesto', async () => {
    usuarioActual.mockResolvedValue(null)

    const resultado = await copiarIdentica('NUEVO_NUMERO', ID_VALIDO)

    expect(resultado).toEqual({ ok: false, error: 'Sesión no válida' })
    expect(crearDb).not.toHaveBeenCalled()
    expect(copiarPresupuesto).not.toHaveBeenCalled()
  })

  it.each(ESTRATEGIAS)('%s: fija MAPA_VACIO y la fecha Europe/Madrid explícita', async (estrategia) => {
    usuarioActual.mockResolvedValue('operador@aluminior')
    copiarPresupuesto.mockResolvedValue({
      ok: true, presupuestoId: 'nuevo-id', numero: 11, revision: 0,
      lineasCopiadas: 2, sustitucionesAplicadas: 0, avisos: [],
    })

    await copiarIdentica(estrategia, ID_VALIDO)

    expect(copiarPresupuesto).toHaveBeenCalledWith(
      { marcador: 'db-simulada' },
      expect.objectContaining({
        presupuestoId: ID_VALIDO,
        destino: { estrategia },
        opciones: expect.objectContaining({ mapa: { pares: [] } }),
        creadoPor: 'operador@aluminior',
        fecha: fechaLocalMadrid(),
      }),
    )
  })

  it('copiarPresupuesto devuelve ok:false: error controlado, sin exponer el detalle', async () => {
    usuarioActual.mockResolvedValue('operador@aluminior')
    copiarPresupuesto.mockResolvedValue({
      ok: false, errores: ['presupuestos_identidad_uq viola UNIQUE (serie, numero, revision)'],
    })

    const resultado = await copiarIdentica('NUEVO_NUMERO', ID_VALIDO)

    expect(resultado).toEqual({ ok: false, error: 'No se pudo copiar el presupuesto' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('copiarPresupuesto lanza: error controlado, sin exponer el detalle', async () => {
    usuarioActual.mockResolvedValue('operador@aluminior')
    copiarPresupuesto.mockRejectedValue(new Error('duplicate key value violates unique constraint'))

    const resultado = await copiarIdentica('MISMO_NUMERO_NUEVA_REVISION', ID_VALIDO)

    expect(resultado).toEqual({ ok: false, error: 'No se pudo copiar el presupuesto' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('éxito: devuelve el id nuevo y revalida listado y destino', async () => {
    usuarioActual.mockResolvedValue('operador@aluminior')
    copiarPresupuesto.mockResolvedValue({
      ok: true, presupuestoId: 'nuevo-id', numero: 12, revision: 0,
      lineasCopiadas: 2, sustitucionesAplicadas: 0, avisos: [],
    })

    const resultado = await copiarIdentica('NUEVO_NUMERO', ID_VALIDO)

    expect(resultado).toEqual({ ok: true, presupuestoId: 'nuevo-id' })
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/presupuestos')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/presupuestos/nuevo-id')
  })

  it('un fallo de revalidación NO se convierte en fallo de copia, y no repite la llamada al motor', async () => {
    usuarioActual.mockResolvedValue('operador@aluminior')
    copiarPresupuesto.mockResolvedValue({
      ok: true, presupuestoId: 'nuevo-id', numero: 12, revision: 0,
      lineasCopiadas: 2, sustitucionesAplicadas: 0, avisos: [],
    })
    revalidatePath.mockImplementation(() => { throw new Error('fallo de revalidación') })

    const resultado = await copiarIdentica('MISMO_NUMERO_NUEVA_REVISION', ID_VALIDO)

    expect(resultado).toEqual({ ok: true, presupuestoId: 'nuevo-id' })
    expect(copiarPresupuesto).toHaveBeenCalledTimes(1)
  })
})
