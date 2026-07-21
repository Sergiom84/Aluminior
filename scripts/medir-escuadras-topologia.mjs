/**
 * PUNTO A: recuento de escuadras desde la TOPOLOGÍA del árbol EstructurasDiseño.
 * SOLO LECTURA. NO commitear hasta verificar.
 *
 * T.33-T.35 dejaron el crux localizado: la cuenta de apariciones de ranura que usa
 * v5 es un valor de plantilla que NO escala con la geometría; el recuento real de
 * escuadras es geométrico (esquinas), y ni un multiplicador plano por nHuecos ni un
 * multiplicador fijo por artículo cierran (tapón GM4735). Aquí se reconstruye la
 * topología real de cada línea desde el árbol de la INSTANCIA (nodos con TipoDoc,
 * que traen Tipo y ContenidoEn), se cuentan los elementos con esquinas
 * (marco/hueco/hoja/travesaño) y se mide, por artículo-escuadra, qué conteo × factor
 * reconstruye la cantidad real del oráculo (enlace exacto por hijas de
 * VPresupuestosLin, regla 8).
 *
 * Tipo de nodo (medido en los datos): 1=marco raíz, 2=hueco, 3=hoja, 5/7=vidrio,
 * 6=travesaño/montante, 4=?. Cada marco/hueco/hoja/travesaño es un rectángulo con 4
 * esquinas; los travesaños generan uniones en T.
 *
 * Uso: npx tsx scripts/medir-escuadras-topologia.mjs
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

// ── TOPOLOGÍA de la instancia: nodos por línea ──────────────────────────────
const nodosPorLinea = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!nodosPorLinea.has(k)) nodosPorLinea.set(k, [])
  nodosPorLinea.get(k).push({ id: col(f, 'Id'), tipo: col(f, 'Tipo'), padre: col(f, 'ContenidoEn'), nHoja: num(f, 'nHoja') })
}
function topologia(k) {
  const nodos = nodosPorLinea.get(k)
  if (!nodos) return null
  const hijos = new Map()
  for (const n of nodos) { if (!hijos.has(n.padre)) hijos.set(n.padre, []); hijos.get(n.padre).push(n) }
  const cnt = (tipo) => nodos.filter((n) => n.tipo === tipo).length
  // hueco HOJA de verdad = hueco (Tipo2) que contiene una hoja (Tipo3)
  // hueco FIJO = hueco sin hoja ni sub-hueco (contiene vidrio directo)
  let huecosConHoja = 0, huecosFijos = 0, huecosSubdiv = 0
  for (const n of nodos) {
    if (n.tipo !== '2') continue
    const ch = hijos.get(n.id) ?? []
    if (ch.some((c) => c.tipo === '3')) huecosConHoja++
    else if (ch.some((c) => c.tipo === '2' || c.tipo === '6')) huecosSubdiv++
    else huecosFijos++
  }
  return {
    marco: cnt('1'), hueco: cnt('2'), hoja: cnt('3'), trav: cnt('6'),
    vidrio: cnt('5') + cnt('7'), huecosConHoja, huecosFijos, huecosSubdiv,
    nNodos: nodos.length,
  }
}

// ── oráculo: escuadra real por línea×artículo ──────────────────────────────
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
      filas.push({ k, serie: seriePorLinea.get(k) ?? '', estructura: col(p, 'Articulo'), art, real, topo })
    }
  }
}
console.log(`Apariciones reales de artículo-escuadra con topología: ${filas.length}`)
const t0 = filas[0]?.topo
console.log(`(ejemplo topo: ${JSON.stringify(t0)})`)

// ── candidatos de esquinas (conteo × factor) ────────────────────────────────
function cands(t) {
  const esq = (n) => 4 * n   // 4 esquinas por rectángulo
  return {
    '4×marco': esq(t.marco),
    '4×hoja': esq(t.hoja),
    '4×hueco': esq(t.hueco),
    '4×trav': esq(t.trav),
    '4×(marco+hoja)': esq(t.marco + t.hoja),
    '4×(hueco+hoja)': esq(t.hueco + t.hoja),
    '4×(hoja+trav)': esq(t.hoja + t.trav),
    '4×huecoConHoja': esq(t.huecosConHoja),
    '4×huecoFijo': esq(t.huecosFijos),
    '2×(marco+hueco+hoja+trav)': 2 * (t.marco + t.hueco + t.hoja + t.trav),
    '4×(marco+hueco+hoja+trav)': 4 * (t.marco + t.hueco + t.hoja + t.trav),
  }
}
const NAMES = Object.keys(cands({ marco: 0, hueco: 0, hoja: 0, trav: 0, huecosConHoja: 0, huecosFijos: 0 }))
const hits = new Map(NAMES.map((n) => [n, 0]))
for (const f of filas) { const c = cands(f.topo); for (const n of NAMES) if (Math.abs(c[n] - f.real) < 0.01) hits.set(n, hits.get(n) + 1) }
console.log(`\n════════ candidatos de ESQUINAS (todos los artículos, n=${filas.length}) ════════`)
for (const [n, h] of [...hits].sort((a, b) => b[1] - a[1])) console.log(`  ${n.padEnd(28)}: ${String(h).padStart(3)}/${filas.length} (${(100 * h / filas.length).toFixed(1)}%)`)

// ── por artículo: mejor conteo de esquinas (× factor libre entero 1..4) ──────
console.log(`\n════════ por ARTÍCULO: mejor conteo de esquinas × factor ════════`)
const BASES = {
  marco: (t) => t.marco, hoja: (t) => t.hoja, hueco: (t) => t.hueco, trav: (t) => t.trav,
  huecoConHoja: (t) => t.huecosConHoja, 'hueco+hoja': (t) => t.hueco + t.hoja,
  'marco+hoja': (t) => t.marco + t.hoja, 'hoja+trav': (t) => t.hoja + t.trav,
  'todos': (t) => t.marco + t.hueco + t.hoja + t.trav,
}
const porArt = new Map()
for (const f of filas) { if (!porArt.has(f.art)) porArt.set(f.art, []); porArt.get(f.art).push(f) }
let artOk = 0, artTot = 0, filasOk = 0
const reglaDe = new Map()
for (const [art, rs] of [...porArt].sort((a, b) => b[1].length - a[1].length)) {
  if (rs.length < 3) continue
  artTot++
  let best = null, bestN = 0, bestFactor = 0
  for (const [bn, bf] of Object.entries(BASES)) {
    for (const factor of [1, 2, 3, 4, 6, 8]) {
      const ok = rs.filter((f) => Math.abs(factor * bf(f.topo) - f.real) < 0.01).length
      if (ok > bestN) { bestN = ok; best = bn; bestFactor = factor }
    }
  }
  const tasa = bestN / rs.length
  if (tasa >= 0.9) { artOk++; filasOk += bestN; reglaDe.set(art, { base: best, factor: bestFactor }) }
  console.log(`  ${art.padEnd(8)} n=${String(rs.length).padStart(3)} mejor=${bestFactor}×${(best ?? '-').padEnd(12)} ${bestN}/${rs.length} (${(100 * tasa).toFixed(0)}%) ${(descArt.get(art) ?? '').slice(0, 24)}`)
}
console.log(`\nArtículos (n≥3) con regla de esquinas consistente (≥90%): ${artOk}/${artTot}`)

// ── ¿cuántas LÍNEAS quedan con TODAS sus escuadras correctas? ────────────────
const porLinea = new Map()
for (const f of filas) { if (!porLinea.has(f.k)) porLinea.set(f.k, []); porLinea.get(f.k).push(f) }
let lineasOk = 0
for (const [, fs] of porLinea) {
  if (fs.every((f) => { const r = reglaDe.get(f.art); return r && Math.abs(r.factor * BASES[r.base](f.topo) - f.real) < 0.01 })) lineasOk++
}
console.log(`LÍNEAS con TODAS sus escuadras correctas por reglas de esquinas: ${lineasOk}/${porLinea.size}`)

// ── FOCO familia ALINEAMIENTO (GM4735/GM4710/GM4330): ¿adyacencia, no esquinas? ──
console.log(`\n████ FOCO ALINEAMIENTO (no encaja 4×conteo) ████`)
for (const art of ['GM4735', 'GM4710', 'GM4330']) {
  const rs = porArt.get(art) ?? []; if (!rs.length) continue
  const dist = new Map(); for (const f of rs) dist.set(f.real, (dist.get(f.real) ?? 0) + 1)
  console.log(`\n  ${art} (${descArt.get(art)}) n=${rs.length}  real: ${[...dist].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([v, n]) => `${v}→${n}`).join(' ')}`)
  // candidatos de adyacencia/uniones: travesaños generan uniones; nº uniones internas
  const AC = {
    '4×trav': (t) => 4 * t.trav, '8×trav': (t) => 8 * t.trav,
    '4×(hueco-1)': (t) => 4 * Math.max(0, t.hueco - 1), '8×(hueco-1)': (t) => 8 * Math.max(0, t.hueco - 1),
    '4×(hoja+trav)': (t) => 4 * (t.hoja + t.trav), '2×vidrio×2': (t) => 4 * t.vidrio,
    '4×(marco+trav)': (t) => 4 * (t.marco + t.trav), '4×hoja+4×trav': (t) => 4 * t.hoja + 4 * t.trav,
    '4×(hoja+hueco)': (t) => 4 * (t.hoja + t.hueco),
  }
  for (const [nm, fn] of Object.entries(AC)) {
    const ok = rs.filter((f) => Math.abs(fn(f.topo) - f.real) < 0.01).length
    if (ok >= rs.length * 0.5) console.log(`     ${nm.padEnd(16)}: ${ok}/${rs.length} (${(100 * ok / rs.length).toFixed(0)}%)`)
  }
  console.log(`     muestra: ${rs.slice(0, 8).map((f) => `r=${f.real}[m${f.topo.marco}h${f.topo.hueco}j${f.topo.hoja}t${f.topo.trav}v${f.topo.vidrio}]`).join(' ')}`)
  // determinismo: ¿la topología (sola) determina el real? ¿y topología+serie?
  const detTest = (keyFn) => {
    const g = new Map()
    for (const f of rs) { const kk = keyFn(f); if (!g.has(kk)) g.set(kk, new Set()); g.get(kk).add(f.real) }
    const amb = [...g.values()].filter((s) => s.size > 1).length
    return { grupos: g.size, ambiguos: amb, techo: [...g.values()].reduce((a, s) => a + (s.size === 1 ? 0 : 0), 0) }
  }
  const soloTopo = detTest((f) => `${f.topo.marco},${f.topo.hueco},${f.topo.hoja},${f.topo.trav},${f.topo.vidrio}`)
  const topoSerie = detTest((f) => `${f.serie}|${f.topo.marco},${f.topo.hueco},${f.topo.hoja},${f.topo.trav},${f.topo.vidrio}`)
  const soloSerie = detTest((f) => f.serie)
  console.log(`     determinismo → solo topología: ${soloTopo.ambiguos}/${soloTopo.grupos} grupos ambiguos | topología+serie: ${topoSerie.ambiguos}/${topoSerie.grupos} | solo serie: ${soloSerie.ambiguos}/${soloSerie.grupos}`)
}
