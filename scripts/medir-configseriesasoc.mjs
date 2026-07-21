/**
 * PUNTO residuo: ¿ConfigSeriesAsoc (por serie × TipoHoja/rol, que v5 IGNORA)
 * reconstruye el recuento de las escuadras de alineamiento GENERALIZANDO —no
 * memorizando— donde la topología sola fallaba? SOLO LECTURA. NO commitear.
 *
 * ConfigSeriesAsoc es la 2ª declaración de asociados (S.7.4 pendiente), en el export
 * CSV de EMP0016. Keyed por (Conjunto=serie, TipoHoja=rol/apertura). Roles: H=Hojas,
 * M=Marco, G=General, '!'=categoría (HOJAS RODAMIENTO…). Hipótesis: cantidad =
 * Cdad × conteo topológico según el rol (M→esquinas de marco, H→por hoja, !→hojas).
 * Se filtra por opción activa (VOpcionesHerraje) como v5, y se mide contra el oráculo
 * (enlace exacto por hijas de VPresupuestosLin, regla 8).
 *
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

// ConfigSeriesAsoc por (Conjunto, Articulo)
const csaPorSerieArt = new Map()
for (const f of csa) {
  const art = col(f, 'Articulo'); if (!ALIN.includes(art)) continue
  const k = `${col(f, 'Conjunto')}|${art}`
  if (!csaPorSerieArt.has(k)) csaPorSerieArt.set(k, [])
  csaPorSerieArt.get(k).push(f)
}

// topología de la instancia + nHojas por línea
const nodosPorLinea = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!nodosPorLinea.has(k)) nodosPorLinea.set(k, [])
  nodosPorLinea.get(k).push({ tipo: col(f, 'Tipo') })
}
function topo(k) {
  const nodos = nodosPorLinea.get(k); if (!nodos) return null
  const cnt = (tp) => nodos.filter((n) => n.tipo === tp).length
  return { marco: cnt('1'), hueco: cnt('2'), hoja: cnt('3'), trav: cnt('6'), vidrio: cnt('5') + cnt('7') }
}

// opciones activas por línea
const opcionesPorLinea = new Map()
for (const f of opcionesDoc) {
  if (col(f, 'SelecSN') !== 'True') continue
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcionesPorLinea.has(k)) opcionesPorLinea.set(k, new Set())
  opcionesPorLinea.get(k).add(col(f, 'nOpcion'))
}

// conteo por rol (candidatos): devuelve el nº de "unidades" del rol en la línea
const ROLES = {
  'M→4(marco esq)': (t, rol) => rol === 'M' ? 4 : null,
  'M→4·marco': (t, rol) => rol === 'M' ? 4 * t.marco : null,
  'H→4·hoja': (t, rol) => rol === 'H' ? 4 * t.hoja : null,
  'H→hoja': (t, rol) => rol === 'H' ? t.hoja : null,
  '!→hoja': (t, rol) => rol === 'G' || rol === 'H' ? t.hoja : null,   // ! suele ir con H/G
}
// modelo combinado (rol→conteo): M→4esquinas de marco, H→4·hoja (esquinas por hoja),
// '!'→ nº hojas (HOJAS RODAMIENTO). comp '!' usa la categoría; ranura usa esquinas.
function contar(comp, rol, t) {
  if (comp === '!') return t.hoja                      // HOJAS RODAMIENTO ≈ nº hojas
  if (rol === 'M' || rol === 'G') return 4 * t.marco   // esquinas del marco (marco=1 → 4)
  if (rol === 'H') return 4 * t.hoja                   // esquinas por hoja
  return 4 * Math.max(t.marco, 1)
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
    const serie = seriePorLinea.get(k) ?? ''
    const opc = opcionesPorLinea.get(k) ?? new Set()
    const reales = new Map()
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'); if (!ALIN.includes(art)) continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    for (const [art, real] of reales) filas.push({ k, serie, art, real, t, opc })
  }
}
console.log(`Apariciones de alineamiento en oráculo: ${filas.length}`)

// predicción con ConfigSeriesAsoc + filtro de opción
function predecir(f, usarOpcion) {
  const rows = csaPorSerieArt.get(`${f.serie}|${f.art}`) ?? []
  if (!rows.length) return null   // serie sin declaración → sin fuente
  let total = 0, aplicables = 0
  for (const r of rows) {
    const nOp = col(r, 'nOpcion')
    if (usarOpcion && nOp && nOp !== '0' && !f.opc.has(nOp)) continue
    aplicables++
    total += num(r, 'Cantidad') * contar(col(r, 'ComponenteAsoc'), col(r, 'TipoHoja'), f.t)
  }
  return aplicables ? total : null
}

for (const usarOpcion of [false, true]) {
  let ok = 0, sinFuente = 0, conFuente = 0
  const porArt = new Map()
  for (const f of filas) {
    const p = predecir(f, usarOpcion)
    if (p === null) { sinFuente++; continue }
    conFuente++
    const bien = Math.abs(p - f.real) < 0.01; if (bien) ok++
    if (!porArt.has(f.art)) porArt.set(f.art, [0, 0]); porArt.get(f.art)[1]++; if (bien) porArt.get(f.art)[0]++
  }
  console.log(`\n════ ConfigSeriesAsoc ${usarOpcion ? 'CON' : 'SIN'} filtro de opción ════`)
  console.log(`  con fuente: ${conFuente}/${filas.length}  (sin declaración de serie: ${sinFuente})`)
  console.log(`  aciertos exactos: ${ok}/${conFuente} (${conFuente ? (100 * ok / conFuente).toFixed(1) : 0}%)`)
  for (const [art, [o, n]] of porArt) console.log(`     ${art}: ${o}/${n} (${(100 * o / n).toFixed(0)}%) ${descArt.get(art)}`)
}

// desglose por serie (con opción): pred modal vs real modal
console.log(`\n  Por serie (con opción): real modal vs pred modal`)
const bySerie = new Map()
for (const f of filas) { if (f.art !== 'GM4735') continue; if (!bySerie.has(f.serie)) bySerie.set(f.serie, []); bySerie.get(f.serie).push(f) }
for (const [s, fs] of [...bySerie].sort((a, b) => b[1].length - a[1].length).slice(0, 12)) {
  const realModa = [...fs.reduce((m, f) => m.set(f.real, (m.get(f.real) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1])[0]
  const preds = fs.map((f) => predecir(f, true)).filter((x) => x !== null)
  const predModa = preds.length ? [...preds.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1])[0] : null
  console.log(`     ${s.padEnd(12)} n=${String(fs.length).padStart(3)} realModa=${realModa[0]} predModa=${predModa ? predModa[0] : '—'}`)
}
