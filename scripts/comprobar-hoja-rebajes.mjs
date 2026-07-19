/**
 * Comprueba en la BASE lo que el ETL acaba de cargar en `hoja_rebajes`.
 *
 * No basta con que el ETL diga "53/53": hay que mirar la tabla. Solo lectura.
 *
 * Uso: npx tsx scripts/comprobar-hoja-rebajes.mjs
 */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 2 })

const [{ total }] = await sql`SELECT count(*)::int AS total FROM hoja_rebajes`
const [{ exactas }] = await sql`
  SELECT count(*)::int AS exactas FROM hoja_rebajes WHERE muestras = total_muestras`
const [{ piezas }] = await sql`SELECT sum(total_muestras)::int AS piezas FROM hoja_rebajes`
console.log(`Reglas en hoja_rebajes: ${total}`)
console.log(`  exactas (sin aviso):  ${exactas}`)
console.log(`  con aviso:            ${total - exactas}`)
console.log(`  piezas respaldadas:   ${piezas}`)

// Ninguna regla puede violar sus propias invariantes.
const [{ malas }] = await sql`
  SELECT count(*)::int AS malas FROM hoja_rebajes
  WHERE muestras > total_muestras OR muestras < 3
     OR muestras::numeric / total_muestras < 0.99`
console.log(`\nReglas que violan el umbral o las invariantes (deben ser 0): ${malas}`)

console.log('\n--- las que llevarán aviso al valorar ---')
const conAviso = await sql`
  SELECT perfil_codigo, eje, serie_codigo, rebaje_mm, muestras, total_muestras, formula
  FROM hoja_rebajes WHERE muestras < total_muestras ORDER BY total_muestras DESC`
for (const g of conAviso) {
  const pct = (100 * g.muestras / g.total_muestras).toFixed(1)
  console.log(`  ${g.perfil_codigo.padEnd(10)} ${g.eje}  ${String(g.rebaje_mm).padStart(7)} mm  ${g.muestras}/${g.total_muestras} (${pct}%)  serie=${g.serie_codigo} fx=${g.formula}`)
}
await sql.end()
