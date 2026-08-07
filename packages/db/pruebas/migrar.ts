/**
 * Migración única antes de toda la batería. `globalSetup` de vitest.
 *
 * Cada suite de integración migraba al arrancar, y vitest ejecuta los ficheros
 * en PARALELO: contra la misma base efímera, dos migradores compitiendo dan
 * `duplicate key value violates unique constraint "pg_namespace_nspname_index"`
 * (o `pg_type_typname_nsp_index`, según qué DDL se solape) y la suite que
 * pierde la carrera se queda sin esquema (T.71.3). Mismo patrón que
 * `packages/web/pruebas/migrar.ts`: se aplica una sola vez, antes de que
 * exista el primer worker, y las suites ya sólo leen y escriben.
 */
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { crearDb } from '../src/index.ts'
import { urlDePruebasValidada } from '../src/pruebas.ts'

/**
 * Devuelve el `teardown` que CIERRA la conexión de la migración.
 *
 * Sin él, el pool queda abierto y vitest no puede terminar: espera diez
 * segundos y avisa con «close timed out». Este pool es EXCLUSIVO del proceso
 * de `globalSetup`; las suites corren en workers aparte con su propio
 * `crearDb`, así que cerrarlo aquí no toca ninguna conexión que las pruebas
 * estén usando.
 */
export async function setup() {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  await migrate(db, {
    migrationsFolder: fileURLToPath(new URL('../migrations', import.meta.url)),
  })

  return async () => {
    await db.$client.end({ timeout: 5 })
  }
}
