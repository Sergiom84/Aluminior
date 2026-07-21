/**
 * T.43/T.44 (draft): aplicar el MODELO LINEAL-ENTERO POR SERIE de T.41 (la RE del
 * configurador para escuadras de alineamiento) al RESIDUO de JUNTAS —los artículos-junta
 * que 4×conteo topológico NO cierra (felpudos, juntas centrales de corredera, y las juntas
 * de acristalamiento GM4057/GM4091/GM4089)—.
 * SOLO LECTURA. NO commitear.
 *
 * Máquina: oráculo de juntas de scripts/medir-juntas-topologia.mjs (enlace exacto por hijas
 * de VPresupuestosLin, regla 8) + modelo lineal-entero por (serie,art) con split por línea
 * de scripts/medir-configseriesasoc.mjs. Base topológica AMPLIADA con vidrio (acristalamiento):
 *   cantidad = a·marco + b·hoja + c·hueco + d·trav + e·vidrio  (coef enteros por serie,art).
 * Aprende coef en TRAIN (grid), evalúa en TEST held-out, y mide GENERALIZACIÓN sobre
 * topologías NUEVAS (no vistas en train). Imprime nulos/ceros (regla 7).
 *
 * Uso: npx tsx scripts/medir-juntas-lineal-serie.mjs
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

const articulos = leer('Articulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const vDatosLinEstr = leer('VDatosLinEstr.csv')
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const seriePorLinea = new Map()
for (const r of vDatosLinEstr) seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))

// junta = fam 002 con desc JUNTA/GOMA/FELPUDO/CEPILLO/BURLETE, sin escuadras/herramientas/tapajuntas
const esJunta = (art) => {
  if (famPorArt.get(art) !== '002') return false
  const d = (descArt.get(art) ?? '').toUpperCase()
  if (!/JUNTA|GOMA|BURLETE|FELPUD|CEPILLO|JUNQUILL/.test(d)) return false
  if (/ESCUADR|TIJERA|RULETA|TAPAJUNT|JUEGO|SIN CONFIGURAR/.test(d)) return false
  return true
}

// topología (incluye vidrio: tipo 5 + 7)
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
const sig = (t) => `${t.marco},${t.hueco},${t.hoja},${t.trav},${t.vidrio}`

// oráculo (enlace exacto por hijas de VPresupuestosLin, regla 8)
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const DOCS = [{ tipo: 'VPRES', lin: 'VPresupuestosLin.csv' }, { tipo: 'VALB', lin: 'VAlbaranesLin.csv' }, { tipo: 'VFAC', lin: 'VFacturasLin.csv' }]
const filas = []
for (const doc of DOCS) {
  const vLin = leer(doc.lin)
  const hijasPorPadre = new Map()
  for (const f of vLin) { const p = col(f, 'nEstr'); if (!p || p === '0') continue; if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, []); hijasPorPadre.get(p).push(f) }
  for (const p of vLin) {
    if (col(p, 'EstructuraSN') !== 'True') continue
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    const t = topo(k); if (!t) continue
    const reales = new Map()
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
      if (!esJunta(art)) continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    for (const [art, real] of reales) filas.push({ k, serie: seriePorLinea.get(k) ?? '', art, real, t, sig: sig(t) })
  }
}
console.log(`Apariciones reales de artículo-junta con topología: ${filas.length}`)

// ── clasificar artículos: DOMINANTE (4×base limpia ≥90%, n≥20) vs RESIDUO ────────────
const BASES = { marco: (t) => t.marco, hoja: (t) => t.hoja, hueco: (t) => t.hueco, trav: (t) => t.trav, vidrio: (t) => t.vidrio }
const FACT = [1, 2, 3, 4, 6, 8]
const porArt = new Map()
for (const f of filas) { if (!porArt.has(f.art)) porArt.set(f.art, []); porArt.get(f.art).push(f) }
const dominantes = new Set(), residuo = new Set()
console.log(`\n════ clasificación por artículo (mejor base×factor topológico simple) ════`)
for (const [art, rs] of [...porArt].sort((a, b) => b[1].length - a[1].length)) {
  let bestN = 0, bestB = '-', bestF = 0
  for (const [bn, bf] of Object.entries(BASES)) for (const factor of FACT) {
    const ok = rs.filter((f) => Math.abs(factor * bf(f.t) - f.real) < 0.01).length
    if (ok > bestN) { bestN = ok; bestB = bn; bestF = factor }
  }
  const pct = bestN / rs.length
  const esDom = rs.length >= 20 && pct >= 0.9
  if (esDom) dominantes.add(art); else residuo.add(art)
  if (rs.length >= 5)
    console.log(`  ${art.padEnd(8)} n=${String(rs.length).padStart(4)} best=${bestF}×${bestB.padEnd(7)} ${bestN}/${rs.length} (${(100 * pct).toFixed(0)}%) ${esDom ? 'DOMINANTE' : 'RESIDUO  '} ${(descArt.get(art) ?? '').slice(0, 26)}`)
}
console.log(`\nDOMINANTES (4×base limpia): ${[...dominantes].join(', ')}`)
console.log(`RESIDUO (artículos que 4×conteo NO cierra, n≥5 mostrados arriba): ${residuo.size} artículos`)

// ── RESIDUO: modelo lineal-entero por (serie,art), split por línea ───────────────────
const filasR = filas.filter((f) => residuo.has(f.art))
console.log(`\nApariciones del RESIDUO: ${filasR.length}`)

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
const esTest = new Map()
for (const f of filasR) if (!esTest.has(f.k)) esTest.set(f.k, hash(f.k + 'jln') % 2 === 0)
const train = filasR.filter((f) => !esTest.get(f.k)), test = filasR.filter((f) => esTest.get(f.k))

// grid: a·marco + b·hoja + c·hueco + d·trav + e·vidrio
const G = [0, 1, 2, 3, 4, 6, 8]
const Gsub = [0, 1, 2, 4]
const modelo = new Map()          // serie|art -> {a,b,c,d,e, nTrain, okTrain}
const trainPorSA = new Map()
for (const f of train) { const k = `${f.serie}|${f.art}`; if (!trainPorSA.has(k)) trainPorSA.set(k, []); trainPorSA.get(k).push(f) }
for (const [k, rs] of trainPorSA) {
  if (rs.length < 2) continue
  let best = null, bestOk = -1
  for (const a of G) for (const b of G) for (const c of Gsub) for (const d of Gsub) for (const e of G) {
    let ok = 0
    for (const f of rs) if (Math.abs(a * f.t.marco + b * f.t.hoja + c * f.t.hueco + d * f.t.trav + e * f.t.vidrio - f.real) < 0.01) ok++
    if (ok > bestOk) { bestOk = ok; best = { a, b, c, d, e } }
  }
  if (bestOk / rs.length >= 0.8) modelo.set(k, { ...best, nTrain: rs.length, okTrain: bestOk })
}
const linPred = (f) => { const m = modelo.get(`${f.serie}|${f.art}`); return m ? m.a * f.t.marco + m.b * f.t.hoja + m.c * f.t.hueco + m.d * f.t.trav + m.e * f.t.vidrio : null }
function evalLin(conj, nombre) {
  let ok = 0, con = 0
  for (const f of conj) { const p = linPred(f); if (p === null) continue; con++; if (Math.abs(p - f.real) < 0.01) ok++ }
  console.log(`  ${nombre}: ${ok}/${con} (${con ? (100 * ok / con).toFixed(1) : 0}%)  [sin modelo de serie: ${conj.length - con}]`)
  return { ok, con }
}
console.log(`\n═══════════ MODELO LINEAL POR SERIE sobre el RESIDUO de juntas ═══════════`)
console.log(`  (serie,art) con modelo (≥80% train, n_train≥2): ${modelo.size}`)
evalLin(train, 'TRAIN (in-sample)')
evalLin(test, 'TEST  (held-out) ⭐')

// modelos con n_train serio (≥10) y evidencia limpia (train 100%)
console.log(`\n  ─ modelos por (serie,art) [n_train, %train, fórmula] ─`)
const conModelo = [...modelo].sort((a, b) => b[1].nTrain - a[1].nTrain)
let serios = 0
for (const [k, m] of conModelo) {
  const pctT = m.okTrain / m.nTrain
  const serio = m.nTrain >= 10 && pctT >= 0.99
  if (serio) serios++
  const terms = [[m.a, 'marco'], [m.b, 'hoja'], [m.c, 'hueco'], [m.d, 'trav'], [m.e, 'vidrio']].filter(([c]) => c).map(([c, n]) => `${c}·${n}`).join(' + ') || '0'
  console.log(`     ${k.padEnd(22)} n=${String(m.nTrain).padStart(3)} ${(100 * pctT).toFixed(0)}%  →  ${terms}${serio ? '   ⭐SERIO' : ''}`)
}
console.log(`  (serie,art) con n_train≥10 y train 100% (evidencia seria, no ajuste trivial): ${serios}/${modelo.size}`)

// ── GENERALIZACIÓN: aciertos en test sobre topologías NUEVAS (no vistas en train) ────
const sigTrain = new Set(train.map((f) => `${f.serie}|${f.art}|${f.sig}`))
let novOk = 0, novN = 0
const novPorSerie = new Map()
for (const f of test) {
  const key = `${f.serie}|${f.art}|${f.sig}`
  if (sigTrain.has(key)) continue
  const p = linPred(f); if (p === null) continue
  novN++; const bien = Math.abs(p - f.real) < 0.01; if (bien) novOk++
  const sk = `${f.serie}|${f.art}`
  if (!novPorSerie.has(sk)) novPorSerie.set(sk, [0, 0]); novPorSerie.get(sk)[1]++; if (bien) novPorSerie.get(sk)[0]++
}
console.log(`\n  ⭐ GENERALIZA (test, topología NUEVA no vista en train): ${novOk}/${novN} (${novN ? (100 * novOk / novN).toFixed(1) : 0}%)`)
for (const [sk, [o, n]] of [...novPorSerie].sort((a, b) => b[1][1] - a[1][1])) console.log(`     ${sk.padEnd(22)} ${o}/${n}`)

// ── comparación con baseline "constante por (serie,art)" (¿es fórmula o memoria?) ────
console.log(`\n  ─ ¿lineal-topología o constante? (varianza REAL por serie del residuo) ─`)
const realPorSA = new Map()
for (const f of filasR) { const k = `${f.serie}|${f.art}`; if (!realPorSA.has(k)) realPorSA.set(k, []); realPorSA.get(k).push(f.real) }
for (const [k, m] of conModelo) {
  if (m.nTrain < 10) continue
  const reales = realPorSA.get(k) ?? []
  const vals = [...new Set(reales)].sort((a, b) => a - b)
  const moda = [...reales.reduce((mm, v) => mm.set(v, (mm.get(v) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1])[0]
  const baseConst = reales.filter((v) => v === moda[0]).length / reales.length
  console.log(`     ${k.padEnd(22)} reales distintos=${vals.length} {${vals.slice(0, 8).join(',')}${vals.length > 8 ? '…' : ''}}  baseline-constante=${(100 * baseConst).toFixed(0)}%`)
}

// ── DIAGNÓSTICO de los que NO encajan: felpudos / dependencia no-topológica ──────────
console.log(`\n  ─ RESIDUO sin modelo lineal limpio (posible dependencia NO topológica: carriles/mm) ─`)
for (const art of residuo) {
  const rs = porArt.get(art) ?? []
  if (rs.length < 10) continue
  // ¿alguna (serie,art) con modelo serio?
  const seriesArt = [...new Set(rs.map((f) => f.serie))]
  const conMod = seriesArt.filter((s) => { const m = modelo.get(`${s}|${art}`); return m && m.nTrain >= 10 && m.okTrain / m.nTrain >= 0.99 })
  if (conMod.length === 0) {
    const d = (descArt.get(art) ?? '').slice(0, 30)
    // best base×factor global para dar la pista
    let bN = 0, bB = '-', bF = 0
    for (const [bn, bf] of Object.entries(BASES)) for (const factor of FACT) { const ok = rs.filter((f) => Math.abs(factor * bf(f.t) - f.real) < 0.01).length; if (ok > bN) { bN = ok; bB = bn; bF = factor } }
    console.log(`     ${art.padEnd(8)} n=${String(rs.length).padStart(4)} NINGUNA serie con modelo serio  best-topo=${bF}×${bB} ${bN}/${rs.length} (${(100 * bN / rs.length).toFixed(0)}%)  ${d}`)
  }
}
