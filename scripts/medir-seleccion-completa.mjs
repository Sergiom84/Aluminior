/**
 * MEDICIÓN: predictor completo de la selección de ConjuntosAsoc (anexo R).
 *
 * Modelo descubierto en R.4 + inspección de los cerraderos de HU531:
 *   - Las filas de un conjunto son ACUMULATIVAS, no excluyentes: cada fila
 *     que pasa sus condiciones aporta su Cantidad (puede ser 0 o negativa —
 *     correcciones: la hoja pasiva RESTA los cerraderos que añadió la
 *     cremona).
 *   - Condiciones por fila: nOpcion marcada en la línea, y MedidaMin/Max
 *     contra una dimensión de la HOJA (el eje no está en la fila: se
 *     APRENDE por consistencia, como los galces).
 *
 * Para aislar la semántica, los conjuntos candidatos de cada línea son los
 * que su histórico registró en VOpcionesHerraje (no la cadena completa).
 *
 * Fase 1 (aprender): para cada (Conjunto, ComponenteAsoc) con rangos, elegir
 * el eje (HHx = ancho de hoja, HVx = alto de hoja, L, A) que mejor explica
 * la presencia histórica.
 * Fase 2 (predecir): artículo → suma de cantidades de las filas que pasan.
 * Métrica: precisión/cobertura de artículos, líneas con el CONJUNTO exacto
 * de artículos, y líneas exactas también en cantidad.
 *
 * Solo lectura. Uso: node scripts/medir-seleccion-completa.mjs
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

const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const opcionesDoc = leer('VOpcionesHerraje.csv')
const datosLin = leer('VDatosLinEstr.csv')
const vLin = leer('VPresupuestosLin.csv')
const articulos = leer('Articulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

// --- candidatas por conjunto ---
const asocPorConjunto = new Map()
const poblacionAsoc = new Set()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  poblacionAsoc.add(art)
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
}

// --- opciones marcadas por línea (VPRES) ---
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

// --- preparar por línea: dims, opciones, reales ---
const lineas = []
for (const p of padres) {
  const clave = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const opciones = opcionesPorLinea.get(clave)
  if (!opciones) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const cortesHH = [], cortesHV = []
  const reales = new Map() // articulo -> cantidad total
  for (const h of hijas) {
    const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
    const lc = num(h, 'LargoCorte')
    if (fn === 'HH' && lc) cortesHH.push(lc)
    if (fn === 'HV' && lc) cortesHV.push(lc)
    if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
    const fam = famPorArt.get(art) ?? ''
    if (fam === '050' || fam === '051') continue
    if (!poblacionAsoc.has(art)) continue
    reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
  }
  if (!reales.size) continue
  lineas.push({
    clave, opciones, reales,
    dims: {
      L: num(p, 'Largo'), A: num(p, 'Ancho'),
      HHx: cortesHH.length ? Math.max(...cortesHH) : 0,
      HVx: cortesHV.length ? Math.max(...cortesHV) : 0,
    },
  })
}
console.log(`Líneas del oráculo con opciones y asociados: ${lineas.length}`)

// filas candidatas que pasan el filtro de opción para una línea
function filasActivas(linea, ejePorGrupo) {
  const activas = []
  for (const [cj, marcadas] of linea.opciones) {
    for (const f of asocPorConjunto.get(cj) ?? []) {
      const nOp = col(f, 'nOpcion')
      if (nOp && nOp !== '0' && !marcadas.has(nOp)) continue
      const min = num(f, 'MedidaMin'), max = num(f, 'MedidaMax')
      if (max > 0) {
        const eje = ejePorGrupo?.get(`${cj}|${col(f, 'ComponenteAsoc')}`)
        if (eje) {
          const d = linea.dims[eje]
          if (!(d >= min && d <= max)) continue
        } else if (ejePorGrupo) {
          // grupo con rango pero sin eje aprendido: se acepta (se mide el coste)
        }
      }
      activas.push(f)
    }
  }
  return activas
}

// --- Fase 1: aprender el eje por (Conjunto|ComponenteAsoc) ---
// Para cada grupo con rangos, probar cada eje: una fila con rango bajo ese
// eje debería estar "dentro" exactamente cuando su artículo aparece (para
// filas con Cantidad > 0 y opción marcada).
const EJES = ['HHx', 'HVx', 'L', 'A']
const votos = new Map() // grupo -> {eje: {aciertos, casos}}
for (const linea of lineas) {
  for (const f of filasActivas(linea, null)) {
    const max = num(f, 'MedidaMax')
    if (max <= 0 || num(f, 'Cantidad') <= 0) continue
    const grupo = `${col(f, 'Conjunto')}|${col(f, 'ComponenteAsoc')}`
    const presente = linea.reales.has(col(f, 'Articulo'))
    const min = num(f, 'MedidaMin')
    if (!votos.has(grupo)) votos.set(grupo, Object.fromEntries(EJES.map((e) => [e, { ok: 0, n: 0 }])))
    const v = votos.get(grupo)
    for (const eje of EJES) {
      const dentro = linea.dims[eje] >= min && linea.dims[eje] <= max
      v[eje].n++
      if (dentro === presente) v[eje].ok++
    }
  }
}
const ejePorGrupo = new Map()
let gruposConEje = 0, gruposSinEje = 0
for (const [grupo, v] of votos) {
  let mejor = null, tasa = 0
  for (const eje of EJES) {
    if (v[eje].n >= 5 && v[eje].ok / v[eje].n > tasa) { tasa = v[eje].ok / v[eje].n; mejor = eje }
  }
  if (mejor && tasa >= 0.9) { ejePorGrupo.set(grupo, mejor); gruposConEje++ }
  else gruposSinEje++
}
console.log(`Ejes aprendidos: ${gruposConEje} grupos (≥90%); sin eje fiable: ${gruposSinEje}`)

// --- Fase 2: predecir y medir ---
let tp = 0, fp = 0, fn = 0
let exactasArt = 0, exactasCdad = 0
const fpFrec = new Map(), fnFrec = new Map()
for (const linea of lineas) {
  const predicho = new Map() // articulo -> cantidad
  for (const f of filasActivas(linea, ejePorGrupo)) {
    const art = col(f, 'Articulo')
    predicho.set(art, (predicho.get(art) ?? 0) + num(f, 'Cantidad'))
  }
  for (const [art, cdad] of [...predicho]) if (cdad <= 0) predicho.delete(art)

  let iguales = 0
  for (const art of linea.reales.keys()) {
    if (predicho.has(art)) { tp++; iguales++ }
    else { fn++; fnFrec.set(art, (fnFrec.get(art) ?? 0) + 1) }
  }
  for (const art of predicho.keys()) {
    if (!linea.reales.has(art)) { fp++; fpFrec.set(art, (fpFrec.get(art) ?? 0) + 1) }
  }
  if (iguales === linea.reales.size && predicho.size === linea.reales.size) {
    exactasArt++
    let cdadOk = true
    for (const [art, cdad] of linea.reales) {
      if (Math.abs((predicho.get(art) ?? 0) - cdad) > 0.01) { cdadOk = false; break }
    }
    if (cdadOk) exactasCdad++
  }
}
console.log(`\nPrecisión artículos: ${(100 * tp / (tp + fp)).toFixed(1)}%   cobertura: ${(100 * tp / (tp + fn)).toFixed(1)}%`)
console.log(`Líneas con conjunto de artículos EXACTO: ${exactasArt}/${lineas.length}`)
console.log(`  … y además cantidades exactas: ${exactasCdad}/${lineas.length}`)

const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
console.log('\n--- Falsos positivos más frecuentes ---')
for (const [a, n] of top(fpFrec)) console.log(`  ${String(n).padStart(5)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 40)}`)
console.log('\n--- Reales no predichos más frecuentes ---')
for (const [a, n] of top(fnFrec)) console.log(`  ${String(n).padStart(5)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 40)}`)
