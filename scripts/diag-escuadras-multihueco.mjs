/**
 * DIAGNÓSTICO del recuento de escuadras en MULTI-HUECO (siguiente lever de T.33).
 * SOLO LECTURA, NO commitear necesariamente. Vuelca, por línea multi-hueco y
 * artículo-escuadra real: la cantidad REAL y, por CADA comp de escuadra en que el
 * artículo se declara (58/59/58R/59R), las apariciones de ranura de la INSTANCIA
 * y la Cantidad declarada, además de nHuecos/nHojas. Objetivo: ver por qué v5
 * mis-cuenta las apariciones cuando hay varias hojas.
 *
 * Uso: npx tsx scripts/diag-escuadras-multihueco.mjs
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
const estArt = leer('EstructurasArticulos.csv')
const vDatosLinEstr = leer('VDatosLinEstr.csv')
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

const seriePorLinea = new Map()
for (const r of vDatosLinEstr) seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))

const ESCUADRA_COMP = new Set(['58', '59', '58R', '59R'])
// comps de escuadra en que se declara cada artículo, y su Cantidad por comp+conjunto
const compsPorArt = new Map()
for (const f of conjuntosAsoc) {
  const art = col(f, 'Articulo'); if (!art || art === '0') continue
  if (!compsPorArt.has(art)) compsPorArt.set(art, new Set())
  compsPorArt.get(art).add(col(f, 'ComponenteAsoc'))
}
const esEscuadra = (art) => [...(compsPorArt.get(art) ?? [])].some((c) => ESCUADRA_COMP.has(c)) || /ESCUADR/.test((descArt.get(art) ?? '').toUpperCase())
const poblacionAsoc = new Set(conjuntosAsoc.map((f) => col(f, 'Articulo')).filter((a) => a && a !== '0'))

// instancia: apariciones de cada DisComponente por línea
const ranurasInstancia = new Map()
for (const f of estArt) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const dis = col(f, 'DisComponente'); if (!dis || dis === '0') continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!ranurasInstancia.has(k)) ranurasInstancia.set(k, new Map())
  const m = ranurasInstancia.get(k)
  m.set(dis, (m.get(dis) ?? 0) + (num(f, 'Cantidad') || 1))
}
const hojasPorLinea = new Map()
for (const f of estArt) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const idHoja = num(f, 'DisIdHoja'); if (idHoja <= 0) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!hojasPorLinea.has(k)) hojasPorLinea.set(k, new Set())
  hojasPorLinea.get(k).add(idHoja)
}

const nHuecos = (e) => { const m = e.match(/^(\d+)/); return m ? Number(m[1]) : 0 }
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const DOCS = [{ tipo: 'VPRES', lin: 'VPresupuestosLin.csv' }, { tipo: 'VALB', lin: 'VAlbaranesLin.csv' }, { tipo: 'VFAC', lin: 'VFacturasLin.csv' }]

const rows = []
for (const doc of DOCS) {
  const vLin = leer(doc.lin)
  const hijasPorPadre = new Map()
  for (const f of vLin) { const p = col(f, 'nEstr'); if (!p || p === '0') continue; if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, []); hijasPorPadre.get(p).push(f) }
  for (const p of vLin) {
    if (col(p, 'EstructuraSN') !== 'True') continue
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    const estructura = col(p, 'Articulo')
    if (nHuecos(estructura) < 2) continue
    const rin = ranurasInstancia.get(k); if (!rin) continue
    const reales = new Map()
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
      const fam = famPorArt.get(art) ?? ''; if (fam === '050' || fam === '051') continue
      if (!poblacionAsoc.has(art)) continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    const nHj = hojasPorLinea.get(k)?.size ?? 0
    for (const [art, real] of reales) {
      if (!esEscuadra(art)) continue
      const comps = [...(compsPorArt.get(art) ?? [])].filter((c) => ESCUADRA_COMP.has(c))
      const apar = comps.map((c) => `${c}:${rin.get(c) ?? 0}`).join(' ')
      const sumApar = comps.reduce((s, c) => s + (rin.get(c) ?? 0), 0)
      rows.push({ serie: seriePorLinea.get(k) ?? '', estructura, huecos: nHuecos(estructura), nHj, art, real, apar, sumApar })
    }
  }
}

// familia geométrica de candidatos (multiplicadores fijos sobre nHuecos/nHojas)
function cands(r) {
  return {
    '4×huecos': 4 * r.huecos,
    '4×hojas': 4 * r.nHj,
    '4×(huecos+hojas)': 4 * (r.huecos + r.nHj),
    '4×huecos+... nada': 4 * r.huecos,
    '2×huecos': 2 * r.huecos,
    '8×huecos': 8 * r.huecos,
  }
}
const NAMES = ['4×huecos', '4×hojas', '4×(huecos+hojas)', '2×huecos', '8×huecos']
const hits = new Map(NAMES.map((n) => [n, 0]))
// "cualquier candidato geométrico acierta" y "mejor por artículo"
let anyHit = 0
const porArt = new Map()
for (const r of rows) {
  const c = cands(r); let any = false
  for (const n of NAMES) if (Math.abs(c[n] - r.real) < 0.01) { hits.set(n, hits.get(n) + 1); any = true }
  if (any) anyHit++
  if (!porArt.has(r.art)) porArt.set(r.art, [])
  porArt.get(r.art).push(r)
}
console.log(`Filas multi-hueco (línea×art-escuadra): ${rows.length}`)
console.log(`\n════════ candidatos geométricos (cantidad exacta) ════════`)
for (const n of NAMES) console.log(`  ${n.padEnd(18)}: ${String(hits.get(n)).padStart(3)}/${rows.length} (${(100 * hits.get(n) / rows.length).toFixed(1)}%)`)
console.log(`  ALGUNO de la familia acierta: ${anyHit}/${rows.length} (${(100 * anyHit / rows.length).toFixed(1)}%)`)

// por artículo: ¿tiene un multiplicador geométrico consistente?
console.log(`\n════════ por ARTÍCULO-escuadra: multiplicador geométrico dominante ════════`)
let artOk = 0
for (const [art, rs] of [...porArt].sort((a, b) => b[1].length - a[1].length)) {
  if (rs.length < 3) continue
  let best = null, bestN = 0
  for (const n of NAMES) {
    const ok = rs.filter((r) => Math.abs(cands(r)[n] - r.real) < 0.01).length
    if (ok > bestN) { bestN = ok; best = n }
  }
  const tasa = bestN / rs.length
  if (tasa >= 0.9) artOk++
  console.log(`  ${art.padEnd(8)} n=${String(rs.length).padStart(3)}  mejor=${(best ?? '-').padEnd(16)} ${bestN}/${rs.length} (${(100 * tasa).toFixed(0)}%)  ${descArt.get(art) ?? ''}`)
}
console.log(`\nArtículos (n≥3) con multiplicador geométrico consistente (≥90%): ${artOk}`)

// check 1: ¿la cuenta de ranura de la instancia (lo que v5 usa) es espuria/constante?
const distApar = new Map()
for (const r of rows) distApar.set(r.sumApar, (distApar.get(r.sumApar) ?? 0) + 1)
console.log(`\n════════ check 1: Σapariciones de ranura escuadra en la instancia (lo que v5 cuenta) ════════`)
for (const [v, n] of [...distApar].sort((a, b) => b[1] - a[1]).slice(0, 6)) console.log(`  Σapar=${v} → ${n} filas`)

// check 2: escuadras de ALINEAMIENTO vs marco/hoja
const esAlin = (art) => /ALIN/.test((descArt.get(art) ?? '').toUpperCase())
const alin = rows.filter((r) => esAlin(r.art)), noAlin = rows.filter((r) => !esAlin(r.art))
const hit4h = (subset) => subset.filter((r) => Math.abs(4 * r.huecos - r.real) < 0.01).length
console.log(`\n════════ check 2: ALINEAMIENTO vs resto (acierto 4×huecos) ════════`)
console.log(`  ALINEAMIENTO: ${hit4h(alin)}/${alin.length} (${alin.length ? (100 * hit4h(alin) / alin.length).toFixed(1) : 0}%)`)
console.log(`  marco/hoja  : ${hit4h(noAlin)}/${noAlin.length} (${noAlin.length ? (100 * hit4h(noAlin) / noAlin.length).toFixed(1) : 0}%)`)
