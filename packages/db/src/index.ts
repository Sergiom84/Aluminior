import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'

export * as schema from './schema/index.ts'

/**
 * Caché del pool por cadena de conexión.
 *
 * IMPRESCINDIBLE que sea único: en Next.js `crearDb()` se llama en cada
 * petición, y sin caché cada una abriría su propio pool. Supabase en modo
 * sesión corta a los 15 clientes y la aplicación empieza a devolver
 * "max clients reached". Ocurrió en pruebas el 18/07/2026.
 *
 * Se cuelga de globalThis para sobrevivir a la recarga en caliente de Next
 * durante el desarrollo, que reevalúa los módulos y perdería la caché.
 */
const cache = globalThis as unknown as {
  __aluminiorPools?: Map<string, ReturnType<typeof postgres>>
}
cache.__aluminiorPools ??= new Map()

/**
 * Devuelve la conexión a PostgreSQL, reutilizando el pool si ya existe.
 *
 * `max` deliberadamente bajo: el plan pequeño de Supabase limita conexiones y
 * el ETL abre su propio pool aparte. Súbelo sólo con datos de carga real.
 */
export function crearDb(urlConexion = process.env.DATABASE_URL) {
  if (!urlConexion) {
    throw new Error(
      'Falta DATABASE_URL. Copia .env.example a .env y rellena la cadena de conexión.',
    )
  }

  let cliente = cache.__aluminiorPools!.get(urlConexion)
  if (!cliente) {
    cliente = postgres(urlConexion, {
      max: 5,
      idle_timeout: 20,
      // Supabase exige TLS; en local (localhost) no.
      ssl: urlConexion.includes('localhost') ? false : 'require',
    })
    cache.__aluminiorPools!.set(urlConexion, cliente)
  }

  return drizzle(cliente, { schema })
}

export type Db = ReturnType<typeof crearDb>
