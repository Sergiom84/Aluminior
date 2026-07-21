/**
 * ¿El nº de MODULOS de MO DESGLOSADO POR CONCEPTO es lineal sobre la topologia por
 * (serie, concepto)?  Modelo lineal-entero a*marco+b*hoja+c*hueco+d*trav (+e*vidrio),
 * aprendido en TRAIN, evaluado en TEST held-out (split por linea). Reutiliza la
 * maquinaria de scripts/medir-configseriesasoc.mjs. SOLO LECTURA.
 * Oraculo directo VConceptosMO.Cantidad = minutos; n modulos = Cantidad/TiempoFabr.
 * Uso: npx tsx scripts/medir-mo-concepto-lineal.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), { columns: true, bom: true, skip_empty_lines: true, relax_quotes: true })
const col = (f, n) => (f[n] ?? '').trim()
const num = (f, n) => Number(col(f, n).replace(',', '.')) || 0

const moConceptos = leer('MOConceptos.csv')
const conceptosMO = leer('VConceptosMO.csv')
const estDis = leer('EstructurasDiseño.csv')
const vDatosLinEstr = leer('VDatosLinEstr.csv')
const seriePorLinea = new Map()
for (const r of vDatosLinEstr) seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))

const tiempoFabr = new Map(), descC = new Map(), compC = new Map()
for (const f of moConceptos) { const c = col(f, 'Codigo'); const t = num(f, 'TiempoFabr'); if (t > 0) tiempoFabr.set(c, t); descC.set(c, col(f, 'Descripcion')); compC.set(c, col(f, 'ComponenteAsoc')) }

// topologia de la instancia
const nodosPorLinea = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!nodosPorLinea.has(k)) nodosPorLinea.set(k, [])
  nodosPorLinea.get(k).push(col(f, 'Tipo'))
}
function topo(k) {
  const n = nodosPorLinea.get(k); if (!n) return null
  const cnt = (t) => n.filter((x) => x === t).length
  return { marco: cnt('1'), hueco: cnt('2'), hoja: cnt('3'), trav: cnt('6'), vidrio: cnt('5') + cnt('7') }
}

// oraculo por (linea, concepto): modulos = Cantidad/TiempoFabr (entero)
const filas = []
let sinTiempo = 0, noEntero = 0, sinTopo = 0
for (const f of conceptosMO) {
  const min = num(f, 'Cantidad'); if (min <= 0) continue
  const cc = col(f, 'Concepto'); const tf = tiempoFabr.get(cc)
  if (!tf) { sinTiempo++; continue }
  const mod = min / tf
  if (Math.abs(mod - Math.round(mod)) > 0.01) { noEntero++; continue }
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLin')}`
  const t = topo(k); if (!t) { sinTopo++; continue }
  filas.push({ k, serie: seriePorLinea.get(k) ?? '', concepto: cc, modulos: Math.round(mod), t })
}
console.log(`Apariciones (linea,concepto) con modulos>0 y topologia: ${filas.length}`)
console.log(`  descartadas: sin TiempoFabr=${sinTiempo}, minutos no multiplo=${noEntero}, sin topologia=${sinTopo}`)

// CONTRASTE 1: lectura simple, modulos de un concepto = n apariciones de UN elemento
const CANDS = {
  marco: (t) => t.marco, hoja: (t) => t.hoja, hueco: (t) => t.hueco, trav: (t) => t.trav, vidrio: (t) => t.vidrio,
  'marco+hoja': (t) => t.marco + t.hoja, 'hoja+trav': (t) => t.hoja + t.trav, 'hueco+hoja': (t) => t.hueco + t.hoja,
}
console.log(`\n==== CONTRASTE 1: mejor candidato topologico SIMPLE por concepto (todas las filas) ====`)
const porConc = new Map()
for (const f of filas) { if (!porConc.has(f.concepto)) porConc.set(f.concepto, []); porConc.get(f.concepto).push(f) }
for (const [c, rs] of [...porConc].sort((a, b) => b[1].length - a[1].length)) {
  let best = '', bh = -1
  for (const [n, fn] of Object.entries(CANDS)) { let h = 0; for (const f of rs) if (Math.abs(fn(f.t) - f.modulos) < 0.01) h++; if (h > bh) { bh = h; best = n } }
  console.log(`  ${c} (n=${String(rs.length).padStart(4)}) tf=${tiempoFabr.get(c)} comp='${compC.get(c)}'  mejor='${best}' ${bh}/${rs.length} (${(100*bh/rs.length).toFixed(0)}%)  ${descC.get(c)}`)
}

// MODELO LINEAL-ENTERO POR (serie,concepto)
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
const esTest = new Map()
for (const f of filas) if (!esTest.has(f.k)) esTest.set(f.k, hash(f.k + 'mo') % 2 === 0)
const train = filas.filter((f) => !esTest.get(f.k)), test = filas.filter((f) => esTest.get(f.k))
const GRID = [0, 1, 2, 3, 4, 6, 8]
const SMALL = [0, 1, 2, 4]
const modelo = new Map()
const trainPorSC = new Map()
for (const f of train) { const k = `${f.serie}|${f.concepto}`; if (!trainPorSC.has(k)) trainPorSC.set(k, []); trainPorSC.get(k).push(f) }
const MIN_TRAIN = 3
for (const [k, rs] of trainPorSC) {
  if (rs.length < MIN_TRAIN) continue
  let best = null, bestOk = -1
  for (const a of GRID) for (const b of GRID) for (const c of SMALL) for (const d of SMALL) for (const e of SMALL) {
    let ok = 0
    for (const f of rs) if (Math.abs(a*f.t.marco + b*f.t.hoja + c*f.t.hueco + d*f.t.trav + e*f.t.vidrio - f.modulos) < 0.01) ok++
    if (ok > bestOk) { bestOk = ok; best = { a, b, c, d, e } }
  }
  if (bestOk / rs.length >= 0.9) modelo.set(k, { ...best, ntrain: rs.length, fitTrain: bestOk / rs.length })
}
const linPred = (f) => { const m = modelo.get(`${f.serie}|${f.concepto}`); return m ? m.a*f.t.marco + m.b*f.t.hoja + m.c*f.t.hueco + m.d*f.t.trav + m.e*f.t.vidrio : null }
function evalLin(conj, nombre) {
  let ok = 0, con = 0
  for (const f of conj) { const p = linPred(f); if (p === null) continue; con++; if (Math.abs(p - f.modulos) < 0.01) ok++ }
  console.log(`  ${nombre}: ${ok}/${con} (${con ? (100*ok/con).toFixed(1) : 0}%)  [sin modelo (serie,concepto): ${conj.length - con}]`)
}
console.log(`\n=== MODELO LINEAL-ENTERO POR (serie,concepto): a*marco+b*hoja+c*hueco+d*trav+e*vidrio ===`)
console.log(`  (serie,concepto) con modelo (fit>=90% en train, n_train>=${MIN_TRAIN}): ${modelo.size}`)
evalLin(train, 'TRAIN (in-sample)')
evalLin(test, 'TEST  (held-out) *')

// generalizacion a topologias NUEVAS
const sigTrain = new Set(train.map((f) => `${f.serie}|${f.concepto}|${f.t.marco},${f.t.hoja},${f.t.hueco},${f.t.trav},${f.t.vidrio}`))
let novOk = 0, novN = 0
for (const f of test) {
  const key = `${f.serie}|${f.concepto}|${f.t.marco},${f.t.hoja},${f.t.hueco},${f.t.trav},${f.t.vidrio}`
  if (sigTrain.has(key)) continue
  const p = linPred(f); if (p === null) continue
  novN++; if (Math.abs(p - f.modulos) < 0.01) novOk++
}
console.log(`  * GENERALIZA (test, topologias NUEVAS no vistas en train): ${novOk}/${novN} (${novN ? (100*novOk/novN).toFixed(1) : 0}%)`)

// desglose por modelo
console.log(`\n  Modelos aprendidos (formula | n_train fit | TEST held-out | topos-nuevas):`)
const testPorSC = new Map()
for (const f of test) { const k = `${f.serie}|${f.concepto}`; if (!testPorSC.has(k)) testPorSC.set(k, []); testPorSC.get(k).push(f) }
const rows = []
for (const [k, m] of modelo) {
  const [serie, cc] = k.split('|')
  const ts = testPorSC.get(k) ?? []
  let to = 0; for (const f of ts) if (Math.abs(linPred(f) - f.modulos) < 0.01) to++
  let no = 0, nn = 0
  for (const f of ts) { const key = `${k}|${f.t.marco},${f.t.hoja},${f.t.hueco},${f.t.trav},${f.t.vidrio}`; if (sigTrain.has(key)) continue; nn++; if (Math.abs(linPred(f)-f.modulos)<0.01) no++ }
  const terms = [[m.a,'marco'],[m.b,'hoja'],[m.c,'hueco'],[m.d,'trav'],[m.e,'vidrio']].filter(([v])=>v).map(([v,n])=>`${v}*${n}`).join(' + ') || '0'
  rows.push({ k, serie, cc, m, terms, ntrain: m.ntrain, fit: m.fitTrain, test: ts.length, to, nn, no })
}
rows.sort((a,b)=>b.ntrain-a.ntrain)
for (const r of rows) {
  console.log(`   ${r.serie.padEnd(12)} ${r.cc} ${descC.get(r.cc).slice(0,22).padEnd(22)} = ${r.terms.padEnd(24)} | ntr=${String(r.ntrain).padStart(3)} fit=${(100*r.fit).toFixed(0)}% | TEST ${r.to}/${r.test} | nuevas ${r.no}/${r.nn}`)
}

// RECONSTRUCCION de la MO de fabricacion por LINEA
console.log(`\n=== RECONSTRUCCION MO fabricacion por LINEA (EUR = modulos*TiempoFabr*0,5), solo TEST ===`)
const realPorLinea = new Map(), predPorLinea = new Map(), cubierto = new Map()
const lineasTest = new Set(test.map(f=>f.k))
for (const f of test) {
  const tf = tiempoFabr.get(f.concepto)
  realPorLinea.set(f.k, (realPorLinea.get(f.k)??0) + f.modulos*tf*0.5)
  const p = linPred(f)
  if (p === null) { cubierto.set(f.k, false); continue }
  if (!cubierto.has(f.k)) cubierto.set(f.k, true)
  predPorLinea.set(f.k, (predPorLinea.get(f.k)??0) + p*tf*0.5)
}
let lineFull=0, nFull=0
for (const k of lineasTest) {
  if (!cubierto.get(k)) continue
  nFull++
  const r = realPorLinea.get(k)??0, p = predPorLinea.get(k)??0
  if (Math.abs(r-p) < 0.01) lineFull++
}
console.log(`  lineas TEST con TODOS sus conceptos modelados: ${nFull}/${lineasTest.size}`)
console.log(`  de esas, EUR de MO_fab reconstruido EXACTO: ${lineFull}/${nFull} (${nFull?(100*lineFull/nFull).toFixed(1):0}%)`)

const porSerieN = new Map()
for (const f of filas){ porSerieN.set(f.serie,(porSerieN.get(f.serie)??0)+1) }
console.log(`\n  Peso por serie (apariciones): ${[...porSerieN].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([s,n])=>`${s}:${n}`).join('  ')}`)
