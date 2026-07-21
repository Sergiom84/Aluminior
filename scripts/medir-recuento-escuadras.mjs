/**
 * MEDICIÓN del RECUENTO de ESCUADRAS (crux de T.31), SOLO LECTURA. NO commitear.
 *
 * T.31 dejó el diagnóstico: 0/216 líneas exactas en cantidades, y el error se
 * concentra en ESCUADRAS (238 de 344 cantidades erróneas), sesgo sistemático a
 * la BAJA — las piezas "una por esquina" que el recuento por aparición de ranura
 * (v5) infravalora. CONTINUACION.md §3.1 pide medir si la GEOMETRÍA de la
 * estructura (huecos, hojas, esquinas) reconstruye la cantidad mejor que v5.
 *
 * Este script NO predice la selección: toma las líneas del oráculo donde el
 * artículo de escuadra es REAL (enlace exacto por VDatosLinDetDis / hijas de
 * VPresupuestosLin), y para cada una compara la cantidad REAL contra:
 *   - v5:  Cantidad × apariciones-de-ranura (el recuento actual)
 *   - candidatos geométricos anclados a la instancia (nHojas, piezas de perfil
 *     de hoja, ranuras de escuadra, etc.), con multiplicadores fijos y honestos.
 *
 * Uso: npx tsx scripts/medir-recuento-escuadras.mjs
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
const vDatosLinEstr = leer('VDatosLinEstr.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

const seriePorLinea = new Map()
for (const r of vDatosLinEstr) {
  seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))
}

// escuadra = artículo declarado en ConjuntosAsoc con ComponenteAsoc de escuadra
const ESCUADRA_COMP = new Set(['58', '59', '58R', '59R'])
const compsPorArt = new Map()
for (const f of conjuntosAsoc) {
  const art = col(f, 'Articulo')
  if (!art || art === '0') continue
  if (!compsPorArt.has(art)) compsPorArt.set(art, new Set())
  compsPorArt.get(art).add(col(f, 'ComponenteAsoc'))
}
function esEscuadra(art) {
  const comps = compsPorArt.get(art) ?? new Set()
  if ([...comps].some((c) => ESCUADRA_COMP.has(c))) return true
  return /ESCUADR/.test((descArt.get(art) ?? '').toUpperCase())
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

// plantilla: apariciones de cada ranura (fórmula + mano) por estructura
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

// cotas
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

// opciones e instancias (rasgos geométricos por línea)
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
const fnInstancia = new Map()      // fn:<Funcion> -> cantidad
const hojasPorLinea = new Map()    // set de DisIdHoja
for (const f of estArt) {
  const t = col(f, 'TipoDoc')
  if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  const dis = col(f, 'DisComponente')
  const cant = num(f, 'Cantidad') || 1
  if (dis && dis !== '0') {
    if (!ranurasInstancia.has(k)) ranurasInstancia.set(k, new Map())
    const m = ranurasInstancia.get(k)
    m.set(dis, (m.get(dis) ?? 0) + cant)
    if (!manosInstancia.has(k)) manosInstancia.set(k, new Map())
    const mm = manosInstancia.get(k)
    if (!mm.has(dis)) mm.set(dis, [])
    mm.get(dis).push(col(f, 'DisManoID'))
  }
  const fn = col(f, 'Funcion')
  if (fn) {
    if (!fnInstancia.has(k)) fnInstancia.set(k, new Map())
    const rr = fnInstancia.get(k)
    rr.set(fn, (rr.get(fn) ?? 0) + cant)
  }
  const idHoja = num(f, 'DisIdHoja')
  if (idHoja > 0) {
    if (!hojasPorLinea.has(k)) hojasPorLinea.set(k, new Set())
    hojasPorLinea.get(k).add(idHoja)
  }
}

// oráculo
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
    for (const h of hijas) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0') continue
      if (FUNCIONES_PERFIL.has(fn)) continue
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
    const fnRasgos = fnInstancia.get(k) ?? new Map()
    lineas.push({
      k, opciones, ranuras, reales, medidasRanura,
      manos: manosInstancia.get(k) ?? new Map(),
      nHojas: hojasPorLinea.get(k)?.size ?? 0,
      nHV: fnRasgos.get('HV') ?? 0, nHH: fnRasgos.get('HH') ?? 0,
      nMV: fnRasgos.get('MV') ?? 0, nMH: fnRasgos.get('MH') ?? 0,
      nTH: fnRasgos.get('TH') ?? 0, nTV: fnRasgos.get('TV') ?? 0, nTM: fnRasgos.get('TM') ?? 0,
      estructura, serie: seriePorLinea.get(k) ?? '',
      perfilesLinea: new Set([...hijas].filter((h) => FUNCIONES_PERFIL.has(col(h, 'Funcion'))).map((h) => col(h, 'Articulo'))),
    })
  }
}

// v5: recuento por aparición de ranura (idéntico a medir-seleccion-v5) para la escuadra
function v5Escuadra(linea, art) {
  let total = 0
  for (const [cj, marcadas] of linea.opciones) {
    for (const f of asocPorConjunto.get(cj) ?? []) {
      if (col(f, 'Articulo') !== art) continue
      const nOp = col(f, 'nOpcion')
      if (nOp && nOp !== '0' && !marcadas.has(nOp)) continue
      const artAsoc = col(f, 'ArticuloAsoc')
      if (artAsoc && artAsoc !== '0' && !linea.perfilesLinea.has(artAsoc)) continue
      const comp = col(f, 'ComponenteAsoc')
      if (!ESCUADRA_COMP.has(comp)) { if (!comp) total += num(f, 'Cantidad'); continue }
      if (!linea.ranuras.has(comp)) continue
      const mano = col(f, 'ManoID')
      const manosReales = linea.manos.get(comp) ?? []
      const nAparMano = mano ? manosReales.filter((m) => m === mano).length : Math.max(manosReales.length, 1)
      if (!nAparMano) continue
      const medidas = linea.medidasRanura.get(comp) ?? []
      const min = num(f, 'MedidaMin'), max = num(f, 'MedidaMax')
      let apar
      if (max > 0) {
        const conMedida = medidas.filter((ap) => ap.medida !== null)
        if (!conMedida.length) continue
        const enRango = conMedida.filter((ap) => ap.medida >= min && ap.medida <= max).length
        if (!enRango) continue
        apar = Math.min(enRango, nAparMano)
      } else apar = nAparMano
      total += num(f, 'Cantidad') * apar
    }
  }
  return total
}

// candidatos geométricos (multiplicadores fijos, sin aprender nada)
function candidatos(linea) {
  const nRanEsc = [...ESCUADRA_COMP].reduce((s, c) => s + (linea.ranuras.get(c) ?? 0), 0)
  const nHojaPerfil = linea.nHV + linea.nHH
  const nMarcoPerfil = linea.nMV + linea.nMH
  return {
    'nHojas×4': linea.nHojas * 4,
    'piezasHoja(HV+HH)': nHojaPerfil,
    'piezasHoja×?': nHojaPerfil, // igual, alias legible
    'ranEsc×4': nRanEsc * 4,
    'ranEsc×1': nRanEsc,
    '(hoja+marco)piezas': nHojaPerfil + nMarcoPerfil,
    'esquinasHoja(nHojas×4)': linea.nHojas * 4,
  }
}

// ── medición ──────────────────────────────────────────────────────────────
const filas = []   // una por (línea, artículo-escuadra real)
for (const linea of lineas) {
  for (const [art, real] of linea.reales) {
    if (!esEscuadra(art)) continue
    filas.push({ k: linea.k, serie: linea.serie, estructura: linea.estructura, art, real,
      v5: v5Escuadra(linea, art), cand: candidatos(linea), linea })
  }
}
console.log(`Líneas del oráculo: ${lineas.length}`)
console.log(`Apariciones REALES de artículo-escuadra (línea×art): ${filas.length}`)
console.log(`Líneas con al menos una escuadra real: ${new Set(filas.map((f) => f.k)).size}`)

// candidato añadido: v5 × 2 (dos escuadras por unión)
for (const f of filas) f.cand['v5×2'] = f.v5 * 2
// aciertos por candidato
const CANDS = ['v5', 'v5×2', 'nHojas×4', 'piezasHoja(HV+HH)', 'ranEsc×4', 'ranEsc×1', '(hoja+marco)piezas']
const acierto = new Map(CANDS.map((c) => [c, 0]))
for (const f of filas) {
  for (const c of CANDS) {
    const v = c === 'v5' ? f.v5 : f.cand[c]
    if (Math.abs(v - f.real) < 0.01) acierto.set(c, acierto.get(c) + 1)
  }
}
// mejor combinación: por artículo, ¿hay un factor entero fijo real/v5 consistente?
const porArt = new Map()
for (const f of filas) {
  if (f.v5 <= 0) continue
  const r = f.real / f.v5
  if (!porArt.has(f.art)) porArt.set(f.art, [])
  porArt.get(f.art).push(r)
}
let artFactorConsistente = 0, artTot = 0
for (const [, rs] of porArt) {
  artTot++
  const moda = [...rs.reduce((m, r) => m.set(Math.round(r * 100) / 100, (m.get(Math.round(r * 100) / 100) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1])[0]
  if (moda && moda[1] / rs.length >= 0.9) artFactorConsistente++
}
console.log(`\nArtículos-escuadra con factor real/v5 consistente (≥90% misma moda): ${artFactorConsistente}/${artTot}`)
console.log(`\n════════ ACIERTO por candidato (cantidad exacta de escuadra) ════════`)
for (const c of CANDS) {
  const a = acierto.get(c)
  console.log(`  ${c.padEnd(22)}: ${String(a).padStart(3)}/${filas.length}  (${(100 * a / filas.length).toFixed(1)}%)`)
}

// desglose SINGLE-hueco vs MULTI-hueco (dígito inicial del código de estructura)
function nHuecos(estructura) { const m = estructura.match(/^(\d+)/); return m ? Number(m[1]) : 0 }
const single = filas.filter((f) => nHuecos(f.estructura) === 1)
const multi = filas.filter((f) => nHuecos(f.estructura) >= 2)
function tasa(subset, campo) {
  let a = 0
  for (const f of subset) { const v = campo === 'v5' ? f.v5 : campo === 'v5×2' ? f.v5 * 2 : f.cand[campo]; if (Math.abs(v - f.real) < 0.01) a++ }
  return subset.length ? `${a}/${subset.length} (${(100 * a / subset.length).toFixed(1)}%)` : 'n=0'
}
console.log(`\n════════ SINGLE-hueco (código 1*) vs MULTI-hueco (2*,3*…) ════════`)
console.log(`  single: n=${single.length}   v5=${tasa(single, 'v5')}   v5×2=${tasa(single, 'v5×2')}   nHojas×4=${tasa(single, 'nHojas×4')}`)
console.log(`  multi : n=${multi.length}   v5=${tasa(multi, 'v5')}   v5×2=${tasa(multi, 'v5×2')}   nHojas×4=${tasa(multi, 'nHojas×4')}`)
const overMulti = multi.filter((f) => f.v5 > f.real).length
console.log(`  multi con v5 SOBRE-contando (v5>real): ${overMulti}/${multi.length}`)

// desglose del sesgo v5 (¿cuánto de menos?)
const deltas = filas.map((f) => f.v5 - f.real)
const menos = deltas.filter((x) => x < 0).length, mas = deltas.filter((x) => x > 0).length, ok = deltas.filter((x) => x === 0).length
console.log(`\n  v5 vs real: exactas=${ok}  de MENOS=${menos}  de MÁS=${mas}`)
const ratios = new Map()
for (const f of filas) {
  if (f.v5 > 0) { const r = Math.round((f.real / f.v5) * 100) / 100; ratios.set(r, (ratios.get(r) ?? 0) + 1) }
}
console.log(`  ratio real/v5 (moda indica el factor que falta):`)
for (const [r, n] of [...ratios].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`     ×${r} → ${n}`)

// muestra de discrepancias para inspección honesta
console.log(`\n  Muestra (real ≠ nHojas×4), para ver qué falla:`)
let shown = 0
for (const f of filas) {
  if (Math.abs(f.cand['nHojas×4'] - f.real) < 0.01) continue
  if (shown++ >= 15) break
  console.log(`     ${f.serie}|${f.estructura} ${f.art}  real=${f.real} v5=${f.v5} nHojas=${f.linea.nHojas} HV+HH=${f.linea.nHV + f.linea.nHH} ranEsc=${[...ESCUADRA_COMP].reduce((s, c) => s + (f.linea.ranuras.get(c) ?? 0), 0)}`)
}

// ════════ FOCO: residuo de HUECO SIMPLE (paso 1 confirmado por el titular) ════════
console.log(`\n\n████████ RESIDUO DE HUECO SIMPLE (dónde falla v5×2 = 63,7%) ████████`)
// candidatos por ROL: marco = 4 esquinas del hueco; +4 por cada hoja
for (const f of single) {
  const nHj = f.linea.nHojas
  f.candS = {
    'v5×2': f.v5 * 2,
    '4 (marco)': 4,
    '4×(1+nHojas)': 4 * (1 + nHj),
    '4+4×nHojas': 4 + 4 * nHj,   // == 4×(1+nHojas)
    '4×nHojas': 4 * nHj,
    '8×nHojas': 8 * nHj,
    '4×max(1,nHojas)': 4 * Math.max(1, nHj),
  }
}
const CS = ['v5×2', '4 (marco)', '4×(1+nHojas)', '4×nHojas', '8×nHojas', '4×max(1,nHojas)']
const hitS = new Map(CS.map((c) => [c, 0]))
for (const f of single) for (const c of CS) if (Math.abs(f.candS[c] - f.real) < 0.01) hitS.set(c, hitS.get(c) + 1)
console.log(`  single n=${single.length}. Acierto por candidato de ROL:`)
for (const c of CS) console.log(`     ${c.padEnd(18)}: ${String(hitS.get(c)).padStart(3)}/${single.length} (${(100 * hitS.get(c) / single.length).toFixed(1)}%)`)

// por artículo en single: multiplicador de ROL dominante
const porArtS = new Map()
for (const f of single) { if (!porArtS.has(f.art)) porArtS.set(f.art, []); porArtS.get(f.art).push(f) }
console.log(`\n  Por ARTÍCULO (single, n≥3): mejor candidato de ROL`)
let artOkS = 0, artTotS = 0
for (const [art, rs] of [...porArtS].sort((a, b) => b[1].length - a[1].length)) {
  if (rs.length < 3) continue
  artTotS++
  let best = null, bestN = 0
  for (const c of CS) { const ok = rs.filter((f) => Math.abs(f.candS[c] - f.real) < 0.01).length; if (ok > bestN) { bestN = ok; best = c } }
  if (bestN / rs.length >= 0.9) artOkS++
  console.log(`     ${art.padEnd(8)} n=${String(rs.length).padStart(3)} mejor=${(best ?? '-').padEnd(16)} ${bestN}/${rs.length} (${(100 * bestN / rs.length).toFixed(0)}%) ${(descArt.get(art) ?? '').slice(0, 24)}`)
}
console.log(`  Artículos single (n≥3) con candidato de ROL consistente (≥90%): ${artOkS}/${artTotS}`)

// residuo puro: donde v5×2 falla, ¿qué relación real/nHojas?
const resid = single.filter((f) => Math.abs(f.v5 * 2 - f.real) > 0.01)
console.log(`\n  Residuo v5×2 en single: ${resid.length}/${single.length}. Muestra:`)
let sh2 = 0
for (const f of resid) {
  if (sh2++ >= 18) break
  console.log(`     ${f.serie}|${f.estructura} ${f.art} real=${f.real} v5=${f.v5} v5×2=${f.v5 * 2} nHj=${f.linea.nHojas} HV+HH=${f.linea.nHV + f.linea.nHH} MV+MH=${f.linea.nMV + f.linea.nMH} T=${f.linea.nTH + f.linea.nTV + f.linea.nTM}`)
}

// CHECK anti-trivial (regla 9): ¿"4 constante" gana solo porque real=4 domina?
const distReal = new Map()
for (const f of single) distReal.set(f.real, (distReal.get(f.real) ?? 0) + 1)
console.log(`\n  Distribución de real (single): ${[...distReal].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v, n]) => `${v}→${n}`).join('  ')}`)

// MODELO COMBINADO por-artículo: asigna a cada art su candidato de ROL de moda
// (≥90% consistencia y n≥3), como el mecanismo de '!' de v5. Aprende sobre single.
const roleDe = new Map()
for (const [art, rs] of porArtS) {
  if (rs.length < 3) continue
  let best = null, bestN = 0
  for (const c of CS) { const ok = rs.filter((f) => Math.abs(f.candS[c] - f.real) < 0.01).length; if (ok > bestN) { bestN = ok; best = c } }
  if (bestN / rs.length >= 0.9) roleDe.set(art, best)
}
let cubierto = 0, correctoModelo = 0, sinRegla = 0
for (const f of single) {
  const role = roleDe.get(f.art)
  if (!role) { sinRegla++; continue }
  cubierto++
  if (Math.abs(f.candS[role] - f.real) < 0.01) correctoModelo++
}
console.log(`\n  MODELO por-artículo (rol de moda, ≥90%, n≥3) sobre single (n=${single.length}):`)
console.log(`     artículos con regla: ${roleDe.size}   filas cubiertas: ${cubierto}   sin regla: ${sinRegla}`)
console.log(`     correctas dentro de lo cubierto: ${correctoModelo}/${cubierto} (${cubierto ? (100 * correctoModelo / cubierto).toFixed(1) : 0}%)`)
console.log(`     baseline "siempre 4": ${single.filter((f) => f.real === 4).length}/${single.length}`)
// líneas single donde TODAS las escuadras quedan correctas por el modelo
const escPorLinea = new Map()
for (const f of single) { if (!escPorLinea.has(f.k)) escPorLinea.set(f.k, []); escPorLinea.get(f.k).push(f) }
let lineasEscOk = 0, lineasSingle = 0
for (const [, fs] of escPorLinea) {
  lineasSingle++
  if (fs.every((f) => roleDe.has(f.art) && Math.abs(f.candS[roleDe.get(f.art)] - f.real) < 0.01)) lineasEscOk++
}
console.log(`     LÍNEAS single con TODAS sus escuadras correctas por el modelo: ${lineasEscOk}/${lineasSingle}`)
// ¿en cuántas líneas single aparece un artículo SIN regla? (el tapón)
let conSinRegla = 0
for (const [, fs] of escPorLinea) if (fs.some((f) => !roleDe.has(f.art))) conSinRegla++
console.log(`     líneas single con ≥1 escuadra SIN regla (el tapón): ${conSinRegla}/${lineasSingle}`)
const sinReglaArts = new Map()
for (const f of single) if (!roleDe.has(f.art)) sinReglaArts.set(f.art, (sinReglaArts.get(f.art) ?? 0) + 1)
console.log(`     artículos sin regla (single): ${[...sinReglaArts].sort((a, b) => b[1] - a[1]).map(([a, n]) => `${a}(${n})`).join(' ')}`)

// FOCO GM4735: el tapón más frecuente. ¿qué determina su cantidad?
console.log(`\n  ── FOCO GM4735 (ESCUADRA ALINEAMIEN.2MM), el tapón más frecuente ──`)
const g = single.filter((f) => f.art === 'GM4735')
const dg = new Map(); for (const f of g) dg.set(f.real, (dg.get(f.real) ?? 0) + 1)
console.log(`     real (single): ${[...dg].sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v}→${n}`).join('  ')}`)
// correlatos candidatos
for (const [nombre, fn] of [
  ['4×nHojas', (f) => 4 * f.linea.nHojas], ['4×(HV+HH)/2', (f) => 2 * (f.linea.nHV + f.linea.nHH)],
  ['2×(MV+MH)', (f) => 2 * (f.linea.nMV + f.linea.nMH)], ['4×nTravVert', (f) => 4 * f.linea.nTV],
  ['4×(1+nTrav)', (f) => 4 * (1 + f.linea.nTH + f.linea.nTV + f.linea.nTM)],
]) {
  const ok = g.filter((f) => Math.abs(fn(f) - f.real) < 0.01).length
  console.log(`     ${nombre.padEnd(14)}: ${ok}/${g.length}`)
}
console.log(`     muestra GM4735: ${g.slice(0, 6).map((f) => `${f.estructura}:real=${f.real},nHj=${f.linea.nHojas},T=${f.linea.nTH + f.linea.nTV + f.linea.nTM},HVHH=${f.linea.nHV + f.linea.nHH}`).join(' | ')}`)
