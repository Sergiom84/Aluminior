/**
 * PUNTO 1 (MO): recuento de MÓDULOS de mano de obra de FABRICACIÓN desde la
 * TOPOLOGÍA del árbol. SOLO LECTURA. NO commitear hasta verificar.
 *
 * T.32: fabricación = Σ(nº módulos × TiempoFabr × 0,5 €); VConceptosMO.Cantidad son
 * los MINUTOS (= módulos × TiempoFabr; 100% múltiplo entero de TiempoFabr, T.32.1).
 * El "nº de módulos" es el recuento acoplado al mismo árbol. Aquí se comprueba si la
 * topología (huecos/hojas/…) reconstruye el nº de módulos por línea, con el oráculo
 * directo VConceptosMO (regla 8: enlace por TipoDoc|nDoc|nLin exacto).
 *
 * Uso: npx tsx scripts/medir-mo-topologia.mjs
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

const moConceptos = leer('MOConceptos.csv')
const conceptosMO = leer('VConceptosMO.csv')
const estDis = leer('EstructurasDiseño.csv')
const vDatosLinEstr = leer('VDatosLinEstr.csv')
const seriePorLinea = new Map()
for (const r of vDatosLinEstr) seriePorLinea.set(`${col(r, 'TipoDoc')}|${col(r, 'nVDoc')}|${col(r, 'nVLinea')}`, col(r, 'Conjunto1'))

// TiempoFabr por concepto
console.log('MOConceptos cols:', Object.keys(moConceptos[0]).join(', '))
const campoConcepto = ['Concepto', 'Codigo', 'nConcepto', 'Id'].find((k) => k in moConceptos[0])
const campoTiempo = ['TiempoFabr', 'Tiempo', 'Minutos'].find((k) => k in moConceptos[0])
console.log(`(usando Concepto=${campoConcepto}, TiempoFabr=${campoTiempo})`)
const tiempoFabr = new Map()
for (const f of moConceptos) { const cc = col(f, campoConcepto); const t = num(f, campoTiempo); if (cc && t > 0) tiempoFabr.set(cc, t) }
console.log(`conceptos con TiempoFabr>0: ${tiempoFabr.size}`)

// topología de la instancia
const nodosPorLinea = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc'); if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!nodosPorLinea.has(k)) nodosPorLinea.set(k, [])
  nodosPorLinea.get(k).push({ tipo: col(f, 'Tipo') })
}
function topologia(k) {
  const nodos = nodosPorLinea.get(k); if (!nodos) return null
  const cnt = (tipo) => nodos.filter((n) => n.tipo === tipo).length
  return { marco: cnt('1'), hueco: cnt('2'), hoja: cnt('3'), trav: cnt('6'), vidrio: cnt('5') + cnt('7') }
}

// módulos por línea = Σ round(Cantidad / TiempoFabr) sobre conceptos con minutos>0
const modulosPorLinea = new Map()
let sinTiempo = 0, noEntero = 0
for (const f of conceptosMO) {
  const min = num(f, 'Cantidad'); if (min <= 0) continue
  const cc = col(f, 'Concepto'); const tf = tiempoFabr.get(cc)
  if (!tf) { sinTiempo++; continue }
  const mod = min / tf
  if (Math.abs(mod - Math.round(mod)) > 0.01) { noEntero++; continue }
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLin')}`
  modulosPorLinea.set(k, (modulosPorLinea.get(k) ?? 0) + Math.round(mod))
}
console.log(`Líneas con módulos>0: ${modulosPorLinea.size}  (filas sin TiempoFabr: ${sinTiempo}, minutos no múltiplo: ${noEntero})`)

// oráculo: por línea con topología, módulos reales vs candidatos topológicos
const filas = []
for (const [k, modulos] of modulosPorLinea) {
  const topo = topologia(k); if (!topo) continue
  filas.push({ k, serie: seriePorLinea.get(k) ?? '', modulos, topo })
}
console.log(`Líneas con módulos Y topología: ${filas.length}`)
const distMod = new Map(); for (const f of filas) distMod.set(f.modulos, (distMod.get(f.modulos) ?? 0) + 1)
console.log(`reparto nº módulos: ${[...distMod].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v, n]) => `${v}→${n}`).join('  ')}`)

// candidatos topológicos para el nº de módulos
const CANDS = {
  'hueco': (t) => t.hueco, 'hoja': (t) => t.hoja, 'marco': (t) => t.marco,
  'hueco+hoja': (t) => t.hueco + t.hoja, 'marco+hoja': (t) => t.marco + t.hoja,
  'hoja+trav': (t) => t.hoja + t.trav, 'huecoOhoja': (t) => Math.max(t.hueco, t.hoja),
  'todos': (t) => t.marco + t.hueco + t.hoja + t.trav, 'marco+hueco': (t) => t.marco + t.hueco,
}
console.log(`\n════════ nº de módulos vs topología (n=${filas.length}) ════════`)
const hits = new Map(Object.keys(CANDS).map((n) => [n, 0]))
for (const f of filas) for (const [n, fn] of Object.entries(CANDS)) if (Math.abs(fn(f.topo) - f.modulos) < 0.01) hits.set(n, hits.get(n) + 1)
for (const [n, h] of [...hits].sort((a, b) => b[1] - a[1])) console.log(`  ${n.padEnd(12)}: ${String(h).padStart(4)}/${filas.length} (${(100 * h / filas.length).toFixed(1)}%)`)

// por serie: ¿la mejor regla es constante o varía?
console.log(`\n  Muestra (módulos vs topología):`)
for (const f of filas.slice(0, 12)) console.log(`     ${f.serie}|mod=${f.modulos} [marco${f.topo.marco} hueco${f.topo.hueco} hoja${f.topo.hoja} trav${f.topo.trav} vid${f.topo.vidrio}]`)
