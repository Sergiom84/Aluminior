// Aplica las migraciones pendientes del journal de Drizzle contra la base
// remota de Supabase. Solo avanza: el migrador aplica las entradas cuyo `when`
// es posterior al `created_at` de la ultima migracion registrada en destino.
//
// Guarda de destino deliberada: aborta si DATABASE_URL no apunta a Supabase, o
// si apunta a localhost. Nunca ejecutar contra el Postgres efimero de pruebas.
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

for (const linea of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

const url = process.env.DATABASE_URL
if (!url) throw new Error('Falta DATABASE_URL')
const u = new URL(url)
if (!/supabase/.test(u.hostname) || /localhost|127\.0\.0\.1/.test(u.hostname)) {
  throw new Error('Destino rechazado')
}

const folder = fileURLToPath(new URL('../migrations', import.meta.url))
const cliente = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 20 })
try {
  const antes = await cliente`select count(*)::int as n from drizzle.__drizzle_migrations`
  await migrate(drizzle(cliente), { migrationsFolder: folder })
  const despues = await cliente`
    select id, hash, created_at from drizzle.__drizzle_migrations order by created_at`
  console.log(JSON.stringify({
    ok: true,
    antes: antes[0].n,
    despues: despues.length,
    aplicadas: despues.slice(antes[0].n).map((r) => ({
      id: r.id,
      hash12: String(r.hash).slice(0, 12),
    })),
  }, null, 2))
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: e.message }, null, 2))
  process.exitCode = 1
} finally {
  await cliente.end({ timeout: 5 })
}
