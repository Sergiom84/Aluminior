import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { crearPresupuestoAlta, crearPresupuestoAltaParaPruebas } from './crear-presupuesto.ts'
import { copiarPresupuesto } from '../copia/copiar-presupuesto.ts'
import { OPCIONES_COPIA_IDENTICA } from '../copia/plan-copia.ts'
import { MAPA_VACIO } from '../copia/mapa-sustitucion.ts'

const nombre = 'QA A3 RESPUESTA PERDIDA'
const datos = () => ({ serie: 'A', fecha: '2038-10-09', clienteCodigo: null,
  potencialCodigo: null, nombreLibre: nombre, obraTexto: null, tarifa: 1,
  formaPago: null, observaciones: null, creadoPor: 'qa-a3', operacionId: randomUUID() })

describe('A3: commit confirmado y respuesta descartada', () => {
  let db: ReturnType<typeof crearDb>
  beforeAll(() => { db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL)) })
  afterAll(async () => {
    await db.delete(schema.presupuestos).where(eq(schema.presupuestos.nombreLibre, nombre))
    await db.delete(schema.operacionesPresupuesto).where(eq(schema.operacionesPresupuesto.actor, 'qa-a3'))
    await db.delete(schema.operacionesPresupuesto).where(eq(schema.operacionesPresupuesto.actor, 'qa-a3-otro'))
    await db.$client.end({ timeout: 5 })
  })
  it('el reintento de alta devuelve el mismo documento', async () => {
    const entrada = datos()
    const perdido = await crearPresupuestoAlta(db, entrada)
    const reintento = await crearPresupuestoAlta(db, entrada)
    expect(reintento).toEqual(perdido)
  })
  it.each(['NUEVO_NUMERO', 'MISMO_NUMERO_NUEVA_REVISION'] as const)(
    'el reintento de copia %s devuelve el mismo documento', async (estrategia) => {
      const origen = await crearPresupuestoAlta(db, datos())
      if (!origen.ok) throw new Error('No se creó el origen')
      const entrada = { presupuestoId: origen.id, destino: { estrategia },
        opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
        fecha: '2038-10-09', creadoPor: 'qa-a3', operacionId: randomUUID() }
      const perdido = await copiarPresupuesto(db, entrada)
      expect(await copiarPresupuesto(db, entrada)).toEqual(perdido)
    })
  it('serializa envíos concurrentes de la misma clave y no consume otro número', async () => {
    const entrada = datos()
    const [a, b] = await Promise.all([
      crearPresupuestoAltaParaPruebas(db, entrada, { pausaTrasLecturaMs: 150 }),
      crearPresupuestoAlta(db, entrada),
    ])
    expect(a.ok).toBe(true)
    expect(b).toEqual(a)
    const otro = await crearPresupuestoAlta(db, { ...entrada, operacionId: randomUUID() })
    if (!a.ok || !otro.ok) throw new Error('Alta fallida')
    const [primero] = await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, a.id))
    const [segundo] = await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, otro.id))
    expect(segundo.numero).toBe(primero.numero + 1)
  })
  it('no reutiliza la clave confirmada para otro contenido; fecha del servidor puede cambiar', async () => {
    const entrada = datos()
    const inicial = await crearPresupuestoAlta(db, entrada)
    expect(await crearPresupuestoAlta(db, { ...entrada, fecha: '2039-01-01' })).toEqual(inicial)
    await expect(crearPresupuestoAlta(db, { ...entrada, obraTexto: 'otra' })).rejects.toThrow('otros datos')
  })
  it('aísla actores y mantiene el recibo aunque se borre el documento', async () => {
    const entrada = datos()
    const a = await crearPresupuestoAlta(db, entrada)
    const b = await crearPresupuestoAlta(db, { ...entrada, creadoPor: 'qa-a3-otro' })
    expect(a.ok && b.ok && a.id !== b.id).toBe(true)
    if (!a.ok) throw new Error('Alta fallida')
    await db.delete(schema.presupuestos).where(eq(schema.presupuestos.id, a.id))
    expect(await crearPresupuestoAlta(db, entrada)).toEqual(a)
    expect(await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, a.id))).toHaveLength(0)
  })
  it('un fallo SQL no deja recibo y permite corregir y reintentar', async () => {
    const entrada = datos()
    await expect(crearPresupuestoAlta(db, { ...entrada, clienteCodigo: 'QA-A3-INEXISTENTE' })).rejects.toThrow()
    expect(await db.select().from(schema.operacionesPresupuesto)
      .where(eq(schema.operacionesPresupuesto.clave, entrada.operacionId))).toHaveLength(0)
    expect((await crearPresupuestoAlta(db, entrada)).ok).toBe(true)
  })
  it.each(['NUEVO_NUMERO', 'MISMO_NUMERO_NUEVA_REVISION'] as const)(
    'copia concurrente %s: una línea persistida y resultado estable tras editar origen', async (estrategia) => {
      const origen = await crearPresupuestoAlta(db, datos())
      if (!origen.ok) throw new Error('Alta fallida')
      await db.insert(schema.lineas).values({ presupuestoId: origen.id, orden: 1, tipo: 'ARTICULO',
        descripcion: 'QA A3', cantidad: '2', precioUnitario: null, total: null, valoracionCompleta: false })
      const entrada = { presupuestoId: origen.id, destino: { estrategia },
        opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO }, fecha: '2038-10-09',
        creadoPor: 'qa-a3', operacionId: randomUUID() }
      const [a, b] = await Promise.all([copiarPresupuesto(db, entrada), copiarPresupuesto(db, entrada)])
      expect(a.ok).toBe(true)
      expect(b).toEqual(a)
      if (!a.ok) throw new Error('Copia fallida')
      const lineas = await db.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, a.presupuestoId))
      expect(lineas).toHaveLength(1)
      expect(lineas[0]).toMatchObject({ total: null, precioUnitario: null, valoracionCompleta: false })
      await db.update(schema.presupuestos).set({ obraTexto: 'cambió después' }).where(eq(schema.presupuestos.id, origen.id))
      expect(await copiarPresupuesto(db, entrada)).toEqual(a)
      await expect(copiarPresupuesto(db, { ...entrada, presupuestoId: a.presupuestoId })).rejects.toThrow('otros datos')
    })
  it('si falla el recibo, revierte también el presupuesto y permite reintentar', async () => {
    const entrada = datos()
    const origen = await crearPresupuestoAlta(db, datos())
    if (!origen.ok) throw new Error('Alta fallida')
    await db.execute(sql`CREATE FUNCTION qa_a3_fallo_recibo() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN IF NEW.actor = 'qa-a3' THEN RAISE EXCEPTION 'fallo recibo sintético'; END IF; RETURN NEW; END $$`)
    await db.execute(sql`CREATE TRIGGER qa_a3_fallo_recibo BEFORE INSERT ON operaciones_presupuesto
      FOR EACH ROW EXECUTE FUNCTION qa_a3_fallo_recibo()`)
    const antes = await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.nombreLibre, nombre))
    try {
      await expect(crearPresupuestoAlta(db, entrada)).rejects.toThrow()
      await expect(copiarPresupuesto(db, { presupuestoId: origen.id, destino: { estrategia: 'NUEVO_NUMERO' },
        opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO }, fecha: '2038-10-09',
        creadoPor: 'qa-a3', operacionId: randomUUID() })).rejects.toThrow()
      expect(await db.select().from(schema.presupuestos).where(eq(schema.presupuestos.nombreLibre, nombre))).toHaveLength(antes.length)
    } finally {
      await db.execute(sql`DROP TRIGGER qa_a3_fallo_recibo ON operaciones_presupuesto`)
      await db.execute(sql`DROP FUNCTION qa_a3_fallo_recibo()`)
    }
    expect((await crearPresupuestoAlta(db, entrada)).ok).toBe(true)
  })

})
