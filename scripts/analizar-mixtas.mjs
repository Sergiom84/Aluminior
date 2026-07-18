/**
 * ESTRUCTURAS MIXTAS (hoja + fijo), fase de medición.
 *
 *  1. ¿Qué estructuras reales tienen hojas Y más vidrios que hojas?
 *  2. En la plantilla: ¿qué distingue la ranura de cristal de la hoja de la
 *     del fijo? (DisVidrio, DisTipoHoja, DisIdHoja, DisGrupo…)
 *  3. En el documento real: ¿de qué cortes salen las medidas del vidrio
 *     del fijo? (¿marco? ¿travesaño? ¿perfil FV/FH?)
 *
 * Solo lectura. Uso: node scripts/analizar-mixtas.mjs
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
const num = (v) => Number(String(v).replace(',', '.')) || 0

const estArt = leer('EstructurasArticulos.csv')
const vLin = leer('VPresupuestosLin.csv')
const datosLin = leer('VDatosLinEstr.csv')
const articulos = leer('Articulos.csv')
const porArt = new Map(articulos.map((a) => [col(a, 'Codigo'), a]))

const seriePorLinea = new Map()
for (const f of datosLin) {
  seriePorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}
const padres = vLin.filter((f) => col(f, 'EstructuraSN') === 'True')
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

// 1. Mixtas: con hojas y con vidrios de MÁS de una medida
const estMixtas = new Map()
const ejemplos = []
for (const p of padres) {
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const hvs = hijas.filter((h) => col(h, 'Funcion') === 'HV')
  if (!hvs.length) continue
  const vidrios = hijas.filter((h) => {
    const a = porArt.get(col(h, 'Articulo'))
    return a && col(a, 'Familia') === '050' && col(a, 'TipoMetraje') === 'M2'
  })
  const medidas = new Set(vidrios.map((h) => `${col(h, 'Largo')}|${col(h, 'Ancho')}`))
  if (medidas.size < 2) continue
  const e = col(p, 'Articulo')
  estMixtas.set(e, (estMixtas.get(e) ?? 0) + 1)
  if (ejemplos.length < 2 && e !== '0') ejemplos.push(p)
}
console.log('Estructuras con hojas y vidrios de varias medidas:')
for (const [e, n] of [...estMixtas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
  console.log(`  ${e.padEnd(10)} ${n}`)
}

// 2. Plantilla de la estructura mixta más frecuente (que no sea '0')
const eMix = [...estMixtas.entries()].filter(([e]) => e !== '0').sort((a, b) => b[1] - a[1])[0]?.[0]
if (eMix) {
  console.log(`\n=== Plantilla de ${eMix}: ranuras de cristal y hojas ===`)
  const CAMPOS = ['Articulo', 'Funcion', 'DisComponente', 'DisVidrio', 'DisTipoHoja', 'DisIdHoja', 'DisGrupo', 'DisIdIt', 'FormulaLargo', 'FormulaAncho', 'FormulaLargoCorte']
  console.log(CAMPOS.map((c) => c.slice(0, 11).padEnd(12)).join(''))
  for (const f of estArt) {
    if (col(f, 'TipoDoc')) continue
    if (col(f, 'Estructura') !== eMix) continue
    console.log(CAMPOS.map((c) => col(f, c).slice(0, 11).padEnd(12)).join(''))
  }
}

// 3. Documento real de esa estructura
for (const p of ejemplos.slice(0, 1)) {
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  console.log(`\n=== Doc ${col(p, 'nDoc')} estructura ${col(p, 'Articulo')} serie ${serie} hueco ${col(p, 'Largo')}×${col(p, 'Ancho')} ===`)
  for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
    const art = col(h, 'Articulo')
    const a = porArt.get(art)
    const fn = col(h, 'Funcion')
    const esVidrio = a && col(a, 'Familia') === '050'
    if (!fn && !esVidrio) continue
    console.log(`  ${art.padEnd(12)} fn=${fn.padEnd(10)} x${col(h, 'Cdad').padEnd(3)} L=${col(h, 'Largo').padEnd(9)} A=${col(h, 'Ancho').padEnd(9)} corte=${col(h, 'LargoCorte').padEnd(9)} ${(a ? col(a, 'Descripcion') : '').slice(0, 32)}`)
  }
}
