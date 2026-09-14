/**
 * Identidad documental de `presupuestos` = (serie, numero, revision), contra
 * PostgreSQL de verdad (T.71.1).
 *
 * `presupuestos_identidad_uq` es la última defensa: el candado normal vive en
 * el advisory lock de `_lib/numeracion/` (T.71.2), pero un proceso externo o
 * un camino de código que no lo respete debe seguir chocando aquí, no
 * escribiendo un duplicado silencioso.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/db test
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { crearDb } from '../index.ts'
import { urlDePruebasValidada } from '../pruebas.ts'
import * as schema from './index.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA IDENTIDAD PRESUPUESTO'

/** Lee la migración 0019 tal cual quedó en disco: la prueba de la migración
 * ejecuta el SQL real, no una copia de mano que podría desincronizarse. */
const sqlMigracion019 = readFileSync(
  fileURLToPath(new URL('../../migrations/0019_fixed_ken_ellis.sql', import.meta.url)),
  'utf8',
)
const [preflightSql] = sqlMigracion019.split('--> statement-breakpoint')

type Fila = typeof schema.presupuestos.$inferInsert

describe('identidad documental de presupuestos, contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>

  const fila = (cambios: Partial<Fila> = {}): Fila => ({
    numero: 900001, revision: 0, serie: 'A',
    fecha: '2026-01-01', nombreLibre: NOMBRE_PRUEBA, tarifa: 1, estado: 'PENDIENTE',
    ...cambios,
  })

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))

  beforeAll(async () => { db = crearDb(urlPruebas) })

  beforeEach(limpiar)
  afterAll(async () => {
    try {
      await limpiar()
    } finally {
      await db.$client.end({ timeout: 5 })
    }
  })

  describe('la restricción única', () => {
    it('rechaza la misma (serie, numero, revision) repetida', async () => {
      await db.insert(schema.presupuestos).values(fila())

      await expect(db.insert(schema.presupuestos).values(fila())).rejects.toMatchObject({
        cause: { code: '23505', constraint_name: 'presupuestos_identidad_uq' },
      })
    })

    it('admite el mismo número y revisión en una serie diferente', async () => {
      await db.insert(schema.presupuestos).values(fila({ serie: 'A' }))
      await db.insert(schema.presupuestos).values(fila({ serie: 'B' }))

      const filas = await db.select().from(schema.presupuestos)
        .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))
      expect(filas).toHaveLength(2)
    })

    it('admite revisiones diferentes del mismo número y serie', async () => {
      await db.insert(schema.presupuestos).values(fila({ revision: 0 }))
      await db.insert(schema.presupuestos).values(fila({ revision: 1 }))

      const filas = await db.select().from(schema.presupuestos)
        .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))
      expect(filas).toHaveLength(2)
    })
  })

  describe('preflight de la migración 0019', () => {
    /** Único bloque de este fichero que quita la restricción: la restaura en
     * el `finally` para no contaminar el resto de la suite. */
    it('se detiene sobre datos duplicados sin borrar ninguna fila', async () => {
      await db.execute(sql`ALTER TABLE presupuestos DROP CONSTRAINT presupuestos_identidad_uq`)
      try {
        // Sin la restricción, esta segunda fila SÍ se inserta: es el estado
        // que el preflight debe detectar.
        await db.insert(schema.presupuestos).values(fila())
        await db.insert(schema.presupuestos).values(fila())

        await expect(
          db.execute(sql.raw(preflightSql)),
        ).rejects.toThrow(/T\.71\.1.*duplicad/)

        const filas = await db.select().from(schema.presupuestos)
          .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))
        expect(filas).toHaveLength(2)
      } finally {
        await limpiar()
        await db.execute(sql`
          ALTER TABLE presupuestos
          ADD CONSTRAINT presupuestos_identidad_uq UNIQUE (serie, numero, revision)
        `)
      }
    })
  })
})
