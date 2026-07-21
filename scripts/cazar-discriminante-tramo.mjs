/**
 * T.51 (medición): caza del DISCRIMINANTE DE TRAMO en el herraje de
 * oscilobatiente (compás/cremona/tirante). S.9.1/T.49 dejaron probado que la
 * medida evaluada de la ranura NO discrimina el tramo: una misma medida
 * evaluada mapea a dos tramos reales distintos. Aquí se buscan discriminantes
 * en fuentes AÚN NO usadas por el predictor v5:
 *   1. Cotas por-hoja del árbol EstructurasDiseño (Cota/Simbolo, y geometría
 *      de hoja Hc/Hd/Ld/Hi/Li/altManilla/PlHojasX/Y/TipoHoja/nHoja).
 *   2. Columnas de la instancia de la ranura (DisManoID, DisIdHoja,
 *      DisTipoHoja, nº de apariciones/tramos de la ranura).
 *   3. Encadenamiento: cantidad real de los OTROS asociados de la línea
 *      (cremona / puntos de cierre hermanos ya presentes).
 *
 * Test de determinismo: para la familia solapada con más oráculo, ¿algún dato
 * oracle-observable separa los tramos que la medida evaluada no separa?
 *
 * Solo lectura. Uso: npx tsx scripts/cazar-discriminante-tramo.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { evaluar } from '../packages/core/src/despiece/formula.ts'

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
const articulos = leer('Articulos.csv')
const estArt = leer('EstructurasArticulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]

// --- familias de tramos con rangos SOLAPADOS ---
const familias = new Map()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  if (num(f, 'MedidaMax') <= 0) continue
  const k = `${cj}|${col(f, 'ComponenteAsoc')}|${col(f, 'nOpcion')}`
  if (!familias.has(k)) familias.set(k, [])
  familias.get(k).push(f)
}
const familiasSolapadas = new Map()
for (const [k, filas] of familias) {
  const arts = new Set(filas.map((f) => col(f, 'Articulo')))
  if (arts.size < 2) continue
  // ¿algún par de tramos con rangos que se solapan?
  const rangos = filas.map((f) => [num(f, 'MedidaMin'), num(f, 'MedidaMax'), col(f, 'Articulo')])
  let solapa = false
  for (let i = 0; i < rangos.length; i++) for (let j = i + 1; j < rangos.length; j++) {
    if (rangos[i][2] === rangos[j][2]) continue
    const [a1, b1] = rangos[i], [a2, b2] = rangos[j]
    if (a1 <= b2 && a2 <= b1) solapa = true
  }
  if (solapa) familiasSolapadas.set(k, filas)
}
console.log(`Familias de tramos con >=2 arts: ${[...familias].filter(([, fs]) => new Set(fs.map((f) => col(f, 'Articulo'))).size >= 2).length}`)
console.log(`Familias con rangos SOLAPADOS: ${familiasSolapadas.size}`)

// --- plantilla ranuras ---
const ranurasPlantilla = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const comp = col(f, 'DisComponente')
  if (!comp || comp === '0') continue
  const e = col(f, 'Estructura')
  if (!ranurasPlantilla.has(e)) ranurasPlantilla.set(e, new Map())
  const m = ranurasPlantilla.get(e)
  if (!m.has(comp)) m.set(comp, [])
  m.get(comp).push({ formula: col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo'), mano: col(f, 'DisManoID') })
}

// cotas plantilla + instancia (símbolo -> valor, nivel línea) + índice símbolo->id
const cotasDefecto = new Map()
const simboloPorId = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura'); const simbolo = col(f, 'Simbolo')
  if (!simbolo) continue
  if (!cotasDefecto.has(e)) cotasDefecto.set(e, {})
  cotasDefecto.get(e)[simbolo] = num(f, 'Cota')
  const id = col(f, 'Id'); if (id) simboloPorId.set(`${e}|${id}`, simbolo)
}
const cotasInstancia = new Map()
// NODOS de instancia por línea: geometría por-hoja del árbol
const nodosInstancia = new Map() // k -> [ {idHoja,nHoja,TipoHoja,Cota,Simbolo,Hc,Hd,Ld,Hi,Li,altManilla,PlHojasX,PlHojasY,Tipo} ]
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const e = col(f, 'Estructura')
  const simbolo = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (simbolo) {
    if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
    cotasInstancia.get(k)[simbolo] = num(f, 'Cota')
  }
  if (!nodosInstancia.has(k)) nodosInstancia.set(k, [])
  nodosInstancia.get(k).push({
    Id: col(f, 'Id'), Tipo: col(f, 'Tipo'), idHoja: col(f, 'idHoja'), nHoja: col(f, 'nHoja'),
    TipoHoja: col(f, 'TipoHoja'), TipoTrav: col(f, 'TipoTrav'), Cota: num(f, 'Cota'), Simbolo: simbolo,
    Hc: num(f, 'Hc'), Hd: num(f, 'Hd'), Ld: num(f, 'Ld'), Hi: num(f, 'Hi'), Li: num(f, 'Li'),
    altManilla: num(f, 'altManilla'), PlHojasX: num(f, 'PlHojasX'), PlHojasY: num(f, 'PlHojasY'),
    TipoCorredera: col(f, 'TipoCorredera'), bApertExt: col(f, 'bApertExt'), moVP: col(f, 'moVP'),
  })
}
const simboloDa = new Map(estructurasDa.map((f) => [`${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA')]))
for (const f of medidasDa) {
  const simbolo = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!simbolo) continue
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Medida')
}

const opcionesPorLinea = new Map()
for (const f of opcionesDoc) {
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcionesPorLinea.has(k)) opcionesPorLinea.set(k, new Map())
  const porConj = opcionesPorLinea.get(k)
  const cj = col(f, 'Conjunto')
  if (!porConj.has(cj)) porConj.set(cj, new Set())
  if (col(f, 'SelecSN') === 'True') porConj.get(cj).add(col(f, 'nOpcion'))
}

// instancia de ranuras + detalle por ranura (mano, idHoja, tipoHoja)
const ranurasInstancia = new Map()
const ranuraDetalle = new Map() // k -> comp -> [ {mano, idHoja, tipoHoja} ]
for (const f of estArt) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const dis = col(f, 'DisComponente')
  if (!dis || dis === '0') continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!ranurasInstancia.has(k)) ranurasInstancia.set(k, new Map())
  ranurasInstancia.get(k).set(dis, (ranurasInstancia.get(k).get(dis) ?? 0) + (num(f, 'Cantidad') || 1))
  if (!ranuraDetalle.has(k)) ranuraDetalle.set(k, new Map())
  if (!ranuraDetalle.get(k).has(dis)) ranuraDetalle.get(k).set(dis, [])
  ranuraDetalle.get(k).get(dis).push({
    mano: col(f, 'DisManoID'), idHoja: col(f, 'DisIdHoja'), tipoHoja: col(f, 'DisTipoHoja'),
    formula: col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo'),
  })
}

const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
// recolectar observaciones por familia solapada
const obsPorFamilia = new Map() // clave familia -> [obs]
for (const doc of DOCS) {
  const vLin = leer(doc.lin)
  const hijasPorPadre = new Map()
  for (const f of vLin) {
    const p = col(f, 'nEstr'); if (!p || p === '0') continue
    if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
    hijasPorPadre.get(p).push(f)
  }
  for (const p of vLin) {
    if (col(p, 'EstructuraSN') !== 'True') continue
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    const opciones = opcionesPorLinea.get(k)
    const ranuras = ranurasInstancia.get(k)
    if (!opciones || !ranuras) continue
    const reales = new Map()
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0') continue
      if (FUNCIONES_PERFIL.has(fn)) continue
      const fam = famPorArt.get(art) ?? ''
      if (fam === '050' || fam === '051') continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    if (!reales.size) continue
    const estructura = col(p, 'Articulo')
    const contexto = { L: num(p, 'Largo'), A: num(p, 'Ancho'), ...(cotasDefecto.get(estructura) ?? {}), ...(cotasInstancia.get(k) ?? {}) }

    for (const [clave, filas] of familiasSolapadas) {
      const [cj, comp, opcion] = clave.split('|')
      if (!opciones.has(cj)) continue
      if (opcion && opcion !== '0' && !opciones.get(cj).has(opcion)) continue
      if (!ranuras.has(comp)) continue
      const presentes = filas.filter((f) => reales.has(col(f, 'Articulo')))
      const artsPresentes = new Set(presentes.map((f) => col(f, 'Articulo')))
      if (artsPresentes.size !== 1) continue // ambiguo
      const elegido = presentes[0]
      const min = num(elegido, 'MedidaMin'), max = num(elegido, 'MedidaMax')
      const apariciones = ranurasPlantilla.get(estructura)?.get(comp) ?? []
      const medidas = []
      for (const { formula } of apariciones) { if (!formula) continue; try { medidas.push(evaluar(formula, contexto)) } catch { /**/ } }
      if (!medidas.length) continue

      // --- features oracle-observables ---
      const det = ranuraDetalle.get(k)?.get(comp) ?? []
      const idHojasRanura = [...new Set(det.map((d) => d.idHoja).filter(Boolean))]
      const manos = [...new Set(det.map((d) => d.mano).filter(Boolean))]
      const tipoHojasRanura = [...new Set(det.map((d) => d.tipoHoja).filter(Boolean))]
      const nTramosRanura = ranuras.get(comp) // cantidad de la ranura en instancia
      // nodos de hoja correspondientes
      const nodos = nodosInstancia.get(k) ?? []
      const nodosHoja = nodos.filter((nd) => idHojasRanura.includes(nd.idHoja) || idHojasRanura.includes(nd.Id))
      // cremona/puntos-cierre hermanos presentes (encadenamiento)
      const hermanos = {}
      for (const [art, c] of reales) {
        const d = (descArt.get(art) ?? '').toUpperCase()
        if (/CREMONA|CREM\.|MANILLA|PUNTO CIERRE|CIERRE|CERRADERO|TIRANTE|COMPAS/.test(d)) hermanos[art] = c
      }

      const feat = {
        measure: Math.round(Math.min(...medidas.map((m) => Math.abs(m)) )), // primaria
        measures: medidas.map((m) => Math.round(m)),
        L: num(p, 'Largo'), A: num(p, 'Ancho'),
        manos, idHojasRanura, tipoHojasRanura, nTramosRanura,
        nodosHoja: nodosHoja.map((nd) => ({ TipoHoja: nd.TipoHoja, nHoja: nd.nHoja, Cota: nd.Cota, Simbolo: nd.Simbolo, Hc: nd.Hc, Hd: nd.Hd, Ld: nd.Ld, Hi: nd.Hi, Li: nd.Li, altManilla: nd.altManilla, PlHojasX: nd.PlHojasX, PlHojasY: nd.PlHojasY, TipoCorredera: nd.TipoCorredera, bApertExt: nd.bApertExt })),
        cotas: cotasInstancia.get(k) ?? {},
        hermanos,
      }
      const o = { k, estructura, tramo: col(elegido, 'Articulo'), rango: `${min}-${max}`, min, max, feat }
      if (!obsPorFamilia.has(clave)) obsPorFamilia.set(clave, [])
      obsPorFamilia.get(clave).push(o)
    }
  }
}

// ranking de familias por nº de observaciones
const ranking = [...obsPorFamilia.entries()].sort((a, b) => b[1].length - a[1].length)
console.log(`\n=== Familias solapadas CON oráculo (obs = línea con 1 tramo real) ===`)
for (const [clave, obs] of ranking.slice(0, 12)) {
  const tramos = new Set(obs.map((o) => o.tramo))
  console.log(`  ${clave.padEnd(22)} obs=${String(obs.length).padStart(3)}  tramos=${[...tramos].join(',')}`)
}

// ---- análisis de la familia con más oráculo ----
for (const [clave, obs] of ranking.slice(0, 3)) {
  console.log(`\n\n############ FAMILIA ${clave}  (obs=${obs.length}) ############`)
  const tramos = new Set(obs.map((o) => o.tramo))
  if (tramos.size < 2) { console.log('  un solo tramo observado, no informa'); continue }
  // TEST 0: rango declarado por tramo
  console.log('  Rangos declarados por tramo:')
  const rangoPorTramo = new Map()
  for (const [k, filas] of [familiasSolapadas.get(clave) ? [clave, familiasSolapadas.get(clave)] : []]) {
    for (const f of filas) rangoPorTramo.set(col(f, 'Articulo'), `${num(f, 'MedidaMin')}-${num(f, 'MedidaMax')}`)
  }
  for (const [a, r] of rangoPorTramo) console.log(`     ${a} [${r}]  (${(descArt.get(a) ?? '').slice(0, 30)})  obs=${obs.filter((o) => o.tramo === a).length}`)

  // TEST 1 (baseline S.9.1): ¿la medida evaluada discrimina?
  const porMedida = new Map()
  for (const o of obs) {
    const m = o.feat.measure
    if (!porMedida.has(m)) porMedida.set(m, new Set())
    porMedida.get(m).add(o.tramo)
  }
  let colisiones = 0, obsEnColision = 0
  for (const [m, ts] of porMedida) if (ts.size > 1) { colisiones++; obsEnColision += obs.filter((o) => o.feat.measure === m).length }
  console.log(`  TEST1 medida evaluada sola: ${porMedida.size} valores; ${colisiones} colisionan (>=2 tramos); obs en colisión=${obsEnColision}`)

  // determinismo por medida: purity
  const purityBase = obs.length ? obs.filter((o) => porMedida.get(o.feat.measure).size === 1).length : 0
  console.log(`     obs resueltas por medida sola: ${purityBase}/${obs.length}`)

  // TEST 2: candidatos discriminantes. Para cada feature, agrupar por (feature) y
  // por (medida,feature); medir pureza de tramo.
  const featExtractors = {
    'mano': (o) => o.feat.manos.join('/'),
    'nTramosRanura': (o) => String(o.feat.nTramosRanura),
    'tipoHojaRanura': (o) => o.feat.tipoHojasRanura.join('/'),
    'nHojaNodo': (o) => o.feat.nodosHoja.map((n) => n.nHoja).join('/'),
    'TipoHojaNodo': (o) => o.feat.nodosHoja.map((n) => n.TipoHoja).join('/'),
    'altManilla': (o) => o.feat.nodosHoja.map((n) => n.altManilla).join('/'),
    'Hc': (o) => o.feat.nodosHoja.map((n) => n.Hc).join('/'),
    'Hi': (o) => o.feat.nodosHoja.map((n) => n.Hi).join('/'),
    'Ld': (o) => o.feat.nodosHoja.map((n) => n.Ld).join('/'),
    'PlHojasX': (o) => o.feat.nodosHoja.map((n) => n.PlHojasX).join('/'),
    'PlHojasY': (o) => o.feat.nodosHoja.map((n) => n.PlHojasY).join('/'),
    'nHermanos': (o) => String(Object.keys(o.feat.hermanos).length),
    'sumHermanos': (o) => String(Object.values(o.feat.hermanos).reduce((a, b) => a + b, 0)),
    'hermanosArts': (o) => Object.keys(o.feat.hermanos).sort().join('+'),
  }
  console.log('  TEST2 pureza de tramo por feature:')
  const purezaDe = (fn, withMeasure) => {
    const g = new Map()
    for (const o of obs) {
      const kk = (withMeasure ? o.feat.measure + '|' : '') + fn(o)
      if (!g.has(kk)) g.set(kk, new Set())
      g.get(kk).add(o.tramo)
    }
    let ok = 0
    for (const o of obs) {
      const kk = (withMeasure ? o.feat.measure + '|' : '') + fn(o)
      if (g.get(kk).size === 1) ok++
    }
    return { ok, grupos: g.size }
  }
  const filas = []
  for (const [nombre, fn] of Object.entries(featExtractors)) {
    const solo = purezaDe(fn, false)
    const conM = purezaDe(fn, true)
    // ¿cuántos valores distintos toma? si toma 1, es inútil
    const vals = new Set(obs.map(fn))
    filas.push({ nombre, valsDistintos: vals.size, soloOk: solo.ok, conMok: conM.ok })
  }
  filas.sort((a, b) => b.conMok - a.conMok)
  for (const r of filas) {
    console.log(`     ${r.nombre.padEnd(16)} valsDistintos=${String(r.valsDistintos).padStart(3)}  puroSolo=${r.soloOk}/${obs.length}  medida+feat=${r.conMok}/${obs.length}`)
  }

  // TEST 3: en las colisiones exactas (misma medida, distinto tramo) volcar features
  console.log('  TEST3 colisiones (misma medida evaluada, distinto tramo) — features lado a lado:')
  let dump = 0
  for (const [m, ts] of porMedida) {
    if (ts.size < 2) continue
    const grupo = obs.filter((o) => o.feat.measure === m)
    if (dump++ >= 4) break
    console.log(`   -- medida=${m}  tramos=${[...ts].join(',')} --`)
    for (const o of grupo.slice(0, 6)) {
      const nd = o.feat.nodosHoja[0] ?? {}
      console.log(`      ${o.tramo}[${o.rango}] L=${o.feat.L} A=${o.feat.A} mano=${o.feat.manos.join(',')||'·'} nTramo=${o.feat.nTramosRanura} tHoja=${o.feat.tipoHojasRanura.join(',')||'·'} nHoja=${nd.nHoja??'·'} TipoHojaNodo=${nd.TipoHoja??'·'} altMan=${nd.altManilla??'·'} Hc=${nd.Hc??'·'} Hi=${nd.Hi??'·'} Ld=${nd.Ld??'·'} herm={${Object.entries(o.feat.hermanos).map(([a,c])=>a+':'+c).join(',')}}`)
    }
  }
}
