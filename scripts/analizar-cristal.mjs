/**
 * ACRISTALAMIENTO, fase de medición.
 *
 * Preguntas, contra los datos:
 *  1. ¿Cómo representa la plantilla el hueco de cristal? (ranuras CRISTAL
 *     GENERICO: fórmulas de largo Y ancho — FormulaAncho aún no migrada)
 *  2. ¿Cómo aparece el vidrio real en los documentos? (líneas hijas familia
 *     050: artículo, largo, ancho, cantidad, precio)
 *  3. ¿Cuadran las fórmulas de la plantilla con las medidas reales del
 *     vidrio? ¿Hay regla de redondeo?
 *
 * Solo lectura. Uso: node scripts/analizar-cristal.mjs
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

const estArt = leer('EstructurasArticulos.csv')
const vLin = leer('VPresupuestosLin.csv')
const articulos = leer('Articulos.csv')
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

// --- 1. Ranuras de cristal en la plantilla de 1+1 y 2P ---
console.log('=== 1. Ranuras de CRISTAL en plantillas (1+1, 1P, 2P) ===')
const CAMPOS = ['Estructura', 'Articulo', 'DisComponente', 'Cantidad', 'FormulaLargo', 'FormulaAncho', 'FormulaLargoCorte', 'FormulaAnchoCorte', 'DisVidrio', 'DisTipoHoja']
console.log(CAMPOS.map((c) => c.slice(0, 12).padEnd(13)).join(''))
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  if (!['1+1', '1P', '2P'].includes(col(f, 'Estructura'))) continue
  const fam = famPorArt.get(col(f, 'Articulo')) ?? ''
  const esCristal = fam === '050' || (descArt.get(col(f, 'Articulo')) ?? '').includes('CRISTAL')
  if (!esCristal) continue
  console.log(CAMPOS.map((c) => col(f, c).slice(0, 12).padEnd(13)).join(''))
}

// --- 2. Vidrios reales en documentos ---
console.log('\n=== 2. Vidrio en líneas reales (hijas familia 050/051) ===')
const padresPorLinea = new Map(vLin.filter((f) => col(f, 'EstructuraSN') === 'True').map((f) => [col(f, 'nLinea'), f]))
let mostrados = 0
const CAMPOS2 = ['nDoc', 'nEstr', 'Articulo', 'Cdad', 'Largo', 'Ancho', 'LargoCorte', 'AnchoCorte', 'Metraje', 'TipoMetraje', 'Precio', 'Subtotal']
console.log('padre(LxA)      ' + CAMPOS2.map((c) => c.slice(0, 9).padEnd(10)).join(''))
for (const f of vLin) {
  const p = padresPorLinea.get(col(f, 'nEstr'))
  if (!p) continue
  const fam = famPorArt.get(col(f, 'Articulo')) ?? ''
  if (fam !== '050' && fam !== '051') continue
  if (mostrados++ >= 20) break
  const dim = `${col(p, 'Largo')}x${col(p, 'Ancho')}`
  console.log(dim.padEnd(16) + CAMPOS2.map((c) => col(f, c).slice(0, 9).padEnd(10)).join(''))
}

// --- 3. ¿Redondeo? distribución de medidas de vidrio módulo 10/50/100 ---
console.log('\n=== 3. Medidas de vidrio: ¿redondeadas? ===')
const mod = { m10: 0, m50: 0, m100: 0, total: 0 }
for (const f of vLin) {
  if (!padresPorLinea.has(col(f, 'nEstr'))) continue
  const fam = famPorArt.get(col(f, 'Articulo')) ?? ''
  if (fam !== '050') continue
  const largo = num(col(f, 'Largo'))
  if (largo <= 0) continue
  mod.total++
  if (largo % 10 === 0) mod.m10++
  if (largo % 50 === 0) mod.m50++
  if (largo % 100 === 0) mod.m100++
}
console.log(`  vidrios con largo>0: ${mod.total}`)
console.log(`  múltiplo de 10: ${mod.m10} (${(100 * mod.m10 / mod.total).toFixed(0)}%)  de 50: ${mod.m50} (${(100 * mod.m50 / mod.total).toFixed(0)}%)  de 100: ${mod.m100} (${(100 * mod.m100 / mod.total).toFixed(0)}%)`)

// --- 4. ¿Cómo se factura? TipoMetraje de los vidrios usados ---
console.log('\n=== 4. Vidrios más usados y su tipo de metraje ===')
const usoVidrio = new Map()
for (const f of vLin) {
  if (!padresPorLinea.has(col(f, 'nEstr'))) continue
  const art = col(f, 'Articulo')
  if ((famPorArt.get(art) ?? '') !== '050') continue
  usoVidrio.set(art, (usoVidrio.get(art) ?? 0) + 1)
}
const tipoMetraje = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'TipoMetraje')]))
const grosor = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'GrosorPesoVid')]))
for (const [a, n] of [...usoVidrio.entries()].sort((x, y) => y[1] - x[1]).slice(0, 12)) {
  console.log(`  ${a.padEnd(10)} x${String(n).padEnd(5)} ${(tipoMetraje.get(a) ?? '?').padEnd(4)} grosor:${(grosor.get(a) ?? '?').padEnd(6)} ${(descArt.get(a) ?? '').slice(0, 45)}`)
}
