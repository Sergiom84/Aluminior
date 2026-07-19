/**
 * MEDICIÓN: ¿las opciones de herraje explican la selección de ConjuntosAsoc?
 *
 * El anexo K identificó las fuentes de los asociados (71,4% ConjuntosAsoc/
 * ConfigSeriesAsoc) pero dejó la SELECCIÓN sin implementar: había filas con el
 * mismo ComponenteAsoc donde una entraba y otra no. La hipótesis es que el
 * discriminante que falta es `nOpcion`, y que la verdad histórica está en
 * `VOpcionesHerraje` (TipoDoc+nDoc+nLinEstr+Conjunto+nOpcion+SelecSN).
 *
 * Este script mide, sobre las líneas reales del oráculo (VPresupuestosLin),
 * la precisión y cobertura del conjunto de ARTÍCULOS predicho al aplicar
 * filtros acumulativos sobre las filas candidatas de ConjuntosAsoc:
 *
 *   F0  cadena de la serie (baseline del anexo K)
 *   F1  + nOpcion contra las opciones marcadas de la línea
 *       (si la línea no tiene opciones registradas, se usan los defaults
 *        de ConjuntosOpcionesHerraje.SelecDefSN)
 *   F2  + MedidaMin/MedidaMax contra las medidas de la línea
 *   F3  + ArticuloAsoc presente entre los artículos reales de la línea
 *   F4  + ComponenteAsoc numérico presente en la plantilla de la estructura
 *
 * Los "reales" se limitan a los artículos que existen en ConjuntosAsoc:
 * mano de obra, junquillos/juntas (TAcristalamiento) y compactos (elección
 * del usuario) tienen otra fuente y contaminarían la medida de selección.
 *
 * NO valora nada; solo mide. Solo lectura.
 * Uso: node scripts/medir-opciones-herraje.mjs
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
const num = (f, n) => Number(col(f, n).replace(',', '.')) || 0

const conjuntos = leer('Conjuntos.csv')
const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const opcionesDoc = leer('VOpcionesHerraje.csv')
const opcionesCat = leer('ConjuntosOpcionesHerraje.csv')
const datosLin = leer('VDatosLinEstr.csv')
const vLin = leer('VPresupuestosLin.csv')
const articulos = leer('Articulos.csv')
const estrArt = leer('EstructurasArticulos.csv')

// plantilla de cada estructura: componentes (genéricos) presentes
const slotsPorEstructura = new Map()
for (const f of estrArt) {
  if (col(f, 'TipoDoc')) continue // instancia de documento, no plantilla
  const e = col(f, 'Estructura'), a = col(f, 'Articulo')
  if (!e || !a) continue
  if (!slotsPorEstructura.has(e)) slotsPorEstructura.set(e, new Set())
  slotsPorEstructura.get(e).add(a)
}

const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

// --- cadena de delegación (igual que anexos J/K) ---
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

// --- opciones marcadas por línea histórica (VPRES = presupuestos) ---
// clave: nDoc|nLinea  ->  Map(conjunto -> Set(nOpcion marcadas))
const opcionesPorLinea = new Map()
for (const f of opcionesDoc) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcionesPorLinea.has(k)) opcionesPorLinea.set(k, new Map())
  const porConj = opcionesPorLinea.get(k)
  const cj = col(f, 'Conjunto')
  if (!porConj.has(cj)) porConj.set(cj, new Set())
  if (col(f, 'SelecSN') === 'True') porConj.get(cj).add(col(f, 'nOpcion'))
}

// --- defaults del catálogo: conjunto -> Set(nOpcion con SelecDefSN) ---
const defaultsPorConjunto = new Map()
for (const f of opcionesCat) {
  const cj = col(f, 'Conjunto')
  if (!defaultsPorConjunto.has(cj)) defaultsPorConjunto.set(cj, new Set())
  if (col(f, 'SelecDefSN') === 'True') defaultsPorConjunto.get(cj).add(col(f, 'nOpcion'))
}

// --- candidatas de ConjuntosAsoc por conjunto ---
const asocPorConjunto = new Map()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto')
  if (!cj || !col(f, 'Articulo') || col(f, 'Articulo') === '0') continue
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
}

// --- oráculo ---
const seriePorLinea = new Map()
for (const f of datosLin) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
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

// población atribuible a ConjuntosAsoc: sus artículos
const poblacionAsoc = new Set()
for (const f of conjuntosAsoc) {
  const a = col(f, 'Articulo')
  if (a && a !== '0') poblacionAsoc.add(a)
}

const NIVELES = ['F0 cadena', 'F1 +nOpcion', 'F2 +medidas', 'F3 +ArticuloAsoc', 'F4 +Componente']
const stats = NIVELES.map(() => ({ tp: 0, fp: 0, fn: 0, exactas: 0 }))
let lineas = 0, lineasConOpciones = 0
const fnFrecuentes = new Map() // artículos reales que F1 deja fuera
const fpFrecuentes = new Map() // artículos que F3 predice de más

for (const p of padres) {
  const clave = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const serie = seriePorLinea.get(clave)
  if (!serie) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []

  // reales: artículos asociados (ni perfil ni vidrio/panel) que además
  // pertenecen a la población de ConjuntosAsoc (selección, no fuente)
  const reales = new Set()
  const todosArtLinea = new Set()
  for (const h of hijas) {
    const art = col(h, 'Articulo')
    if (!art || art === '0') continue
    todosArtLinea.add(art)
    if (FUNCIONES_PERFIL.has(col(h, 'Funcion'))) continue
    const fam = famPorArt.get(art) ?? ''
    if (fam === '050' || fam === '051') continue
    if (!poblacionAsoc.has(art)) continue
    reales.add(art)
  }
  if (!reales.size) continue
  lineas++
  const slots = slotsPorEstructura.get(col(p, 'Articulo')) ?? new Set()

  const opciones = opcionesPorLinea.get(clave)
  if (opciones) lineasConOpciones++
  const largo = num(p, 'Largo'), ancho = num(p, 'Ancho')

  // filas candidatas con los cuatro niveles de filtro
  const predicho = NIVELES.map(() => new Set())
  for (const cj of cadena(serie)) {
    for (const f of asocPorConjunto.get(cj) ?? []) {
      const art = col(f, 'Articulo')
      predicho[0].add(art)

      // F1: nOpcion
      const nOp = col(f, 'nOpcion')
      if (nOp && nOp !== '0') {
        const marcadas = opciones?.get(cj) ?? defaultsPorConjunto.get(cj) ?? new Set()
        if (!marcadas.has(nOp)) continue
      }
      predicho[1].add(art)

      // F2: medidas (si el rango existe, alguna dimensión debe caber)
      const min = num(f, 'MedidaMin'), max = num(f, 'MedidaMax')
      if (max > 0) {
        const cabe = (d) => d >= min && d <= max
        if (!(cabe(largo) || cabe(ancho))) continue
      }
      predicho[2].add(art)

      // F3: ArticuloAsoc condicionado a la presencia de otro artículo
      const artAsoc = col(f, 'ArticuloAsoc')
      if (artAsoc && artAsoc !== '0' && !todosArtLinea.has(artAsoc)) continue
      predicho[3].add(art)

      // F4: ComponenteAsoc numérico debe existir en la plantilla
      const comp = col(f, 'ComponenteAsoc')
      if (comp && /^\d+$/.test(comp) && !slots.has(comp)) continue
      predicho[4].add(art)
    }
  }

  for (let i = 0; i < NIVELES.length; i++) {
    let tp = 0
    for (const a of reales) {
      if (predicho[i].has(a)) tp++
      else if (i === 1) fnFrecuentes.set(a, (fnFrecuentes.get(a) ?? 0) + 1)
    }
    const fp = predicho[i].size - tp
    stats[i].tp += tp
    stats[i].fp += fp
    stats[i].fn += reales.size - tp
    if (fp === 0 && tp === reales.size) stats[i].exactas++
    if (i === NIVELES.length - 1) {
      for (const a of predicho[i]) {
        if (!reales.has(a)) fpFrecuentes.set(a, (fpFrecuentes.get(a) ?? 0) + 1)
      }
    }
  }
}

console.log(`Líneas del oráculo con asociados: ${lineas}`)
console.log(`  con opciones de herraje registradas: ${lineasConOpciones} (${(100 * lineasConOpciones / lineas).toFixed(1)}%)`)
console.log('\nNivel               precisión   cobertura   líneas exactas')
for (let i = 0; i < NIVELES.length; i++) {
  const s = stats[i]
  const prec = 100 * s.tp / (s.tp + s.fp)
  const cob = 100 * s.tp / (s.tp + s.fn)
  console.log(`  ${NIVELES[i].padEnd(18)} ${prec.toFixed(1).padStart(6)}%    ${cob.toFixed(1).padStart(6)}%    ${String(s.exactas).padStart(4)}/${lineas}`)
}

console.log('\n--- Reales que F1 (nOpcion) deja fuera con más frecuencia (top 15) ---')
for (const [a, n] of [...fnFrecuentes.entries()].sort((x, y) => y[1] - x[1]).slice(0, 15)) {
  console.log(`  ${String(n).padStart(5)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 45)}`)
}
console.log('\n--- Falsos positivos del último nivel más frecuentes (top 15) ---')
for (const [a, n] of [...fpFrecuentes.entries()].sort((x, y) => y[1] - x[1]).slice(0, 15)) {
  console.log(`  ${String(n).padStart(5)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 45)}`)
}
