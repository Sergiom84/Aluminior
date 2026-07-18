/**
 * VALIDACIÓN CONTRA EL ORÁCULO, versión 2 (la buena)
 *
 * El despiece RESUELTO vive en VPresupuestosLin: la línea padre tiene
 * EstructuraSN=True y Articulo = código de estructura; las hijas tienen
 * nEstr = nLinea del padre, y llevan el perfil REAL con su Funcion.
 * La serie de la línea sale de VDatosLinEstr (nVLinea = nLinea del padre).
 *
 * Mecanismo bajo prueba:
 *   plantilla(estructura) da ranuras (DisComponente, Funcion)
 *   predicción = ConjuntosLin[conjunto ∈ cadena(serie)][DisComponente]
 *
 * Comparación por (línea, Funcion) sobre las funciones de PERFIL
 * (MV, MH, HV, HH, TM…): conjunto de artículos predichos frente a conjunto
 * de artículos reales.
 *
 * Solo lectura. Uso: node scripts/validar-oraculo2.mjs
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
const conjuntosLin = leer('ConjuntosLin.csv')
const datosLin = leer('VDatosLinEstr.csv')
const estArt = leer('EstructurasArticulos.csv')
const vLin = leer('VPresupuestosLin.csv')

// --- resolución ---
const porConjunto = new Map()
for (const f of conjuntosLin) {
  const cj = col(f, 'Conjunto'), comp = col(f, 'Componente'), art = col(f, 'Articulo')
  if (!cj || !comp || !art || art === '0') continue
  if (!porConjunto.has(cj)) porConjunto.set(cj, new Map())
  porConjunto.get(cj).set(comp, art)
}
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
// Devuelve TODOS los candidatos: componente exacto y variantes de
// acristalamiento comp.1 (sencillo) / comp.2 (doble). Medimos si el espacio
// de candidatos contiene el artículo real; el selector de variante se
// identifica después.
const resolver = (serie, comp) => {
  const out = new Set()
  for (const cj of cadena(serie)) {
    for (const k of [comp, `${comp}.1`, `${comp}.2`]) {
      const a = porConjunto.get(cj)?.get(k)
      if (a) out.add(a)
    }
  }
  return out.size ? [...out] : null
}

// --- plantillas: estructura -> ranuras únicas (comp, funcion) ---
const plantillas = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura')
  if (!plantillas.has(e)) plantillas.set(e, [])
  plantillas.get(e).push({ comp: col(f, 'DisComponente'), fn: col(f, 'Funcion') })
}

// --- serie por línea padre ---
const seriePorLinea = new Map()
for (const f of datosLin) {
  seriePorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}

// --- documentos: padres e hijas ---
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const padres = vLin.filter((f) => col(f, 'EstructuraSN') === 'True')
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}
console.log(`Líneas de estructura (padres): ${padres.length}`)

// --- validación ---
let lineasEval = 0, lineasSinSerie = 0, lineasSinPlantilla = 0
let fnOK = 0, fnFallo = 0, fnHueco = 0, fnExtra = 0
const fallosDetalle = new Map()
const huecosDetalle = new Map()

for (const p of padres) {
  const nLinea = col(p, 'nLinea')
  const estructura = col(p, 'Articulo')
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${nLinea}`)
  const hijas = hijasPorPadre.get(nLinea) ?? []
  if (!serie) { lineasSinSerie++; continue }
  const plantilla = plantillas.get(estructura)
  if (!plantilla) { lineasSinPlantilla++; continue }
  lineasEval++

  // reales por función (solo perfiles con artículo real)
  const realPorFn = new Map()
  for (const h of hijas) {
    const fn = col(h, 'Funcion'), art = col(h, 'Articulo')
    if (!FUNCIONES_PERFIL.has(fn) || !art || art === '0') continue
    if (!realPorFn.has(fn)) realPorFn.set(fn, new Set())
    realPorFn.get(fn).add(art)
  }
  // predichos por función
  const predPorFn = new Map()
  for (const { comp, fn } of plantilla) {
    if (!FUNCIONES_PERFIL.has(fn) || !comp) continue
    const as = resolver(serie, comp)
    if (!predPorFn.has(fn)) predPorFn.set(fn, new Set())
    if (as) for (const a of as) predPorFn.get(fn).add(a)
  }
  // comparar
  for (const [fn, reales] of realPorFn) {
    const preds = predPorFn.get(fn) ?? new Set()
    for (const r of reales) {
      if (preds.has(r)) fnOK++
      else if (preds.size === 0) {
        fnHueco++
        const k = `${serie} ${estructura} ${fn} real:${r}`
        huecosDetalle.set(k, (huecosDetalle.get(k) ?? 0) + 1)
      } else {
        fnFallo++
        const k = `${serie} ${estructura} ${fn} real:${r} pred:${[...preds].join(',')}`
        fallosDetalle.set(k, (fallosDetalle.get(k) ?? 0) + 1)
      }
    }
    for (const a of preds) if (!reales.has(a)) fnExtra++
  }
}

console.log(`Líneas evaluadas: ${lineasEval} (sin serie: ${lineasSinSerie}, sin plantilla: ${lineasSinPlantilla})`)
const total = fnOK + fnFallo + fnHueco
console.log(`\n=== Artículos de perfil, por (línea, función) ===`)
console.log(`Coincide      : ${fnOK} (${(100 * fnOK / total).toFixed(1)}%)`)
console.log(`FALLA         : ${fnFallo} (${(100 * fnFallo / total).toFixed(1)}%)  <- predice otro perfil`)
console.log(`Hueco         : ${fnHueco} (${(100 * fnHueco / total).toFixed(1)}%)  <- sin predicción`)
console.log(`Predicho de más (real no lo usa): ${fnExtra}`)

console.log(`\n--- Fallos más frecuentes (top 20) ---`)
for (const [k, n] of [...fallosDetalle.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  console.log(`  ${String(n).padStart(5)}  ${k}`)
}
console.log(`\n--- Huecos más frecuentes (top 10) ---`)
for (const [k, n] of [...huecosDetalle.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${String(n).padStart(5)}  ${k}`)
}
