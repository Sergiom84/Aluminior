import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { borrarPresupuesto, enTransaccionDrizzle } from './index.ts'
import { siguienteNumeroPrevisto } from '../numeracion/siguiente.ts'

/**
 * Contra PostgreSQL efímero. Ejercicio 97 (números 97xxxx, fecha 2097) y serie
 * propia: ninguna otra suite escribe ahí, así que el máximo del ejercicio es
 * sólo de esta suite.
 */
const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const SERIE = 'QA-BOR'
const FECHA = '2097-03-01'
afterAll(async () => {
  await db.delete(schema.presupuestos).where(eq(schema.presupuestos.serie, SERIE))
  await db.$client.end({ timeout: 5 })
})
beforeEach(() => db.delete(schema.presupuestos).where(eq(schema.presupuestos.serie, SERIE)))

const dependencias = { usuarioActual: async () => 'qa@aluminior', enTransaccion: enTransaccionDrizzle(db) }

async function documentoCompleto(numero: number, estado = 'PENDIENTE') {
  const [p] = await db.insert(schema.presupuestos).values({ numero, serie: SERIE, revision: 0, fecha: FECHA,
    nombreLibre: 'QA borrado', tarifa: 1, estado }).returning()
  const [l] = await db.insert(schema.lineas).values({ presupuestoId: p!.id, orden: 1, tipo: 'CERRAMIENTO',
    descripcion: 'GRUPO sintético', cantidad: '1', precioUnitario: '20', total: '20' }).returning()
  await db.insert(schema.lineasCerramiento).values({ lineaId: l!.id,
    configuracion: { version: 1, modulos: [], uniones: [] } })
  await db.insert(schema.lineasCerramientoResultados).values({ lineaId: l!.id, version: 1,
    resultado: { version: 1 } as never })
  await db.insert(schema.presupuestosGastos).values({ presupuestoId: p!.id, comisionPorc: '5' })
  return { presupuestoId: p!.id, lineaId: l!.id }
}

async function restos(presupuestoId: string, lineaId: string) {
  const contar = async (consulta: Promise<unknown[]>) => (await consulta).length
  return {
    presupuestos: await contar(db.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, presupuestoId))),
    gastos: await contar(db.select().from(schema.presupuestosGastos)
      .where(eq(schema.presupuestosGastos.presupuestoId, presupuestoId))),
    lineas: await contar(db.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, presupuestoId))),
    cerramiento: await contar(db.select().from(schema.lineasCerramiento)
      .where(eq(schema.lineasCerramiento.lineaId, lineaId))),
    resultados: await contar(db.select().from(schema.lineasCerramientoResultados)
      .where(eq(schema.lineasCerramientoResultados.lineaId, lineaId))),
  }
}

describe('borrarPresupuesto contra PostgreSQL', () => {
  it('borra cabecera, gastos, líneas y satélites de la línea', async () => {
    const { presupuestoId, lineaId } = await documentoCompleto(970001)
    expect(await restos(presupuestoId, lineaId))
      .toEqual({ presupuestos: 1, gastos: 1, lineas: 1, cerramiento: 1, resultados: 1 })

    expect(await borrarPresupuesto(dependencias, presupuestoId))
      .toEqual({ ok: true, numero: 970001, revision: 0, serie: SERIE })
    expect(await restos(presupuestoId, lineaId))
      .toEqual({ presupuestos: 0, gastos: 0, lineas: 0, cerramiento: 0, resultados: 0 })
  })

  it.each(['ACEPTADO', 'RECHAZADO', 'ANULADO'])('deja intacto un presupuesto %s', async (estado) => {
    const { presupuestoId, lineaId } = await documentoCompleto(970002, estado)

    expect(await borrarPresupuesto(dependencias, presupuestoId)).toMatchObject({ ok: false, motivo: 'ESTADO_NO_BORRABLE' })
    expect(await restos(presupuestoId, lineaId))
      .toEqual({ presupuestos: 1, gastos: 1, lineas: 1, cerramiento: 1, resultados: 1 })
  })

  it('un id que no existe no borra nada', async () => {
    const { presupuestoId, lineaId } = await documentoCompleto(970003)

    expect(await borrarPresupuesto(dependencias, '00000000-0000-4000-8000-000000000000'))
      .toMatchObject({ ok: false, motivo: 'NO_ENCONTRADO' })
    expect((await restos(presupuestoId, lineaId)).presupuestos).toBe(1)
  })

  it('numeración MAX+1: borrar el último libera su número; borrar uno intermedio deja hueco', async () => {
    const primero = await documentoCompleto(970001)
    const ultimo = await documentoCompleto(970002)
    expect(await siguienteNumeroPrevisto(db, FECHA)).toBe(970003)

    await borrarPresupuesto(dependencias, ultimo.presupuestoId)
    expect(await siguienteNumeroPrevisto(db, FECHA)).toBe(970002)

    await documentoCompleto(970002)
    await borrarPresupuesto(dependencias, primero.presupuestoId)
    expect(await siguienteNumeroPrevisto(db, FECHA)).toBe(970003)
  })
})

describe('integridad referencial del borrado', () => {
  it('toda clave ajena que llega, directa o transitivamente, a presupuestos es ON DELETE CASCADE', async () => {
    // Barrido del catálogo de PostgreSQL, no una lista escrita a mano: una
    // tabla nueva que referencie el documento sin cascada hace fallar esto.
    const filas = (await db.execute<{ hija: string; padre: string; borrado: string }>(sql`
      WITH RECURSIVE dependientes(tabla) AS (
        SELECT 'presupuestos'::regclass
        UNION
        SELECT c.conrelid::regclass FROM pg_constraint c
        JOIN dependientes d ON c.confrelid = d.tabla
        WHERE c.contype = 'f'
      )
      SELECT c.conrelid::regclass::text AS hija, c.confrelid::regclass::text AS padre, c.confdeltype AS borrado
      FROM pg_constraint c JOIN dependientes d ON c.confrelid = d.tabla
      WHERE c.contype = 'f'
    `)) as unknown as { hija: string; padre: string; borrado: string }[]

    const hijas = new Set(filas.map((f) => f.hija))
    expect(hijas).toEqual(new Set(['lineas', 'presupuestos_gastos', 'lineas_estructura', 'lineas_cargos',
      'lineas_cerramiento', 'lineas_opciones_herraje', 'lineas_acristalamiento', 'lineas_despiece',
      'lineas_mano_obra', 'lineas_cerramiento_resultados']))
    expect(filas.filter((f) => f.borrado !== 'c')).toEqual([])
  })
})
