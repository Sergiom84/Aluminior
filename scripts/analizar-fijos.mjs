/**
 * FIJOS, fase de medición.
 *
 *  1. ¿Qué estructuras reales son SOLO fijo (sin HV/HH)? ¿Qué funciones
 *     llevan sus perfiles?
 *  2. En esas líneas, ¿de qué corte sale la medida del vidrio?
 *     (vidrio = corte de algún perfil − delta, como en hojas)
 *  3. ¿Y en líneas mixtas (hoja + fijo): cuántos vidrios distintos hay?
 *
 * Solo lectura. Uso: node scripts/analizar-fijos.mjs
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

// 1. Líneas sin HV/HH pero con vidrio: estructuras de fijo
const estructurasFijo = new Map() // estructura -> n
const funcionesFijo = new Map()
let mixtas = 0, soloFijo = 0
for (const p of padres) {
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  let tieneHoja = false, tieneVidrio = false
  const funciones = new Set()
  for (const h of hijas) {
    const fn = col(h, 'Funcion')
    if (fn === 'HV' || fn === 'HH') tieneHoja = true
    if (fn) funciones.add(fn)
    const a = porArt.get(col(h, 'Articulo'))
    if (a && col(a, 'Familia') === '050' && col(a, 'TipoMetraje') === 'M2') tieneVidrio = true
  }
  if (!tieneVidrio) continue
  if (tieneHoja) { mixtas++; continue }
  soloFijo++
  const e = col(p, 'Articulo')
  estructurasFijo.set(e, (estructurasFijo.get(e) ?? 0) + 1)
  for (const fn of funciones) funcionesFijo.set(fn, (funcionesFijo.get(fn) ?? 0) + 1)
}
console.log(`Líneas con vidrio: mixtas (hoja+fijo u hoja) contadas aparte`)
console.log(`  SOLO fijo: ${soloFijo}   con hojas: ${mixtas}`)
console.log(`\nEstructuras de solo-fijo más frecuentes:`)
for (const [e, n] of [...estructurasFijo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${e.padEnd(10)} ${n}`)
}
console.log(`\nFunciones presentes en líneas de solo-fijo:`)
for (const [fn, n] of [...funcionesFijo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${fn.padEnd(12)} ${n}`)
}

// 2. Detalle de dos líneas de solo-fijo (serie con más casos)
console.log('\n=== Detalle de líneas de solo-fijo ===')
let mostradas = 0
for (const p of padres) {
  if (mostradas >= 3) break
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  let tieneHoja = false, vidrios = []
  for (const h of hijas) {
    const fn = col(h, 'Funcion')
    if (fn === 'HV' || fn === 'HH') tieneHoja = true
    const a = porArt.get(col(h, 'Articulo'))
    if (a && col(a, 'Familia') === '050' && col(a, 'TipoMetraje') === 'M2') vidrios.push(h)
  }
  if (tieneHoja || !vidrios.length) continue
  mostradas++
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  console.log(`\n  Doc ${col(p, 'nDoc')} serie ${serie} estructura ${col(p, 'Articulo')} hueco ${col(p, 'Largo')}×${col(p, 'Ancho')}`)
  for (const h of hijas) {
    const art = col(h, 'Articulo')
    const a = porArt.get(art)
    const desc = a ? col(a, 'Descripcion') : ''
    console.log(`    ${art.padEnd(12)} fn=${col(h, 'Funcion').padEnd(10)} x${col(h, 'Cdad').padEnd(3)} L=${col(h, 'Largo').padEnd(9)} A=${col(h, 'Ancho').padEnd(9)} corte=${col(h, 'LargoCorte').padEnd(9)} ${desc.slice(0, 35)}`)
  }
}
