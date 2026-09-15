import { readFileSync } from 'node:fs'
import postgres from 'postgres'

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

const sql = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 20 })
try {
  const applied = await sql`
    select id, hash, created_at from drizzle.__drizzle_migrations order by created_at`
  const tables = await sql`
    select table_name from information_schema.tables
    where table_schema='public'
      and table_name in (
        'lineas_cerramiento','lineas_mano_obra','lineas_cerramiento_resultados',
        'lineas_despiece','presupuestos')
    order by 1`
  const cols = await sql`
    select column_name from information_schema.columns
    where table_schema='public' and table_name='lineas_despiece'
      and column_name like 'origen%'
    order by 1`
  const constraints = await sql`
    select conname from pg_constraint
    where conname in (
      'presupuestos_identidad_uq','despiece_origen_uq','mano_obra_linea_concepto_uq')
    order by 1`
  const dup = await sql`
    select count(*)::int as n from (
      select serie, numero, revision from presupuestos
      group by 1,2,3 having count(*) > 1
    ) g`
  const nPres = await sql`select count(*)::int as n from presupuestos`
  const nLin = await sql`select count(*)::int as n from lineas`
  console.log(JSON.stringify({
    projectHint: u.hostname.includes('cwtyrpqwdbfylqdlydez') || u.username.startsWith('postgres.cwtyrpqwdbfylqdlydez'),
    port: u.port,
    migrationCount: applied.length,
    hashes: applied.map((r) => ({
      id: r.id,
      hash12: String(r.hash).slice(0, 12),
    })),
    tables: tables.map((t) => t.table_name),
    despieceOrigenCols: cols.map((c) => c.column_name),
    constraints: constraints.map((c) => c.conname),
    duplicadosIdentidad: dup[0].n,
    presupuestos: nPres[0].n,
    lineas: nLin[0].n,
  }, null, 2))
} finally {
  await sql.end({ timeout: 2 })
}
