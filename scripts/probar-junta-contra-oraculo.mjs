/**
 * PRUEBA REAL: la junta perimetral emitida por el motor, contra el histórico.
 *
 * S.7.2 midió la regla (cada tramo de junta copia el corte de una pieza de
 * perfil de hoja, delta 0, 4.624/4.632 tramos) pero nunca se ejecutó el
 * código que la aplica. Esto llama a `emitirJuntaPerimetral` con los cortes
 * de hoja REALES de cada línea y compara el multiconjunto de largos con las
 * juntas que el ERP emitió.
 *
 * Se parte de los cortes reales de hoja, no de los calculados, para aislar
 * la regla de la junta del rebaje de hoja (anexo T): aquí se mide si la
 * junta copia bien, no si la hoja se calcula bien.
 *
 * Solo lectura. Uso: npx tsx scripts/probar-junta-contra-oraculo.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { emitirJuntaPerimetral } from '../packages/core/src/despiece/calcular.ts'

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
const datosLin = leer('VDatosLinEstr.csv')
const articulos = leer('Articulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

// El artículo de junta sale de la fila '!' HOJAS de ConjuntosAsoc, indexada
// por CONJUNTO. Ojo: el conjunto NO es la serie de la línea (Conjunto1). Los
// conjuntos aplicables a una línea son los de sus opciones de herraje
// (VOpcionesHerraje), como estableció el anexo S. Usar Conjunto1 no encuentra
// ninguno — el mismo error que se documentó con GMBASTIDOR en S.9.3.
const juntaPorConjunto = new Map()
const ARTICULOS_JUNTA = new Set()
for (const f of conjuntosAsoc) {
  if (col(f, 'ComponenteAsoc') !== '!') continue
  const texto = col(f, 'AsociadoA')
  if (texto !== 'HOJAS' && texto !== 'HOJAS (TODAS)') continue
  const art = col(f, 'Articulo')
  if (!art || art === '0') continue
  ARTICULOS_JUNTA.add(art)
  const cj = col(f, 'Conjunto')
  if (!juntaPorConjunto.has(cj)) juntaPorConjunto.set(cj, art)
}
const opcionesDoc = leer('VOpcionesHerraje.csv')
const conjuntosPorLinea = new Map()
for (const f of opcionesDoc) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!conjuntosPorLinea.has(k)) conjuntosPorLinea.set(k, new Set())
  conjuntosPorLinea.get(k).add(col(f, 'Conjunto'))
}
console.log(`Conjuntos con artículo de junta declarado: ${juntaPorConjunto.size}`)
console.log(`Artículos de junta distintos: ${ARTICULOS_JUNTA.size}\n`)

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

let lineas = 0, sinArticulo = 0
let tramosReales = 0, tramosCasados = 0, tramosSobrantes = 0
let lineasExactas = 0
const fallos = new Map()
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const k = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  // juntas REALES de la línea
  const reales = []
  for (const h of hijas) {
    if (!ARTICULOS_JUNTA.has(col(h, 'Articulo'))) continue
    const largo = num(h, 'LargoCorte') || num(h, 'Largo')
    if (largo <= 0) continue
    for (let i = 0; i < Math.max(1, Math.round(num(h, 'Cdad'))); i++) reales.push(largo)
  }
  if (!reales.length) continue
  lineas++

  let articuloJunta = null
  for (const cj of conjuntosPorLinea.get(k) ?? []) {
    const a = juntaPorConjunto.get(cj)
    if (a) { articuloJunta = a; break }
  }
  if (!articuloJunta) { sinArticulo++; continue }

  // piezas de hoja REALES, en el formato del motor
  const piezasHoja = []
  for (const h of hijas) {
    const fn = col(h, 'Funcion')
    if (fn !== 'HV' && fn !== 'HH') continue
    if (col(h, 'Articulo') === '0') continue
    const largo = num(h, 'LargoCorte') || num(h, 'Largo')
    if (largo <= 0) continue
    piezasHoja.push({
      articuloCodigo: col(h, 'Articulo'),
      cantidad: Math.max(1, Math.round(num(h, 'Cdad'))),
      largoMm: largo,
      formula: null, tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null,
      funcion: fn, incidencia: null,
    })
  }
  // El motor, tal cual
  const juntas = emitirJuntaPerimetral(piezasHoja, articuloJunta)
  const previstos = []
  for (const j of juntas) {
    if (j.largoMm === null) continue
    for (let i = 0; i < Math.max(1, Math.round(j.cantidad)); i++) previstos.push(j.largoMm)
  }

  const disponibles = [...previstos]
  let casadasLinea = 0
  for (const r of reales) {
    const i = disponibles.findIndex((x) => Math.abs(x - r) <= TOL)
    if (i >= 0) { disponibles.splice(i, 1); casadasLinea++ }
  }
  tramosReales += reales.length
  tramosCasados += casadasLinea
  tramosSobrantes += disponibles.length
  if (casadasLinea === reales.length && !disponibles.length) lineasExactas++
  else {
    const falta = reales.length - casadasLinea
    const clave = `faltan ${falta}, sobran ${disponibles.length}`
    fallos.set(clave, (fallos.get(clave) ?? 0) + 1)
  }
}

console.log('=== JUNTA PERIMETRAL: motor contra el histórico ===\n')
console.log(`Líneas con junta real:            ${lineas}`)
console.log(`  sin artículo de junta en su serie: ${sinArticulo}`)
console.log(`\nTramos reales:   ${tramosReales}`)
console.log(`Tramos casados:  ${tramosCasados}  (${(100 * tramosCasados / tramosReales).toFixed(1)}%)`)
console.log(`Tramos emitidos de más: ${tramosSobrantes}`)
console.log(`Líneas exactas (ni falta ni sobra): ${lineasExactas}/${lineas}  (${(100 * lineasExactas / lineas).toFixed(1)}%)`)
if (fallos.size) {
  console.log('\n--- desajustes más frecuentes ---')
  for (const [c, n] of [...fallos].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    console.log(`  ${String(n).padStart(4)} líneas  ${c}`)
  }
}
