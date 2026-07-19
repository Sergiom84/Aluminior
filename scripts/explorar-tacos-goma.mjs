/**
 * EXPLORACIÓN (solo lectura), frentes 2 y 3 de S.8:
 *   - tacos de pilastra GM4870 / GM5102 / GM4726
 *   - goma de acristalamiento GM4090
 *
 * Antes de codificar nada: cómo están declarados en ConjuntosAsoc y a qué
 * se pueden anclar. "Medir el ancla antes de codificar."
 *
 * Uso: npx tsx scripts/explorar-tacos-goma.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})
const col = (f, n) => (f[n] ?? '').trim()

const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const DIANA = new Set(['GM4870', 'GM5102', 'GM4726', 'GM4090'])

console.log('--- filas de ConjuntosAsoc de los artículos diana ---')
const porArt = new Map()
for (const f of conjuntosAsoc) {
  const art = col(f, 'Articulo')
  if (!DIANA.has(art)) continue
  if (!porArt.has(art)) porArt.set(art, [])
  porArt.get(art).push(f)
}
for (const [art, filas] of porArt) {
  console.log(`\n${art}  (${filas.length} filas)`)
  const resumen = new Map()
  for (const f of filas) {
    const k = [
      `comp=${col(f, 'ComponenteAsoc')}`,
      `cdad=${col(f, 'Cantidad')}`,
      `asocA=${col(f, 'AsociadoA') || '·'}`,
      `umin=${col(f, 'UnidadesMin')}`,
      `rango=${col(f, 'MedidaMin')}-${col(f, 'MedidaMax')}`,
    ].join(' ')
    resumen.set(k, (resumen.get(k) ?? 0) + 1)
  }
  for (const [k, n] of [...resumen].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`   ${String(n).padStart(4)}×  ${k}`)
  }
}

// ¿Qué categorías de texto ('AsociadoA') existen y cuáles menciona una pilastra?
console.log('\n--- categorías AsociadoA que contienen PILASTRA / TRAVESAÑO ---')
const cats = new Map()
for (const f of conjuntosAsoc) {
  const a = col(f, 'AsociadoA')
  if (!a) continue
  cats.set(a, (cats.get(a) ?? 0) + 1)
}
for (const [a, n] of [...cats].sort((x, y) => y[1] - x[1])) {
  if (/PILASTRA|TRAVES/i.test(a)) console.log(`  ${String(n).padStart(5)}  ${a}`)
}
console.log('\n--- todas las categorías AsociadoA (para elegir ancla) ---')
for (const [a, n] of [...cats].sort((x, y) => y[1] - x[1])) {
  console.log(`  ${String(n).padStart(5)}  ${a}`)
}
