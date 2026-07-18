/**
 * ORÁCULO DE ASOCIADOS
 *
 * Los perfiles ya están validados (anexo J). Quedan los ASOCIADOS: escuadras,
 * herrajes, juntas, junquillos… que en los documentos reales aparecen como
 * líneas hijas sin Funcion de perfil.
 *
 * Hipótesis: salen de ConjuntosAsoc (Conjunto ∈ cadena(serie)) y de
 * ConfigSeriesAsoc (por TipoHoja). Este script mide la COBERTURA:
 * ¿qué fracción de los artículos asociados reales de cada línea aparece
 * entre los candidatos de esas dos tablas?
 *
 * No mide todavía la selección exacta (qué subconjunto entra y con qué
 * cantidad): primero hay que saber si la fuente es la correcta.
 *
 * Solo lectura. Uso: node scripts/oraculo-asociados.mjs
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

const conjuntos = leer('Conjuntos.csv')
const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const configSeriesAsoc = leer('ConfigSeriesAsoc.csv')
const datosLin = leer('VDatosLinEstr.csv')
const vLin = leer('VPresupuestosLin.csv')
const articulos = leer('Articulos.csv')

const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

// --- cadena de delegación (igual que el anexo J) ---
const ficha = new Map(conjuntos.map((c) => [col(c, 'Codigo'), c]))
const COLS_DELEGA = Object.keys(conjuntos[0] ?? {}).filter((k) =>
  /^(TablaHojas\d?|TablaFijos\d?|TablaDobleH\d?|SubSerieDe|herr.+)$/.test(k),
)
const cadenaCache = new Map()
function cadena(serie) {
  if (cadenaCache.has(serie)) return cadenaCache.get(serie)
  const vistos = new Set()
  const rec = (c) => {
    if (!c || vistos.has(c)) return
    vistos.add(c)
    const fc = ficha.get(c)
    if (!fc) return
    for (const k of COLS_DELEGA) {
      const v = col(fc, k)
      if (v && v !== '0' && ficha.has(v)) rec(v)
    }
  }
  rec(serie)
  const r = [...vistos]
  cadenaCache.set(serie, r)
  return r
}

// --- candidatos por conjunto ---
const asocPorConjunto = new Map()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, new Set())
  asocPorConjunto.get(cj).add(art)
}
const cfgPorConjunto = new Map()
for (const f of configSeriesAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  if (!cfgPorConjunto.has(cj)) cfgPorConjunto.set(cj, new Set())
  cfgPorConjunto.get(cj).add(art)
}

// --- oráculo ---
const seriePorLinea = new Map()
for (const f of datosLin) {
  seriePorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const padres = vLin.filter((f) => col(f, 'EstructuraSN') === 'True')
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

let lineas = 0, artTotal = 0, artCubiertos = 0
let soloConjAsoc = 0, soloCfg = 0, ambas = 0
const noCubiertos = new Map()
const porSerieStats = new Map()

for (const p of padres) {
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  if (!serie) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const cad = cadena(serie)
  const candA = new Set(), candC = new Set()
  for (const cj of cad) {
    for (const a of asocPorConjunto.get(cj) ?? []) candA.add(a)
    for (const a of cfgPorConjunto.get(cj) ?? []) candC.add(a)
  }
  // Asociados reales: hijas con artículo, sin función de perfil, y que no
  // sean vidrio/panel (familia 050/051: elección de acristalamiento).
  const reales = new Set()
  for (const h of hijas) {
    const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
    if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
    const fam = famPorArt.get(art) ?? ''
    if (fam === '050' || fam === '051') continue
    reales.add(art)
  }
  if (!reales.size) continue
  lineas++
  for (const a of reales) {
    artTotal++
    const enA = candA.has(a), enC = candC.has(a)
    if (enA || enC) {
      artCubiertos++
      if (enA && enC) ambas++
      else if (enA) soloConjAsoc++
      else soloCfg++
    } else {
      const k = `${serie} ${a} ${(descArt.get(a) ?? '').slice(0, 35)}`
      noCubiertos.set(k, (noCubiertos.get(k) ?? 0) + 1)
    }
  }
  const st = porSerieStats.get(serie) ?? { total: 0, cubiertos: 0 }
  st.total += reales.size
  for (const a of reales) if (candA.has(a) || candC.has(a)) st.cubiertos++
  porSerieStats.set(serie, st)
}

console.log(`Líneas con asociados: ${lineas}`)
console.log(`Artículos asociados (línea, artículo): ${artTotal}`)
console.log(`Cubiertos por candidatos: ${artCubiertos} (${(100 * artCubiertos / artTotal).toFixed(1)}%)`)
console.log(`  sólo ConjuntosAsoc: ${soloConjAsoc}   sólo ConfigSeriesAsoc: ${soloCfg}   ambas: ${ambas}`)

console.log('\n--- Por serie (peores primero) ---')
const filas = [...porSerieStats.entries()]
  .map(([s, v]) => ({ s, ...v, pct: 100 * v.cubiertos / v.total }))
  .sort((a, b) => a.pct - b.pct)
for (const f of filas.slice(0, 12)) {
  console.log(`  ${f.s.padEnd(12)} ${String(f.cubiertos).padStart(5)}/${String(f.total).padEnd(5)} ${f.pct.toFixed(1)}%`)
}

console.log('\n--- No cubiertos más frecuentes (top 20) ---')
for (const [k, n] of [...noCubiertos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  console.log(`  ${String(n).padStart(5)}  ${k}`)
}
