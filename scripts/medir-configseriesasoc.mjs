/**
 * INGENIERÍA INVERSA del recuento de escuadras de alineamiento vía ConfigSeriesAsoc
 * (la 2ª declaración de asociados por serie que v5 ignora, S.7.4 pendiente).
 * SOLO LECTURA. NO commitear hasta verificar.
 *
 * Mecanismo reconstruido (T.40 → aquí): una fila de ConfigSeriesAsoc(serie, art)
 * DISPARA si (a) su nOpcion está activa en la línea, (b) su ArticuloAsoc (perfil) está
 * presente —esto colapsa las filas-alternativas que solo difieren en el perfil, el bug
 * de T.40—, y (c) su TipoHoja aplica. Las filas que disparan son ACUMULATIVAS (S.1).
 * count(fila) = Cdad × 4 × (nº de elementos del rol): M/G → marco (4 esquinas),
 * H → por hoja (4·hoja); comp '!' (HOJAS RODAMIENTO) → nº hojas. Verificado: GMA60RL
 * 1 fila (tras filtro perfil) Cdad2 × 4 = 8 = oráculo.
 *
 * Enlace exacto por hijas de VPresupuestosLin (regla 8). Split held-out por línea.
 * Uso: npx tsx scripts/medir-configseriesasoc.mjs
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

const csa = leer('ConfigSeriesAsoc.csv')
const opcionesDoc = leer('VOpcionesHerraje.csv')
const estDis = leer('EstructurasDiseño.csv')
const vDatosLinEstr = leer('VDatosLinEstr.csv')
const descArt = new Map(leer('Articulos.csv').map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const seriePorLinea = new Map()
for (const r of vDatosLinEstr) seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))

const ALIN = ['GM4735', 'GM4710', 'GM4330']
const csaPorSerieArt = new Map()
for (const f of csa) {
  const art = col(f, 'Articulo'); if (!ALIN.includes(art)) continue
  const k = `${col(f, 'Conjunto')}|${art}`
  if (!csaPorSerieArt.has(k)) csaPorSerieArt.set(k, [])
  csaPorSerieArt.get(k).push(f)
}

// topología
const nodosPorLinea = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!nodosPorLinea.has(k)) nodosPorLinea.set(k, [])
  nodosPorLinea.get(k).push(col(f, 'Tipo'))
}
function topo(k) {
  const n = nodosPorLinea.get(k); if (!n) return null
  const cnt = (t) => n.filter((x) => x === t).length
  return { marco: cnt('1'), hueco: cnt('2'), hoja: cnt('3'), trav: cnt('6') }
}

// opciones activas por línea (unión de nOpcion sobre todos los conjuntos)
const opcPorLinea = new Map()
for (const f of opcionesDoc) {
  if (col(f, 'SelecSN') !== 'True') continue
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcPorLinea.has(k)) opcPorLinea.set(k, new Set())
  opcPorLinea.get(k).add(col(f, 'nOpcion'))
}

// count por rol: Cdad × 4 × elementos-del-rol; comp '!' = nº hojas (HOJAS RODAMIENTO)
function contar(row, t) {
  const cdad = num(row, 'Cantidad'), comp = col(row, 'ComponenteAsoc'), rol = col(row, 'TipoHoja')
  if (comp === '!') return cdad * t.hoja
  if (rol === 'H') return cdad * 4 * t.hoja
  if (rol === 'M' || rol === 'G') return cdad * 4 * Math.max(t.marco, 1)
  // códigos de apertura (4HC, 2HOP…): tratarlos como marco por defecto
  return cdad * 4 * Math.max(t.marco, 1)
}

// oráculo
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
console.log(`Apariciones de alineamiento en oráculo: ${filas.length}`)

function predecir(f) {
  const rows = csaPorSerieArt.get(`${f.serie}|${f.art}`); if (!rows) return null
  let total = 0, disparadas = 0
  for (const r of rows) {
    const nOp = col(r, 'nOpcion')
    if (nOp && nOp !== '0' && !f.opc.has(nOp)) continue        // (a) opción activa
    const artA = col(r, 'ArticuloAsoc')
    if (artA && artA !== '0' && !f.perfiles.has(artA)) continue // (b) perfil presente
    disparadas++
    total += contar(r, f.t)
  }
  return disparadas ? total : null
}

let ok = 0, conFuente = 0, sinFuente = 0
const porArt = new Map(), porSerie = new Map()
for (const f of filas) {
  const p = predecir(f)
  if (p === null) { sinFuente++; continue }
  conFuente++
  const bien = Math.abs(p - f.real) < 0.01; if (bien) ok++
  if (!porArt.has(f.art)) porArt.set(f.art, [0, 0]); porArt.get(f.art)[1]++; if (bien) porArt.get(f.art)[0]++
  if (!porSerie.has(f.serie)) porSerie.set(f.serie, [0, 0]); porSerie.get(f.serie)[1]++; if (bien) porSerie.get(f.serie)[0]++
}
console.log(`\n════ predictor ConfigSeriesAsoc (gates: opción + ArticuloAsoc; count = Cdad×4×rol) ════`)
console.log(`  con fuente de serie: ${conFuente}/${filas.length}  (sin declaración: ${sinFuente})`)
console.log(`  ACIERTOS EXACTOS: ${ok}/${conFuente} (${conFuente ? (100 * ok / conFuente).toFixed(1) : 0}%)`)
console.log(`  por artículo:`)
for (const [art, [o, n]] of porArt) console.log(`     ${art}: ${o}/${n} (${(100 * o / n).toFixed(0)}%) ${descArt.get(art)}`)
console.log(`  por serie:`)
for (const [s, [o, n]] of [...porSerie].sort((a, b) => b[1][1] - a[1][1])) console.log(`     ${s.padEnd(12)}: ${o}/${n} (${(100 * o / n).toFixed(0)}%)`)

// muestra de fallos para seguir la RE
console.log(`\n  Muestra de FALLOS (con fuente):`)
let sh = 0
for (const f of filas) {
  const p = predecir(f); if (p === null || Math.abs(p - f.real) < 0.01) continue
  if (sh++ >= 8) break
  console.log(`     ${f.serie}|${f.art} real=${f.real} pred=${p} [m${f.t.marco}h${f.t.hueco}j${f.t.hoja}t${f.t.trav}]`)
}

// ═══════════ MODELO LINEAL POR SERIE (RE del configurador) ═══════════
// La cuenta = a·marco + b·hoja + c·hueco + d·trav, coeficientes enteros POR (serie,art).
// Se APRENDEN en train y se evalúan en test (held-out): ¿generaliza a topologías nuevas?
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
const esTest = new Map()
for (const f of filas) if (!esTest.has(f.k)) esTest.set(f.k, hash(f.k + 'cfg') % 2 === 0)
const train = filas.filter((f) => !esTest.get(f.k)), test = filas.filter((f) => esTest.get(f.k))
const GRID = [0, 1, 2, 3, 4, 6, 8]
const modelo = new Map()   // serie|art -> {a,b,c,d}
const trainPorSA = new Map()
for (const f of train) { const k = `${f.serie}|${f.art}`; if (!trainPorSA.has(k)) trainPorSA.set(k, []); trainPorSA.get(k).push(f) }
for (const [k, rs] of trainPorSA) {
  if (rs.length < 2) continue
  let best = null, bestOk = -1
  for (const a of GRID) for (const b of GRID) for (const c of [0, 1, 2, 4]) for (const d of [0, 1, 2, 4]) {
    let ok = 0
    for (const f of rs) if (Math.abs(a * f.t.marco + b * f.t.hoja + c * f.t.hueco + d * f.t.trav - f.real) < 0.01) ok++
    if (ok > bestOk) { bestOk = ok; best = { a, b, c, d } }
  }
  if (bestOk / rs.length >= 0.8) modelo.set(k, best)
}
const linPred = (f) => { const m = modelo.get(`${f.serie}|${f.art}`); return m ? m.a * f.t.marco + m.b * f.t.hoja + m.c * f.t.hueco + m.d * f.t.trav : null }
function evalLin(conj, nombre) {
  let ok = 0, con = 0
  for (const f of conj) { const p = linPred(f); if (p === null) continue; con++; if (Math.abs(p - f.real) < 0.01) ok++ }
  console.log(`  ${nombre}: ${ok}/${con} (${con ? (100 * ok / con).toFixed(1) : 0}%)  [sin modelo de serie: ${conj.length - con}]`)
  return { ok, con }
}
console.log(`\n═══════════ MODELO LINEAL POR SERIE (coef enteros a·marco+b·hoja+c·hueco+d·trav) ═══════════`)
console.log(`  series/art con modelo (≥80% en train, n≥2): ${modelo.size}`)
evalLin(train, 'TRAIN (in-sample)')
evalLin(test, 'TEST  (held-out) ⭐')
// coeficientes aprendidos (muestra)
console.log(`  coeficientes (muestra):`)
let sc = 0
for (const [k, m] of modelo) { if (sc++ >= 8) break; console.log(`     ${k.padEnd(20)} → ${m.a}·marco + ${m.b}·hoja + ${m.c}·hueco + ${m.d}·trav`) }
// generalización: aciertos en test sobre topologías NO vistas en train (por serie|art)
const sigTrain = new Set(train.map((f) => `${f.serie}|${f.art}|${f.t.marco},${f.t.hoja},${f.t.hueco},${f.t.trav}`))
let novOk = 0, novN = 0
for (const f of test) {
  const key = `${f.serie}|${f.art}|${f.t.marco},${f.t.hoja},${f.t.hueco},${f.t.trav}`
  if (sigTrain.has(key)) continue
  const p = linPred(f); if (p === null) continue
  novN++; if (Math.abs(p - f.real) < 0.01) novOk++
}
console.log(`  ⭐ GENERALIZA: aciertos en test sobre topologías NUEVAS (no vistas en train): ${novOk}/${novN} (${novN ? (100 * novOk / novN).toFixed(1) : 0}%)`)
