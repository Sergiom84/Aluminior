import postgres from 'postgres'
import { databases, dbUrl } from './entorno-local.mjs'

for (const name of databases) {
  const sql = postgres(await dbUrl(name), { max: 1, connect_timeout: 10 })
  try {
    const mig = await sql`select hash from drizzle.__drizzle_migrations order by created_at`
    const tables = await sql`
      select table_name from information_schema.tables
      where table_schema='public'
        and table_name in ('lineas_mano_obra','lineas_cerramiento_resultados','lineas_cerramiento')
      order by 1`
    const cons = await sql`
      select conname from pg_constraint
      where conname in ('presupuestos_identidad_uq','despiece_origen_uq')
      order by 1`
    console.log(JSON.stringify({
      name,
      n: mig.length,
      hash12: mig.map((r) => String(r.hash).slice(0, 12)),
      tables: tables.map((t) => t.table_name),
      cons: cons.map((c) => c.conname),
    }))
  } catch (e) {
    console.log(JSON.stringify({ name, error: e.message }))
  } finally {
    await sql.end({ timeout: 1 })
  }
}
