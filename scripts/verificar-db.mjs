/**
 * Comprueba que el esquema esta aplicado y muestra el recuento por tabla.
 * Uso: node scripts/verificar-db.mjs
 */
import postgres from 'postgres'
import { readFileSync } from 'node:fs'

// Carga .env sin imprimirlo
for (const linea of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 2 })

try {
  const tablas = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `

  console.log(`Tablas en public: ${tablas.length}\n`)

  for (const { table_name } of tablas) {
    const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM ${sql(table_name)}`
    const [{ c }] = await sql`
      SELECT COUNT(*)::int AS c FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table_name}
    `
    console.log(`  ${table_name.padEnd(26)} ${String(c).padStart(3)} col  ${String(n).padStart(8)} filas`)
  }
} finally {
  await sql.end()
}
