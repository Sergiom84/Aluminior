/**
 * MODELO COMPLETO de recuento de escuadras (fuente (a): tabla aprendida del oráculo).
 * SOLO LECTURA. NO commitear hasta verificar.
 *
 * Combina la ley de esquinas de T.36 (4 × conteo topológico) para las escuadras de
 * esquina, con una TABLA aprendida por (serie, topología) → serie para las escuadras
 * de alineamiento (GM4735 &c.), y mide, EN HELD-OUT (split por línea), cuántas líneas
 * quedan con TODAS sus escuadras correctas. Esa es la prueba de si la fuente (a)
 * cierra líneas.
 *
 * Split honesto: cada LÍNEA entera va a train o test por hash determinista de su
 * clave (sin Math.random). El modelo se aprende en train y se evalúa en test.
 *
 * Uso: npx tsx scripts/medir-escuadras-modelo.mjs
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

const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const articulos = leer('Articulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const vDatosLinEstr = leer('VDatosLinEstr.csv')
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const seriePorLinea = new Map()
for (const r of vDatosLinEstr) seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))

const ESCUADRA_COMP = new Set(['58', '59', '58R', '59R'])
const compsPorArt = new Map()
for (const f of conjuntosAsoc) {
  const art = col(f, 'Articulo'); if (!art || art === '0') continue
  if (!compsPorArt.has(art)) compsPorArt.set(art, new Set())
  compsPorArt.get(art).add(col(f, 'ComponenteAsoc'))
}
const esEscuadra = (art) => [...(compsPorArt.get(art) ?? [])].some((c) => ESCUADRA_COMP.has(c)) || /ESCUADR/.test((descArt.get(art) ?? '').toUpperCase())
const poblacionAsoc = new Set(conjuntosAsoc.map((f) => col(f, 'Articulo')).filter((a) => a && a !== '0'))

// topología de la instancia
const nodosPorLinea = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!nodosPorLinea.has(k)) nodosPorLinea.set(k, [])
  nodosPorLinea.get(k).push({ id: col(f, 'Id'), tipo: col(f, 'Tipo'), padre: col(f, 'ContenidoEn') })
}
function topologia(k) {
  const nodos = nodosPorLinea.get(k); if (!nodos) return null
  const cnt = (tipo) => nodos.filter((n) => n.tipo === tipo).length
  return { marco: cnt('1'), hueco: cnt('2'), hoja: cnt('3'), trav: cnt('6'), vidrio: cnt('5') + cnt('7') }
}
const sig = (t) => `${t.marco},${t.hueco},${t.hoja},${t.trav},${t.vidrio}`

// oráculo
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
    const topo = topologia(k); if (!topo) continue
    const reales = new Map()
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
      const fam = famPorArt.get(art) ?? ''; if (fam === '050' || fam === '051') continue
      if (!poblacionAsoc.has(art)) continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    for (const [art, real] of reales) {
      if (!esEscuadra(art)) continue
      filas.push({ k, serie: seriePorLinea.get(k) ?? '', art, real, topo, sig: sig(topo) })
    }
  }
}

// split determinista por LÍNEA (hash simple, sin Math.random)
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
const lineaTest = new Map()
for (const f of filas) if (!lineaTest.has(f.k)) lineaTest.set(f.k, hash(f.k) % 2 === 0)  // true=test
const train = filas.filter((f) => !lineaTest.get(f.k))
const test = filas.filter((f) => lineaTest.get(f.k))
console.log(`Apariciones escuadra: ${filas.length}  (train ${train.length} / test ${test.length})`)
console.log(`Líneas: ${lineaTest.size}  (train ${[...lineaTest.values()].filter((v) => !v).length} / test ${[...lineaTest.values()].filter((v) => v).length})`)

// ── aprendizaje del modelo POR ARTÍCULO sobre TRAIN ─────────────────────────
const BASES = {
  marco: (t) => t.marco, hoja: (t) => t.hoja, hueco: (t) => t.hueco, trav: (t) => t.trav,
  'marco+hoja': (t) => t.marco + t.hoja, 'hoja+trav': (t) => t.hoja + t.trav,
  'todos': (t) => t.marco + t.hueco + t.hoja + t.trav,
}
const FACTORES = [1, 2, 3, 4, 6, 8]
const trainPorArt = new Map()
for (const f of train) { if (!trainPorArt.has(f.art)) trainPorArt.set(f.art, []); trainPorArt.get(f.art).push(f) }

const modelo = new Map()   // art -> {tipo:'esquina', base, factor} | {tipo:'tabla', porSig, porSerie, global}
for (const [art, rs] of trainPorArt) {
  // 1) intenta ley de esquinas universal (n≥15, ≥90%)
  let best = null, bestN = 0
  for (const [bn, bf] of Object.entries(BASES)) for (const factor of FACTORES) {
    const ok = rs.filter((f) => Math.abs(factor * bf(f.topo) - f.real) < 0.01).length
    if (ok > bestN) { bestN = ok; best = { base: bn, factor } }
  }
  if (rs.length >= 15 && bestN / rs.length >= 0.9) {
    modelo.set(art, { tipo: 'esquina', ...best })
    continue
  }
  // 2) tabla por (serie,sig) → serie → global (moda del real)
  const moda = (arr) => { const m = new Map(); for (const v of arr) m.set(v, (m.get(v) ?? 0) + 1); return [...m].sort((a, b) => b[1] - a[1])[0]?.[0] }
  const porSig = new Map(), porSerie = new Map()
  const bySig = new Map(), bySerie = new Map()
  for (const f of rs) {
    const ks = `${f.serie}|${f.sig}`
    if (!bySig.has(ks)) bySig.set(ks, []); bySig.get(ks).push(f.real)
    if (!bySerie.has(f.serie)) bySerie.set(f.serie, []); bySerie.get(f.serie).push(f.real)
  }
  for (const [ks, arr] of bySig) porSig.set(ks, moda(arr))
  for (const [s, arr] of bySerie) porSerie.set(s, moda(arr))
  modelo.set(art, { tipo: 'tabla', porSig, porSerie, global: moda(rs.map((f) => f.real)) })
}
const nEsq = [...modelo.values()].filter((m) => m.tipo === 'esquina').length
const nTab = [...modelo.values()].filter((m) => m.tipo === 'tabla').length
console.log(`\nModelo aprendido (train): ${nEsq} artículos ley-esquina, ${nTab} artículos tabla-por-serie`)

// ── predicción ──────────────────────────────────────────────────────────────
function predecir(f) {
  const m = modelo.get(f.art)
  if (!m) return null
  if (m.tipo === 'esquina') return m.factor * BASES[m.base](f.topo)
  return m.porSig.get(`${f.serie}|${f.sig}`) ?? m.porSerie.get(f.serie) ?? m.global ?? null
}
function evaluar(conj, nombre) {
  let ok = 0, tot = 0
  const porLinea = new Map()
  for (const f of conj) {
    tot++
    const pred = predecir(f)
    const bien = pred != null && Math.abs(pred - f.real) < 0.01
    if (bien) ok++
    if (!porLinea.has(f.k)) porLinea.set(f.k, true)
    if (!bien) porLinea.set(f.k, false)
  }
  const lineasOk = [...porLinea.values()].filter(Boolean).length
  console.log(`  ${nombre}: apariciones correctas ${ok}/${tot} (${(100 * ok / tot).toFixed(1)}%)  |  LÍNEAS con TODAS las escuadras OK: ${lineasOk}/${porLinea.size} (${(100 * lineasOk / porLinea.size).toFixed(1)}%)`)
  return { lineasOk, lineas: porLinea.size }
}
console.log(`\n════════ EVALUACIÓN ════════`)
evaluar(train, 'TRAIN (in-sample)')
const rTest = evaluar(test, 'TEST  (held-out) ⭐')

// desglose test: por artículo de alineamiento, ¿acierta la tabla?
console.log(`\n  Desglose TEST por artículo (tabla-por-serie):`)
const testPorArt = new Map()
for (const f of test) { if (!testPorArt.has(f.art)) testPorArt.set(f.art, []); testPorArt.get(f.art).push(f) }
for (const [art, rs] of [...testPorArt].sort((a, b) => b[1].length - a[1].length)) {
  const m = modelo.get(art); if (!m || rs.length < 3) continue
  const ok = rs.filter((f) => { const p = predecir(f); return p != null && Math.abs(p - f.real) < 0.01 }).length
  console.log(`     ${art.padEnd(8)} [${m.tipo === 'esquina' ? `${m.factor}×${m.base}` : 'tabla'}] ${ok}/${rs.length} (${(100 * ok / rs.length).toFixed(0)}%) ${(descArt.get(art) ?? '').slice(0, 22)}`)
}
console.log(`\n⭐ Líneas valorables (escuadras completas) held-out: ${rTest.lineasOk}/${rTest.lineas}`)
console.log(`   (nota: cierre de escuadras ≠ línea valorada; faltan juntas/otros asociados. Es cota superior por el lado de escuadras.)`)

// ── generalización: ¿de qué nivel de la tabla vive el acierto en test? ───────
let viaSig = 0, viaSigOk = 0, viaSerie = 0, viaSerieOk = 0, viaGlobal = 0, viaGlobalOk = 0, viaEsq = 0, viaEsqOk = 0
for (const f of test) {
  const m = modelo.get(f.art); if (!m) continue
  const bien = (() => { const p = predecir(f); return p != null && Math.abs(p - f.real) < 0.01 })()
  if (m.tipo === 'esquina') { viaEsq++; if (bien) viaEsqOk++; continue }
  if (m.porSig.has(`${f.serie}|${f.sig}`)) { viaSig++; if (bien) viaSigOk++ }
  else if (m.porSerie.has(f.serie)) { viaSerie++; if (bien) viaSerieOk++ }
  else { viaGlobal++; if (bien) viaGlobalOk++ }
}
console.log(`\n  Generalización en TEST (de dónde sale la predicción de tabla):`)
console.log(`     ley-esquina (fórmula)              : ${viaEsqOk}/${viaEsq} (${viaEsq ? (100 * viaEsqOk / viaEsq).toFixed(0) : 0}%)`)
console.log(`     tabla (serie,topología) YA en train: ${viaSigOk}/${viaSig} (${viaSig ? (100 * viaSigOk / viaSig).toFixed(0) : 0}%)  ← memoriza config exacta`)
console.log(`     tabla serie (topología NUEVA)      : ${viaSerieOk}/${viaSerie} (${viaSerie ? (100 * viaSerieOk / viaSerie).toFixed(0) : 0}%)  ← generaliza dentro de serie`)
console.log(`     fallback global (serie NUEVA)      : ${viaGlobalOk}/${viaGlobal} (${viaGlobal ? (100 * viaGlobalOk / viaGlobal).toFixed(0) : 0}%)  ← aquí haría falta el catálogo (fuente b)`)
