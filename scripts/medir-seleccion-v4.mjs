/**
 * MEDICIÓN v4: la referencia del rango es la FÓRMULA DE LA PROPIA RANURA.
 *
 * Descubrimiento (anexo S): cada ranura de asociado de la plantilla lleva
 * su propia fórmula de medida (`FormulaLargoCorte`/`FormulaLargo`): la
 * ranura 56 (cremona) mide `L-FS-FI` (altura de hoja), `OBC` mide `(A)/2`
 * (ancho de hoja), etc. La condición `MedidaMin/Max` de ConjuntosAsoc se
 * compara contra ESA medida evaluada con las cotas reales de la línea —
 * no hay eje que aprender: es determinista y sale de la plantilla.
 *
 * Además la ranura aparece UNA VEZ POR ELEMENTO (una por hoja pasiva, una
 * por zona de apertura…): la cantidad es
 *     Σ filas × nº de apariciones de la ranura que pasan el rango.
 *
 * Se mantiene de v3: opciones marcadas, '!' con multiplicador aprendido,
 * 'A'/'L' por UnidadesMin, oráculo VPRES+VALB+VFAC.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-seleccion-v4.mjs
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
const ranurasPlantilla = new Map() // estructura -> Map(comp -> [{formula, mano},...])
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const comp = col(f, 'DisComponente')
  if (!comp || comp === '0') continue
  const e = col(f, 'Estructura')
  if (!ranurasPlantilla.has(e)) ranurasPlantilla.set(e, new Map())
  const m = ranurasPlantilla.get(e)
  if (!m.has(comp)) m.set(comp, [])
  m.get(comp).push({
    formula: col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo'),
    mano: col(f, 'DisManoID'),
  })
}

// --- cotas: por defecto (plantilla) y de la instancia ---
const cotasDefecto = new Map() // estructura -> {simbolo: cota}
const simboloPorId = new Map() // estructura|id -> simbolo (para instancias sin símbolo)
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
const cotasInstancia = new Map() // tipo|doc|linea -> {simbolo: cota}
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
const simboloDa = new Map(estructurasDa.map((f) => [
  `${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA'),
]))
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
const ranurasInstancia = new Map() // tipo|doc|linea -> Map(dis -> n)
const manosInstancia = new Map() // tipo|doc|linea -> Map(dis -> [mano,...]) (mano REAL elegida)
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
    for (const h of hijas) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
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
    // medidas evaluadas por aparición de ranura, con su mano
    const medidasRanura = new Map() // comp -> [{medida|null, mano}, ...]
    for (const [comp, apariciones] of ranurasPlantilla.get(estructura) ?? []) {
      medidasRanura.set(comp, apariciones.map(({ formula, mano }) => {
        let medida = null
        if (formula) { try { medida = evaluar(formula, contexto) } catch { /* sin medida */ } }
        return { medida, mano }
      }))
    }
    lineas.push({
      k, opciones, ranuras, reales, medidasRanura,
      manos: manosInstancia.get(k) ?? new Map(),
      nHojas: hojasPorLinea.get(k)?.size ?? 0,
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
      activas.push(f)
    }
  }
  return activas
}

// --- multiplicador '!' aprendido (igual que v3) ---
function rasgosDe(linea) {
  const r = new Map([['const1', 1], ['nHojas', linea.nHojas]])
  for (const [dis, n] of linea.ranuras) r.set(`dis:${dis}`, n)
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
      acc.bang += num(f, 'Cantidad')
      acc.textos.add(col(f, 'AsociadoA'))
      porArt.set(art, acc)
    } else if (!comp || linea.ranuras.has(comp) || ESPECIALES.has(comp)) {
      const acc = porArt.get(art) ?? { bang: 0, otras: 0, textos: new Set() }
      acc.otras++
      porArt.set(art, acc)
    }
  }
  for (const [art, acc] of porArt) {
    if (acc.bang <= 0 || acc.otras > 0 || acc.textos.size !== 1) continue
    const texto = [...acc.textos][0]
    if (!obsCategoria.has(texto)) obsCategoria.set(texto, [])
    obsCategoria.get(texto).push({
      base: acc.bang, real: linea.reales.get(art) ?? 0, rasgos: rasgosDe(linea),
    })
  }
}
const multiplicador = new Map()
for (const [texto, obs] of obsCategoria) {
  if (obs.length < 5) continue
  const nombres = new Set()
  for (const o of obs) for (const n of o.rasgos.keys()) nombres.add(n)
  let mejor = null, tasa = 0
  for (const nombre of nombres) {
    let ok = 0
    for (const o of obs) {
      const v = o.rasgos.get(nombre) ?? 0
      if (Math.abs(o.base * v - o.real) < 0.01) ok++
    }
    if (ok / obs.length > tasa) { tasa = ok / obs.length; mejor = nombre }
  }
  if (mejor && tasa >= 0.9) multiplicador.set(texto, mejor)
}
console.log(`Multiplicadores '!' aprendidos: ${multiplicador.size} de ${obsCategoria.size} categorías`)

// --- predicción ---
let tp = 0, fp = 0, fn = 0, exactasArt = 0, exactasCdad = 0
let filasRangoSinMedida = 0
const fpFrec = new Map(), fnFrec = new Map()
for (const linea of lineas) {
  const predicho = new Map()
  const rasgos = rasgosDe(linea)
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc')
    const art = col(f, 'Articulo')
    let aporte = null
    if (comp === 'A' || comp === 'L') {
      aporte = num(f, 'Cantidad') * Math.max(num(f, 'UnidadesMin'), 1)
    } else if (comp === '!') {
      const rasgo = multiplicador.get(col(f, 'AsociadoA'))
      if (!rasgo) continue
      aporte = num(f, 'Cantidad') * (rasgos.get(rasgo) ?? 0)
    } else if (comp === '59R') {
      continue
    } else if (comp) {
      if (!linea.ranuras.has(comp)) continue
      // La mano REAL de cada aparición está en la instancia (el usuario
      // puede invertir la de la plantilla). La medida sale de la fórmula
      // de la plantilla (única por ranura en la práctica).
      const mano = col(f, 'ManoID')
      const manosReales = linea.manos.get(comp) ?? []
      const nAparicionesMano = mano
        ? manosReales.filter((m) => m === mano).length
        : Math.max(manosReales.length, 1)
      if (!nAparicionesMano) continue
      const medidas = linea.medidasRanura.get(comp) ?? []
      const min = num(f, 'MedidaMin'), max = num(f, 'MedidaMax')
      let apariciones
      if (max > 0) {
        const conMedida = medidas.filter((ap) => ap.medida !== null)
        if (!conMedida.length) { filasRangoSinMedida++; continue }
        const enRango = conMedida.filter((ap) => ap.medida >= min && ap.medida <= max).length
        if (!enRango) continue
        apariciones = Math.min(enRango, nAparicionesMano)
      } else {
        apariciones = nAparicionesMano
      }
      aporte = num(f, 'Cantidad') * apariciones
    } else {
      aporte = num(f, 'Cantidad')
    }
    predicho.set(art, (predicho.get(art) ?? 0) + aporte)
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
console.log(`\nPrecisión: ${(100 * tp / (tp + fp)).toFixed(1)}%   cobertura: ${(100 * tp / (tp + fn)).toFixed(1)}%`)
console.log(`Líneas exactas en artículos: ${exactasArt}/${lineas.length}   y en cantidades: ${exactasCdad}/${lineas.length}`)
console.log(`Filas con rango descartadas por ranura sin fórmula evaluable: ${filasRangoSinMedida}`)
const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
console.log('\n--- FP frecuentes ---')
for (const [a, n] of top(fpFrec)) console.log(`  ${String(n).padStart(5)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 40)}`)
console.log('--- FN frecuentes ---')
for (const [a, n] of top(fnFrec)) console.log(`  ${String(n).padStart(5)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 40)}`)
