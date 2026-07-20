/**
 * MEDICIÓN (solo lectura). ¿El RECUENTO de la junta perimetral de hoja se puede
 * reconstruir del oráculo, o está genuinamente bloqueado (T.15)?
 *
 * Contradicción:
 *  - Mapeo de asociados: recuento ABIERTO, medible con VDatosLinDetDis.
 *  - T.15/PROMPT-FABLE: los 5.158 tramos de junta NO tienen enlace de diseño
 *    (0 en VDatosLinDetDis) → BLOQUEADO.
 *  - PERO T.25.3/T.26 usan VDatosLinDetDis.Componente = JH/JV para las juntas.
 *
 * Se mide sobre los CSV, sin tocar nada. Uso: npx tsx scripts/medir-recuento-junta.mjs
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
const lleno = (v) => v !== undefined && v !== null && v !== '' && v !== '0'

const vLin = leer('VPresupuestosLin.csv')
const detalles = leer('VDatosLinDetDis.csv')
const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const estArt = leer('EstructurasArticulos.csv')

// ── Enlace 1:1 pieza↔detalle por nVLinea==nLinea (verificado T.24–T.29) ──
const detPorLinea = new Map(detalles.map((f) => [col(f, 'nVLinea'), f]))

// ── (0) Los artículos de junta según el mapeo de asociados (método T.15) ──
const ARTICULOS_JUNTA = new Set()
for (const f of conjuntosAsoc) {
  if (col(f, 'ComponenteAsoc') !== '!') continue
  const t = col(f, 'AsociadoA')
  if (t !== 'HOJAS' && t !== 'HOJAS (TODAS)') continue
  const art = col(f, 'Articulo')
  if (lleno(art)) ARTICULOS_JUNTA.add(art)
}
console.log(`Artículos de junta (ConjuntosAsoc '!' → HOJAS): ${ARTICULOS_JUNTA.size}`)

// ══ A. REPRODUCCIÓN DE T.15: junta = VLin con Articulo ∈ ARTICULOS_JUNTA ══
let a_total = 0, a_conDet = 0, a_conIdIt = 0
const a_comps = new Map()
for (const f of vLin) {
  if (!ARTICULOS_JUNTA.has(col(f, 'Articulo'))) continue
  a_total++
  const d = detPorLinea.get(col(f, 'nLinea'))
  if (!d) continue
  a_conDet++
  if (lleno(col(d, 'DisIdIt'))) a_conIdIt++
  const c = col(d, 'Componente') || '(vacío)'
  a_comps.set(c, (a_comps.get(c) || 0) + 1)
}
console.log(`\n═══ A. Método T.15 (junta por Articulo ∈ ARTICULOS_JUNTA) ═══`)
console.log(`  Tramos de junta:                ${a_total}`)
console.log(`  con fila en VDatosLinDetDis:    ${a_conDet}`)
console.log(`  con DisIdIt utilizable:         ${a_conIdIt}`)
console.log(`  Componente de los que SÍ enlazan:`)
for (const [c, n] of [...a_comps].sort((x, y) => y[1] - x[1])) console.log(`      ${c.padEnd(10)} ${n}`)

// ══ B. Junta por el ENLACE LIMPIO: det.Componente ∈ {JH, JV} (T.25/T.26) ══
const esJunta = (c) => /^J[HV]$/.test(c)
let b_total = 0, b_conIdIt = 0, b_conDisId = 0, b_conNHoja = 0, b_conIdHoja = 0
const b_porComp = new Map()
// Junta piece necesita nVLinea con fila hija en VLin (para largo/estructura)
const juntasLimpias = []
for (const d of detalles) {
  const c = col(d, 'Componente')
  if (!esJunta(c)) continue
  b_total++
  b_porComp.set(c, (b_porComp.get(c) || 0) + 1)
  if (lleno(col(d, 'DisIdIt'))) b_conIdIt++
  if (lleno(col(d, 'DisId'))) b_conDisId++
  if (lleno(col(d, 'DisNHoja'))) b_conNHoja++
  if (lleno(col(d, 'DisIdHoja'))) b_conIdHoja++
  juntasLimpias.push(d)
}
console.log(`\n═══ B. Método enlace limpio (VDatosLinDetDis.Componente ∈ {JH,JV}) ═══`)
console.log(`  Tramos de junta (filas de detalle): ${b_total}`)
for (const [c, n] of [...b_porComp].sort((x, y) => y[1] - x[1])) console.log(`      ${c.padEnd(6)} ${n}`)
console.log(`  con DisIdIt no nulo:   ${b_conIdIt}  (${(100*b_conIdIt/b_total).toFixed(1)}%)`)
console.log(`  con DisId  no nulo:    ${b_conDisId}  (${(100*b_conDisId/b_total).toFixed(1)}%)`)
console.log(`  con DisNHoja no nulo:  ${b_conNHoja}  (${(100*b_conNHoja/b_total).toFixed(1)}%)`)
console.log(`  con DisIdHoja no nulo: ${b_conIdHoja}  (${(100*b_conIdHoja/b_total).toFixed(1)}%)`)

// ¿Los tramos JH/JV tienen fila hija en VLin? ¿Y con Articulo?
const vLinPorLinea = new Map(vLin.map((f) => [col(f, 'nLinea'), f]))
let b_conHija = 0, b_hijaConArt = 0
for (const d of juntasLimpias) {
  const h = vLinPorLinea.get(col(d, 'nVLinea'))
  if (!h) continue
  b_conHija++
  if (lleno(col(h, 'Articulo'))) b_hijaConArt++
}
console.log(`  con fila hija en VLin:          ${b_conHija}`)
console.log(`    de ellas con Articulo≠0:     ${b_hijaConArt}`)

// ¿Cuántos de los JH/JV coinciden con la identificación por Articulo de T.15?
let solape = 0
for (const d of juntasLimpias) {
  const h = vLinPorLinea.get(col(d, 'nVLinea'))
  if (h && ARTICULOS_JUNTA.has(col(h, 'Articulo'))) solape++
}
console.log(`    de ellas cuyo Articulo ∈ ARTICULOS_JUNTA (T.15): ${solape}`)

// ══ C. RECUENTO por línea: tramos de junta JH/JV vs piezas de hoja HV/HH ══
// Piezas de hoja reales por estructura (línea padre) usando det.Componente
// Enlace: cada fila hija VLin → su detalle → Componente. Hoja = Funcion HV/HH.
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!lleno(p)) continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}
// Set de componentes de hoja: por Funcion de la fila hija
let lineasConJunta = 0
const distrib = new Map() // "nJunta:nHoja" -> nLíneas
let sumJunta = 0, sumHoja = 0
let lineas1a1 = 0, lineasNo1a1 = 0
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  let nJunta = 0, nHoja = 0
  for (const h of hijas) {
    const d = detPorLinea.get(col(h, 'nLinea'))
    const comp = d ? col(d, 'Componente') : ''
    const fn = col(h, 'Funcion')
    if (esJunta(comp)) nJunta++
    if (fn === 'HV' || fn === 'HH') nHoja++
  }
  if (nJunta === 0) continue
  lineasConJunta++
  sumJunta += nJunta; sumHoja += nHoja
  if (nJunta === nHoja) lineas1a1++; else lineasNo1a1++
  const k = `${nJunta}:${nHoja}`
  distrib.set(k, (distrib.get(k) || 0) + 1)
}
console.log(`\n═══ C. Recuento por línea: nº tramos junta (JH/JV) vs nº piezas hoja (HV/HH) ═══`)
console.log(`  Líneas con junta:               ${lineasConJunta}`)
console.log(`  Σ tramos junta:                 ${sumJunta}`)
console.log(`  Σ piezas hoja:                  ${sumHoja}`)
console.log(`  Líneas con nJunta == nHoja (1:1): ${lineas1a1}`)
console.log(`  Líneas con nJunta != nHoja:       ${lineasNo1a1}`)
console.log(`  Distribución nJunta:nHoja (top 15):`)
for (const [k, n] of [...distrib].sort((x, y) => y[1] - x[1]).slice(0, 15))
  console.log(`      ${k.padEnd(8)} ${n} líneas`)

// ══ D. ¿La PLANTILLA (EstructurasArticulos) encodea la junta? ══
// Si el motor puede predecir el recuento, la plantilla debe tener filas JH/JV
// (por Funcion o DisComponente) con su FormulaCdad, por estructura.
let d_funcJ = 0, d_discJ = 0
const d_plantillaPorEstr = new Map() // estructura -> nº filas JH/JV plantilla
const d_funcVals = new Map(), d_discVals = new Map()
for (const f of estArt) {
  if (lleno(col(f, 'TipoDoc'))) continue // solo plantilla de catálogo
  const fn = col(f, 'Funcion')
  const dc = col(f, 'DisComponente')
  if (fn) d_funcVals.set(fn, (d_funcVals.get(fn) || 0) + 1)
  const esJ = esJunta(fn) || esJunta(dc)
  if (esJunta(fn)) d_funcJ++
  if (esJunta(dc)) d_discJ++
  if (esJ) {
    const e = col(f, 'Estructura')
    d_plantillaPorEstr.set(e, (d_plantillaPorEstr.get(e) || 0) + 1)
  }
}
console.log(`\n═══ D. ¿La plantilla EstructurasArticulos encodea la junta? ═══`)
console.log(`  Filas de plantilla con Funcion JH/JV:       ${d_funcJ}`)
console.log(`  Filas de plantilla con DisComponente JH/JV: ${d_discJ}`)
console.log(`  Estructuras (catálogo) con fila de junta:   ${d_plantillaPorEstr.size}`)
// ¿La cuenta de plantilla predice la cuenta de instancia por estructura?
// Comparar, para las estructuras usadas, nº filas junta plantilla vs media instancia.
const instJuntaPorEstr = new Map() // estructura -> [conteos por línea]
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const est = col(p, 'Articulo')
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  let nJ = 0
  for (const h of hijas) {
    const d = detPorLinea.get(col(h, 'nLinea'))
    if (d && esJunta(col(d, 'Componente'))) nJ++
  }
  if (nJ === 0) continue
  if (!instJuntaPorEstr.has(est)) instJuntaPorEstr.set(est, [])
  instJuntaPorEstr.get(est).push(nJ)
}
let coincide = 0, difiere = 0, sinPlantilla = 0
for (const [est, arr] of instJuntaPorEstr) {
  const plant = d_plantillaPorEstr.get(est)
  if (plant === undefined) { sinPlantilla++; continue }
  // instancia constante por estructura?
  const uniq = new Set(arr)
  if (uniq.size === 1 && [...uniq][0] === plant) coincide++
  else difiere++
}
console.log(`  Estructuras usadas con junta en instancia:  ${instJuntaPorEstr.size}`)
console.log(`    plantilla predice el recuento exacto:     ${coincide}`)
console.log(`    plantilla existe pero difiere:            ${difiere}`)
console.log(`    sin fila de junta en plantilla:           ${sinPlantilla}`)

console.log(`\n(regla 7) Nulos impresos arriba explícitamente. Enlace: nVLinea==nLinea 1:1.`)
