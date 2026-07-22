/**
 * T.56 (prueba, SOLO LECTURA): revaloriza UN presupuesto apuntándolo a una tarifa NUEVA,
 * para ver el efecto del swap SIN escribir en producción.
 *
 * Usa la identidad validada en T.55: ImporteTotal = PVP(articulo,acabado,tarifa) × Metraje.
 * Precio nuevo = fichero de tarifa (ejemplo 2026) donde exista el artículo; si no está en el
 * fichero, se mantiene el PVP histórico (tarifa 1). Compara total histórico vs revalorizado
 * y desglosa qué líneas cambian. NO toca la base de datos (lee CSV del oráculo + el fichero).
 *
 * Uso: npx tsx scripts/probar-revalorar-tarifa.mjs [nDoc] [ficheroTarifa.csv]
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const O = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(O, n)), { columns: true, bom: true, skip_empty_lines: true, relax_quotes: true })
const c = (f, n) => (f[n] ?? '').trim()
const num = (f, n) => Number(c(f, n).replace(',', '.')) || 0

const DOC = process.argv[2] || '764'
const FICH = process.argv[3] || 'packages/etl/ejemplos/tarifa-ejemplo-2026.csv'

// tarifa nueva (fichero): (articulo|acabado) -> precio
const nuevo = new Map()
for (const r of parse(readFileSync(new URL('../' + FICH, import.meta.url)), { columns: true, bom: true, skip_empty_lines: true, trim: true, relax_quotes: true })) {
  const art = (r.articulo ?? '').trim(); let aca = (r.acabado ?? '').trim(); if (aca === '' || aca === '*') aca = 'UNI'
  const p = Number((r.precio ?? '').replace(',', '.'))
  if (art && Number.isFinite(p) && p > 0 && p < 100000) nuevo.set(`${art}|${aca}`, p)
}

// PVP histórico tarifa 1: (articulo|acabado) -> precio (fallback)
const pvpT = leer('ArticulosPVP.csv')
const hist = new Map(), histArt = new Map()
for (const r of pvpT) {
  if (c(r, 'Tarifa') !== '1') continue
  const a = c(r, 'Articulo'), ac = c(r, 'Acabado'), v = num(r, 'PVP')
  hist.set(`${a}|${ac}`, v); if (!histArt.has(a)) histArt.set(a, new Map()); histArt.get(a).set(ac, v)
}
const pvpHist = (a, ac) => hist.has(`${a}|${ac}`) ? hist.get(`${a}|${ac}`) : hist.has(`${a}|UNI`) ? hist.get(`${a}|UNI`) : (histArt.get(a)?.size === 1 ? [...histArt.get(a).values()][0] : null)
// precio bajo tarifa nueva: fichero -> (para acabado exacto o UNI) -> si no, histórico
const precioNuevo = (a, ac) => nuevo.get(`${a}|${ac}`) ?? nuevo.get(`${a}|UNI`) ?? pvpHist(a, ac)

const vLin = leer('VPresupuestosLin.csv').filter((f) => c(f, 'nDoc') === DOC)
const esEstr = (f) => c(f, 'EstructuraSN') === 'True'
const esHija = (f) => !esEstr(f) && c(f, 'nEstr') && c(f, 'nEstr') !== '0'

console.log(`\n═══ REVALORACIÓN presupuesto ${DOC} con tarifa NUEVA (${FICH}) — SOLO LECTURA ═══`)
console.log(`artículos con precio nuevo en el fichero: ${nuevo.size}`)

let histTot = 0, nvoTot = 0, lineasCambian = 0, revaloradas = 0, sinPrecio = 0
const cambios = []
for (const f of vLin) {
  if (!esHija(f)) continue // las hijas son el desglose que fija el precio de la ventana
  const imp = num(f, 'ImporteTotal'); if (imp === 0) continue
  const a = c(f, 'Articulo'), ac = c(f, 'Acabado'), met = num(f, 'Metraje')
  const pN = precioNuevo(a, ac)
  if (pN === null) { sinPrecio++; continue }
  const impN = pN * met
  histTot += imp; nvoTot += impN
  if (nuevo.has(`${a}|${ac}`) || nuevo.has(`${a}|UNI`)) revaloradas++
  if (Math.abs(impN - imp) > 0.01) { lineasCambian++; if (cambios.length < 8) cambios.push({ a, ac, met, imp, impN }) }
}
console.log(`\nlíneas de despiece valoradas: ${vLin.filter(esHija).filter((f) => num(f, 'ImporteTotal') !== 0).length}`)
console.log(`  revaloradas con precio del fichero: ${revaloradas}   sin precio (ni fichero ni histórico): ${sinPrecio}`)
console.log(`  líneas cuyo importe cambia:         ${lineasCambian}`)
console.log(`\nTOTAL despiece histórico (tarifa 1):  ${histTot.toFixed(2)} €`)
console.log(`TOTAL despiece revalorizado (nueva):  ${nvoTot.toFixed(2)} €`)
const delta = nvoTot - histTot
console.log(`DELTA:                                ${delta >= 0 ? '+' : ''}${delta.toFixed(2)} € (${(100 * delta / histTot).toFixed(2)}%)`)
console.log(`\nejemplos de línea revalorizada (art | acabado | metraje | histórico → nuevo):`)
for (const x of cambios) console.log(`   ${x.a.padEnd(10)} ${x.ac.padEnd(4)} m=${x.met}  ${x.imp.toFixed(2)} → ${x.impN.toFixed(2)}`)
console.log(`\n(NOTA: solo ${nuevo.size} artículos en el fichero de ejemplo; con la tarifa 2026 completa se revalorizaría todo. No se ha escrito nada en la BD.)`)
