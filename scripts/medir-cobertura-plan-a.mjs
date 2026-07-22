/**
 * T.54 (medición, SOLO LECTURA): cobertura del PLAN (a) sobre los presupuestos REALES.
 *
 * Plan (a) = valorar SOLO donde el recuento topológico reconstruye y GENERALIZA; el resto
 * "sin valorar" honesto (regla 3). Este script:
 *  1) Define el conjunto que CALIFICA con criterio MEDIDO (regla 8, no a mano): las clases
 *     (serie, topología) cuyas líneas del oráculo resuelven EXACTO fuera de muestra (2-fold
 *     CV: cada línea juzgada por un modelo entrenado sin ella). Una clase califica si, con
 *     soporte >= minSup, TODAS sus líneas del oráculo resuelven OOS (tasa 100%).
 *  2) CUANTIFICA la cobertura sobre las 2.071 líneas estructurales VPRES (no solo las 216):
 *     % de LÍNEAS que obtendrían total válido y % de PRESUPUESTOS COMPLETOS (todas sus
 *     líneas valorables). Enlace exacto por VDatosLinEstr / EstructurasDiseño (regla 8).
 *
 * "Resuelve" a nivel línea = v5 acierta el CONJUNTO de asociados (exactArt, config de
 * fábrica, determinista) Y el recuento topológico acierta TODAS las cantidades (exactCdad).
 * El perfil (frente cerrado 100%, T.24-28) se asume resuelto; el binding es el recuento de
 * asociados. Una línea sin árbol de diseño (EstructurasDiseño) NO es modelable por esta vía.
 *
 * Uso: npx tsx scripts/medir-cobertura-plan-a.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { evaluar } from '../packages/core/src/despiece/formula.ts'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), { columns: true, bom: true, skip_empty_lines: true, relax_quotes: true })
const col = (f, n) => (f[n] ?? '').trim()
const num = (f, n) => Number(col(f, n).replace(',', '.')) || 0

const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const configSeriesAsoc = leer('ConfigSeriesAsoc.csv')
const opcionesDoc = leer('VOpcionesHerraje.csv')
const articulos = leer('Articulos.csv')
const estArt = leer('EstructurasArticulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
const vDatosLinEstr = leer('VDatosLinEstr.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

const seriePorLinea = new Map()
for (const r of vDatosLinEstr) {
  seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))
}

// ── clasificadores de artículo (idénticos a T.48) ───────────────────────────
const compsPorArt = new Map()
for (const f of conjuntosAsoc) {
  const art = col(f, 'Articulo'); if (!art || art === '0') continue
  if (!compsPorArt.has(art)) compsPorArt.set(art, new Set())
  compsPorArt.get(art).add(col(f, 'ComponenteAsoc'))
}
const ESCUADRA_COMP = new Set(['58', '59', '58R', '59R'])
const ALIN = new Set(['GM4735', 'GM4710', 'GM4330'])
const esEscuadra = (art) =>
  [...(compsPorArt.get(art) ?? [])].some((c) => ESCUADRA_COMP.has(c)) ||
  /ESCUADR/.test((descArt.get(art) ?? '').toUpperCase())
const esJunta = (art) => {
  if (famPorArt.get(art) !== '002') return false
  const d = (descArt.get(art) ?? '').toUpperCase()
  if (!/JUNTA|GOMA|BURLETE|FELPUD|CEPILLO|JUNQUILL/.test(d)) return false
  if (/ESCUADR|TIJERA|RULETA|TAPAJUNT|JUEGO|SIN CONFIGURAR/.test(d)) return false
  return true
}

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]

const asocPorConjunto = new Map()
const poblacionAsoc = new Set()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  poblacionAsoc.add(art)
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
}

const ranurasPlantilla = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const comp = col(f, 'DisComponente'); if (!comp || comp === '0') continue
  const e = col(f, 'Estructura')
  if (!ranurasPlantilla.has(e)) ranurasPlantilla.set(e, new Map())
  const m = ranurasPlantilla.get(e)
  if (!m.has(comp)) m.set(comp, [])
  m.get(comp).push({ formula: col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo'), mano: col(f, 'DisManoID') })
}

const cotasDefecto = new Map()
const simboloPorId = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura'); const simbolo = col(f, 'Simbolo'); if (!simbolo) continue
  if (!cotasDefecto.has(e)) cotasDefecto.set(e, {})
  cotasDefecto.get(e)[simbolo] = num(f, 'Cota')
  const id = col(f, 'Id'); if (id) simboloPorId.set(`${e}|${id}`, simbolo)
}
const cotasInstancia = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const e = col(f, 'Estructura')
  const simbolo = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  if (!simbolo) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Cota')
}
const simboloDa = new Map(estructurasDa.map((f) => [`${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA')]))
for (const f of medidasDa) {
  const simbolo = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`); if (!simbolo) continue
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
const ranurasInstancia = new Map()
const manosInstancia = new Map()
const rasgosInstancia = new Map()
const hojasPorLinea = new Map()
for (const f of estArt) {
  const t = col(f, 'TipoDoc'); if (!t) continue
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

const nodosPorLinea = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!nodosPorLinea.has(k)) nodosPorLinea.set(k, [])
  nodosPorLinea.get(k).push(col(f, 'Tipo'))
}
const topoDe = (k) => {
  const n = nodosPorLinea.get(k); if (!n) return null
  const c = (t) => n.filter((x) => x === t).length
  return { marco: c('1'), hueco: c('2'), hoja: c('3'), trav: c('6'), vidrio: c('5') + c('7') }
}
const topoSig = (t) => `m${t.marco}hu${t.hueco}h${t.hoja}t${t.trav}v${t.vidrio}`

// ── T.46+T.47 predictor de escuadra de ALINEAMIENTO (config de fábrica) ──────
const basePorSA = new Map()
for (const f of conjuntosAsoc) {
  const art = col(f, 'Articulo'); if (!ALIN.has(art)) continue
  if (col(f, 'nOpcion')) continue
  const comp = col(f, 'ComponenteAsoc'); if (comp !== '58' && comp !== '59') continue
  const k = `${col(f, 'Conjunto')}|${art}`
  if (!basePorSA.has(k)) basePorSA.set(k, []); basePorSA.get(k).push(f)
}
const optPorSA = new Map()
for (const f of configSeriesAsoc) {
  const art = col(f, 'Articulo'); if (!ALIN.has(art)) continue
  const k = `${col(f, 'Conjunto')}|${art}`
  if (!optPorSA.has(k)) optPorSA.set(k, []); optPorSA.get(k).push(f)
}
const bangPorSA = new Map()
for (const src of [configSeriesAsoc, conjuntosAsoc]) for (const f of src) {
  const art = col(f, 'Articulo'); if (!ALIN.has(art)) continue
  if (col(f, 'ComponenteAsoc') !== '!') continue
  const k = `${col(f, 'Conjunto')}|${art}`
  if (!bangPorSA.has(k)) bangPorSA.set(k, []); bangPorSA.get(k).push(f)
}
const parCompleto = new Map()
for (const [sa, rows] of optPorSA) for (const r of rows) {
  const artA = col(r, 'ArticuloAsoc'); if (artA && artA !== '0') continue
  const comp = col(r, 'ComponenteAsoc'); if (comp !== '58' && comp !== '59') continue
  const kk = `${sa}|${col(r, 'TipoHoja')}`
  if (!parCompleto.has(kk)) parCompleto.set(kk, new Set()); parCompleto.get(kk).add(comp)
}
const tienePar = (sa, rol) => { const s = parCompleto.get(`${sa}|${rol}`); return s && s.has('58') && s.has('59') }
const elem = (rol, t) => (rol === 'H') ? t.hoja : Math.max(t.marco, 1)
function contBang(asoc, t) {
  const a = (asoc ?? '').toUpperCase()
  if (a.includes('HOJAS RODAMIENTO')) return t.hueco
  if (a.includes('ESCUADRAS ABATIBLES')) return t.hoja
  if (a.includes('FIJOS INDEPENDIENTES')) return t.hoja
  if (a.includes('MARCOS CARRIL')) return t.hueco
  if (a.includes('FIJO')) return t.hoja
  return 0
}
function predAlin(serie, art, t, perfiles) {
  const sa = `${serie}|${art}`
  let total = 0, tuvo = false
  for (const b of basePorSA.get(sa) ?? []) { total += num(b, 'Cantidad') * 2 * Math.max(t.marco, 1); tuvo = true }
  for (const r of optPorSA.get(sa) ?? []) {
    const comp = col(r, 'ComponenteAsoc'); if (comp === '!') continue
    const rol = col(r, 'TipoHoja'), cdad = num(r, 'Cantidad'), artA = col(r, 'ArticuloAsoc')
    const dispara = (artA && artA !== '0') ? perfiles.has(artA) : tienePar(sa, rol)
    tuvo = true; if (dispara) total += cdad * 2 * elem(rol, t)
  }
  for (const r of bangPorSA.get(sa) ?? []) { tuvo = true; total += num(r, 'Cantidad') * contBang(col(r, 'AsociadoA'), t) }
  return tuvo ? total : null
}

const ESPECIALES = new Set(['A', 'L', '!', '59R'])
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
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
function rasgosDe(linea) {
  const r = new Map([['const1', 1], ['nHojas', linea.nHojas]])
  for (const [dis, n] of linea.ranuras) r.set(`dis:${dis}`, n)
  for (const [nombre, n] of linea.rasgosExtra) r.set(nombre, n)
  return r
}

// ── construcción del oráculo (con herraje asociado real) ─────────────────────
const lineas = []
for (const doc of DOCS) {
  const vLin = leer(doc.lin)
  const hijasPorPadre = new Map()
  for (const f of vLin) {
    const p = col(f, 'nEstr'); if (!p || p === '0') continue
    if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, []); hijasPorPadre.get(p).push(f)
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
        if (formula) { try { medida = evaluar(formula, contexto) } catch { /* */ } }
        return { medida, mano }
      }))
    }
    lineas.push({
      k, tipoDoc: doc.tipo, opciones, ranuras, reales, medidasRanura, perfilesLinea,
      manos: manosInstancia.get(k) ?? new Map(),
      rasgosExtra: rasgosInstancia.get(k) ?? new Map(),
      nHojas: hojasPorLinea.get(k)?.size ?? 0,
      estructura, serie: seriePorLinea.get(k) ?? '',
      topo: topoDe(k),
    })
  }
}

// multiplicador '!' de v5 (global; config-driven, no ajusta cantidad al oráculo por serie)
const obsCategoria = new Map()
for (const linea of lineas) {
  const porArt = new Map()
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc'); const art = col(f, 'Articulo')
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
      const v = o.rasgos.get(nombre) ?? 0; if (o.base * v <= 0) continue
      const r = Math.round((o.real / (o.base * v)) * 100) / 100
      ratios.set(r, (ratios.get(r) ?? 0) + 1)
    }
    if (!ratios.size) continue
    const [k] = [...ratios.entries()].sort((a, b) => b[1] - a[1])[0]
    if (k <= 0) continue
    let ok = 0
    for (const o of obs) { const v = o.rasgos.get(nombre) ?? 0; if (Math.abs(o.base * v * k - o.real) < 0.01) ok++ }
    const tasaK = ok / obs.length - (k === 1 ? 0 : 0.001)
    if (tasaK > tasa) { tasa = tasaK; mejor = { rasgo: nombre, k } }
  }
  if (mejor && tasa >= 0.9) multiplicador.set(texto, mejor)
}

function predecirV5(linea) {
  const predicho = new Map()
  const rasgos = rasgosDe(linea)
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc'); const art = col(f, 'Articulo')
    let aporte = null
    if (comp === 'A' || comp === 'L') {
      aporte = num(f, 'Cantidad') * Math.max(num(f, 'UnidadesMin'), 1)
    } else if (comp === '!') {
      const regla = multiplicador.get(col(f, 'AsociadoA'))
      if (!regla) continue
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
        if (!conMedida.length) continue
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
  return predicho
}

function exacta(predicho, reales) {
  if (predicho.size !== reales.size) return { exactArt: false, exactCdad: false }
  for (const art of reales.keys()) if (!predicho.has(art)) return { exactArt: false, exactCdad: false }
  for (const [art, cdad] of reales) if (Math.abs((predicho.get(art) ?? 0) - cdad) > 0.01) return { exactArt: true, exactCdad: false }
  return { exactArt: true, exactCdad: true }
}

// ── reglas topológicas (idénticas a T.48) aprendidas sobre un CONJUNTO train ──
const BASES = {
  marco: (t) => t.marco, hoja: (t) => t.hoja, hueco: (t) => t.hueco, trav: (t) => t.trav, vidrio: (t) => t.vidrio,
  'marco+hoja': (t) => t.marco + t.hoja, 'hoja+trav': (t) => t.hoja + t.trav,
  'hueco+hoja': (t) => t.hueco + t.hoja, 'todos': (t) => t.marco + t.hueco + t.hoja + t.trav,
}
const FACT = [1, 2, 3, 4, 6, 8]
const G = [0, 1, 2, 3, 4, 6, 8], Gsub = [0, 1, 2, 4]
function mejorBaseFactor(rows) {
  let bestN = 0, bestB = null, bestF = 0
  for (const [bn, bf] of Object.entries(BASES)) for (const factor of FACT) {
    const ok = rows.filter((r) => Math.abs(factor * bf(r.topo) - r.real) < 0.01).length
    if (ok > bestN) { bestN = ok; bestB = bn; bestF = factor }
  }
  return { base: bestB, factor: bestF, ok: bestN, n: rows.length }
}
function entrenar(trainLineas) {
  const escR = new Map(), junR = new Map()
  for (const linea of trainLineas) {
    if (!linea.topo) continue
    for (const [art, real] of linea.reales) {
      if (esEscuadra(art) && !ALIN.has(art)) { if (!escR.has(art)) escR.set(art, []); escR.get(art).push({ topo: linea.topo, real }) }
      else if (esJunta(art)) { if (!junR.has(art)) junR.set(art, []); junR.get(art).push({ serie: linea.serie, topo: linea.topo, real }) }
    }
  }
  const rEsc = new Map()
  for (const [art, rs] of escR) { if (rs.length < 3) continue; const r = mejorBaseFactor(rs); if (r.base) rEsc.set(art, r) }
  const jDom = new Map(), jLin = new Map(), jFb = new Map()
  for (const [art, rs] of junR) {
    const best = mejorBaseFactor(rs); jFb.set(art, best)
    if (rs.length >= 20 && best.ok / rs.length >= 0.9) { jDom.set(art, best); continue }
    const porSA = new Map()
    for (const r of rs) { const kk = `${r.serie}|${art}`; if (!porSA.has(kk)) porSA.set(kk, []); porSA.get(kk).push(r) }
    for (const [kk, g] of porSA) {
      if (g.length < 2) continue
      let bA = null, bOk = -1
      for (const a of G) for (const b of G) for (const c of Gsub) for (const d of Gsub) for (const e of G) {
        let ok = 0; for (const r of g) if (Math.abs(a * r.topo.marco + b * r.topo.hoja + c * r.topo.hueco + d * r.topo.trav + e * r.topo.vidrio - r.real) < 0.01) ok++
        if (ok > bOk) { bOk = ok; bA = { a, b, c, d, e } }
      }
      if (bOk / g.length >= 0.8) jLin.set(kk, bA)
    }
  }
  return { rEsc, jDom, jLin, jFb }
}
function overrideCon(M, linea, art) {
  const t = linea.topo; if (!t) return null
  if (esEscuadra(art)) { if (ALIN.has(art)) return predAlin(linea.serie, art, t, linea.perfilesLinea); const r = M.rEsc.get(art); return r ? r.factor * BASES[r.base](t) : null }
  if (esJunta(art)) {
    const dom = M.jDom.get(art); if (dom) return dom.factor * BASES[dom.base](t)
    const lin = M.jLin.get(`${linea.serie}|${art}`); if (lin) return lin.a * t.marco + lin.b * t.hoja + lin.c * t.hueco + lin.d * t.trav + lin.e * t.vidrio
    const fb = M.jFb.get(art); return fb && fb.base ? fb.factor * BASES[fb.base](t) : null
  }
  return null
}
function resuelveCon(M, linea) {
  const pV5 = predecirV5(linea)
  const e0 = exacta(pV5, linea.reales)
  if (!e0.exactArt) return false
  const pTopo = new Map(pV5)
  for (const art of pV5.keys()) { if (esEscuadra(art) || esJunta(art)) { const ov = overrideCon(M, linea, art); if (ov !== null) pTopo.set(art, ov) } }
  return exacta(pTopo, linea.reales).exactCdad
}

// ── 2-fold CV: cada línea del oráculo recibe un veredicto FUERA DE MUESTRA ────
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
const fold = new Map()
for (const linea of lineas) fold.set(linea.k, hash(linea.k + 'cv2') % 2)
const M0 = entrenar(lineas.filter((l) => fold.get(l.k) === 1)) // modelo para juzgar fold 0
const M1 = entrenar(lineas.filter((l) => fold.get(l.k) === 0)) // modelo para juzgar fold 1
const resuelveOOS = new Map()
for (const linea of lineas) resuelveOOS.set(linea.k, resuelveCon(fold.get(linea.k) === 0 ? M0 : M1, linea))

console.log(`Líneas del oráculo (VPRES+VALB+VFAC, con herraje asociado): ${lineas.length}`)
console.log(`  exactArt (conjunto v5 correcto): ${lineas.filter((l) => exacta(predecirV5(l), l.reales).exactArt).length}`)
console.log(`  resuelven EXACTO fuera de muestra (2-fold CV): ${[...resuelveOOS.values()].filter(Boolean).length}`)

// ── clases (serie, topo) del oráculo VPRES y su calificación medida ──────────
const oracleVpres = lineas.filter((l) => l.tipoDoc === 'VPRES' && l.topo && l.serie)
const claseOraculo = new Map() // sig -> {n, ok}
for (const l of oracleVpres) {
  const sig = `${l.serie}|${topoSig(l.topo)}`
  if (!claseOraculo.has(sig)) claseOraculo.set(sig, { n: 0, ok: 0 })
  const c = claseOraculo.get(sig); c.n++; if (resuelveOOS.get(l.k)) c.ok++
}
function clasesQualifican(minSup) {
  const s = new Set()
  for (const [sig, c] of claseOraculo) if (c.n >= minSup && c.ok === c.n) s.add(sig)
  return s
}

// ── COBERTURA sobre las 2.071 líneas estructurales VPRES reales ──────────────
const vpresLin = leer('VPresupuestosLin.csv')
const estructurales = vpresLin.filter((f) => col(f, 'EstructuraSN') === 'True')
const docsConEstr = new Set(estructurales.map((f) => col(f, 'nDoc')))

function coberturaLineas(minSup) {
  const qual = clasesQualifican(minSup)
  let valued = 0, sinArbol = 0, sinSerie = 0, claseNoCalifica = 0
  const valuedPorDoc = new Map(), totalPorDoc = new Map()
  for (const f of estructurales) {
    const nDoc = col(f, 'nDoc')
    totalPorDoc.set(nDoc, (totalPorDoc.get(nDoc) ?? 0) + 1)
    const k = `VPRES|${nDoc}|${col(f, 'nLinea')}`
    const topo = topoDe(k), serie = seriePorLinea.get(k) ?? ''
    let ok = false
    if (!topo) sinArbol++
    else if (!serie) sinSerie++
    else if (qual.has(`${serie}|${topoSig(topo)}`)) ok = true
    else claseNoCalifica++
    if (ok) { valued++; valuedPorDoc.set(nDoc, (valuedPorDoc.get(nDoc) ?? 0) + 1) }
  }
  let docsCompletos = 0
  for (const d of docsConEstr) if ((valuedPorDoc.get(d) ?? 0) === totalPorDoc.get(d)) docsCompletos++
  return { minSup, qualClases: qual.size, valued, sinArbol, sinSerie, claseNoCalifica, docsCompletos }
}

console.log(`\n════════ UNIVERSO REAL ════════`)
console.log(`  Líneas estructurales VPRES (productos configurados): ${estructurales.length}`)
console.log(`  Presupuestos con >=1 línea estructural: ${docsConEstr.size}`)
console.log(`  De ellas con árbol de diseño (topo): ${estructurales.filter((f) => topoDe(`VPRES|${col(f, 'nDoc')}|${col(f, 'nLinea')}`)).length}`)
console.log(`  (el resto NO es modelable por la vía topológica; sin árbol ni en la MDB viva)`)

console.log(`\n════════ CLASES (serie, topo) QUE CALIFICAN (criterio MEDIDO, 100% OOS) ════════`)
console.log(`  clases (serie,topo) del oráculo VPRES: ${claseOraculo.size}`)
for (const minSup of [1, 2, 3, 5]) {
  const q = clasesQualifican(minSup)
  console.log(`   minSoporte=${minSup}: ${q.size} clases califican`)
}

console.log(`\n════════ COBERTURA (dos porcentajes, por minSoporte de clase) ════════`)
console.log(`  minSup | clasesOK | LÍNEAS valoradas / ${estructurales.length}  (%)  | PRESUP. COMPLETOS / ${docsConEstr.size} (%)`)
for (const minSup of [1, 2, 3, 5]) {
  const c = coberturaLineas(minSup)
  const pl = (100 * c.valued / estructurales.length).toFixed(1)
  const pd = (100 * c.docsCompletos / docsConEstr.size).toFixed(1)
  console.log(`   ${String(minSup).padStart(4)}   | ${String(c.qualClases).padStart(7)}  | ${String(c.valued).padStart(6)} / ${estructurales.length}  (${pl}%) | ${String(c.docsCompletos).padStart(5)} / ${docsConEstr.size}  (${pd}%)`)
}

console.log(`\n════════ ANATOMÍA de por qué una línea NO se valora (minSup=2) ════════`)
{
  const c = coberturaLineas(2)
  console.log(`  sin árbol de diseño (no modelable)      : ${c.sinArbol}`)
  console.log(`  con árbol pero sin serie                : ${c.sinSerie}`)
  console.log(`  con árbol+serie, clase NO califica      : ${c.claseNoCalifica}`)
  console.log(`  VALORADAS (clase califica)              : ${c.valued}`)
}

console.log(`\n════════ TECHO OPTIMISTA (si el recuento fuera perfecto en toda clase con árbol) ════════`)
{
  let conArbolSerie = 0
  for (const f of estructurales) {
    const k = `VPRES|${col(f, 'nDoc')}|${col(f, 'nLinea')}`
    if (topoDe(k) && (seriePorLinea.get(k) ?? '')) conArbolSerie++
  }
  console.log(`  líneas con árbol+serie (techo estructural de plan (a)): ${conArbolSerie} / ${estructurales.length} (${(100 * conArbolSerie / estructurales.length).toFixed(1)}%)`)
}

// ── cobertura ponderada por € (histórico ImporteTotal) y distribución por doc ─
console.log(`\n════════ COBERTURA PONDERADA POR € (histórico ImporteTotal, minSup=2) ════════`)
{
  const qual = clasesQualifican(2)
  let eurTot = 0, eurVal = 0
  const eurTotDoc = new Map(), eurValDoc = new Map()
  for (const f of estructurales) {
    const nDoc = col(f, 'nDoc')
    const imp = num(f, 'ImporteTotal')
    eurTot += imp; eurTotDoc.set(nDoc, (eurTotDoc.get(nDoc) ?? 0) + imp)
    const k = `VPRES|${nDoc}|${col(f, 'nLinea')}`
    const topo = topoDe(k), serie = seriePorLinea.get(k) ?? ''
    if (topo && serie && qual.has(`${serie}|${topoSig(topo)}`)) { eurVal += imp; eurValDoc.set(nDoc, (eurValDoc.get(nDoc) ?? 0) + imp) }
  }
  console.log(`  € en líneas valoradas / € total estructural: ${eurVal.toFixed(0)} / ${eurTot.toFixed(0)} (${(100 * eurVal / eurTot).toFixed(2)}%)`)
  // distribución: por presupuesto, % de sus líneas estructurales con árbol
  const conArbolDoc = new Map(), totDoc = new Map()
  for (const f of estructurales) {
    const nDoc = col(f, 'nDoc')
    totDoc.set(nDoc, (totDoc.get(nDoc) ?? 0) + 1)
    if (topoDe(`VPRES|${nDoc}|${col(f, 'nLinea')}`)) conArbolDoc.set(nDoc, (conArbolDoc.get(nDoc) ?? 0) + 1)
  }
  const fracs = [...docsConEstr].map((d) => (conArbolDoc.get(d) ?? 0) / totDoc.get(d)).sort((a, b) => a - b)
  const median = fracs[Math.floor(fracs.length / 2)]
  const docsTodoArbol = fracs.filter((x) => x === 1).length
  console.log(`  presupuestos donde TODAS sus líneas estructurales tienen árbol: ${docsTodoArbol} / ${docsConEstr.size}`)
  console.log(`  mediana de (líneas con árbol / líneas estructurales) por presupuesto: ${(100 * median).toFixed(0)}%`)
}

// ── LISTA de las clases que califican (para el anexo; regla 8, medido) ────────
console.log(`\n════════ CLASES QUE CALIFICAN (minSup=2) — lista explícita ════════`)
{
  const qual = clasesQualifican(2)
  for (const sig of qual) { const c = claseOraculo.get(sig); console.log(`   ${sig}  (oráculo n=${c.n}, resuelven OOS=${c.ok})`) }
  if (!qual.size) console.log(`   (ninguna)`)
}
