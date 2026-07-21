/** SOLO LECTURA — T.47: reverse-engineer del comp '!' (wildcard "TODAS") de la
 * escuadra de alineamiento. Extiende scripts/medir-escuadra-derivacion.mjs (T.46).
 *
 * Hallazgo: comp '!' es una FAMILIA de categorias AsociadoA (HOJAS RODAMIENTO,
 * ESCUADRAS ABATIBLES, FIJOS INDEPENDIENTES, MARCOS CARRIL, FIJO HORIZONTAL/LATERAL)
 * presente en ConfigSeriesAsoc Y ConjuntosAsoc. Cada categoria mapea a un conteo
 * topologico. Para correderas la hoja-corredera se colapsa en el arbol a 1 hoja por
 * carril => el conteo es HUECOS, no hojas Tipo3.
 *
 * count('!') = Cdad × conteo_topologico(categoria)   (sin ×2, a diferencia de 58/59)
 *   HOJAS RODAMIENTO  -> hueco   (medido 2/2, 6×hoja falla 0/2)
 *   otras             -> se PRUEBAN varios conteos y se reporta con honestidad (regla 7)
 * Enlace regla 8: reales = Cdad de hijas por nEstr==nLinea.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), { columns: true, bom: true, skip_empty_lines: true, relax_quotes: true })
const col = (f, n) => (f[n] ?? '').trim()
const num = (f, n) => Number(col(f, n).replace(',', '.')) || 0
const ALIN = ['GM4735', 'GM4710', 'GM4330']

const ca = leer('ConjuntosAsoc.csv')
const csa = leer('ConfigSeriesAsoc.csv')
const estDis = leer('EstructurasDiseño.csv')
const vDatosLinEstr = leer('VDatosLinEstr.csv')

// --- base 58/59 (ConjuntosAsoc nOpcion vacio) — igual que T.46
const basePorSA = new Map()
for (const f of ca) {
  const art = col(f, 'Articulo'); if (!ALIN.includes(art)) continue
  if (col(f, 'nOpcion')) continue
  const comp = col(f, 'ComponenteAsoc'); if (comp !== '58' && comp !== '59') continue
  const k = `${col(f, 'Conjunto')}|${art}`
  if (!basePorSA.has(k)) basePorSA.set(k, []); basePorSA.get(k).push(f)
}
// --- opciones 58/59 (ConfigSeriesAsoc) — igual que T.46
const optPorSA = new Map()
for (const f of csa) {
  const art = col(f, 'Articulo'); if (!ALIN.includes(art)) continue
  const k = `${col(f, 'Conjunto')}|${art}`
  if (!optPorSA.has(k)) optPorSA.set(k, []); optPorSA.get(k).push(f)
}
// --- filas '!' de AMBAS tablas
const bangPorSA = new Map()
for (const src of [csa, ca]) for (const f of src) {
  const art = col(f, 'Articulo'); if (!ALIN.includes(art)) continue
  if (col(f, 'ComponenteAsoc') !== '!') continue
  const k = `${col(f, 'Conjunto')}|${art}`
  if (!bangPorSA.has(k)) bangPorSA.set(k, []); bangPorSA.get(k).push(f)
}

const seriePorLinea = new Map()
for (const r of vDatosLinEstr) seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))
const nodosPorLinea = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!nodosPorLinea.has(k)) nodosPorLinea.set(k, []); nodosPorLinea.get(k).push(col(f, 'Tipo'))
}
const topo = (k) => { const n = nodosPorLinea.get(k); if (!n) return null; const c = (t) => n.filter((x) => x === t).length; return { marco: c('1'), hueco: c('2'), hoja: c('3'), trav: c('6') } }

// mapa categoria '!' -> conteo topologico (hipotesis medidas)
function contBang(asoc, t) {
  const a = asoc.toUpperCase()
  if (a.includes('HOJAS RODAMIENTO')) return t.hueco     // corredera: 1 hoja/carril colapsada -> hueco
  if (a.includes('ESCUADRAS ABATIBLES')) return t.hoja   // abatible: hojas Tipo3
  if (a.includes('FIJOS INDEPENDIENTES')) return t.hoja
  if (a.includes('MARCOS CARRIL')) return t.hueco
  if (a.includes('FIJO')) return t.hoja
  return 0
}

const elem = (rol, t) => (rol === 'H') ? t.hoja : Math.max(t.marco, 1)
const parCompleto = new Map()
for (const [sa, rows] of optPorSA) for (const r of rows) {
  const artA = col(r, 'ArticuloAsoc'); if (artA && artA !== '0') continue
  const comp = col(r, 'ComponenteAsoc'); if (comp !== '58' && comp !== '59') continue
  const k = `${sa}|${col(r, 'TipoHoja')}`
  if (!parCompleto.has(k)) parCompleto.set(k, new Set()); parCompleto.get(k).add(comp)
}
const tienePar = (sa, rol) => { const s = parCompleto.get(`${sa}|${rol}`); return s && s.has('58') && s.has('59') }

function predecir(serie, art, t, perfiles, conBang) {
  const sa = `${serie}|${art}`
  let total = 0, tuvo = false
  for (const b of basePorSA.get(sa) ?? []) { total += num(b, 'Cantidad') * 2 * Math.max(t.marco, 1); tuvo = true }
  for (const r of optPorSA.get(sa) ?? []) {
    const comp = col(r, 'ComponenteAsoc'); if (comp === '!') continue // '!' aparte
    const rol = col(r, 'TipoHoja'), cdad = num(r, 'Cantidad'), artA = col(r, 'ArticuloAsoc')
    const dispara = (artA && artA !== '0') ? perfiles.has(artA) : tienePar(sa, rol)
    tuvo = true; if (dispara) total += cdad * 2 * elem(rol, t)
  }
  if (conBang) for (const r of bangPorSA.get(sa) ?? []) {
    tuvo = true; total += num(r, 'Cantidad') * contBang(col(r, 'AsociadoA'), t)
  }
  return tuvo ? total : null
}

const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const DOCS = [{ tipo: 'VPRES', lin: 'VPresupuestosLin.csv' }, { tipo: 'VALB', lin: 'VAlbaranesLin.csv' }, { tipo: 'VFAC', lin: 'VFacturasLin.csv' }]
const filas = []
for (const doc of DOCS) {
  const vLin = leer(doc.lin)
  const hijasPorPadre = new Map()
  for (const f of vLin) { const p = col(f, 'nEstr'); if (!p || p === '0') continue; if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, []); hijasPorPadre.get(p).push(f) }
  for (const p of vLin) {
    if (col(p, 'EstructuraSN') !== 'True') continue
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    const t = topo(k); if (!t) continue
    const perfiles = new Set(); const reales = new Map()
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (FUNCIONES_PERFIL.has(fn)) { perfiles.add(art); continue }
      if (ALIN.includes(art)) reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    for (const [art, real] of reales) filas.push({ k, serie: seriePorLinea.get(k) ?? '', art, real, t, perfiles })
  }
}

function medir(conBang, etiqueta) {
  let ok = 0, con = 0; const porSA = new Map()
  for (const f of filas) {
    const p = predecir(f.serie, f.art, f.t, f.perfiles, conBang); if (p === null) continue
    con++; const bien = Math.abs(p - f.real) < 0.01; if (bien) ok++
    const sa = `${f.serie}|${f.art}`; if (!porSA.has(sa)) porSA.set(sa, [0, 0]); porSA.get(sa)[1]++; if (bien) porSA.get(sa)[0]++
  }
  console.log(`\n════ ${etiqueta} ════`)
  console.log(`con fuente: ${con}   ACIERTOS: ${ok}/${con} (${(100 * ok / con).toFixed(1)}%)`)
  return { ok, con, porSA }
}
const sin = medir(false, 'SIN termino ! (= T.46)')
const con = medir(true, 'CON termino ! (T.47: Cdad × conteo(categoria))')
console.log('\npor (serie|art) [solo las que tienen filas !]:')
for (const [sa] of bangPorSA) {
  const a = sin.porSA.get(sa), b = con.porSA.get(sa)
  if (!a && !b) continue
  console.log(`   ${sa.padEnd(20)} sin=${a ? a[0] + '/' + a[1] : '-'}   con=${b ? b[0] + '/' + b[1] : '-'}`)
}
console.log('\ndetalle series ! con oraculo:')
for (const f of filas) {
  if (!bangPorSA.has(`${f.serie}|${f.art}`)) continue
  const p = predecir(f.serie, f.art, f.t, f.perfiles, true)
  console.log(`   ${f.serie}|${f.art} [m${f.t.marco}hu${f.t.hueco}h${f.t.hoja}t${f.t.trav}] real=${f.real} pred=${p}`)
}
