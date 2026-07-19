/**
 * EXPLORACIÓN (solo lectura): ¿el aplanado FormulaLargo pierde información
 * frente a la cadena DisFRefLargo/DisIdRefLargo?
 *
 * DisFRefLargo usa `REF` = medida del ítem DisIdRefLargo. FormulaLargo
 * parece ser esa misma fórmula con REF ya sustituido. Si el aplanado fuese
 * completo y correcto, evaluar FormulaLargo (lo que hace v5) bastaría y el
 * frente 1 tendría otra causa. Esto lo decide con datos.
 *
 * Uso: npx tsx scripts/explorar-ref-largo.mjs
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

// Qué fila DEFINE la medida de un ítem del diseño. Candidato: la fila cuyo
// DisIdIt es ese ítem. Si hay varias, ¿coinciden en su fórmula de largo?
const filasPorItem = new Map() // estructura|idIt -> filas
for (const f of plantilla) {
  const id = col(f, 'DisIdIt')
  if (!id || id === '0') continue
  const k = `${col(f, 'Estructura')}|${id}`
  if (!filasPorItem.has(k)) filasPorItem.set(k, [])
  filasPorItem.get(k).push(f)
}
let itemsCoherentes = 0, itemsAmbiguos = 0
for (const [, filas] of filasPorItem) {
  const fx = new Set(filas.map((f) => col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo')))
  if (fx.size === 1) itemsCoherentes++; else itemsAmbiguos++
}
console.log(`Ítems con una sola fórmula de largo: ${itemsCoherentes}`)
console.log(`Ítems con fórmulas de largo distintas entre sus filas: ${itemsAmbiguos}`)

// ¿El aplanado coincide con sustituir REF por la fórmula del ítem referenciado?
const norm = (s) => s.replace(/\s+/g, '')
let comprobables = 0, coinciden = 0
const discrepancias = []
for (const f of plantilla) {
  const fRef = col(f, 'DisFRefLargo')
  const idRef = col(f, 'DisIdRefLargo')
  const plano = col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo')
  if (!fRef || !plano || !idRef || idRef === '0') continue
  if (!fRef.includes('REF')) continue
  const e = col(f, 'Estructura')
  // medida del ítem referenciado, según SUS propias filas
  const filasRef = filasPorItem.get(`${e}|${idRef}`) ?? []
  const fxRef = new Set(filasRef.map((r) => col(r, 'FormulaLargoCorte') || col(r, 'FormulaLargo')).filter(Boolean))
  // el ítem 1 es la estructura entera: su largo es L
  const medidaRef = idRef === '1' ? 'L' : (fxRef.size === 1 ? [...fxRef][0] : null)
  if (!medidaRef) continue
  comprobables++
  const esperado = norm(fRef.replaceAll('REF', `(${medidaRef})`))
  const obtenido = norm(plano)
  if (esperado === obtenido || norm(fRef.replaceAll('REF', medidaRef)) === obtenido) coinciden++
  else if (discrepancias.length < 15) {
    discrepancias.push(`${e.padEnd(12)} idIt=${col(f, 'DisIdIt').padEnd(4)} refL=${idRef.padEnd(4)} fRef=${fRef.padEnd(14)} medidaRef=${medidaRef.padEnd(12)} plano=${plano}`)
  }
}
console.log(`\nFilas comprobables: ${comprobables}   aplanado coincide: ${coinciden}`)
console.log('--- discrepancias (muestra) ---')
for (const d of discrepancias) console.log(`  ${d}`)
