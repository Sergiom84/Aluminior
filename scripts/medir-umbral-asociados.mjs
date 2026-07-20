/**
 * MEDICIÓN de decision-support, SOLO LECTURA. NO commitear.
 *
 * Destila la salida del predictor de asociados v5 (+trvPeq) para que el
 * titular decida un umbral, análogo a T.17. Replica EXACTAMENTE la lógica de
 * predicción de scripts/medir-seleccion-v5.mjs y añade desglose por línea:
 *
 *   1. Artículos vs cantidades (exactasArt / exactasCdad / gap).
 *   2. Anatomía del error (artículo de más / de menos / equivocado /
 *      cantidad equivocada), y reparto por tipo de asociado y componente.
 *   3. Tabla estilo T.17: correctas / valoradas-pero-MAL / sin-valorar por
 *      política de aceptación.
 *   4. Cruce con las 82 parejas de T.29 (asociados = único tapón), reusando
 *      la clasificación de bloqueo de scripts/medir-bloqueo-vivo.mjs (DB).
 *
 * Uso: npx tsx scripts/medir-umbral-asociados.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import postgres from 'postgres'
import { evaluar } from '../packages/core/src/despiece/formula.ts'
import { construirResoluciones, expandirCadena, resolverComponente }
  from '../packages/core/src/series/resolver.ts'

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
const vDatosLinEstr = leer('VDatosLinEstr.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

// serie por (TipoDoc|nDoc|nLinea) desde VDatosLinEstr.Conjunto1
const seriePorLinea = new Map()
for (const r of vDatosLinEstr) {
  seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))
}

// --- clasificador de TIPO de asociado ---------------------------------------
// componente(s) de ConjuntosAsoc en que aparece cada artículo (rol estructural)
const compsPorArt = new Map()
for (const f of conjuntosAsoc) {
  const art = col(f, 'Articulo')
  if (!art || art === '0') continue
  if (!compsPorArt.has(art)) compsPorArt.set(art, new Set())
  compsPorArt.get(art).add(col(f, 'ComponenteAsoc'))
}
const ESCUADRA_COMP = new Set(['58', '59', '58R', '59R'])
function tipoAsoc(art) {
  const fam = famPorArt.get(art) ?? ''
  const desc = (descArt.get(art) ?? '').toUpperCase()
  if (fam === '054' || /^MO/.test(art) || /MANO DE OBRA|COLOCAC|FABRICAC/.test(desc)) return 'mano de obra'
  const comps = compsPorArt.get(art) ?? new Set()
  if (/ESCUADR/.test(desc) || [...comps].some((c) => ESCUADRA_COMP.has(c)) || comps.has('39') === false && /ESCUADR/.test(desc)) return 'escuadra'
  if ([...comps].some((c) => ESCUADRA_COMP.has(c))) return 'escuadra'
  if (/GOMA|JUNTA|JUNQUILL|BURLETE|FELPUD|CEPILLO/.test(desc)) return 'junta/goma'
  return 'herraje'
}

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]

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

// --- plantilla: apariciones de cada ranura (fórmula + mano), por estructura ---
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

// --- cotas ---
const cotasDefecto = new Map()
const simboloPorId = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura')
  const simbolo = col(f, 'Simbolo')
  if (!simbolo) continue
  if (!cotasDefecto.has(e)) cotasDefecto.set(e, {})
  cotasDefecto.get(e)[simbolo] = num(f, 'Cota')
  const id = col(f, 'Id')
  if (id) simboloPorId.set(`${e}|${id}`, simbolo)
}
const cotasInstancia = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc')
  if (!t) continue
  const e = col(f, 'Estructura')
  const simbolo = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  if (!simbolo) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Cota')
}
const simboloDa = new Map(estructurasDa.map((f) => [`${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA')]))
for (const f of medidasDa) {
  const simbolo = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!simbolo) continue
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Medida')
}

// --- opciones e instancias ---
const opcionesPorLinea = new Map()
for (const f of opcionesDoc) {
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcionesPorLinea.has(k)) opcionesPorLinea.set(k, new Map())
  const porConj = opcionesPorLinea.get(k)
  const cj = col(f, 'Conjunto')
  if (!porConj.has(cj)) porConj.set(cj, new Set())
  if (col(f, 'SelecSN') === 'True') porConj.get(cj).add(col(f, 'nOpcion'))
}
const ranurasInstancia = new Map()
const manosInstancia = new Map()
const rasgosInstancia = new Map()
const hojasPorLinea = new Map()
for (const f of estArt) {
  const t = col(f, 'TipoDoc')
  if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  const dis = col(f, 'DisComponente')
  if (dis && dis !== '0') {
    if (!ranurasInstancia.has(k)) ranurasInstancia.set(k, new Map())
    const m = ranurasInstancia.get(k)
    m.set(dis, (m.get(dis) ?? 0) + (num(f, 'Cantidad') || 1))
    if (!manosInstancia.has(k)) manosInstancia.set(k, new Map())
    const mm = manosInstancia.get(k)
    if (!mm.has(dis)) mm.set(dis, [])
    mm.get(dis).push(col(f, 'DisManoID'))
  }
  const fn = col(f, 'Funcion'), gen = col(f, 'Articulo')
  const cant = num(f, 'Cantidad') || 1
  if (!rasgosInstancia.has(k)) rasgosInstancia.set(k, new Map())
  const rr = rasgosInstancia.get(k)
  if (fn) rr.set(`fn:${fn}`, (rr.get(`fn:${fn}`) ?? 0) + cant)
  if (gen && gen !== '0') rr.set(`gen:${gen}`, (rr.get(`gen:${gen}`) ?? 0) + cant)
  if (gen === '11' || fn === 'TH') rr.set('trvPeq', (rr.get('trvPeq') ?? 0) + cant)
  const idHoja = num(f, 'DisIdHoja')
  if (idHoja > 0) {
    if (!hojasPorLinea.has(k)) hojasPorLinea.set(k, new Set())
    hojasPorLinea.get(k).add(idHoja)
  }
}

// --- oráculo ---
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const lineas = []
for (const doc of DOCS) {
  const vLin = leer(doc.lin)
  const hijasPorPadre = new Map()
  for (const f of vLin) {
    const p = col(f, 'nEstr')
    if (!p || p === '0') continue
    if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
    hijasPorPadre.get(p).push(f)
  }
  for (const p of vLin) {
    if (col(p, 'EstructuraSN') !== 'True') continue
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    const opciones = opcionesPorLinea.get(k)
    const ranuras = ranurasInstancia.get(k)
    if (!opciones || !ranuras) continue
    const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
    const reales = new Map()
    const perfilesLinea = new Set()
    for (const h of hijas) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0') continue
      if (FUNCIONES_PERFIL.has(fn)) { perfilesLinea.add(art); continue }
      const fam = famPorArt.get(art) ?? ''
      if (fam === '050' || fam === '051') continue
      if (!poblacionAsoc.has(art)) continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    if (!reales.size) continue
    const estructura = col(p, 'Articulo')
    const contexto = {
      L: num(p, 'Largo'), A: num(p, 'Ancho'),
      ...(cotasDefecto.get(estructura) ?? {}),
      ...(cotasInstancia.get(k) ?? {}),
    }
    const medidasRanura = new Map()
    for (const [comp, apariciones] of ranurasPlantilla.get(estructura) ?? []) {
      medidasRanura.set(comp, apariciones.map(({ formula, mano }) => {
        let medida = null
        if (formula) { try { medida = evaluar(formula, contexto) } catch { /* sin medida */ } }
        return { medida, mano }
      }))
    }
    lineas.push({
      k, opciones, ranuras, reales, medidasRanura, perfilesLinea,
      manos: manosInstancia.get(k) ?? new Map(),
      rasgosExtra: rasgosInstancia.get(k) ?? new Map(),
      nHojas: hojasPorLinea.get(k)?.size ?? 0,
      estructura, serie: seriePorLinea.get(k) ?? '',
    })
  }
}
console.log(`Líneas del oráculo (VPRES+VALB+VFAC): ${lineas.length}`)

const ESPECIALES = new Set(['A', 'L', '!', '59R'])
function filasOpcionOk(linea) {
  const activas = []
  for (const [cj, marcadas] of linea.opciones) {
    for (const f of asocPorConjunto.get(cj) ?? []) {
      const nOp = col(f, 'nOpcion')
      if (nOp && nOp !== '0' && !marcadas.has(nOp)) continue
      const artAsoc = col(f, 'ArticuloAsoc')
      if (artAsoc && artAsoc !== '0' && !linea.perfilesLinea.has(artAsoc)) continue
      activas.push(f)
    }
  }
  return activas
}

// --- aprendizaje del multiplicador '!' (idéntico a v5) ---
function rasgosDe(linea) {
  const r = new Map([['const1', 1], ['nHojas', linea.nHojas]])
  for (const [dis, n] of linea.ranuras) r.set(`dis:${dis}`, n)
  for (const [nombre, n] of linea.rasgosExtra) r.set(nombre, n)
  return r
}
const obsCategoria = new Map()
for (const linea of lineas) {
  const porArt = new Map()
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc')
    const art = col(f, 'Articulo')
    if (comp === '!') {
      const acc = porArt.get(art) ?? { bang: 0, otras: 0, textos: new Set() }
      acc.bang += num(f, 'Cantidad'); acc.textos.add(col(f, 'AsociadoA')); porArt.set(art, acc)
    } else if (!comp || linea.ranuras.has(comp) || ESPECIALES.has(comp)) {
      const acc = porArt.get(art) ?? { bang: 0, otras: 0, textos: new Set() }
      acc.otras++; porArt.set(art, acc)
    }
  }
  for (const [art, acc] of porArt) {
    if (acc.bang <= 0 || acc.otras > 0 || acc.textos.size !== 1) continue
    const texto = [...acc.textos][0]
    if (!obsCategoria.has(texto)) obsCategoria.set(texto, [])
    obsCategoria.get(texto).push({ base: acc.bang, real: linea.reales.get(art) ?? 0, rasgos: rasgosDe(linea) })
  }
}
const multiplicador = new Map()
for (const [texto, obs] of obsCategoria) {
  if (obs.length < 5) continue
  const nombres = new Set()
  for (const o of obs) for (const n of o.rasgos.keys()) nombres.add(n)
  let mejor = null, tasa = 0
  for (const nombre of nombres) {
    const ratios = new Map()
    for (const o of obs) {
      const v = o.rasgos.get(nombre) ?? 0
      if (o.base * v <= 0) continue
      const r = Math.round((o.real / (o.base * v)) * 100) / 100
      ratios.set(r, (ratios.get(r) ?? 0) + 1)
    }
    if (!ratios.size) continue
    const [k] = [...ratios.entries()].sort((a, b) => b[1] - a[1])[0]
    if (k <= 0) continue
    let ok = 0
    for (const o of obs) {
      const v = o.rasgos.get(nombre) ?? 0
      if (Math.abs(o.base * v * k - o.real) < 0.01) ok++
    }
    const tasaK = ok / obs.length - (k === 1 ? 0 : 0.001)
    if (tasaK > tasa) { tasa = tasaK; mejor = { rasgo: nombre, k } }
  }
  if (mejor && tasa >= 0.9) multiplicador.set(texto, mejor)
}
console.log(`Multiplicadores '!' aprendidos: ${multiplicador.size} de ${obsCategoria.size} categorías`)

// --- predicción con diagnóstico por línea ---
let tp = 0, fp = 0, fn = 0, exactasArt = 0, exactasCdad = 0
const diag = []               // por línea
const errTipoArt = { 'artículo de más': new Map(), 'artículo de menos': new Map(), 'cantidad equivocada': new Map() }
for (const linea of lineas) {
  const predicho = new Map()
  const rasgos = rasgosDe(linea)
  let bangSinRegla = false, rangoSinMedida = false
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc')
    const art = col(f, 'Articulo')
    let aporte = null
    if (comp === 'A' || comp === 'L') {
      aporte = num(f, 'Cantidad') * Math.max(num(f, 'UnidadesMin'), 1)
    } else if (comp === '!') {
      const regla = multiplicador.get(col(f, 'AsociadoA'))
      if (!regla) { bangSinRegla = true; continue }
      aporte = num(f, 'Cantidad') * (rasgos.get(regla.rasgo) ?? 0) * regla.k
    } else if (comp === '59R') {
      continue
    } else if (comp) {
      if (!linea.ranuras.has(comp)) continue
      const mano = col(f, 'ManoID')
      const manosReales = linea.manos.get(comp) ?? []
      const nAparicionesMano = mano ? manosReales.filter((m) => m === mano).length : Math.max(manosReales.length, 1)
      if (!nAparicionesMano) continue
      const medidas = linea.medidasRanura.get(comp) ?? []
      const min = num(f, 'MedidaMin'), max = num(f, 'MedidaMax')
      let apariciones
      if (max > 0) {
        const conMedida = medidas.filter((ap) => ap.medida !== null)
        if (!conMedida.length) { rangoSinMedida = true; continue }
        const enRango = conMedida.filter((ap) => ap.medida >= min && ap.medida <= max).length
        if (!enRango) continue
        apariciones = Math.min(enRango, nAparicionesMano)
      } else { apariciones = nAparicionesMano }
      aporte = num(f, 'Cantidad') * apariciones
    } else {
      aporte = num(f, 'Cantidad')
    }
    predicho.set(art, (predicho.get(art) ?? 0) + aporte)
  }
  for (const [art, cdad] of [...predicho]) if (cdad <= 0) predicho.delete(art)

  // conteo TP/FP/FN
  const fpArts = [], fnArts = []
  let iguales = 0
  for (const art of linea.reales.keys()) {
    if (predicho.has(art)) { tp++; iguales++ } else { fn++; fnArts.push(art) }
  }
  for (const art of predicho.keys()) {
    if (!linea.reales.has(art)) { fp++; fpArts.push(art) }
  }
  const exactArt = iguales === linea.reales.size && predicho.size === linea.reales.size
  let exactCdad = false
  const qtyWrong = []   // {art, pred, real}
  if (exactArt) {
    exactasArt++
    exactCdad = true
    for (const [art, cdad] of linea.reales) {
      const pv = predicho.get(art) ?? 0
      if (Math.abs(pv - cdad) > 0.01) { exactCdad = false; qtyWrong.push({ art, pred: pv, real: cdad }) }
    }
    if (exactCdad) exactasCdad++
  }

  // clasificación de la línea NO exacta en artículos
  let errClase = null
  if (!exactArt) {
    if (fpArts.length && !fnArts.length) errClase = 'artículo de más'
    else if (!fpArts.length && fnArts.length) errClase = 'artículo de menos'
    else errClase = 'artículo equivocado'   // FP + FN a la vez (mezcla)
  } else if (!exactCdad) {
    errClase = 'cantidad equivocada'
  } else {
    errClase = 'exacta'
  }

  // reparto por tipo de asociado
  const bucket = errClase === 'artículo de más' ? errTipoArt['artículo de más']
    : errClase === 'artículo de menos' ? errTipoArt['artículo de menos']
    : errClase === 'cantidad equivocada' ? errTipoArt['cantidad equivocada']
    : errClase === 'artículo equivocado' ? null : null
  if (errClase === 'artículo de más') for (const a of fpArts) { const t = tipoAsoc(a); bucket.set(t, (bucket.get(t) ?? 0) + 1) }
  if (errClase === 'artículo de menos') for (const a of fnArts) { const t = tipoAsoc(a); bucket.set(t, (bucket.get(t) ?? 0) + 1) }
  if (errClase === 'artículo equivocado') {
    for (const a of fpArts) { const t = tipoAsoc(a); errTipoArt['artículo de más'].set(t, (errTipoArt['artículo de más'].get(t) ?? 0) + 1) }
    for (const a of fnArts) { const t = tipoAsoc(a); errTipoArt['artículo de menos'].set(t, (errTipoArt['artículo de menos'].get(t) ?? 0) + 1) }
  }
  if (errClase === 'cantidad equivocada') for (const w of qtyWrong) { const t = tipoAsoc(w.art); bucket.set(t, (bucket.get(t) ?? 0) + 1) }

  diag.push({
    k: linea.k, serie: linea.serie, estructura: linea.estructura,
    exactArt, exactCdad, errClase,
    nFP: fpArts.length, nFN: fnArts.length, nQtyWrong: qtyWrong.length,
    emitido: predicho.size > 0,
    limpia: !bangSinRegla && !rangoSinMedida,
    bangSinRegla, rangoSinMedida,
    qtyWrong,
  })
}

console.log(`\nPrecisión: ${(100 * tp / (tp + fp)).toFixed(1)}%   cobertura: ${(100 * tp / (tp + fn)).toFixed(1)}%`)

// ===== ENTREGABLE 1: artículos vs cantidades =====
console.log(`\n════════ 1) ARTÍCULOS vs CANTIDADES (sobre ${lineas.length}) ════════`)
console.log(`  Exactas en ARTÍCULOS (conjunto correcto)        : ${exactasArt}`)
console.log(`  Exactas TAMBIÉN en CANTIDADES (valorables bien) : ${exactasCdad}`)
console.log(`  GAP (art. exacto pero cantidad mal)             : ${exactasArt - exactasCdad}`)
// dentro de las exactas-en-art, ¿cuántos artículos y cuánto se desvía la cantidad?
const exArtLines = diag.filter((d) => d.exactArt)
const distNqty = new Map()
let totDeltaArts = 0, totArtsEnExArt = 0
for (const d of exArtLines) {
  distNqty.set(d.nQtyWrong, (distNqty.get(d.nQtyWrong) ?? 0) + 1)
  totDeltaArts += d.nQtyWrong
}
console.log(`  De las ${exactasArt} exactas-en-artículos, nº de artículos con CANTIDAD mal por línea:`)
for (const [n, c] of [...distNqty].sort((a, b) => a[0] - b[0])) console.log(`     ${n} art. mal → ${c} líneas`)
// magnitud del desvío de cantidad (proxy sin precios, regla 7)
const deltas = []
for (const d of exArtLines) for (const w of d.qtyWrong) deltas.push(w.pred - w.real)
if (deltas.length) {
  const abs = deltas.map(Math.abs).sort((a, b) => a - b)
  const median = abs[Math.floor(abs.length / 2)]
  const sobre = deltas.filter((x) => x > 0).length, corto = deltas.filter((x) => x < 0).length
  console.log(`  Desvíos de cantidad (proxy; NO hay precios cargados, regla 7): n=${deltas.length}`)
  console.log(`     predice de MÁS: ${sobre}   predice de MENOS: ${corto}   |Δ| mediana=${median}  |Δ| máx=${abs[abs.length - 1]}`)
}

// ===== ENTREGABLE 2: anatomía del error =====
console.log(`\n════════ 2) ANATOMÍA DEL ERROR (líneas NO exactas en cantidad) ════════`)
const clases = new Map()
for (const d of diag) clases.set(d.errClase, (clases.get(d.errClase) ?? 0) + 1)
console.log(`  Reparto de las ${lineas.length} líneas por clase de fallo:`)
for (const c of ['exacta', 'cantidad equivocada', 'artículo de menos', 'artículo de más', 'artículo equivocado']) {
  console.log(`     ${c.padEnd(22)}: ${clases.get(c) ?? 0}`)
}
console.log(`  (nota: "artículo equivocado" = FP y FN a la vez en la misma línea)`)
console.log(`\n  Reparto por TIPO DE ASOCIADO (recuento de artículos implicados):`)
for (const modo of ['artículo de más', 'artículo de menos', 'cantidad equivocada']) {
  const m = errTipoArt[modo]
  const tot = [...m.values()].reduce((a, b) => a + b, 0)
  console.log(`   · ${modo} (Σ ${tot} art.):`)
  if (!tot) { console.log(`        (ninguno) 0   (regla 7)`); continue }
  for (const [t, n] of [...m].sort((a, b) => b[1] - a[1])) console.log(`        ${t.padEnd(14)}: ${n}`)
}

// ===== ENTREGABLE 3: tabla estilo T.17 =====
console.log(`\n════════ 3) TABLA ESTILO T.17 (correctas / valoradas-pero-MAL / sin-valorar) ════════`)
function partir(pred) {
  // pred(d) => true si la política ACEPTA valorar la línea
  let correcta = 0, mal = 0, sin = 0
  for (const d of diag) {
    if (pred(d)) { if (d.exactCdad) correcta++; else mal++ } else sin++
  }
  return { correcta, mal, sin }
}
const politicas = [
  ['A · aceptar TODO lo que el predictor emite', (d) => d.emitido],
  ['B · aceptar solo líneas LIMPIAS (sin fila descartada por falta de regla/medida)', (d) => d.emitido && d.limpia],
  ['C · aceptar solo si el conjunto de artículos es EXACTO (techo; usa el oráculo, no realizable en producción)', (d) => d.exactArt],
]
console.log(`  ${'Política'.padEnd(64)} ${'valoradas'.padStart(9)} ${'correctas'.padStart(9)} ${'MAL'.padStart(6)} ${'sin-valorar'.padStart(11)}`)
for (const [nombre, pred] of politicas) {
  const { correcta, mal, sin } = partir(pred)
  console.log(`  ${nombre.slice(0, 64).padEnd(64)} ${String(correcta + mal).padStart(9)} ${String(correcta).padStart(9)} ${String(mal).padStart(6)} ${String(sin).padStart(11)}`)
}
console.log(`  ⚠ "MAL" = línea valorada con PRECIO INCORRECTO EN SILENCIO (el caso peligroso).`)
console.log(`  Nº de líneas donde el predictor descartó ≥1 fila por falta de regla '!' : ${diag.filter((d) => d.bangSinRegla).length}`)
console.log(`  Nº de líneas donde descartó ≥1 fila de rango por ranura sin fórmula     : ${diag.filter((d) => d.rangoSinMedida).length}`)
console.log(`  Nº de líneas LIMPIAS (sin ningún descarte)                              : ${diag.filter((d) => d.limpia).length}`)

// ===== ENTREGABLE 4: cruce con las 82 parejas de T.29 =====
console.log(`\n════════ 4) CRUCE CON LAS 82 PAREJAS DE T.29 (asociados = único tapón) ════════`)
let sql
try {
  sql = postgres(process.env.DATABASE_URL)
  const COMPONENTE_CRISTAL = '1'
  const FUNCIONES_HOJA = new Set(['HV', 'HH'])
  const esAsociado = (fn) => !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))
  const COMPONENTES_HERRAJE = new Set([
    '222', '223', '224', '225', '226', '227', '228', '229',
    'OBC', 'OBCR', 'OBM', 'OBP', 'OBPH', 'PRC', 'PRPH', 'PRPV',
    'EKCC', 'EKEE', 'EKEF', '39', '50', '51', '52', '53', '55', '56', '57', '58', '58R', '59',
    '71', '130', '133', '134', 'EHC', 'EHH', 'EHF', 'EHFH', 'EMBF',
    'CHC', 'CHH', 'JA', 'JB', 'JD', 'JI', '30', '116', '135', '139', '143', '51MA',
  ])
  // parejas reales VPRES con hoja (idéntico a medir-bloqueo-vivo)
  const seriePorLineaVpres = new Map()
  for (const r of vDatosLinEstr) if (col(r, 'TipoDoc') === 'VPRES') seriePorLineaVpres.set(col(r, 'nVLinea'), col(r, 'Conjunto1'))
  const vpres = leer('VPresupuestosLin.csv')
  const parejas = new Map()
  for (const l of vpres) {
    if (col(l, 'EstructuraSN') !== 'True') continue
    const serie = seriePorLineaVpres.get(col(l, 'nLinea'))
    const est = col(l, 'Articulo')
    if (!serie || !est) continue
    parejas.set(`${serie}|${est}`, (parejas.get(`${serie}|${est}`) || 0) + 1)
  }
  const deleg = await sql`select conjunto_codigo, delegado_codigo from conjunto_delegaciones`
  const mapaDeleg = new Map()
  for (const d of deleg) { if (!mapaDeleg.has(d.conjunto_codigo)) mapaDeleg.set(d.conjunto_codigo, []); mapaDeleg.get(d.conjunto_codigo).push(d.delegado_codigo) }
  const genericos = new Set((await sql`select codigo from articulos where descripcion like '(**%'`).map((a) => a.codigo))
  const comps = await sql`select estructura_codigo, articulo_codigo, componente_disenyo, funcion from estructura_componentes`
  const porEstr = new Map()
  for (const c of comps) { if (!porEstr.has(c.estructura_codigo)) porEstr.set(c.estructura_codigo, []); porEstr.get(c.estructura_codigo).push(c) }
  const conPvp = new Set((await sql`select distinct articulo_codigo from articulos_pvp`).map((a) => a.articulo_codigo))
  const cache = new Map()
  async function resolucionesDe(serie) {
    if (cache.has(serie)) return cache.get(serie)
    const cadena = expandirCadena(serie, mapaDeleg)
    const filas = await sql`select conjunto_codigo, componente, articulo_codigo from conjunto_resoluciones where conjunto_codigo = any(${cadena})`
    const r = construirResoluciones(cadena, filas.map((f) => ({ conjuntoCodigo: f.conjunto_codigo, componente: f.componente, articuloCodigo: f.articulo_codigo })))
    cache.set(serie, r); return r
  }
  const VARIANTE = '2'
  const soloAsociadosPares = new Set()
  let conHoja = 0
  for (const [k] of parejas) {
    const [serie, estructura] = k.split('|')
    const cs = porEstr.get(estructura)
    if (!cs || !cs.some((c) => FUNCIONES_HOJA.has(c.funcion))) continue
    conHoja++
    const resoluciones = await resolucionesDe(serie)
    const sinResolver = new Set(), sinResolverAsoc = new Set(), perfilResueltoArts = new Set()
    for (const c of cs) {
      const comp = c.componente_disenyo
      if (comp === COMPONENTE_CRISTAL) continue
      const esAsoc = esAsociado(c.funcion) || (comp != null && COMPONENTES_HERRAJE.has(comp))
      if (!comp) {
        if (genericos.has(c.articulo_codigo)) { if (esAsoc) sinResolverAsoc.add(c.articulo_codigo); else sinResolver.add(c.articulo_codigo) }
        else if (!esAsoc) perfilResueltoArts.add(c.articulo_codigo)
        continue
      }
      const res = resolverComponente(comp, resoluciones, VARIANTE)
      if (res.articuloCodigo) { if (!esAsoc) perfilResueltoArts.add(res.articuloCodigo); continue }
      if (genericos.has(c.articulo_codigo)) { if (esAsoc) sinResolverAsoc.add(c.articulo_codigo); else sinResolver.add(c.articulo_codigo) }
      else if (!esAsoc) perfilResueltoArts.add(c.articulo_codigo)
    }
    const perfilSinPvp = [...perfilResueltoArts].filter((a) => !conPvp.has(a))
    if (sinResolverAsoc.size > 0 && sinResolver.size === 0 && perfilSinPvp.length === 0) soloAsociadosPares.add(k)
  }
  console.log(`  Parejas con hoja (esperado 87): ${conHoja}`)
  console.log(`  Parejas "asociados = único tapón" (esperado 82): ${soloAsociadosPares.size}`)

  // cruce: líneas del oráculo cuya pareja (serie|estructura) está entre las 82
  const porPareja = new Map()  // pareja -> {lineas, exactArt, exactCdad}
  for (const d of diag) {
    const par = `${d.serie}|${d.estructura}`
    if (!soloAsociadosPares.has(par)) continue
    if (!porPareja.has(par)) porPareja.set(par, { lineas: 0, exactArt: 0, exactCdad: 0 })
    const o = porPareja.get(par); o.lineas++; if (d.exactArt) o.exactArt++; if (d.exactCdad) o.exactCdad++
  }
  const lineasEn82 = diag.filter((d) => soloAsociadosPares.has(`${d.serie}|${d.estructura}`))
  console.log(`\n  De las 82 parejas, ${porPareja.size} tienen evidencia en el oráculo de 216 líneas`)
  console.log(`  (las otras ${soloAsociadosPares.size - porPareja.size} no aparecen como línea con asociados en VPRES+VALB+VFAC).`)
  console.log(`  Líneas del oráculo que caen en esas 82 parejas: ${lineasEn82.length}`)
  // clasificación por pareja: correcta (todas sus líneas exactCdad), mal (alguna emitida y ninguna exactCdad), incompleta
  let parCorr = 0, parMal = 0, parInc = 0
  for (const [, o] of porPareja) {
    if (o.exactCdad === o.lineas && o.lineas > 0) parCorr++
    else if (o.exactArt < o.lineas) parInc++     // el predictor ni siquiera acierta el conjunto en alguna línea
    else parMal++                                 // conjunto correcto pero cantidad mal en todas
  }
  console.log(`\n  Reparto de las ${porPareja.size} parejas-82 con evidencia, según el predictor actual:`)
  console.log(`     correctas (todas sus líneas exactas en cantidad)        : ${parCorr}`)
  console.log(`     valoradas MAL (conjunto ok pero cantidad mal)           : ${parMal}`)
  console.log(`     incompletas (el conjunto de artículos falla en alguna)  : ${parInc}`)
  const en82Art = lineasEn82.filter((d) => d.exactArt).length
  const en82Cdad = lineasEn82.filter((d) => d.exactCdad).length
  console.log(`  A nivel de línea dentro de las 82: exactas-art=${en82Art}/${lineasEn82.length}  exactas-cdad=${en82Cdad}/${lineasEn82.length}`)
  await sql.end({ timeout: 5 })
} catch (e) {
  console.log(`  [no se pudo cruzar con DB: ${e.message}]`)
  if (sql) try { await sql.end({ timeout: 5 }) } catch { /* */ }
}
