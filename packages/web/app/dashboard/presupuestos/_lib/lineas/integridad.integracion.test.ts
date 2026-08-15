/**
 * Integridad de las mutaciones de líneas contra PostgreSQL local efímero.
 *
 * La URL pasa por `urlDePruebasValidada`: una configuración remota o una base
 * que no sea de pruebas se rechaza antes de escribir el primer fixture.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { asc, eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { actualizarTotales } from '../totales.ts'
import { borrarLineaDePresupuesto } from './borrar-linea.ts'
import { guardarLinea, guardarLineaParaPruebas } from './guardar-linea.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE = 'PRUEBA AUTOMÁTICA INTEGRIDAD LÍNEAS'

function diferida() {
  let resolver!: () => void
  const promesa = new Promise<void>((resolve) => { resolver = resolve })
  return { promesa, resolver }
}

describe('integridad de líneas de presupuesto', () => {
  let db: ReturnType<typeof crearDb>

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE))

  const crearPresupuesto = async (numero: number) => {
    const [fila] = await db.insert(schema.presupuestos).values({
      numero,
      revision: 0,
      serie: 'I',
      fecha: '2026-08-15',
      nombreLibre: NOMBRE,
      tarifa: 1,
    }).returning({ id: schema.presupuestos.id })
    return fila.id
  }

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()
  }, 60_000)

  afterAll(async () => { await limpiar() })

  it('serializa tres altas intercaladas y asigna órdenes consecutivos', async () => {
    const presupuestoId = await crearPresupuesto(999970)

    // Una ruta de copia/restauración puede conservar un orden explícito.
    await guardarLinea(db, {
      tipo: 'ARTICULO',
      valores: {
        presupuestoId,
        orden: 7,
        descripcion: 'LÍNEA PREEXISTENTE',
        cantidad: '1',
        precioUnitario: '5.0000',
        total: '5.00',
      },
    })

    const liberarPrimera = diferida()
    const primeraBloqueada = diferida()
    const segundaLista = diferida()
    const terceraLista = diferida()
    let segundaEntro = false
    let terceraEntro = false

    const alta = (descripcion: string, total: string) => ({
      tipo: 'ARTICULO' as const,
      valores: {
        presupuestoId,
        descripcion,
        cantidad: '1',
        precioUnitario: `${total}.0000`,
        total: `${total}.00`,
      },
    })

    const primera = guardarLineaParaPruebas(db, alta('CONCURRENTE 1', '10'), {
      despuesDeBloquearPresupuesto: async () => {
        primeraBloqueada.resolver()
        await liberarPrimera.promesa
      },
    })
    await primeraBloqueada.promesa

    const segunda = guardarLineaParaPruebas(db, alta('CONCURRENTE 2', '20'), {
      antesDeBloquearPresupuesto: async () => { segundaLista.resolver() },
      despuesDeBloquearPresupuesto: async () => { segundaEntro = true },
    })
    const tercera = guardarLineaParaPruebas(db, alta('CONCURRENTE 3', '30'), {
      antesDeBloquearPresupuesto: async () => { terceraLista.resolver() },
      despuesDeBloquearPresupuesto: async () => { terceraEntro = true },
    })

    // Las dos transacciones ya han arrancado, pero ninguna puede atravesar el
    // FOR UPDATE mientras la primera conserva la cabecera bloqueada.
    await Promise.all([segundaLista.promesa, terceraLista.promesa])
    await new Promise((resolve) => setTimeout(resolve, 75))
    expect([segundaEntro, terceraEntro]).toEqual([false, false])

    liberarPrimera.resolver()
    await Promise.all([primera, segunda, tercera])

    const lineas = await db.select({ orden: schema.lineas.orden })
      .from(schema.lineas)
      .where(eq(schema.lineas.presupuestoId, presupuestoId))
      .orderBy(asc(schema.lineas.orden))
    expect(lineas.map((fila) => fila.orden)).toEqual([7, 8, 9, 10])
    expect(new Set(lineas.map((fila) => fila.orden)).size).toBe(4)

    const [cabecera] = await db.select({ subtotal: schema.presupuestos.subtotal })
      .from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, presupuestoId))
    expect(cabecera.subtotal).toBe('65.00')
  }, 30_000)

  it('no borra una línea ajena ni sus satélites, y recalcula sólo al borrar la propia', async () => {
    const presupuestoId = await crearPresupuesto(999971)
    const otroPresupuestoId = await crearPresupuesto(999972)
    const [linea] = await db.insert(schema.lineas).values({
      presupuestoId,
      orden: 1,
      tipo: 'CERRAMIENTO',
      descripcion: 'GRUPO PROTEGIDO',
      cantidad: '1',
      precioUnitario: '100.0000',
      total: '100.00',
    }).returning({ id: schema.lineas.id })
    await db.insert(schema.lineasCerramiento).values({
      lineaId: linea.id,
      configuracion: { prueba: true },
    })
    await actualizarTotales(db, presupuestoId)

    expect(await borrarLineaDePresupuesto(db, linea.id, otroPresupuestoId)).toBe(false)

    const conservada = await db.select({ id: schema.lineas.id })
      .from(schema.lineas).where(eq(schema.lineas.id, linea.id))
    const satelite = await db.select({ lineaId: schema.lineasCerramiento.lineaId })
      .from(schema.lineasCerramiento)
      .where(eq(schema.lineasCerramiento.lineaId, linea.id))
    expect(conservada).toHaveLength(1)
    expect(satelite).toHaveLength(1)

    const antes = await db.select({ id: schema.presupuestos.id, subtotal: schema.presupuestos.subtotal })
      .from(schema.presupuestos)
      .where(inArray(schema.presupuestos.id, [presupuestoId, otroPresupuestoId]))
    expect(Object.fromEntries(antes.map((fila) => [fila.id, fila.subtotal]))).toEqual({
      [presupuestoId]: '100.00',
      [otroPresupuestoId]: '0.00',
    })

    expect(await borrarLineaDePresupuesto(db, linea.id, presupuestoId)).toBe(true)
    expect(await db.select().from(schema.lineas).where(eq(schema.lineas.id, linea.id))).toHaveLength(0)
    expect(await db.select().from(schema.lineasCerramiento)
      .where(eq(schema.lineasCerramiento.lineaId, linea.id))).toHaveLength(0)

    const [recalculada] = await db.select({ subtotal: schema.presupuestos.subtotal })
      .from(schema.presupuestos).where(eq(schema.presupuestos.id, presupuestoId))
    expect(recalculada.subtotal).toBe('0.00')
  })

})
