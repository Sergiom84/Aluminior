/**
 * MEDICIÓN v2: selección de asociados anclada a las RANURAS del despiece.
 *
 * Descubrimiento: las instancias de EstructurasArticulos conservan las
 * ranuras genéricas de asociados con su DisComponente (105 infHAesc → 58,
 * 156 infZApert → 71, 148 infMOmof → 39…), y 50 de los 54 valores de
 * ComponenteAsoc son exactamente esos DisComponente. La selección es el
 * mismo mecanismo que los perfiles: la plantilla pone la ranura y
 * ConjuntosAsoc la resuelve con condiciones (nOpcion, medidas).
 *
 * Predictor por línea del oráculo:
 *   ranuras = DisComponente de su instancia (con nº de apariciones)
 *   filas   = ConjuntosAsoc de los conjuntos con opciones registradas
 *             cuyo ComponenteAsoc sea una ranura presente ('!', 'A', 'L'
 *             se miden aparte), con nOpcion marcada y medida en rango
 *             (eje aprendido por grupo, ≥90%)
 *   cantidad por artículo = Σ Cantidad de fila   [hipótesis H1]
 *                         = Σ Cantidad × apariciones de la ranura  [H2]
 *
 * Solo lectura. Uso: node scripts/medir-seleccion-v2.mjs
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
const vLin = leer('VPresupuestosLin.csv')
const articulos = leer('Articulos.csv')
const estArt = leer('EstructurasArticulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

// --- ranuras por línea instanciada (VPRES) ---
const ranurasPorLinea = new Map() // nDoc|nLinEstr -> Map(DisComponente -> apariciones)
for (const f of estArt) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  const dis = col(f, 'DisComponente')
  if (!dis || dis === '0') continue
  if (!ranurasPorLinea.has(k)) ranurasPorLinea.set(k, new Map())
  const m = ranurasPorLinea.get(k)
  m.set(dis, (m.get(dis) ?? 0) + (num(f, 'Cantidad') || 1))
}

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

// --- opciones por línea ---
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
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const padres = vLin.filter((f) => col(f, 'EstructuraSN') === 'True')
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

const lineas = []
for (const p of padres) {
  const clave = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const opciones = opcionesPorLinea.get(clave)
  const ranuras = ranurasPorLinea.get(clave)
  if (!opciones || !ranuras) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const cortesHH = [], cortesHV = []
  const reales = new Map()
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
    clave, opciones, ranuras, reales,
    dims: {
      L: num(p, 'Largo'), A: num(p, 'Ancho'),
      HHx: cortesHH.length ? Math.max(...cortesHH) : 0,
      HVx: cortesHV.length ? Math.max(...cortesHV) : 0,
    },
  })
}
console.log(`Líneas con opciones, instancia y asociados: ${lineas.length}`)

const ESPECIALES = new Set(['!', 'A', 'L', '59R'])

function* filasCandidatas(linea) {
  for (const [cj] of linea.opciones) {
    for (const f of asocPorConjunto.get(cj) ?? []) {
      const comp = col(f, 'ComponenteAsoc')
      if (ESPECIALES.has(comp)) continue // se miden aparte
      if (comp && !linea.ranuras.has(comp)) continue
      const marcadas = linea.opciones.get(cj)
      const nOp = col(f, 'nOpcion')
      if (nOp && nOp !== '0' && !marcadas.has(nOp)) continue
      yield f
    }
  }
}

// --- fase 1: aprender eje por (Conjunto|ComponenteAsoc) ---
const EJES = ['HHx', 'HVx', 'L', 'A']
const votos = new Map()
for (const linea of lineas) {
  for (const f of filasCandidatas(linea)) {
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
for (const [grupo, v] of votos) {
  let mejor = null, tasa = 0
  for (const eje of EJES) {
    if (v[eje].n >= 5 && v[eje].ok / v[eje].n > tasa) { tasa = v[eje].ok / v[eje].n; mejor = eje }
  }
  if (mejor && tasa >= 0.9) ejePorGrupo.set(grupo, mejor)
}
console.log(`Ejes aprendidos (≥90%): ${ejePorGrupo.size} de ${votos.size} grupos con rango`)

// --- fase 2: predicción ---
for (const HIP of ['H1 cantidad de fila', 'H2 fila × apariciones de ranura']) {
  let tp = 0, fp = 0, fn = 0, exactasArt = 0, exactasCdad = 0
  const fpFrec = new Map(), fnFrec = new Map()
  for (const linea of lineas) {
    const predicho = new Map()
    for (const f of filasCandidatas(linea)) {
      const min = num(f, 'MedidaMin'), max = num(f, 'MedidaMax')
      if (max > 0) {
        const eje = ejePorGrupo.get(`${col(f, 'Conjunto')}|${col(f, 'ComponenteAsoc')}`)
        if (eje && !(linea.dims[eje] >= min && linea.dims[eje] <= max)) continue
      }
      const art = col(f, 'Articulo')
      const mult = HIP.startsWith('H2') ? (linea.ranuras.get(col(f, 'ComponenteAsoc')) ?? 1) : 1
      predicho.set(art, (predicho.get(art) ?? 0) + num(f, 'Cantidad') * mult)
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
      let ok = true
      for (const [art, cdad] of linea.reales) {
        if (Math.abs((predicho.get(art) ?? 0) - cdad) > 0.01) { ok = false; break }
      }
      if (ok) exactasCdad++
    }
  }
  console.log(`\n=== ${HIP} ===`)
  console.log(`Precisión: ${(100 * tp / (tp + fp)).toFixed(1)}%   cobertura: ${(100 * tp / (tp + fn)).toFixed(1)}%`)
  console.log(`Líneas exactas en artículos: ${exactasArt}/${lineas.length}   y en cantidades: ${exactasCdad}/${lineas.length}`)
  const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
  console.log('FP frecuentes: ' + top(fpFrec).map(([a, n]) => `${a}×${n}`).join('  '))
  console.log('FN frecuentes: ' + top(fnFrec).map(([a, n]) => `${a}×${n}`).join('  '))
}
