/** SOLO LECTURA. Predictor COMBINADO de la escuadra de alineamiento:
 *   base = ConjuntosAsoc (nOpcion vacia)  -> siempre; factor Cdad*2*marco
 *   opts = ConfigSeriesAsoc (por rol)     -> si nOpcion activa & perfil presente;
 *                                            factor Cdad*2*elem(rol)  (H->hoja, M/G->marco)
 *   comp '!' (wildcard) se cuenta aparte: Cdad*elem(rol) (mecanismo corredera/abatible)
 * Medido contra el oraculo (enlace regla 8: Cdad de hijas por nEstr==nLinea).
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
const opcionesDoc = leer('VOpcionesHerraje.csv')
const estDis = leer('EstructurasDiseño.csv')
const vDatosLinEstr = leer('VDatosLinEstr.csv')

// base (ConjuntosAsoc, nOpcion vacia, art ALIN, comp 58/59)
const basePorSA = new Map()
for (const f of ca) {
  const art = col(f, 'Articulo'); if (!ALIN.includes(art)) continue
  if (col(f, 'nOpcion')) continue                 // solo genericas (siempre)
  const comp = col(f, 'ComponenteAsoc'); if (comp !== '58' && comp !== '59') continue
  const k = `${col(f, 'Conjunto')}|${art}`
  if (!basePorSA.has(k)) basePorSA.set(k, [])
  basePorSA.get(k).push(f)
}
// opciones (ConfigSeriesAsoc, por rol)
const optPorSA = new Map()
for (const f of csa) {
  const art = col(f, 'Articulo'); if (!ALIN.includes(art)) continue
  const k = `${col(f, 'Conjunto')}|${art}`
  if (!optPorSA.has(k)) optPorSA.set(k, [])
  optPorSA.get(k).push(f)
}

const seriePorLinea = new Map()
for (const r of vDatosLinEstr) seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))
const nodosPorLinea = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!nodosPorLinea.has(k)) nodosPorLinea.set(k, [])
  nodosPorLinea.get(k).push(col(f, 'Tipo'))
}
const topo = (k) => { const n = nodosPorLinea.get(k); if (!n) return null; const c = (t) => n.filter((x) => x === t).length; return { marco: c('1'), hueco: c('2'), hoja: c('3'), trav: c('6') } }
const opcPorLinea = new Map()
for (const f of opcionesDoc) {
  if (col(f, 'SelecSN') !== 'True') continue
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcPorLinea.has(k)) opcPorLinea.set(k, new Set())
  opcPorLinea.get(k).add(col(f, 'nOpcion'))
}

const elem = (rol, t) => (rol === 'H') ? t.hoja : Math.max(t.marco, 1)  // M/G/apertura -> marco
// par 58+59 completo (filas SIN perfil) por (serie,art,rol) -> las filas sin ArticuloAsoc
// solo disparan si su rol declara ambos comp 58 y 59.
const parCompleto = new Map()  // serie|art|rol -> Set(comps sin perfil)
for (const [sa, rows] of optPorSA) {
  for (const r of rows) {
    const artA = col(r, 'ArticuloAsoc'); if (artA && artA !== '0') continue
    const comp = col(r, 'ComponenteAsoc'); if (comp !== '58' && comp !== '59') continue
    const k = `${sa}|${col(r, 'TipoHoja')}`
    if (!parCompleto.has(k)) parCompleto.set(k, new Set())
    parCompleto.get(k).add(comp)
  }
}
const tienePar = (sa, rol) => { const s = parCompleto.get(`${sa}|${rol}`); return s && s.has('58') && s.has('59') }

function predecir(serie, art, t, perfiles, opc) {
  const sa = `${serie}|${art}`
  let total = 0, tuvo = false
  // base generica: siempre
  for (const b of basePorSA.get(sa) ?? []) { total += num(b, 'Cantidad') * 2 * Math.max(t.marco, 1); tuvo = true }
  // opciones por rol: SIN gate de nOpcion. Disparo = (perfil presente) O (par 58+59 sin perfil).
  for (const r of optPorSA.get(sa) ?? []) {
    const comp = col(r, 'ComponenteAsoc'), rol = col(r, 'TipoHoja'), cdad = num(r, 'Cantidad')
    const artA = col(r, 'ArticuloAsoc')
    let dispara
    if (comp === '!') dispara = true                        // wildcard corredera/abatible
    else if (artA && artA !== '0') dispara = perfiles.has(artA) // fila perfil-gated
    else dispara = tienePar(sa, rol)                        // fila sin perfil: solo si par completo
    if (!dispara) { tuvo = true; continue }                 // hay fuente aunque no dispare
    tuvo = true
    if (comp === '!') total += cdad * elem(rol, t)          // wildcard: sin *2
    else total += cdad * 2 * elem(rol, t)                   // 58/59: *2
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
    for (const [art, real] of reales) filas.push({ k, serie: seriePorLinea.get(k) ?? '', art, real, t, perfiles, opc: opcPorLinea.get(k) ?? new Set() })
  }
}

let ok = 0, con = 0
const porSA = new Map()
for (const f of filas) {
  const p = predecir(f.serie, f.art, f.t, f.perfiles, f.opc)
  if (p === null) continue
  con++
  const bien = Math.abs(p - f.real) < 0.01; if (bien) ok++
  const sa = `${f.serie}|${f.art}`
  if (!porSA.has(sa)) porSA.set(sa, [0, 0]); porSA.get(sa)[1]++; if (bien) porSA.get(sa)[0]++
}
console.log(`════ PREDICTOR COMBINADO v3 (base CA generica ×2·marco + opciones CSA ×2·elem; disparo = perfil presente O par 58+59; SIN gate nOpcion) ════`)
console.log(`apariciones oraculo: ${filas.length}   con fuente: ${con}   ACIERTOS: ${ok}/${con} (${(100*ok/con).toFixed(1)}%)`)
console.log(`por (serie|art), ordenado por n:`)
for (const [sa, [o, n]] of [...porSA].sort((a,b)=>b[1][1]-a[1][1])) console.log(`   ${sa.padEnd(22)} ${o}/${n} (${(100*o/n).toFixed(0)}%)`)

// diagnostico ELEGANTPVC
console.log(`\n── ELEGANTPVC|GM4735: base=${(basePorSA.get('ELEGANTPVC|GM4735')||[]).length} filas, opts=${(optPorSA.get('ELEGANTPVC|GM4735')||[]).length}`)
const ejs = filas.filter(f=>f.serie==='ELEGANTPVC'&&f.art==='GM4735').slice(0,6)
for (const f of ejs) console.log(`   [m${f.t.marco}h${f.t.hueco}j${f.t.hoja}t${f.t.trav}] real=${f.real} pred=${predecir(f.serie,f.art,f.t,f.perfiles,f.opc)} opcActivas={${[...f.opc].join(',')}}`)

// fallos ELEGANTPVC agrupados por topologia
console.log('\n── FALLOS ELEGANTPVC|GM4735 por topologia (real≠pred):')
const fe = new Map()
for (const f of filas) {
  if (f.serie!=='ELEGANTPVC'||f.art!=='GM4735') continue
  const p = predecir(f.serie,f.art,f.t,f.perfiles,f.opc)
  const tk=`m${f.t.marco}h${f.t.hueco}j${f.t.hoja}t${f.t.trav}`
  const key=`${tk} real=${f.real} pred=${p}`
  fe.set(key,(fe.get(key)??0)+1)
}
for (const [k,c] of [...fe].sort()) console.log(`   ${k} ×${c} ${k.includes('real='+k.split('pred=')[1].trim())?'':''}`)
