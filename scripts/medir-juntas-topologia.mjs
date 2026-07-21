/**
 * PUNTO 1 (juntas): recuento de JUNTAS desde la TOPOLOGÍA del árbol EstructurasDiseño.
 * SOLO LECTURA. NO commitear hasta verificar.
 *
 * Análogo a T.36/T.37 para escuadras. Las juntas se cuentan en PIEZAS (Cdad ∈ {1,2,4},
 * verificado), no en metros: cada tramo es una pieza que bordea un lado (S.7.2, delta
 * 0 sobre el perfil de hoja). T.30 dejó abierto "estimar por estructura", que es justo
 * lo que da la topología. Se mide, por artículo-junta, qué conteo topológico
 * reconstruye la cantidad real (enlace exacto por hijas de VPresupuestosLin, regla 8),
 * y luego el modelo completo held-out (ley topológica + tabla por serie).
 *
 * Uso: npx tsx scripts/medir-juntas-topologia.mjs
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

// junta = artículo de familia 002 con desc JUNTA/GOMA/FELPUDO/CEPILLO/BURLETE,
// excluyendo falsos positivos por keyword (escuadras, herramientas, tapajuntas, kits)
const esJunta = (art) => {
  if (famPorArt.get(art) !== '002') return false
  const d = (descArt.get(art) ?? '').toUpperCase()
  if (!/JUNTA|GOMA|BURLETE|FELPUD|CEPILLO|JUNQUILL/.test(d)) return false
  if (/ESCUADR|TIJERA|RULETA|TAPAJUNT|JUEGO|SIN CONFIGURAR/.test(d)) return false
  return true
}
const poblacionAsoc = new Set(conjuntosAsoc.map((f) => col(f, 'Articulo')).filter((a) => a && a !== '0'))

// topología de la instancia
const nodosPorLinea = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!nodosPorLinea.has(k)) nodosPorLinea.set(k, [])
  nodosPorLinea.get(k).push({ tipo: col(f, 'Tipo') })
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
      if (!esJunta(art)) continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    for (const [art, real] of reales) filas.push({ k, serie: seriePorLinea.get(k) ?? '', art, real, topo, sig: sig(topo) })
  }
}
console.log(`Apariciones reales de artículo-junta con topología: ${filas.length}`)

// ── candidatos topológicos por artículo ─────────────────────────────────────
const BASES = {
  marco: (t) => t.marco, hoja: (t) => t.hoja, hueco: (t) => t.hueco, trav: (t) => t.trav, vidrio: (t) => t.vidrio,
  'marco+hoja': (t) => t.marco + t.hoja, 'hoja+trav': (t) => t.hoja + t.trav,
  'hueco+hoja': (t) => t.hueco + t.hoja, 'todos': (t) => t.marco + t.hueco + t.hoja + t.trav,
}
const FACTORES = [1, 2, 3, 4, 6, 8]
const porArt = new Map()
for (const f of filas) { if (!porArt.has(f.art)) porArt.set(f.art, []); porArt.get(f.art).push(f) }
console.log(`\n════════ por ARTÍCULO-junta: mejor conteo topológico × factor ════════`)
let robustos = 0
for (const [art, rs] of [...porArt].sort((a, b) => b[1].length - a[1].length)) {
  if (rs.length < 3) continue
  let best = null, bestN = 0, bestF = 0
  for (const [bn, bf] of Object.entries(BASES)) for (const factor of FACTORES) {
    const ok = rs.filter((f) => Math.abs(factor * bf(f.topo) - f.real) < 0.01).length
    if (ok > bestN) { bestN = ok; best = bn; bestF = factor }
  }
  const rob = rs.length >= 20 && bestN / rs.length >= 0.9
  if (rob) robustos++
  console.log(`  ${art.padEnd(8)} n=${String(rs.length).padStart(4)} mejor=${bestF}×${(best ?? '-').padEnd(11)} ${bestN}/${rs.length} (${(100 * bestN / rs.length).toFixed(0)}%)${rob ? ' ROBUSTO' : ''} ${(descArt.get(art) ?? '').slice(0, 24)}`)
}
console.log(`\nArtículos-junta ROBUSTOS (n≥20, ≥90%, regla topológica limpia): ${robustos}`)

// ── modelo completo held-out (ley topológica n≥15 + tabla por serie) ─────────
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
const lineaTest = new Map()
for (const f of filas) if (!lineaTest.has(f.k)) lineaTest.set(f.k, hash(f.k + 'j') % 2 === 0)
const train = filas.filter((f) => !lineaTest.get(f.k)), test = filas.filter((f) => lineaTest.get(f.k))
const moda = (arr) => { const m = new Map(); for (const v of arr) m.set(v, (m.get(v) ?? 0) + 1); return [...m].sort((a, b) => b[1] - a[1])[0]?.[0] }
const trainPorArt = new Map()
for (const f of train) { if (!trainPorArt.has(f.art)) trainPorArt.set(f.art, []); trainPorArt.get(f.art).push(f) }
const modelo = new Map()
for (const [art, rs] of trainPorArt) {
  let best = null, bestN = 0
  for (const [bn, bf] of Object.entries(BASES)) for (const factor of FACTORES) {
    const ok = rs.filter((f) => Math.abs(factor * bf(f.topo) - f.real) < 0.01).length
    if (ok > bestN) { bestN = ok; best = { base: bn, factor } }
  }
  if (rs.length >= 15 && bestN / rs.length >= 0.9) { modelo.set(art, { tipo: 'topo', ...best }); continue }
  const porSig = new Map(), porSerie = new Map(), bySig = new Map(), bySerie = new Map()
  for (const f of rs) { const ks = `${f.serie}|${f.sig}`; (bySig.get(ks) ?? bySig.set(ks, []).get(ks)).push(f.real); (bySerie.get(f.serie) ?? bySerie.set(f.serie, []).get(f.serie)).push(f.real) }
  for (const [ks, arr] of bySig) porSig.set(ks, moda(arr))
  for (const [s, arr] of bySerie) porSerie.set(s, moda(arr))
  modelo.set(art, { tipo: 'tabla', porSig, porSerie, global: moda(rs.map((f) => f.real)) })
}
function predecir(f) {
  const m = modelo.get(f.art); if (!m) return null
  if (m.tipo === 'topo') return m.factor * BASES[m.base](f.topo)
  return m.porSig.get(`${f.serie}|${f.sig}`) ?? m.porSerie.get(f.serie) ?? m.global ?? null
}
function evaluar(conj, nombre) {
  let ok = 0; const porLinea = new Map(), viaSig = [0, 0], viaSerie = [0, 0], viaTopo = [0, 0], viaGlob = [0, 0]
  for (const f of conj) {
    const p = predecir(f); const bien = p != null && Math.abs(p - f.real) < 0.01; if (bien) ok++
    if (!porLinea.has(f.k)) porLinea.set(f.k, true); if (!bien) porLinea.set(f.k, false)
    const m = modelo.get(f.art)
    if (m?.tipo === 'topo') { viaTopo[1]++; if (bien) viaTopo[0]++ }
    else if (m?.porSig.has(`${f.serie}|${f.sig}`)) { viaSig[1]++; if (bien) viaSig[0]++ }
    else if (m?.porSerie.has(f.serie)) { viaSerie[1]++; if (bien) viaSerie[0]++ }
    else { viaGlob[1]++; if (bien) viaGlob[0]++ }
  }
  const lo = [...porLinea.values()].filter(Boolean).length
  console.log(`  ${nombre}: aparic ${ok}/${conj.length} (${(100 * ok / conj.length).toFixed(1)}%) | LÍNEAS todas-OK ${lo}/${porLinea.size} (${(100 * lo / porLinea.size).toFixed(1)}%)`)
  if (nombre.includes('TEST')) console.log(`     vías → topo(fórmula) ${viaTopo[0]}/${viaTopo[1]} | (serie,topo) vista ${viaSig[0]}/${viaSig[1]} | serie/topo-nueva ${viaSerie[0]}/${viaSerie[1]} | serie-nueva ${viaGlob[0]}/${viaGlob[1]}`)
  return { lo, tot: porLinea.size }
}
const nTopo = [...modelo.values()].filter((m) => m.tipo === 'topo').length
console.log(`\n════════ MODELO held-out (split por línea): ${nTopo} art. ley-topología, ${modelo.size - nTopo} tabla ════════`)
evaluar(train, 'TRAIN (in-sample)')
evaluar(test, 'TEST  (held-out) ⭐')
