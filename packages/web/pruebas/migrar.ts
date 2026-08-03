/**
 * Migración única antes de toda la batería. `globalSetup` de vitest.
 *
 * Cada suite de integración migraba al arrancar, y vitest ejecuta los ficheros
 * en PARALELO: contra la misma base efímera, dos `CREATE SCHEMA`/`CREATE TABLE`
 * simultáneos no fallan con un «ya existe» limpio, revientan con
 * `duplicate key value violates unique constraint "pg_namespace_nspname_index"`
 * y la suite que pierde la carrera se queda sin esquema. Se vio al añadir el
 * tercer fichero de integración (T.68); con dos era una carrera latente que
 * salía bien por poco.
 *
 * Aquí se aplica una sola vez, antes de que exista el primer worker. Las suites
 * ya sólo leen y escriben.
 */
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { crearDb } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'

export async function setup() {
  // La misma salvaguarda que las suites: sólo Postgres local y base `_test`.
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  await migrate(db, {
    migrationsFolder: fileURLToPath(new URL('../../db/migrations', import.meta.url)),
  })
}
