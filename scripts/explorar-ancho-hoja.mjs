/**
 * EXPLORACIÓN (solo lectura): ¿de dónde sale la medida de una ranura de
 * asociado cuando las hojas son desiguales?
 *
 * Fase 2: qué contienen DisIdRefLargo / DisFRefLargo y si el ítem
 * referenciado tiene fórmula propia que dé la medida real de esa hoja.
 *
 * Uso: npx tsx scripts/explorar-ancho-hoja.mjs
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

const estArt = leer('EstructurasArticulos.csv')
const plantilla = estArt.filter((f) => !col(f, 'TipoDoc'))

// --- 1. Contenido de DisFRefLargo / DisFRefAncho: ¿fórmula o id? ---
const muestraFRef = new Map()
for (const f of plantilla) {
  const v = col(f, 'DisFRefLargo')
  if (v && v !== '0') muestraFRef.set(v, (muestraFRef.get(v) ?? 0) + 1)
}
console.log('--- valores de DisFRefLargo más frecuentes ---')
for (const [v, n] of [...muestraFRef].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${String(n).padStart(6)}  ${JSON.stringify(v)}`)
}
const muestraFRefA = new Map()
for (const f of plantilla) {
  const v = col(f, 'DisFRefAncho')
  if (v && v !== '0') muestraFRefA.set(v, (muestraFRefA.get(v) ?? 0) + 1)
}
console.log('--- valores de DisFRefAncho más frecuentes ---')
for (const [v, n] of [...muestraFRefA].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${String(n).padStart(6)}  ${JSON.stringify(v)}`)
}

// --- 2. Ranuras de asociado concretas de los artículos que fallan ---
// Las ranuras de cremona/pletina/tirante salen de ConjuntosAsoc.
const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const FALLAN = new Set(['GM5320', 'GM5335', 'GM5368', 'GM5317', 'GM5321', 'GM5336'])
const compsFallan = new Map() // comp -> artículos
for (const f of conjuntosAsoc) {
  const art = col(f, 'Articulo')
  if (!FALLAN.has(art)) continue
  const comp = col(f, 'ComponenteAsoc')
  if (!compsFallan.has(comp)) compsFallan.set(comp, new Set())
  compsFallan.get(comp).add(art)
}
console.log('\n--- ComponenteAsoc de los artículos que fallan ---')
for (const [comp, arts] of compsFallan) {
  console.log(`  comp=${comp.padEnd(6)} ${[...arts].join(' ')}`)
}

// --- 3. Para esas ranuras: fórmula, hoja anclada y referencias ---
console.log('\n--- filas de plantilla de esas ranuras (muestra) ---')
let vistos = 0
for (const f of plantilla) {
  const comp = col(f, 'DisComponente')
  if (!compsFallan.has(comp)) continue
  if (vistos++ > 24) break
  console.log([
    col(f, 'Estructura').padEnd(12),
    `comp=${comp.padEnd(5)}`,
    `fx=${(col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo') || '·').padEnd(12)}`,
    `idIt=${col(f, 'DisIdIt').padEnd(4)}`,
    `hoja=${col(f, 'DisIdHoja').padEnd(4)}`,
    `refL=${col(f, 'DisIdRefLargo').padEnd(4)}`,
    `fRefL=${(col(f, 'DisFRefLargo') || '·').padEnd(10)}`,
    `refA=${col(f, 'DisIdRefAncho').padEnd(4)}`,
    `fRefA=${col(f, 'DisFRefAncho') || '·'}`,
  ].join(' '))
}

// --- 4. ¿Las ranuras ancladas a hoja tienen un slot hermano con esa DisIdIt? ---
const slotPorEstructuraId = new Map() // estructura|idIt -> fila de hoja
for (const f of plantilla) {
  if (col(f, 'DisComponente') !== '1') continue
  slotPorEstructuraId.set(`${col(f, 'Estructura')}|${col(f, 'DisIdIt')}`, f)
}
let conSlot = 0, sinSlot = 0
for (const f of plantilla) {
  const comp = col(f, 'DisComponente')
  if (!comp || comp === '0' || comp === '1') continue
  const hoja = col(f, 'DisIdHoja')
  if (!hoja || hoja === '0') continue
  if (slotPorEstructuraId.has(`${col(f, 'Estructura')}|${hoja}`)) conSlot++
  else sinSlot++
}
console.log(`\nRanuras ancladas a hoja con slot hermano localizable: ${conSlot}   sin él: ${sinSlot}`)
