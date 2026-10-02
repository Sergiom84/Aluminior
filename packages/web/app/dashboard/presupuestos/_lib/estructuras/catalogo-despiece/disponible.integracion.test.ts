import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import postgres from 'postgres'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { catalogoDespieceCargado } from './cargado.ts'
import { leerCatalogoLinea } from './leer-catalogo.ts'
import { prepararCortesCatalogo } from '../cortes-catalogo.ts'
import { TABLAS_MOTOR_CATALOGO } from './disponible.ts'

const base = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const nombre = `aluminior_sin_motor_${randomUUID().replaceAll('-', '')}_test`
const admin = postgres(base, { max: 1, onnotice: () => {} })
let db: ReturnType<typeof crearDb>

// Este ensayo elimina tablas: una transacción no evita conflictos de bloqueo
// con las demás suites que leen el catálogo. Usa su propia base desechable.
beforeAll(async () => {
  await admin.unsafe(`CREATE DATABASE ${nombre}`)
  db = crearDb(urlDePruebasValidada(base.replace(/\/[^/]+$/, `/${nombre}`)))
  await db.execute(sql`CREATE SCHEMA auth`)
  await db.execute(sql`CREATE TABLE auth.users (id uuid PRIMARY KEY)`)
  await migrate(db, {
    migrationsFolder: fileURLToPath(new URL('../../../../../../../db/migrations', import.meta.url)),
  })
}, 60000)
const rollback = new Error('rollback del ensayo sin la migración del motor')
afterAll(async () => {
  await db?.$client.end({ timeout: 5 })
  await admin.unsafe(`DROP DATABASE IF EXISTS ${nombre} WITH (FORCE)`)
  await admin.end({ timeout: 5 })
})

// Una base migrada solo hasta 0022_catalogo_diseno, como Supabase antes de la 0023.
describe('motor de catálogo sin su migración', () => {
  it('degrada a la vía anterior sin abortar la transacción', async () => {
    await expect(db.transaction(async tx => {
      for (const tabla of TABLAS_MOTOR_CATALOGO) await tx.execute(sql.raw(`drop table "${tabla}" cascade`))

      expect(await catalogoDespieceCargado(tx)).toBe(false)
      expect(await leerCatalogoLinea(tx, { estructura: 'C2', serie: 'GMC400', vidrio: null, tarifa: 1 })).toBeNull()
      expect(await prepararCortesCatalogo(tx, { codigo: 'C2', serieCodigo: 'GMC400', anchoMm: 1500, altoMm: 1200 }, {}))
        .toBeUndefined()
      // La transacción sigue utilizable: ninguna consulta anterior falló.
      await tx.select().from(schema.estructuras).limit(1)
      throw rollback
    })).rejects.toBe(rollback)
  })

  it('reconoce la base migrada', async () => {
    expect(await catalogoDespieceCargado(db)).toBe(false)
    await expect(db.transaction(async tx => {
      await tx.insert(schema.conjuntoParametrosDespiece).values({ conjuntoCodigo: 'QA-SERIE', herrajes: {}, manoObra: {}, grosorMaximoSimple: '0', grosorMaximoDoble: '0' })
      expect(await catalogoDespieceCargado(tx)).toBe(true)
      throw rollback
    })).rejects.toBe(rollback)
  })
})
