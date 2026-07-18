/**
 * Valida la regla de facturación del vidrio contra el oráculo:
 *
 *   por dimensión: redondear HACIA ARRIBA al múltiplo del artículo (en cm)
 *   metraje = max(MetrajeMinimo, largo_redondeado × ancho_redondeado)  [m²]
 *
 * comparando con la columna Metraje de las líneas reales de vidrio.
 *
 * Solo lectura. Uso: node scripts/validar-metraje-vidrio.mjs
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
const num = (v) => Number(String(v).replace(',', '.')) || 0

const vLin = leer('VPresupuestosLin.csv')
const articulos = leer('Articulos.csv')
const porArt = new Map(articulos.map((a) => [col(a, 'Codigo'), a]))

const padres = new Set(vLin.filter((f) => col(f, 'EstructuraSN') === 'True').map((f) => col(f, 'nLinea')))

function metrajePredicho(art, largoMm, anchoMm) {
  const multL = num(col(art, 'MetrajeMultiploLargo'))   // en cm
  const multA = num(col(art, 'MetrajeMultiploAncho'))
  const min = num(col(art, 'MetrajeMinimo'))
  let lCm = largoMm / 10, aCm = anchoMm / 10
  if (multL > 0) lCm = Math.ceil(lCm / multL - 1e-9) * multL
  if (multA > 0) aCm = Math.ceil(aCm / multA - 1e-9) * multA
  let m2 = (lCm / 100) * (aCm / 100)
  m2 = Math.round(m2 * 100) / 100
  if (min > 0 && m2 < min) m2 = min
  return m2
}

let total = 0, exactos = 0, cerca = 0
const fallos = new Map()
for (const f of vLin) {
  if (!padres.has(col(f, 'nEstr'))) continue
  const art = porArt.get(col(f, 'Articulo'))
  if (!art || col(art, 'TipoMetraje') !== 'M2' || col(art, 'Familia') !== '050') continue
  const largo = num(col(f, 'Largo')), ancho = num(col(f, 'Ancho'))
  const real = num(col(f, 'Metraje'))
  if (largo <= 0 || ancho <= 0 || real <= 0) continue
  total++
  const pred = metrajePredicho(art, largo, ancho)
  if (Math.abs(pred - real) < 0.005) exactos++
  else if (Math.abs(pred - real) <= 0.05) cerca++
  else {
    const k = `${col(f, 'Articulo')} ${largo}x${ancho} real:${real} pred:${pred}`
    fallos.set(k, (fallos.get(k) ?? 0) + 1)
  }
}
console.log(`Vidrios evaluados: ${total}`)
console.log(`Metraje exacto   : ${exactos} (${(100 * exactos / total).toFixed(1)}%)`)
console.log(`±0,05 m²         : ${cerca} (${(100 * cerca / total).toFixed(1)}%)`)
console.log(`Fallo            : ${total - exactos - cerca}`)
console.log('\n--- Fallos (top 12) ---')
for (const [k, n] of [...fallos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
  console.log(`  ${String(n).padStart(4)}  ${k}`)
}
