// Aplica las migraciones pendientes del journal contra el Postgres EFIMERO de
// pruebas. El destino lo resuelve `entorno-local.mjs`, cuya guarda solo admite
// localhost:55433 y bases `_test`: este script no puede alcanzar Supabase.
// Para la base compartida, usar `aplicar-remoto.mjs`.
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { crearDb } from '../src/index.ts'
import { dbUrl } from './entorno-local.mjs'

const folder = fileURLToPath(new URL('../migrations', import.meta.url))
for (const name of ['aluminior_test', 'aluminior_javi_test']) {
  const db = crearDb(await dbUrl(name))
  try {
    await migrate(db, { migrationsFolder: folder })
    const rows = await db.$client`select count(*)::int as n from drizzle.__drizzle_migrations`
    console.log(JSON.stringify({ name, ok: true, journal: rows[0].n }))
  } catch (e) {
    console.log(JSON.stringify({ name, ok: false, error: e.message }))
    process.exitCode = 1
  } finally {
    await db.$client.end({ timeout: 5 })
  }
}
