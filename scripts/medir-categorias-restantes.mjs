/**
 * Clasifica el 22% de asociados no cubiertos por ConjuntosAsoc/ConfigSeriesAsoc:
 *   - ¿acristalamiento? (junquillo/juntas de TAcristalamientoLin vía TablaHojas)
 *   - ¿mano de obra? (campos mo* de Conjuntos)
 *   - ¿compactos/persiana? (elección de usuario)
 *   - ¿otros?
 *
 * Y de paso mide: con TAcristalamientoLin añadido a los candidatos,
 * ¿a cuánto sube la cobertura total?
 *
 * Solo lectura. Uso: node scripts/medir-categorias-restantes.mjs
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
const tacrisLin = leer('TAcristalamientoLin.csv')
const tacris = leer('TAcristalamiento.csv')
const datosLin = leer('VDatosLinEstr.csv')
const vLin = leer('VPresupuestosLin.csv')
const articulos = leer('Articulos.csv')

const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

const ficha = new Map(conjuntos.map((c) => [col(c, 'Codigo'), c]))
const COLS_DELEGA = Object.keys(conjuntos[0] ?? {}).filter((k) =>
  /^(TablaHojas\d?|TablaFijos\d?|TablaDobleH\d?|SubSerieDe|herr.+)$/.test(k),
)
const COLS_MO = Object.keys(conjuntos[0] ?? {}).filter((k) => /^mo/.test(k))
console.log(`Columnas mo* en Conjuntos: ${COLS_MO.length} (${COLS_MO.slice(0, 8).join(', ')}…)`)

// ¿Qué contienen los mo* de un conjunto de serie? Muestra:
for (const s of ['GMA350', 'ELEGANTPVC']) {
  const fc = ficha.get(s)
  if (!fc) continue
  const valores = new Set(COLS_MO.map((k) => col(fc, k)).filter((v) => v && v !== '0'))
  console.log(`  ${s}: mo* = ${[...valores].join(', ') || '(vacío)'}`)
}

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

// Candidatos de asociados
const asocPorConjunto = new Map()
for (const f of [...conjuntosAsoc, ...configSeriesAsoc]) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, new Set())
  asocPorConjunto.get(cj).add(art)
}

// Candidatos de acristalamiento por tabla TAcris (todas las posiciones/grosores)
const tacrisArt = new Map() // codigo tabla -> Set(articulos)
for (const f of tacrisLin) {
  const t = col(f, 'TAcris')
  if (!tacrisArt.has(t)) tacrisArt.set(t, new Set())
  for (const c of ['Junquillo', 'JuntaExt', 'JuntaInt']) {
    const a = col(f, c)
    if (a && a !== '0') tacrisArt.get(t).add(a)
  }
}
// Gomas de la ficha TAcristalamiento (GomaInt1-8, GomaExt1-8)
const COLS_GOMA = Object.keys(tacris[0] ?? {}).filter((k) => /^Goma(Int|Ext)\d$/.test(k))
for (const f of tacris) {
  const t = col(f, 'Codigo')
  if (!tacrisArt.has(t)) tacrisArt.set(t, new Set())
  for (const k of COLS_GOMA) {
    const a = col(f, k)
    if (a && a !== '0') tacrisArt.get(t).add(a)
  }
}
// Junquillos de las listas (CodLstJunq -> TAcrisLstJunqLin)
const lstJunq = leer('TAcrisLstJunqLin.csv')
const junqPorLista = new Map()
for (const f of lstJunq) {
  const l = col(f, 'CodLstJunq')
  if (!junqPorLista.has(l)) junqPorLista.set(l, new Set())
  junqPorLista.get(l).add(col(f, 'CodJunquillo'))
}
for (const f of tacris) {
  const t = col(f, 'Codigo')
  for (const k of ['CodLstJunq', 'CodLstJunqV']) {
    for (const a of junqPorLista.get(col(f, k)) ?? []) tacrisArt.get(t)?.add(a)
  }
}

// Tablas de acristalamiento de la serie (TablaHojas*/TablaFijos*/TablaDobleH*)
const COLS_TACRIS = Object.keys(conjuntos[0] ?? {}).filter((k) =>
  /^(TablaHojas\d?|TablaFijos\d?|TablaDobleH\d?)$/.test(k),
)
function candidatosAcris(serie) {
  const out = new Set()
  for (const cj of cadena(serie)) {
    const fc = ficha.get(cj)
    if (!fc) continue
    for (const k of COLS_TACRIS) {
      const t = col(fc, k)
      for (const a of tacrisArt.get(t) ?? []) out.add(a)
    }
  }
  return out
}

// Oráculo
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

const ES_MO = /^MO/
let total = 0, porAsoc = 0, porAcris = 0, esMO = 0, resto = 0
const restoDetalle = new Map()
for (const p of padres) {
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  if (!serie) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const cad = cadena(serie)
  const candA = new Set()
  for (const cj of cad) for (const a of asocPorConjunto.get(cj) ?? []) candA.add(a)
  const candT = candidatosAcris(serie)
  for (const h of hijas) {
    const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
    if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
    const fam = famPorArt.get(art) ?? ''
    if (fam === '050' || fam === '051') continue
    total++
    if (candA.has(art)) porAsoc++
    else if (candT.has(art)) porAcris++
    else if (ES_MO.test(art)) esMO++
    else {
      resto++
      const k = `${serie} ${art} ${(descArt.get(art) ?? '').slice(0, 38)}`
      restoDetalle.set(k, (restoDetalle.get(k) ?? 0) + 1)
    }
  }
}

console.log(`\nPiezas asociadas evaluadas (con repetición por línea): ${total}`)
const pct = (n) => `${(100 * n / total).toFixed(1)}%`
console.log(`  ConjuntosAsoc/ConfigSeriesAsoc : ${porAsoc} (${pct(porAsoc)})`)
console.log(`  TAcristalamiento (junq/juntas) : ${porAcris} (${pct(porAcris)})`)
console.log(`  Mano de obra (MO*)             : ${esMO} (${pct(esMO)})`)
console.log(`  Sin fuente identificada        : ${resto} (${pct(resto)})`)

console.log('\n--- Sin fuente, más frecuentes (top 15) ---')
for (const [k, n] of [...restoDetalle.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${String(n).padStart(5)}  ${k}`)
}
