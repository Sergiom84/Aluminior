import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'

export * as schema from './schema/index.ts'

/**
 * Crea la conexión a PostgreSQL.
 *
 * `max` bajo por defecto: Supabase en plan pequeño limita conexiones, y el ETL
 * abre su propio pool aparte. Súbelo sólo con datos de carga real.
 */
export function crearDb(urlConexion = process.env.DATABASE_URL) {
  if (!urlConexion) {
    throw new Error(
      'Falta DATABASE_URL. Copia .env.example a .env y rellena la cadena de conexión.',
    )
  }

  const cliente = postgres(urlConexion, {
    max: 10,
    // Supabase exige TLS; en local (localhost) no.
    ssl: urlConexion.includes('localhost') ? false : 'require',
  })

  return drizzle(cliente, { schema })
}

export type Db = ReturnType<typeof crearDb>
