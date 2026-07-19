/**
 * MEDICIÓN: asociados en METROS (S.7.2).
 *
 * Las filas de junta perimetral (GM4055/GM5085) son `'!' HOJAS` con
 * Cantidad=1 y sin fórmula: la longitud la calcula la aplicación desde la
 * geometría del ancla. Hipótesis a medir:
 *
 *   H-perímetro   Cdad real (m) = Σ por hoja de 2·(ancho+alto)/1000
 *   H-mitad       ídem /2 (junta en una cara)
 *
 * Las dimensiones de cada hoja salen de las fórmulas HV/HH de la plantilla
 * (por DisIdHoja) evaluadas con las cotas reales de la línea — el mismo
 * mecanismo validado en v4 (anexo S.6).
 *
 * También mide las gomas `A`/`L` (GM4090…):
 *   H-dim   Cdad real (m) = Σ filas Cantidad × dim/1000  (A→ancho, L→alto)
 *
 * Solo lectura. Uso: npx tsx scripts/medir-ml-asociados.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { evaluar } from '../packages/core/src/despiece/formula.ts'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})
const col = (f, n) => (f[n] ?? '').trim()
const num = (f, n) => Number(col(f, n).replace(',', '.')) || 0

const estArt = leer('EstructurasArticulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
const vLin = leer('VPresupuestosLin.csv')

// hojas por estructura: idHoja -> {fHH, fHV}
const hojasPlantilla = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const fn = col(f, 'Funcion')
  if (fn !== 'HH' && fn !== 'HV') continue
  const idHoja = num(f, 'DisIdHoja')
  if (idHoja <= 0) continue
  const e = col(f, 'Estructura')
  if (!hojasPlantilla.has(e)) hojasPlantilla.set(e, new Map())
  const m = hojasPlantilla.get(e)
  if (!m.has(idHoja)) m.set(idHoja, {})
  const fl = col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo')
  if (fn === 'HH') m.get(idHoja).fHH = fl
  else m.get(idHoja).fHV = fl
}

// cotas (idéntico a v4)
const cotasDefecto = new Map()
const simboloPorId = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura')
  const simbolo = col(f, 'Simbolo')
  if (!simbolo) continue
  if (!cotasDefecto.has(e)) cotasDefecto.set(e, {})
  cotasDefecto.get(e)[simbolo] = num(f, 'Cota')
  const id = col(f, 'Id')
  if (id) simboloPorId.set(`${e}|${id}`, simbolo)
}
const cotasInstancia = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc')
  if (t !== 'VPRES') continue
  const e = col(f, 'Estructura')
  const simbolo = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  if (!simbolo) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Cota')
}
const simboloDa = new Map(estructurasDa.map((f) => [
  `${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA'),
]))
for (const f of medidasDa) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const simbolo = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!simbolo) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Medida')
}

// oráculo: padres e hijas
const padres = new Map()
const hijasPorPadre = new Map()
for (const f of vLin) {
  if (col(f, 'EstructuraSN') === 'True') { padres.set(col(f, 'nLinea'), f); continue }
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

// --- juntas perimetrales: espejo {2×HV, 2×HH} por hoja ---
// Cada pieza de junta tiene Cdad=1 y Largo = corte de un lado de la hoja.
// Hipótesis: multiconjunto de largos de junta == por cada hoja, dos veces
// el corte vertical y dos veces el horizontal (fórmulas de plantilla
// evaluadas con las cotas reales).
const JUNTAS = ['GM4055', 'GM5085']
let casos = 0, espejo = 0
const desvios = []
for (const [nLinea, p] of padres) {
  const hijas = hijasPorPadre.get(nLinea) ?? []
  const junta = hijas.filter((h) => JUNTAS.includes(col(h, 'Articulo')))
  if (!junta.length) continue
  const estructura = col(p, 'Articulo')
  const hojas = hojasPlantilla.get(estructura)
  if (!hojas || !hojas.size) continue
  const contexto = {
    L: num(p, 'Largo'), A: num(p, 'Ancho'),
    ...(cotasDefecto.get(estructura) ?? {}),
    ...(cotasInstancia.get(`${col(p, 'nDoc')}|${nLinea}`) ?? {}),
  }
  const esperados = []
  let completo = true
  for (const [, formulas] of hojas) {
    try {
      const ancho = formulas.fHH ? evaluar(formulas.fHH, contexto) : NaN
      const alto = formulas.fHV ? evaluar(formulas.fHV, contexto) : NaN
      if (!Number.isFinite(ancho) || !Number.isFinite(alto)) throw new Error('sin fórmula')
      esperados.push(alto, alto, ancho, ancho)
    } catch { completo = false; break }
  }
  if (!completo) continue
  casos++
  const reales = junta.flatMap((h) => {
    const n = Math.max(1, Math.round(num(h, 'Cdad')))
    return Array(n).fill(num(h, 'LargoCorte') || num(h, 'Largo'))
  })
  // emparejamiento con tolerancia de 0,5 mm
  const restantes = [...esperados]
  let ok = reales.length === esperados.length
  if (ok) {
    for (const r of reales) {
      const i = restantes.findIndex((e) => Math.abs(e - r) <= 0.5)
      if (i < 0) { ok = false; break }
      restantes.splice(i, 1)
    }
  }
  if (ok) espejo++
  else if (desvios.length < 10) {
    desvios.push(`${estructura}: junta[${reales.length}] ${reales.map((x) => x.toFixed(0)).sort().join(',')}  esperado[${esperados.length}] ${esperados.map((x) => x.toFixed(0)).sort().join(',')}`)
  }
}
console.log(`Juntas perimetrales: ${casos} líneas medibles`)
console.log(`  espejo {2×HV, 2×HH} por hoja (±0,5 mm): ${espejo} (${(100 * espejo / casos).toFixed(1)}%)`)
console.log('  no coinciden (ejemplos):')
for (const d of desvios) console.log('   ', d)

// --- gomas A/L ---
const GOMAS = ['GM4090']
let casosG = 0, okDim = 0
const desviosG = []
for (const [nLinea, p] of padres) {
  const hijas = hijasPorPadre.get(nLinea) ?? []
  const goma = hijas.filter((h) => GOMAS.includes(col(h, 'Articulo')))
  if (!goma.length) continue
  const real = goma.reduce((a, h) => a + num(h, 'Cdad'), 0)
  casosG++
  // filas A×2 y L×2 (GMBASTIDOR): 2·ancho + 2·alto en metros
  const pred = (2 * num(p, 'Ancho') + 2 * num(p, 'Largo')) / 1000
  if (Math.abs(pred - real) / Math.max(real, 0.001) <= 0.02) okDim++
  else if (desviosG.length < 8) desviosG.push(`real ${real.toFixed(2)}m  2A+2L ${pred.toFixed(2)}m  (${num(p, 'Largo')}×${num(p, 'Ancho')})`)
}
console.log(`\nGoma GM4090 (A/L ×2): ${casosG} líneas`)
console.log(`  == 2·ancho+2·alto (±2%): ${okDim} (${(100 * okDim / Math.max(casosG, 1)).toFixed(1)}%)`)
for (const d of desviosG) console.log('   ', d)
