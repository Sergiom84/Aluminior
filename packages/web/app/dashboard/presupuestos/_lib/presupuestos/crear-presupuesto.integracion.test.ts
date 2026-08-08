/**
 * Alta de presupuesto, contra PostgreSQL de verdad (T.71.4).
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 *
 * La concurrencia se fuerza con `crearPresupuestoAltaParaPruebas` (el gancho
 * de pausa de `_lib/numeracion/`, hilado hasta aquí): un `Promise.all` de dos
 * altas reales podría pasar por casualidad si ninguna se solapa de verdad.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { and, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { crearPresupuestoAlta, crearPresupuestoAltaParaPruebas, type DatosAltaPresupuesto } from './crear-presupuesto.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA ALTA PRESUPUESTO'
// Ejercicio 32 -> rango 320000-329999, aislado de las demás suites.
const FECHA = '2032-03-10'
const EJERCICIO = 32

describe('alta de presupuesto, contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>

  const datos = (cambios: Partial<DatosAltaPresupuesto> = {}): DatosAltaPresupuesto => ({
    serie: 'A', fecha: FECHA, clienteCodigo: null, potencialCodigo: null,
    nombreLibre: NOMBRE_PRUEBA, obraTexto: null, tarifa: 1,
    formaPago: null, observaciones: null, creadoPor: 'prueba@aluminior',
    ...cambios,
  })

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))

  const contarFilas = (numero: number) => db.select().from(schema.presupuestos)
    .where(and(eq(schema.presupuestos.numero, numero), eq(schema.presupuestos.serie, 'A')))
    .then((filas) => filas.length)

  beforeAll(async () => { db = crearDb(urlPruebas) })
  beforeEach(limpiar)
  afterAll(async () => {
    try {
      await limpiar()
    } finally {
      await db.$client.end({ timeout: 5 })
    }
  })

  it('alta normal en ejercicio vacío: AASSSS con secuencia 0001', async () => {
    const resultado = await crearPresupuestoAlta(db, datos())
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return

    const [fila] = await db.select().from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, resultado.id))
    expect(fila.numero).toBe(320001)
    expect(fila.revision).toBe(0)
    expect(fila.serie).toBe('A')
  })

  it('dos altas concurrentes, con intercalación forzada, dan números consecutivos', async () => {
    const [r1, r2] = await Promise.all([
      crearPresupuestoAltaParaPruebas(db, datos(), { pausaTrasLecturaMs: 200 }),
      (async () => {
        await new Promise((resolver) => setTimeout(resolver, 40))
        return crearPresupuestoAlta(db, datos())
      })(),
    ])

    expect(r1.ok).toBe(true)
    expect(r2.ok).toBe(true)
    if (!r1.ok || !r2.ok) return

    const [f1] = await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, r1.id))
    const [f2] = await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, r2.id))
    expect(new Set([f1.numero, f2.numero]).size).toBe(2)
    expect(Math.abs(f1.numero - f2.numero)).toBe(1)
  })

  it('un fallo durante la escritura de la cabecera no deja nada persistido', async () => {
    // FK inexistente: falla DENTRO de la misma transacción que reservó el
    // número, después de que la numeración ya se resolvió.
    await expect(crearPresupuestoAlta(db, datos({ clienteCodigo: 'NO-EXISTE-ESTE-CLIENTE' })))
      .rejects.toThrow()

    expect(await contarFilas(320001)).toBe(0)
  })

  it('una colisión externa puntual se reintenta una vez automáticamente', async () => {
    await db.insert(schema.presupuestos).values({
      numero: 320001, revision: 0, serie: 'A', fecha: FECHA,
      nombreLibre: NOMBRE_PRUEBA, tarifa: 1, estado: 'PENDIENTE',
    })

    const resultado = await crearPresupuestoAlta(db, datos())
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    const [fila] = await db.select().from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, resultado.id))
    expect(fila.numero).toBe(320002)
  })

  it('fecha inválida: no escribe nada', async () => {
    const resultado = await crearPresupuestoAlta(db, datos({ fecha: '2032-02-30' }))
    expect(resultado.ok).toBe(false)
    expect(await contarFilas(320001)).toBe(0)
  })

  it('secuencia anual agotada: no escribe nada', async () => {
    await db.insert(schema.presupuestos).values({
      numero: 329999, revision: 0, serie: 'A', fecha: FECHA,
      nombreLibre: NOMBRE_PRUEBA, tarifa: 1, estado: 'PENDIENTE',
    })

    const resultado = await crearPresupuestoAlta(db, datos())
    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(resultado.errores[0]).toContain(`Secuencia del ejercicio ${EJERCICIO} agotada`)
    expect(await contarFilas(330000)).toBe(0)
  })
})
