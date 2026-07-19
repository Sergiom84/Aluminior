/**
 * MEDICIÓN: ¿qué piezas de perfil de hoja llevan junta perimetral?
 *
 * T.14 descubrió, al ejecutar el código, que la regla de S.7.2 acierta el
 * LARGO (94,2% de tramos casados) pero emite 840 tramos de más: no todas
 * las piezas de hoja llevan junta. S.7.2 nunca midió el recuento.
 *
 * Aquí se mide, con el mismo método de T.9-T.10: para cada pieza de hoja se
 * comprueba si existe un tramo de junta de su mismo largo (emparejamiento
 * con consumo, sin reutilizar tramos), y se busca qué rasgo separa las que
 * lo llevan de las que no.
 *
 * Un discriminante sirve si sus grupos son casi todo-sí o casi todo-no; un
 * grupo al 50% no informa de nada.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-que-hojas-llevan-junta.mjs
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
const TOL = 0.51

const vLin = leer('VPresupuestosLin.csv')
const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const opcionesDoc = leer('VOpcionesHerraje.csv')
const detalles = leer('VDatosLinDetDis.csv')
const estArt = leer('EstructurasArticulos.csv')
const datosLin = leer('VDatosLinEstr.csv')

const ARTICULOS_JUNTA = new Set()
const juntaPorConjunto = new Map()
for (const f of conjuntosAsoc) {
  if (col(f, 'ComponenteAsoc') !== '!') continue
  const t = col(f, 'AsociadoA')
  if (t !== 'HOJAS' && t !== 'HOJAS (TODAS)') continue
  const art = col(f, 'Articulo')
  if (!art || art === '0') continue
  ARTICULOS_JUNTA.add(art)
  const cj = col(f, 'Conjunto')
  if (!juntaPorConjunto.has(cj)) juntaPorConjunto.set(cj, art)
}
const conjuntosPorLinea = new Map()
for (const f of opcionesDoc) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!conjuntosPorLinea.has(k)) conjuntosPorLinea.set(k, new Set())
  conjuntosPorLinea.get(k).add(col(f, 'Conjunto'))
}
const detallePorLinea = new Map(detalles.map((f) => [col(f, 'nVLinea'), f]))
const plantillaHoja = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const fn = col(f, 'Funcion')
  if (fn !== 'HV' && fn !== 'HH') continue
  const idIt = col(f, 'DisIdIt')
  if (!idIt || idIt === '0') continue
  const k = `${col(f, 'Estructura')}|${fn}|${idIt}`
  if (!plantillaHoja.has(k)) plantillaHoja.set(k, f)
}
const seriePorLinea = new Map()
for (const f of datosLin) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  seriePorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

// ¿Los tramos de junta traen su propio enlace de diseño? Si lo trajeran, el
// emparejamiento sería exacto —el mismo desbloqueo que T.7— y no haría falta
// adivinar nada por largos.
{
  let conDetalle = 0, conIdIt = 0, total = 0
  for (const f of vLin) {
    if (!ARTICULOS_JUNTA.has(col(f, 'Articulo'))) continue
    total++
    const det = detallePorLinea.get(col(f, 'nLinea'))
    if (!det) continue
    conDetalle++
    if (col(det, 'DisIdIt') && col(det, 'DisIdIt') !== '0') conIdIt++
  }
  console.log(`Tramos de junta en el histórico: ${total}`)
  console.log(`  con fila en VDatosLinDetDis:   ${conDetalle}`)
  console.log(`  con DisIdIt utilizable:        ${conIdIt}\n`)
}

const obs = []
let lineas = 0
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const k = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const juntas = []
  for (const h of hijas) {
    if (!ARTICULOS_JUNTA.has(col(h, 'Articulo'))) continue
    const largo = num(h, 'LargoCorte') || num(h, 'Largo')
    if (largo <= 0) continue
    for (let i = 0; i < Math.max(1, Math.round(num(h, 'Cdad'))); i++) juntas.push(largo)
  }
  if (!juntas.length) continue
  let tieneArticulo = false
  for (const cj of conjuntosPorLinea.get(k) ?? []) if (juntaPorConjunto.has(cj)) { tieneArticulo = true; break }
  if (!tieneArticulo) continue
  lineas++
  const estructura = col(p, 'Articulo')
  const serie = seriePorLinea.get(k) ?? ''

  // piezas de hoja de la línea, con su fila de plantilla
  const piezas = []
  for (const h of hijas) {
    const fn = col(h, 'Funcion')
    if (fn !== 'HV' && fn !== 'HH') continue
    const perfil = col(h, 'Articulo')
    if (!perfil || perfil === '0') continue
    const largo = num(h, 'LargoCorte') || num(h, 'Largo')
    if (largo <= 0) continue
    const det = detallePorLinea.get(col(h, 'nLinea'))
    const idIt = det ? col(det, 'DisIdIt') : ''
    const fila = idIt ? plantillaHoja.get(`${estructura}|${fn}|${idIt}`) : null
    for (let i = 0; i < Math.max(1, Math.round(num(h, 'Cdad'))); i++) {
      piezas.push({ perfil, fn, largo, fila, estructura, serie, grupo: det ? col(det, 'DisGrupo') : '' })
    }
  }
  // Emparejar pieza a pieza por largo es AMBIGUO: si dos piezas de hoja
  // miden lo mismo y sólo hay un tramo de junta, cuál de las dos "lleva
  // junta" lo decidiría el orden del bucle, no los datos. Esa marca
  // arbitraria contaminaría cualquier discriminante que se midiese después.
  //
  // Se agrupa por (línea, largo), donde el recuento sí es inequívoco: si hay
  // 3 piezas de ese largo y 2 tramos de junta, 2 llevan y 1 no. La cesta
  // sólo se usa si TODAS sus piezas comparten el valor del discriminante;
  // si no, no se puede atribuir y se descarta.
  const cestas = new Map()
  for (const pz of piezas) {
    const kl = Math.round(pz.largo * 10)
    if (!cestas.has(kl)) cestas.set(kl, [])
    cestas.get(kl).push(pz)
  }
  for (const [kl, grupo] of cestas) {
    const nJuntas = juntas.filter((x) => Math.abs(x - kl / 10) <= TOL).length
    obs.push({ piezas: grupo, conJunta: Math.min(nJuntas, grupo.length), total: grupo.length })
  }
}
const totalPiezas = obs.reduce((a, o) => a + o.total, 0)
const totalConJunta = obs.reduce((a, o) => a + o.conJunta, 0)
console.log(`Líneas analizadas: ${lineas}   cestas (línea × largo): ${obs.length}   piezas de hoja: ${totalPiezas}`)
console.log(`  con tramo de junta: ${totalConJunta} (${(100 * totalConJunta / totalPiezas).toFixed(1)}%)`)
console.log(`  sin tramo de junta: ${totalPiezas - totalConJunta} (${(100 * (totalPiezas - totalConJunta) / totalPiezas).toFixed(1)}%)\n`)

const c = (f, n) => (f ? col(f, n) : '')
const CANDIDATOS = [
  ['eje (HV/HH)', (o) => o.fn],
  ['perfil', (o) => o.perfil],
  ['perfil + eje', (o) => `${o.perfil}|${o.fn}`],
  ['perfil + eje + fórmula', (o) => `${o.perfil}|${o.fn}|${c(o.fila, 'FormulaLargoCorte') || c(o.fila, 'FormulaLargo')}`],
  ['DisTipoHoja', (o) => c(o.fila, 'DisTipoHoja')],
  ['perfil + eje + DisTipoHoja', (o) => `${o.perfil}|${o.fn}|${c(o.fila, 'DisTipoHoja')}`],
  ['DisGrupo (del detalle)', (o) => o.grupo],
  ['perfil + eje + DisGrupo', (o) => `${o.perfil}|${o.fn}|${o.grupo}`],
  ['serie + eje', (o) => `${o.serie}|${o.fn}`],
]

console.log('discriminante                       grupos  decididos  piezas explicadas   cestas no atribuibles')
for (const [nombre, clave] of CANDIDATOS) {
  const g = new Map()
  let noAtribuibles = 0
  for (const o of obs) {
    // sólo cuenta si TODAS las piezas de la cesta comparten el discriminante
    const valores = new Set(o.piezas.map(clave))
    if (valores.size !== 1) { noAtribuibles += o.total; continue }
    const k2 = [...valores][0]
    if (!g.has(k2)) g.set(k2, { si: 0, total: 0 })
    const acc = g.get(k2)
    acc.si += o.conJunta
    acc.total += o.total
  }
  let decididos = 0, explicadas = 0
  for (const [, v] of g) {
    if (v.total < 3) continue
    const tasa = Math.max(v.si, v.total - v.si) / v.total
    if (tasa >= 0.9) { decididos++; explicadas += v.total }
  }
  console.log(`  ${nombre.padEnd(32)} ${String(g.size).padStart(5)}  ${String(decididos).padStart(9)}   ${String(explicadas).padStart(5)}/${totalPiezas} (${(100 * explicadas / totalPiezas).toFixed(1)}%)   ${noAtribuibles}`)
}
