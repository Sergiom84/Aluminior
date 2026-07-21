/**
 * T.50 (medición, SOLO LECTURA, NO commitear):
 * Extiende T.48 (medir-topo-sustituido.mjs). Sustituye la regla de la ESCUADRA DE
 * ESQUINA: donde T.48/T.36 usaba UN solo término base×factor (4×hoja, 4×marco…) —que
 * no cierra multi-hueco/travesaño—, ahora usa el MISMO modelo LINEAL-ENTERO POR SERIE
 * de T.41/T.43 (a·marco+b·hoja+c·hueco+d·trav+e·vidrio, coef enteros por (serie,art),
 * grid, con base×factor de T.36 como FALLBACK cuando no hay modelo de serie). La
 * escuadra de alineamiento (predAlin) y la junta quedan como T.48.
 *
 * Mide, honesto, held-out por línea (split idéntico a T.48):
 *   1) por artículo-escuadra: ¿el lineal cierra el residuo multi-hueco/trav que 4×base
 *      dejaba abierto? train/test/topología nueva; qué generaliza vs memoriza.
 *   2) integrado: exactasCdad held-out ANTES (escuadra base×factor, = T.48) vs DESPUÉS
 *      (escuadra lineal), cuántos near-miss de escuadra cierran, nuevo bloqueante.
 * Enlace exacto = Cdad de hijas por nEstr==nLinea (regla 8). Imprime nulos/ceros (regla 7).
 *
 * Uso: npx tsx scripts/medir-escuadra-lineal-serie.mjs
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

// ── clasificadores de artículo ──────────────────────────────────────────────
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
function tipoAsoc(art) {
  const fam = famPorArt.get(art) ?? ''
  const desc = (descArt.get(art) ?? '').toUpperCase()
  if (fam === '054' || /^MO/.test(art) || /MANO DE OBRA|COLOCAC|FABRICAC/.test(desc)) return 'mano de obra'
  if (esEscuadra(art)) return 'escuadra'
  if (esJunta(art) || /GOMA|JUNTA|JUNQUILL|BURLETE|FELPUD|CEPILLO/.test(desc)) return 'junta/goma'
  if (/PATILL/.test(desc)) return 'patilla'
  return 'herraje'
}

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]

// ── candidatas por conjunto (v5) ────────────────────────────────────────────
const asocPorConjunto = new Map()
const poblacionAsoc = new Set()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  poblacionAsoc.add(art)
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
}

// ── plantilla de ranuras (v5) ───────────────────────────────────────────────
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

// ── cotas (v5) ──────────────────────────────────────────────────────────────
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

// ── opciones e instancias (v5) ──────────────────────────────────────────────
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

// ── topología de la instancia (Tipo counts) para override topológico ─────────
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

// ── T.46+T.47: predictor de escuadra de ALINEAMIENTO ────────────────────────
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

// ── aprendizaje '!' de v5 (idéntico) ────────────────────────────────────────
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

// ── construcción del oráculo (v5) ───────────────────────────────────────────
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
      k, opciones, ranuras, reales, medidasRanura, perfilesLinea,
      manos: manosInstancia.get(k) ?? new Map(),
      rasgosExtra: rasgosInstancia.get(k) ?? new Map(),
      nHojas: hojasPorLinea.get(k)?.size ?? 0,
      estructura, serie: seriePorLinea.get(k) ?? '',
      topo: topoDe(k),
    })
  }
}
console.log(`Líneas del oráculo (VPRES+VALB+VFAC): ${lineas.length}`)

// multiplicador '!' de v5 (idéntico)
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
console.log(`Multiplicadores '!' aprendidos: ${multiplicador.size} de ${obsCategoria.size} categorías`)

// ── predicción v5 pura (predicho por línea) ─────────────────────────────────
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

// ═════════ APRENDER reglas topológicas IN-SAMPLE (techo) ════════════════════
// Reales de escuadra / junta por (línea, art)
const escuadraRows = new Map()   // art -> [{serie, topo, real}]  (esquina, no ALIN)
const alinRows = new Map()       // art -> [{serie, topo, real}]  (alineamiento)
const juntaRows = new Map()      // art -> [{serie, topo, real}]
for (const linea of lineas) {
  if (!linea.topo) continue
  for (const [art, real] of linea.reales) {
    if (esEscuadra(art) && !ALIN.has(art)) {
      if (!escuadraRows.has(art)) escuadraRows.set(art, [])
      escuadraRows.get(art).push({ serie: linea.serie, topo: linea.topo, real })
    } else if (esEscuadra(art) && ALIN.has(art)) {
      if (!alinRows.has(art)) alinRows.set(art, [])
      alinRows.get(art).push({ serie: linea.serie, topo: linea.topo, real })
    } else if (esJunta(art)) {
      if (!juntaRows.has(art)) juntaRows.set(art, [])
      juntaRows.get(art).push({ serie: linea.serie, topo: linea.topo, real })
    }
  }
}

const BASES = {
  marco: (t) => t.marco, hoja: (t) => t.hoja, hueco: (t) => t.hueco, trav: (t) => t.trav, vidrio: (t) => t.vidrio,
  'marco+hoja': (t) => t.marco + t.hoja, 'hoja+trav': (t) => t.hoja + t.trav,
  'hueco+hoja': (t) => t.hueco + t.hoja, 'todos': (t) => t.marco + t.hueco + t.hoja + t.trav,
}
const FACT = [1, 2, 3, 4, 6, 8]
function mejorBaseFactor(rows) {
  let bestN = 0, bestB = null, bestF = 0
  for (const [bn, bf] of Object.entries(BASES)) for (const factor of FACT) {
    const ok = rows.filter((r) => Math.abs(factor * bf(r.topo) - r.real) < 0.01).length
    if (ok > bestN) { bestN = ok; bestB = bn; bestF = factor }
  }
  return { base: bestB, factor: bestF, ok: bestN, n: rows.length }
}

const G = [0, 1, 2, 3, 4, 6, 8], Gsub = [0, 1, 2, 4]
function ajustarLineal(rows) {   // grid a·marco+b·hoja+c·hueco+d·trav+e·vidrio
  let bA = null, bOk = -1
  for (const a of G) for (const b of G) for (const c of Gsub) for (const d of Gsub) for (const e of G) {
    let ok = 0
    for (const r of rows) if (Math.abs(a * r.topo.marco + b * r.topo.hoja + c * r.topo.hueco + d * r.topo.trav + e * r.topo.vidrio - r.real) < 0.01) ok++
    if (ok > bOk) { bOk = ok; bA = { a, b, c, d, e } }
  }
  return { m: bA, ok: bOk }
}
const linVal = (m, t) => m.a * t.marco + m.b * t.hoja + m.c * t.hueco + m.d * t.trav + m.e * t.vidrio

// escuadra de esquina: T.36 base×factor (FALLBACK) + T.50 lineal-entero por (serie,art)
const reglaEscuadra = new Map()   // art -> {base,factor}  (T.36, fallback)
const reglaEscLin = new Map()     // serie|art -> {a,b,c,d,e}  (T.50)
for (const [art, rows] of escuadraRows) {
  if (rows.length >= 3) { const r = mejorBaseFactor(rows); if (r.base) reglaEscuadra.set(art, r) }
  const porSA = new Map()
  for (const r of rows) { const kk = `${r.serie}|${art}`; if (!porSA.has(kk)) porSA.set(kk, []); porSA.get(kk).push(r) }
  for (const [kk, rs] of porSA) {
    if (rs.length < 2) continue
    const { m, ok } = ajustarLineal(rs)
    if (ok / rs.length >= 0.8) reglaEscLin.set(kk, m)
  }
}

// escuadra de ALINEAMIENTO: lineal-entero por (serie,art) (in-sample completo), fallback predAlin
const reglaAlinLin = new Map()    // serie|art -> {a,b,c,d,e}
for (const [art, rows] of alinRows) {
  const porSA = new Map()
  for (const r of rows) { const kk = `${r.serie}|${art}`; if (!porSA.has(kk)) porSA.set(kk, []); porSA.get(kk).push(r) }
  for (const [kk, rs] of porSA) { if (rs.length < 2) continue; const { m, ok } = ajustarLineal(rs); if (ok / rs.length >= 0.8) reglaAlinLin.set(kk, m) }
}

// junta: dominante (n≥20, ≥90%) base×factor; residuo → lineal-entero por (serie,art)
const reglaJuntaDom = new Map()
const reglaJuntaLin = new Map()   // serie|art -> {a,b,c,d,e}
const juntaFallback = new Map()   // art -> mejorBaseFactor (para residuo sin modelo serie)
for (const [art, rows] of juntaRows) {
  const best = mejorBaseFactor(rows)
  juntaFallback.set(art, best)
  if (rows.length >= 20 && best.ok / rows.length >= 0.9) { reglaJuntaDom.set(art, best); continue }
  // residuo: lineal-entero por (serie,art) in-sample
  const porSA = new Map()
  for (const r of rows) { const kk = `${r.serie}|${art}`; if (!porSA.has(kk)) porSA.set(kk, []); porSA.get(kk).push(r) }
  for (const [kk, rs] of porSA) {
    if (rs.length < 2) continue
    let bA = null, bOk = -1
    for (const a of G) for (const b of G) for (const c of Gsub) for (const d of Gsub) for (const e of G) {
      let ok = 0
      for (const r of rs) if (Math.abs(a * r.topo.marco + b * r.topo.hoja + c * r.topo.hueco + d * r.topo.trav + e * r.topo.vidrio - r.real) < 0.01) ok++
      if (ok > bOk) { bOk = ok; bA = { a, b, c, d, e } }
    }
    if (bOk / rs.length >= 0.8) reglaJuntaLin.set(kk, bA)
  }
}
console.log(`Reglas topológicas: escuadra-esquina base×factor=${reglaEscuadra.size} art; escuadra-LINEAL(serie,art)=${reglaEscLin.size}; junta-dominante=${reglaJuntaDom.size}; junta-lineal(serie,art)=${reglaJuntaLin.size}`)

// override topológico de la cantidad de UN artículo escuadra/junta en una línea.
// modo='techo': incluye ajustes in-sample (corner esquina, junta lineal/fallback).
// modo='estructural': solo reglas NO ajustadas al oráculo (ALIN T.46/47 desde tablas de
//   config, y junta dominante n≥20 ≥90%). Es el número honesto no-optimista.
// escMode: 'lin' = lineal-por-serie con fallback base×factor (T.50, defecto)
//          'bf'  = solo base×factor de T.36 (= comportamiento T.48, para comparar)
function overrideTopo(linea, art, modo = 'techo', escMode = 'lin') {
  const t = linea.topo; if (!t) return null
  if (esEscuadra(art)) {
    if (ALIN.has(art)) {
      if (escMode === 'linAll') { const lin = reglaAlinLin.get(`${linea.serie}|${art}`); if (lin) return linVal(lin, t) }
      return predAlin(linea.serie, art, t, linea.perfilesLinea)
    }
    if (modo === 'estructural') return null
    if (escMode === 'lin' || escMode === 'linAll') {
      const lin = reglaEscLin.get(`${linea.serie}|${art}`)
      if (lin) return linVal(lin, t)
    }
    const r = reglaEscuadra.get(art); if (!r) return null
    return r.factor * BASES[r.base](t)
  }
  if (esJunta(art)) {
    const dom = reglaJuntaDom.get(art); if (dom) return dom.factor * BASES[dom.base](t)
    if (modo === 'estructural') return null
    const lin = reglaJuntaLin.get(`${linea.serie}|${art}`)
    if (lin) return lin.a * t.marco + lin.b * t.hoja + lin.c * t.hueco + lin.d * t.trav + lin.e * t.vidrio
    const fb = juntaFallback.get(art); if (fb && fb.base) return fb.factor * BASES[fb.base](t)
    return null
  }
  return null
}

// ═════════ MEDICIÓN ANTES / DESPUÉS ═════════════════════════════════════════
function exacta(predicho, reales) {
  if (predicho.size !== reales.size) return { exactArt: false, exactCdad: false, qtyWrong: [] }
  for (const art of reales.keys()) if (!predicho.has(art)) return { exactArt: false, exactCdad: false, qtyWrong: [] }
  const qtyWrong = []
  for (const [art, cdad] of reales) {
    const pv = predicho.get(art) ?? 0
    if (Math.abs(pv - cdad) > 0.01) qtyWrong.push({ art, pred: pv, real: cdad })
  }
  return { exactArt: true, exactCdad: qtyWrong.length === 0, qtyWrong }
}

let exArtCount = 0, exCdadAntes = 0, exCdadDespues = 0
const cierran = []                     // líneas que pasan de mal→exacta
const bloqueante = new Map()           // tipo -> nº líneas donde es el (co)bloqueante top
const nearMiss = { antes: 0, despues: 0, compDespues: new Map() }
const overrideStats = { escOverride: 0, escNull: 0, juntaOverride: 0, juntaNull: 0, cambios: 0 }

for (const linea of lineas) {
  const pV5 = predecirV5(linea)
  const antes = exacta(pV5, linea.reales)
  if (!antes.exactArt) continue        // el override no cambia el conjunto -> solo importa exactArt
  exArtCount++
  if (antes.exactCdad) exCdadAntes++

  // DESPUÉS: copiar y sustituir cantidad de escuadra/junta
  const pTopo = new Map(pV5)
  for (const art of pV5.keys()) {
    if (!(esEscuadra(art) || esJunta(art))) continue
    const ov = overrideTopo(linea, art)
    if (esEscuadra(art)) { if (ov === null) overrideStats.escNull++; else overrideStats.escOverride++ }
    else { if (ov === null) overrideStats.juntaNull++; else overrideStats.juntaOverride++ }
    if (ov !== null && Math.abs(ov - (pV5.get(art) ?? 0)) > 0.01) overrideStats.cambios++
    if (ov !== null) pTopo.set(art, ov)   // mantiene la clave (no rompe exactArt)
  }
  const despues = exacta(pTopo, linea.reales)
  if (despues.exactCdad) exCdadDespues++
  if (!antes.exactCdad && despues.exactCdad) cierran.push(linea)

  // anatomía del bloqueante restante (líneas exactArt pero NO exactCdad DESPUÉS)
  if (!despues.exactCdad) {
    const tiposMal = new Set(despues.qtyWrong.map((w) => tipoAsoc(w.art)))
    for (const t of tiposMal) bloqueante.set(t, (bloqueante.get(t) ?? 0) + 1)
    // near-miss: exactamente 1 artículo mal
    if (despues.qtyWrong.length === 1) {
      nearMiss.despues++
      const t = tipoAsoc(despues.qtyWrong[0].art)
      nearMiss.compDespues.set(t, (nearMiss.compDespues.get(t) ?? 0) + 1)
    }
  }
  if (!antes.exactCdad && antes.qtyWrong.length === 1) nearMiss.antes++
}

console.log(`\n════════ 1) exactasCdad ANTES vs DESPUÉS (sobre ${lineas.length} líneas) ════════`)
console.log(`  Líneas exactas en ARTÍCULOS (conjunto correcto, invariante)     : ${exArtCount}`)
console.log(`  exactasCdad ANTES  (v5 puro)                                    : ${exCdadAntes}`)
console.log(`  exactasCdad DESPUÉS (escuadras+juntas con recuento topológico)  : ${exCdadDespues}`)
console.log(`  → cierres netos por el recuento topológico                     : ${exCdadDespues - exCdadAntes}`)
console.log(`  (nota: DESPUÉS = TECHO; reglas topológicas aprendidas in-sample)`)

if (cierran.length) {
  console.log(`\n  LÍNEAS QUE CIERRAN (serie | estructura | k):`)
  for (const l of cierran) console.log(`     ${l.serie} | ${l.estructura} | ${l.k}  [m${l.topo.marco}hu${l.topo.hueco}h${l.topo.hoja}t${l.topo.trav}v${l.topo.vidrio}]`)
} else {
  console.log(`\n  LÍNEAS QUE CIERRAN: 0 (ninguna; regla 7)`)
}

// VERIFICACIÓN art-a-art de las 3 primeras que cierran
console.log(`\n  ── VERIFICACIÓN art-a-art (3 primeras que cierran) ──`)
for (const l of cierran.slice(0, 3)) {
  const pV5 = predecirV5(l); const pTopo = new Map(pV5)
  for (const art of pV5.keys()) { if (esEscuadra(art) || esJunta(art)) { const ov = overrideTopo(l, art); if (ov !== null) pTopo.set(art, ov) } }
  console.log(`   ${l.serie}|${l.estructura}|${l.k}`)
  for (const [art, real] of l.reales) {
    console.log(`      ${art.padEnd(8)} real=${real} v5=${pV5.get(art)} topo=${pTopo.get(art)} [${tipoAsoc(art)}] ${real === pTopo.get(art) ? 'OK' : 'MISMATCH'}`)
  }
}

console.log(`\n════════ 2) ANATOMÍA DEL BLOQUEANTE RESTANTE (líneas exactArt, cdad mal DESPUÉS) ════════`)
console.log(`  Nº líneas con conjunto correcto pero cantidad mal DESPUÉS: ${exArtCount - exCdadDespues}`)
console.log(`  Componentes implicados (una línea puede tener varios; cuenta de líneas donde el tipo aparece):`)
for (const [t, n] of [...bloqueante].sort((a, b) => b[1] - a[1])) console.log(`     ${t.padEnd(14)}: ${n}`)
if (!bloqueante.size) console.log(`     (ninguno) 0   (regla 7)`)

console.log(`\n════════ 3) NEAR-MISS (a UN SOLO artículo de ser exactas) ════════`)
console.log(`  Near-miss ANTES  (v5 puro, exactArt, 1 art de cdad mal)   : ${nearMiss.antes}`)
console.log(`  Near-miss DESPUÉS (con topología, 1 art de cdad mal)      : ${nearMiss.despues}`)
console.log(`  Componente de ese único artículo bloqueante (DESPUÉS):`)
for (const [t, n] of [...nearMiss.compDespues].sort((a, b) => b[1] - a[1])) console.log(`     ${t.padEnd(14)}: ${n}`)
if (!nearMiss.compDespues.size) console.log(`     (ninguno) 0`)

console.log(`\n════════ diagnóstico del override ════════`)
console.log(`  Escuadra: override aplicado ${overrideStats.escOverride}, sin regla (null, sigue v5) ${overrideStats.escNull}`)
console.log(`  Junta   : override aplicado ${overrideStats.juntaOverride}, sin regla (null, sigue v5) ${overrideStats.juntaNull}`)
console.log(`  Sustituciones que cambian la cantidad vs v5: ${overrideStats.cambios}`)

// ── subconjunto "regime reconstruido": líneas single-hueco / corredera limpia ──
// (sin oscilobatiente/felpudo). Aproximación topológica: 1 marco, sin travesaño,
//  y sin junta felpudo entre los reales.
const esFelpudo = (art) => /FELPUD|CEPILLO/.test((descArt.get(art) ?? '').toUpperCase())
let regN = 0, regExAntes = 0, regExDespues = 0
for (const linea of lineas) {
  if (!linea.topo) continue
  const limpio = linea.topo.marco === 1 && linea.topo.trav === 0 && ![...linea.reales.keys()].some(esFelpudo)
  if (!limpio) continue
  const pV5 = predecirV5(linea); const antes = exacta(pV5, linea.reales)
  if (!antes.exactArt) continue
  regN++
  if (antes.exactCdad) regExAntes++
  const pTopo = new Map(pV5)
  for (const art of pV5.keys()) { if (esEscuadra(art) || esJunta(art)) { const ov = overrideTopo(linea, art); if (ov !== null) pTopo.set(art, ov) } }
  if (exacta(pTopo, linea.reales).exactCdad) regExDespues++
}
console.log(`\n════════ subconjunto REGIME RECONSTRUIDO (marco=1, trav=0, sin felpudo) ════════`)
console.log(`  líneas exactArt en el régimen: ${regN}   exactasCdad antes=${regExAntes}  después=${regExDespues}`)

// ── modo ESTRUCTURAL (honesto, sin ajuste in-sample) ────────────────────────
let exCdadEstructural = 0
for (const linea of lineas) {
  const pV5 = predecirV5(linea); const antes = exacta(pV5, linea.reales)
  if (!antes.exactArt) continue
  const pTopo = new Map(pV5)
  for (const art of pV5.keys()) { if (esEscuadra(art) || esJunta(art)) { const ov = overrideTopo(linea, art, 'estructural'); if (ov !== null) pTopo.set(art, ov) } }
  if (exacta(pTopo, linea.reales).exactCdad) exCdadEstructural++
}
console.log(`\n════════ exactasCdad MODO ESTRUCTURAL (solo ALIN T.46/47 + junta dominante; SIN ajuste in-sample) ════════`)
console.log(`  exactasCdad DESPUÉS (estructural, honesto): ${exCdadEstructural}  (vs techo ${exCdadDespues}, vs antes ${exCdadAntes})`)

// ── ATRIBUCIÓN: solo-escuadra vs solo-junta (techo) ─────────────────────────
function contarConOverride(fam) {  // fam: 'esc' | 'junta' | 'ambos'
  let n = 0
  for (const linea of lineas) {
    const pV5 = predecirV5(linea); if (!exacta(pV5, linea.reales).exactArt) continue
    const pTopo = new Map(pV5)
    for (const art of pV5.keys()) {
      const apEsc = esEscuadra(art) && (fam === 'esc' || fam === 'ambos')
      const apJun = esJunta(art) && (fam === 'junta' || fam === 'ambos')
      if (!apEsc && !apJun) continue
      const ov = overrideTopo(linea, art, 'techo'); if (ov !== null) pTopo.set(art, ov)
    }
    if (exacta(pTopo, linea.reales).exactCdad) n++
  }
  return n
}
console.log(`\n════════ ATRIBUCIÓN del techo (qué familia cierra) ════════`)
console.log(`  solo override ESCUADRA: ${contarConOverride('esc')}   solo override JUNTA: ${contarConOverride('junta')}   ambos: ${contarConOverride('ambos')}`)

// ── HELD-OUT MULTI-SALT: reglas train-only, medir cierres en test; ≥4 sales distintas ──
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
// runSalt: aprende reglas SOLO en train (según la sal), devuelve exactasCdad TEST para cada modo.
// cf=true activa el CONTRAFACTUAL: la override de escuadra solo dispara si la (serie,art,topo-sig)
//   de la línea de test NO se vio en train -> desactiva la "memoria de config vista exacta" (T.37).
function runSalt(salt, cf = false) {
  const esTest = new Map()
  for (const linea of lineas) esTest.set(linea.k, hash(linea.k + salt) % 2 === 0)
  const escRowsTr = new Map(), junRowsTr = new Map(), alinRowsTr = new Map()
  const sigTr = new Map()  // serie|art -> Set(topo-sig visto en train)
  for (const linea of lineas) {
    if (esTest.get(linea.k) || !linea.topo) continue
    const sg = `${linea.topo.marco},${linea.topo.hueco},${linea.topo.hoja},${linea.topo.trav},${linea.topo.vidrio}`
    for (const [art, real] of linea.reales) {
      const kk = `${linea.serie}|${art}`
      if (esEscuadra(art)) { if (!sigTr.has(kk)) sigTr.set(kk, new Set()); sigTr.get(kk).add(sg) }
      if (esEscuadra(art) && !ALIN.has(art)) { if (!escRowsTr.has(art)) escRowsTr.set(art, []); escRowsTr.get(art).push({ serie: linea.serie, topo: linea.topo, real }) }
      else if (esEscuadra(art) && ALIN.has(art)) { if (!alinRowsTr.has(art)) alinRowsTr.set(art, []); alinRowsTr.get(art).push({ serie: linea.serie, topo: linea.topo, real }) }
      else if (esJunta(art)) { if (!junRowsTr.has(art)) junRowsTr.set(art, []); junRowsTr.get(art).push({ serie: linea.serie, topo: linea.topo, real }) }
    }
  }
  const reglaEscTr = new Map(), reglaEscLinTr = new Map(), reglaAlinLinTr = new Map()
  for (const [art, rs] of escRowsTr) {
    if (rs.length >= 3) { const r = mejorBaseFactor(rs); if (r.base) reglaEscTr.set(art, r) }
    const porSA = new Map(); for (const r of rs) { const kk = `${r.serie}|${art}`; if (!porSA.has(kk)) porSA.set(kk, []); porSA.get(kk).push(r) }
    for (const [kk, g] of porSA) { if (g.length < 2) continue; const { m, ok } = ajustarLineal(g); if (ok / g.length >= 0.8) reglaEscLinTr.set(kk, m) }
  }
  for (const [art, rs] of alinRowsTr) {
    const porSA = new Map(); for (const r of rs) { const kk = `${r.serie}|${art}`; if (!porSA.has(kk)) porSA.set(kk, []); porSA.get(kk).push(r) }
    for (const [kk, g] of porSA) { if (g.length < 2) continue; const { m, ok } = ajustarLineal(g); if (ok / g.length >= 0.8) reglaAlinLinTr.set(kk, m) }
  }
  const junDomTr = new Map(), junLinTr = new Map(), junFbTr = new Map()
  for (const [art, rs] of junRowsTr) {
    const best = mejorBaseFactor(rs); junFbTr.set(art, best)
    if (rs.length >= 20 && best.ok / rs.length >= 0.9) { junDomTr.set(art, best); continue }
    const porSA = new Map(); for (const r of rs) { const kk = `${r.serie}|${art}`; if (!porSA.has(kk)) porSA.set(kk, []); porSA.get(kk).push(r) }
    for (const [kk, g] of porSA) { if (g.length < 2) continue; const { m, ok } = ajustarLineal(g); if (ok / g.length >= 0.8) junLinTr.set(kk, m) }
  }
  function ovTr(linea, art, escMode) {
    const t = linea.topo; if (!t) return null
    const sg = `${t.marco},${t.hueco},${t.hoja},${t.trav},${t.vidrio}`
    const memoria = cf && esTest.get(linea.k) && (sigTr.get(`${linea.serie}|${art}`)?.has(sg))
    if (esEscuadra(art)) {
      if (ALIN.has(art)) {
        if (escMode === 'linAll' && !memoria) { const lin = reglaAlinLinTr.get(`${linea.serie}|${art}`); if (lin) return linVal(lin, t) }
        return predAlin(linea.serie, art, t, linea.perfilesLinea)
      }
      if ((escMode === 'lin' || escMode === 'linAll') && !memoria) { const lin = reglaEscLinTr.get(`${linea.serie}|${art}`); if (lin) return linVal(lin, t) }
      const r = reglaEscTr.get(art); return r ? r.factor * BASES[r.base](t) : null
    }
    if (esJunta(art)) {
      const dom = junDomTr.get(art); if (dom) return dom.factor * BASES[dom.base](t)
      const lin = junLinTr.get(`${linea.serie}|${art}`); if (lin) return linVal(lin, t)
      const fb = junFbTr.get(art); return fb && fb.base ? fb.factor * BASES[fb.base](t) : null
    }
    return null
  }
  const cierres = {}
  for (const escMode of ['bf', 'lin', 'linAll']) {
    let teExArt = 0, teEx = 0; const set = new Set()
    for (const linea of lineas) {
      if (!esTest.get(linea.k)) continue
      const pV5 = predecirV5(linea); if (!exacta(pV5, linea.reales).exactArt) continue
      teExArt++
      const pTopo = new Map(pV5)
      for (const art of pV5.keys()) { if (esEscuadra(art) || esJunta(art)) { const ov = ovTr(linea, art, escMode); if (ov !== null) pTopo.set(art, ov) } }
      if (exacta(pTopo, linea.reales).exactCdad) { teEx++; set.add(linea.k) }
    }
    cierres[escMode] = { teEx, teExArt, set }
  }
  return cierres
}
console.log(`\n════════ ESTABILIDAD HELD-OUT MULTI-SALT (5 sales; exactasCdad TEST) ════════`)
console.log(`  sal        T48(bf)   TODAS-LIN   delta   |  contrafactual (sin memoria topo exacta): TODAS-LIN  delta`)
const SALES = ['topo', 's2alt', 's3xyz', 's4qrs', 's5mno']
const deltas = [], deltasCf = [], teLinAll = [], teBFs = []
for (const salt of SALES) {
  const c = runSalt(salt, false), ccf = runSalt(salt, true)
  const d = c.linAll.teEx - c.bf.teEx, dcf = ccf.linAll.teEx - ccf.bf.teEx
  deltas.push(d); deltasCf.push(dcf); teLinAll.push(c.linAll.teEx); teBFs.push(c.bf.teEx)
  console.log(`  ${salt.padEnd(8)}  ${String(c.bf.teEx).padStart(2)}/${c.bf.teExArt}     ${String(c.linAll.teEx).padStart(2)}/${c.linAll.teExArt}      +${d}      |                                    ${String(ccf.linAll.teEx).padStart(2)}/${ccf.linAll.teExArt}      +${dcf}`)
}
const mean = (a) => (a.reduce((x, y) => x + y, 0) / a.length)
const rng = (a) => `[${Math.min(...a)}..${Math.max(...a)}]`
console.log(`\n  delta TODAS-LIN vs T.48: media ${mean(deltas).toFixed(1)} rango ${rng(deltas)}`)
console.log(`  delta CONTRAFACTUAL (solo fórmula sobre topología NUEVA, sin memoria exacta): media ${mean(deltasCf).toFixed(1)} rango ${rng(deltasCf)}`)
console.log(`  → parte del delta que es FÓRMULA-que-generaliza (contrafactual/total): ${mean(deltas) ? (100 * mean(deltasCf) / mean(deltas)).toFixed(0) : 0}%  ; resto = memoria de (serie,topología) exacta vista en train`)

// para el bloque siguiente (in-sample techo) reusa reglas full ya aprendidas arriba
const esTest = new Map(); for (const linea of lineas) esTest.set(linea.k, hash(linea.k + 'topo') % 2 === 0)
// modelo lineal de esquina train-only (sal 'topo') para la columna "LIN test" del diagnóstico
const reglaEscLinTr = new Map()
{
  const escTr = new Map()
  for (const linea of lineas) { if (esTest.get(linea.k) || !linea.topo) continue; for (const [art, real] of linea.reales) { if (esEscuadra(art) && !ALIN.has(art)) { if (!escTr.has(art)) escTr.set(art, []); escTr.get(art).push({ serie: linea.serie, topo: linea.topo, real }) } } }
  for (const [art, rs] of escTr) { const porSA = new Map(); for (const r of rs) { const kk = `${r.serie}|${art}`; if (!porSA.has(kk)) porSA.set(kk, []); porSA.get(kk).push(r) } for (const [kk, g] of porSA) { if (g.length < 2) continue; const { m, ok } = ajustarLineal(g); if (ok / g.length >= 0.8) reglaEscLinTr.set(kk, m) } }
}

// ── bloqueante restante DESPUÉS (lineal), sobre TODAS las exactArt (in-sample techo) ──
const bloqLin = new Map(); const nmLin = new Map(); let nmLinTot = 0
for (const linea of lineas) {
  const pV5 = predecirV5(linea); if (!exacta(pV5, linea.reales).exactArt) continue
  const pTopo = new Map(pV5)
  for (const art of pV5.keys()) { if (esEscuadra(art) || esJunta(art)) { const ov = overrideTopo(linea, art, 'techo', 'linAll'); if (ov !== null) pTopo.set(art, ov) } }
  const res = exacta(pTopo, linea.reales)
  if (res.exactCdad) continue
  for (const t of new Set(res.qtyWrong.map((w) => tipoAsoc(w.art)))) bloqLin.set(t, (bloqLin.get(t) ?? 0) + 1)
  if (res.qtyWrong.length === 1) { nmLinTot++; const t = tipoAsoc(res.qtyWrong[0].art); nmLin.set(t, (nmLin.get(t) ?? 0) + 1) }
}
console.log(`\n════════ NUEVO BLOQUEANTE tras escuadra LINEAL (techo in-sample, líneas exactArt aún mal) ════════`)
for (const [t, n] of [...bloqLin].sort((a, b) => b[1] - a[1])) console.log(`     ${t.padEnd(14)}: ${n}`)
console.log(`  Near-miss DESPUÉS (1 solo art mal) total=${nmLinTot}:`)
for (const [t, n] of [...nmLin].sort((a, b) => b[1] - a[1])) console.log(`     ${t.padEnd(14)}: ${n}`)

// ── ¿QUÉ escuadra bloquea los near-miss? (art, ALIN?, tiene bf?, tiene lin?, pred vs real) ──
console.log(`\n════════ NEAR-MISS de ESCUADRA: identidad del artículo bloqueante (techo lin, in-sample) ════════`)
const nmEscArt = new Map()
for (const linea of lineas) {
  const pV5 = predecirV5(linea); if (!exacta(pV5, linea.reales).exactArt) continue
  const pTopo = new Map(pV5)
  for (const art of pV5.keys()) { if (esEscuadra(art) || esJunta(art)) { const ov = overrideTopo(linea, art, 'techo', 'linAll'); if (ov !== null) pTopo.set(art, ov) } }
  const res = exacta(pTopo, linea.reales)
  if (res.exactCdad || res.qtyWrong.length !== 1) continue
  const w = res.qtyWrong[0]; if (tipoAsoc(w.art) !== 'escuadra') continue
  const isAlin = ALIN.has(w.art), hasBf = reglaEscuadra.has(w.art), hasLin = reglaEscLin.has(`${linea.serie}|${w.art}`)
  const key = `${w.art}|${isAlin ? 'ALIN' : hasLin ? 'LIN' : hasBf ? 'BF' : 'SIN-REGLA'}`
  if (!nmEscArt.has(key)) nmEscArt.set(key, { n: 0, ej: null })
  const rec = nmEscArt.get(key); rec.n++; if (!rec.ej) rec.ej = { serie: linea.serie, k: linea.k, pred: w.pred, real: w.real, topo: linea.topo }
}
for (const [key, rec] of [...nmEscArt].sort((a, b) => b[1].n - a[1].n)) {
  const e = rec.ej
  console.log(`  ${key.padEnd(18)} x${rec.n}  ej ${e.serie}|${e.k} pred=${e.pred} real=${e.real} [m${e.topo.marco}hu${e.topo.hueco}h${e.topo.hoja}t${e.topo.trav}v${e.topo.vidrio}]  ${(descArt.get(key.split('|')[0]) ?? '').slice(0, 24)}`)
}

// ── DIAGNÓSTICO POR ARTÍCULO-ESCUADRA: base×factor vs lineal, multi-hueco/trav, novel ──
console.log(`\n════════ POR ARTÍCULO-ESCUADRA: base×factor (T.36) vs LINEAL por serie (T.50) ════════`)
console.log(`  (multi = líneas con hueco≥2 o trav≥1; novel = topología de serie NO vista en train)`)
const sigT = (t) => `${t.marco},${t.hueco},${t.hoja},${t.trav},${t.vidrio}`
for (const [art, rows] of [...escuadraRows].sort((a, b) => b[1].length - a[1].length)) {
  if (rows.length < 3) continue
  const bf = mejorBaseFactor(rows)
  const bfOk = rows.filter((r) => bf.base && Math.abs(bf.factor * BASES[bf.base](r.topo) - r.real) < 0.01).length
  const multi = rows.filter((r) => r.topo.hueco >= 2 || r.topo.trav >= 1)
  const bfMulti = multi.filter((r) => bf.base && Math.abs(bf.factor * BASES[bf.base](r.topo) - r.real) < 0.01).length
  // lineal por serie held-out: usa reglaEscLinTr (train), evalúa filas de test
  let linOk = 0, linN = 0, linMulti = 0, linMultiN = 0, novOk = 0, novN = 0
  const sigTrainArt = new Set()
  for (const linea of lineas) { if (esTest.get(linea.k) || !linea.topo || !linea.reales.has(art)) continue; sigTrainArt.add(`${linea.serie}|${sigT(linea.topo)}`) }
  for (const linea of lineas) {
    if (!esTest.get(linea.k) || !linea.topo || !linea.reales.has(art)) continue
    const real = linea.reales.get(art); const m = reglaEscLinTr.get(`${linea.serie}|${art}`); if (!m) continue
    const p = linVal(m, linea.topo); const bien = Math.abs(p - real) < 0.01
    linN++; if (bien) linOk++
    if (linea.topo.hueco >= 2 || linea.topo.trav >= 1) { linMultiN++; if (bien) linMulti++ }
    if (!sigTrainArt.has(`${linea.serie}|${sigT(linea.topo)}`)) { novN++; if (bien) novOk++ }
  }
  const pc = (a, b) => b ? (100 * a / b).toFixed(0) + '%' : '-'
  console.log(`  ${art.padEnd(8)} n=${String(rows.length).padStart(4)}  bf=${bf.factor}×${(bf.base ?? '-').padEnd(9)} all ${bfOk}/${rows.length}(${pc(bfOk, rows.length)}) multi ${bfMulti}/${multi.length}(${pc(bfMulti, multi.length)})  |  LIN test ${linOk}/${linN}(${pc(linOk, linN)}) multi ${linMulti}/${linMultiN}(${pc(linMulti, linMultiN)}) novel ${novOk}/${novN}(${pc(novOk, novN)})  ${(descArt.get(art) ?? '').slice(0, 22)}`)
}

// ── fórmulas lineales aprendidas (in-sample completo) por (serie,art) con n serio ──
console.log(`\n════════ FÓRMULAS LINEALES escuadra por (serie,art) [n≥5] — ¿generaliza o memoriza?  ════════`)
const escSA = new Map()
for (const [art, rows] of escuadraRows) for (const r of rows) { const kk = `${r.serie}|${art}`; if (!escSA.has(kk)) escSA.set(kk, []); escSA.get(kk).push(r) }
for (const [kk, rs] of [...escSA].sort((a, b) => b[1].length - a[1].length)) {
  const m = reglaEscLin.get(kk); if (!m || rs.length < 5) continue
  const ok = rs.filter((r) => Math.abs(linVal(m, r.topo) - r.real) < 0.01).length
  const terms = [[m.a, 'marco'], [m.b, 'hoja'], [m.c, 'hueco'], [m.d, 'trav'], [m.e, 'vidrio']].filter(([c]) => c).map(([c, n]) => `${c}·${n}`).join(' + ') || '0'
  const reales = [...new Set(rs.map((r) => r.real))].sort((a, b) => a - b)
  const moda = [...rs.reduce((mm, r) => mm.set(r.real, (mm.get(r.real) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1])[0]
  const baseConst = (100 * moda[1] / rs.length).toFixed(0)
  const nSig = new Set(rs.map((r) => sigT(r.topo))).size
  console.log(`  ${kk.padEnd(24)} n=${String(rs.length).padStart(4)} ${(100 * ok / rs.length).toFixed(0)}%  ${terms.padEnd(24)} reales{${reales.slice(0, 6).join(',')}} topos=${nSig} baseline-cte=${baseConst}%`)
}

// ── ALINEAMIENTO: fórmula lineal vs predAlin (T.46/47) por (serie,art) ──
console.log(`\n════════ ALINEAMIENTO: lineal por serie vs predAlin (T.46/47) [n≥5] ════════`)
const alinSA = new Map()
for (const [art, rows] of alinRows) for (const r of rows) { const kk = `${r.serie}|${art}`; if (!alinSA.has(kk)) alinSA.set(kk, []); alinSA.get(kk).push(r) }
for (const [kk, rs] of [...alinSA].sort((a, b) => b[1].length - a[1].length)) {
  if (rs.length < 5) continue
  const m = reglaAlinLin.get(kk)
  const linOk = m ? rs.filter((r) => Math.abs(linVal(m, r.topo) - r.real) < 0.01).length : 0
  const terms = m ? ([[m.a, 'marco'], [m.b, 'hoja'], [m.c, 'hueco'], [m.d, 'trav'], [m.e, 'vidrio']].filter(([c]) => c).map(([c, n]) => `${c}·${n}`).join(' + ') || '0') : 'sin modelo'
  const reales = [...new Set(rs.map((r) => r.real))].sort((a, b) => a - b)
  const nSig = new Set(rs.map((r) => sigT(r.topo))).size
  console.log(`  ${kk.padEnd(24)} n=${String(rs.length).padStart(4)} LIN ${linOk}/${rs.length}(${(100 * linOk / rs.length).toFixed(0)}%)  ${terms.padEnd(22)} reales{${reales.slice(0, 6).join(',')}} topos=${nSig}`)
}
