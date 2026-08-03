import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * La acción, en su camino de rechazo.
 *
 * No duplica la validación —eso es `esquema-linea.test.ts`— ni simula
 * PostgreSQL. Comprueba lo único que la acción decide por su cuenta: que una
 * entrada inválida vuelve como errores por campo SIN haber abierto conexión ni
 * haber llegado a escribir.
 */
const crearDb = vi.fn(() => { throw new Error('la acción no debe conectar si la entrada no vale') })
const guardarLinea = vi.fn()

vi.mock('@aluminior/db', () => ({ crearDb, schema: new Proxy({}, { get: () => ({}) }) }))
vi.mock('./lineas/guardar-linea.ts', () => ({ guardarLinea }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('../../../../lib/supabase/servidor.ts', () => ({ crearClienteServidor: vi.fn() }))

const { anyadirLinea } = await import('./acciones.ts')

const formulario = (campos: Record<string, string>) => {
  const datos = new FormData()
  for (const [clave, valor] of Object.entries(campos)) datos.set(clave, valor)
  return datos
}

const valido = {
  presupuestoId: '11111111-1111-4111-8111-111111111111',
  tipo: 'CERRAMIENTO',
  codigo: 'GRUPO',
}

describe('anyadirLinea con entrada inválida', () => {
  beforeEach(() => {
    crearDb.mockClear()
    guardarLinea.mockClear()
  })

  it('devuelve los errores de cantidad y de ambos conceptos a la vez', async () => {
    const estado = await anyadirLinea(null, formulario({
      ...valido, cantidad: '0', horasFabricacion: '-1', horasColocacion: '0.001',
    }))

    expect(estado?.ok).toBe(false)
    if (!estado || estado.ok) return
    expect(estado.errores.cantidad).toEqual(['Cantidad: debe ser mayor que cero'])
    expect(estado.errores.horasFabricacion).toEqual(['Fabricación: no admite negativos'])
    expect(estado.errores.horasColocacion).toEqual(['Colocación: máximo 2 decimales'])
    expect(estado.mensaje).toBeUndefined()
  })

  it('no abre conexión ni escribe cuando la entrada no vale', async () => {
    const estado = await anyadirLinea(null, formulario({ ...valido, horasFabricacion: '25,50' }))

    expect(estado?.ok).toBe(false)
    expect(crearDb).not.toHaveBeenCalled()
    expect(guardarLinea).not.toHaveBeenCalled()
  })

  it('rechaza la composición del cerramiento antes de conectar', async () => {
    const estado = await anyadirLinea(null, formulario({
      ...valido, configuracionCerramiento: '{"version":9}',
    }))

    expect(estado?.ok).toBe(false)
    if (!estado || estado.ok) return
    expect(estado.errores.configuracionCerramiento)
      .toEqual(['La composición del cerramiento no es válida'])
    expect(crearDb).not.toHaveBeenCalled()
    expect(guardarLinea).not.toHaveBeenCalled()
  })
})
