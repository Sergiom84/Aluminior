import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `copiarComoRevision`, en sus caminos de guarda y de error (T.72.1.1).
 *
 * No repite la prueba de contrato (`copiar-revision-identica.contrato.test.ts`,
 * que barre el fichero real) ni la integración de `copiarPresupuesto`
 * (`copiar-presupuesto.rollback.integracion.test.ts`, contra PostgreSQL de
 * verdad). Esto es la orquestación de la propia acción, con sus tres
 * dependencias simuladas: nunca se abre conexión real ni se llama al motor de
 * copia salvo cuando la entrada ya es válida y hay sesión.
 */
const usuarioActual = vi.fn()
const crearDb = vi.fn(() => ({ marcador: 'db-simulada' }))
const copiarPresupuesto = vi.fn()
const revalidatePath = vi.fn()

vi.mock('../usuario-actual.ts', () => ({ usuarioActual }))
vi.mock('@aluminior/db', () => ({ crearDb, schema: new Proxy({}, { get: () => ({}) }) }))
vi.mock('./copiar-presupuesto.ts', () => ({ copiarPresupuesto }))
vi.mock('next/cache', () => ({ revalidatePath }))

const { copiarComoRevision } = await import('./copiar-revision-identica.ts')

const ID_VALIDO = '11111111-1111-4111-8111-111111111111'

describe('copiarComoRevision', () => {
  beforeEach(() => {
    usuarioActual.mockReset()
    crearDb.mockClear()
    copiarPresupuesto.mockReset()
    revalidatePath.mockClear()
  })

  it('UUID inválido: no consulta autenticación ni base', async () => {
    const resultado = await copiarComoRevision('no-es-un-uuid')

    expect(resultado).toEqual({ ok: false, error: 'Presupuesto no válido' })
    expect(usuarioActual).not.toHaveBeenCalled()
    expect(crearDb).not.toHaveBeenCalled()
    expect(copiarPresupuesto).not.toHaveBeenCalled()
  })

  it('sesión ausente: no crea Db ni llama a copiarPresupuesto', async () => {
    usuarioActual.mockResolvedValue(null)

    const resultado = await copiarComoRevision(ID_VALIDO)

    expect(resultado).toEqual({ ok: false, error: 'Sesión no válida' })
    expect(crearDb).not.toHaveBeenCalled()
    expect(copiarPresupuesto).not.toHaveBeenCalled()
  })

  it('copiarPresupuesto devuelve ok:false: error controlado, sin exponer el detalle', async () => {
    usuarioActual.mockResolvedValue('operador@aluminior')
    copiarPresupuesto.mockResolvedValue({
      ok: false, errores: ['presupuestos_identidad_uq viola UNIQUE (serie, numero, revision)'],
    })

    const resultado = await copiarComoRevision(ID_VALIDO)

    expect(resultado).toEqual({ ok: false, error: 'No se pudo copiar el presupuesto como nueva revisión' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('copiarPresupuesto lanza: error controlado, sin exponer el detalle', async () => {
    usuarioActual.mockResolvedValue('operador@aluminior')
    copiarPresupuesto.mockRejectedValue(new Error('duplicate key value violates unique constraint'))

    const resultado = await copiarComoRevision(ID_VALIDO)

    expect(resultado).toEqual({ ok: false, error: 'No se pudo copiar el presupuesto como nueva revisión' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('éxito: devuelve el id nuevo y revalida listado y destino', async () => {
    usuarioActual.mockResolvedValue('operador@aluminior')
    copiarPresupuesto.mockResolvedValue({
      ok: true, presupuestoId: 'nuevo-id', numero: 11, revision: 1,
      lineasCopiadas: 2, sustitucionesAplicadas: 0, avisos: [],
    })

    const resultado = await copiarComoRevision(ID_VALIDO)

    expect(resultado).toEqual({ ok: true, presupuestoId: 'nuevo-id' })
    expect(copiarPresupuesto).toHaveBeenCalledWith(
      { marcador: 'db-simulada' },
      expect.objectContaining({
        presupuestoId: ID_VALIDO,
        destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
        creadoPor: 'operador@aluminior',
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/presupuestos')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/presupuestos/nuevo-id')
  })
})
