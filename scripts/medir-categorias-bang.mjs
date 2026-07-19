/**
 * MEDICIÓN: las categorías '!' que aún no aprenden multiplicador.
 *
 * v5 aprende 6 de 13 categorías. El caso de los tacos (S.9.2) enseñó que el
 * fallo no era del mecanismo sino del RASGO: 'travesaño pequeño' no es
 * gen:11 (86,8%) sino "gen:11 ó fn:TH" (100%). Aquí se repite ese análisis
 * para todas las categorías, con un repertorio de rasgos más amplio, y se
 * informa de cuáles quedan sin explicar para anotarlas como pendientes.
 *
 * No codifica ningún multiplicador: sólo mide cuál sería y con qué tasa.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-categorias-bang.mjs
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
const articulos = leer('Articulos.csv')
const estArt = leer('EstructurasArticulos.csv')
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]

const asocPorConjunto = new Map()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
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
const rasgosInstancia = new Map()
const hojasPorLinea = new Map()
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
  }
  if (!rasgosInstancia.has(k)) rasgosInstancia.set(k, new Map())
  const rr = rasgosInstancia.get(k)
  const fn = col(f, 'Funcion'), gen = col(f, 'Articulo')
  const suma = (n, v) => rr.set(n, (rr.get(n) ?? 0) + v)
  if (fn) suma(`fn:${fn}`, cant)
  if (gen && gen !== '0') suma(`gen:${gen}`, cant)
  if (fn && gen && gen !== '0') suma(`fg:${fn}:${gen}`, cant)
  if (gen === '11' || fn === 'TH') suma('trvPeq', cant)
  // repertorio ampliado: agregados por familia de función
  if (fn === 'HV' || fn === 'HH') suma('perfilHoja', cant)
  if (fn === 'MV' || fn === 'MH') suma('perfilMarco', cant)
  if (fn === 'TM' || fn === 'TH' || fn === 'TV') suma('travesano', cant)
  if (fn && fn.startsWith('inf')) suma('ranurasInf', cant)
  const idHoja = num(f, 'DisIdHoja')
  if (idHoja > 0) {
    if (!hojasPorLinea.has(k)) hojasPorLinea.set(k, new Set())
    hojasPorLinea.get(k).add(idHoja)
  }
}

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
    const reales = new Map()
    const perfilesLinea = new Set()
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0') continue
      if (FUNCIONES_PERFIL.has(fn)) { perfilesLinea.add(art); continue }
      const fam = famPorArt.get(art) ?? ''
      if (fam === '050' || fam === '051') continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    if (!reales.size) continue
    lineas.push({
      k, opciones, ranuras, reales, perfilesLinea,
      rasgos: rasgosInstancia.get(k) ?? new Map(),
      nHojas: hojasPorLinea.get(k)?.size ?? 0,
    })
  }
}
console.log(`Líneas del oráculo: ${lineas.length}`)

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
function rasgosDe(linea) {
  const r = new Map([['const1', 1], ['nHojas', linea.nHojas]])
  for (const [dis, n] of linea.ranuras) r.set(`dis:${dis}`, n)
  for (const [nombre, n] of linea.rasgos) r.set(nombre, n)
  return r
}

const obsCategoria = new Map()
for (const linea of lineas) {
  const porArt = new Map()
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc'), art = col(f, 'Articulo')
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
      base: acc.bang, real: linea.reales.get(art) ?? 0, rasgos: rasgosDe(linea), art,
    })
  }
}

console.log(`\nCategorías '!' con observaciones: ${obsCategoria.size}\n`)
const pendientes = []
for (const [texto, obs] of [...obsCategoria].sort((a, b) => b[1].length - a[1].length)) {
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
    if (tasaK > tasa) { tasa = tasaK; mejor = { rasgo: nombre, k, ok } }
  }
  const aprende = obs.length >= 5 && mejor && tasa >= 0.9
  const linea = mejor
    ? `${mejor.rasgo} × ${mejor.k}  ${mejor.ok}/${obs.length} (${(100 * mejor.ok / obs.length).toFixed(1)}%)`
    : '(ningún rasgo)'
  console.log(`  ${aprende ? '✔' : '✘'} ${texto.padEnd(46)} n=${String(obs.length).padStart(3)}  ${linea}`)
  if (!aprende) {
    pendientes.push({ texto, obs, mejor })
  }
}

console.log('\n--- categorías pendientes: cantidades reales observadas ---')
for (const { texto, obs, mejor } of pendientes) {
  const cd = new Map()
  for (const o of obs) cd.set(`base=${o.base} real=${o.real}`, (cd.get(`base=${o.base} real=${o.real}`) ?? 0) + 1)
  const arts = [...new Set(obs.map((o) => o.art))].slice(0, 4).join(' ')
  console.log(`\n  ${texto}  (n=${obs.length}, arts: ${arts})`)
  console.log(`    mejor rasgo: ${mejor ? `${mejor.rasgo} × ${mejor.k} → ${mejor.ok}/${obs.length}` : 'ninguno'}`)
  for (const [k, n] of [...cd].sort((a, b) => b[1] - a[1]).slice(0, 6)) {
    console.log(`    ${String(n).padStart(3)}×  ${k}`)
  }
}
