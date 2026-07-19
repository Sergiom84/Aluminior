/**
 * MEDICIÓN v4: ¿qué le pasa al 20,4% que T.9 no cubre?
 *
 * T.9 dejó la regla `rebaje = f(perfil, eje, fórmula)` con 50 grupos
 * estables y medidas variadas, 6.084 de 7.639 piezas (79,6%). Quedan 37
 * grupos inestables. Antes de implementar con guarda conviene saber si les
 * falta una condición más (y entonces sube la cobertura) o si son
 * irreducibles con los datos disponibles (y entonces la guarda es la
 * respuesta correcta).
 *
 * Se prueban discriminantes ADICIONALES sólo dentro de los grupos
 * inestables, y se comprueba si el contexto observable llega a determinar
 * el rebaje (mismo test de determinismo que S.9.8).
 *
 * Solo lectura. Uso: npx tsx scripts/medir-rebaje-hoja-v4.mjs
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
const TOL = 0.51

const estArt = leer('EstructurasArticulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
const vLin = leer('VPresupuestosLin.csv')
const detalles = leer('VDatosLinDetDis.csv')
const datosLin = leer('VDatosLinEstr.csv')
const articulos = leer('Articulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const detallePorLinea = new Map(detalles.map((f) => [col(f, 'nVLinea'), f]))
const plantillaHoja = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const fn = col(f, 'Funcion')
  if (!FUNCIONES_HOJA.has(fn)) continue
  const idIt = col(f, 'DisIdIt')
  if (!idIt || idIt === '0') continue
  if (!(col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo'))) continue
  const k = `${col(f, 'Estructura')}|${fn}|${idIt}`
  if (!plantillaHoja.has(k)) plantillaHoja.set(k, f)
}
const cotasDefecto = new Map(); const simboloPorId = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura'), s = col(f, 'Simbolo')
  if (!s) continue
  if (!cotasDefecto.has(e)) cotasDefecto.set(e, {})
  cotasDefecto.get(e)[s] = num(f, 'Cota')
  const id = col(f, 'Id'); if (id) simboloPorId.set(`${e}|${id}`, s)
}
const cotasInstancia = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const e = col(f, 'Estructura')
  const s = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  if (!s) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[s] = num(f, 'Cota')
}
const simboloDa = new Map(estructurasDa.map((f) => [`${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA')]))
for (const f of medidasDa) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const s = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!s) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[s] = num(f, 'Medida')
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

const observaciones = []
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const estructura = col(p, 'Articulo')
  const ancho = num(p, 'Ancho'), largo = num(p, 'Largo')
  if (ancho <= 0 || largo <= 0) continue
  const k = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const contexto = {
    L: largo, A: ancho,
    ...(cotasDefecto.get(estructura) ?? {}),
    ...(cotasInstancia.get(k) ?? {}),
  }
  for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
    const fn = col(h, 'Funcion')
    if (!FUNCIONES_HOJA.has(fn)) continue
    const perfil = col(h, 'Articulo')
    if (!perfil || perfil === '0') continue
    const corte = num(h, 'LargoCorte') || num(h, 'Largo')
    if (corte <= 0) continue
    const det = detallePorLinea.get(col(h, 'nLinea'))
    const idIt = det ? col(det, 'DisIdIt') : ''
    if (!idIt || idIt === '0') continue
    const fila = plantillaHoja.get(`${estructura}|${fn}|${idIt}`)
    if (!fila) continue
    const formula = col(fila, 'FormulaLargoCorte') || col(fila, 'FormulaLargo')
    let previsto
    try { previsto = evaluar(formula, contexto) } catch { continue }
    observaciones.push({
      perfil, fn, fila, formula, previsto, estructura, idIt,
      delta: previsto - corte, serie: seriePorLinea.get(k) ?? '?',
      acabado: col(h, 'Acabado'),
    })
  }
}

const estable = (deltas) => {
  if (deltas.length < 3) return false
  let mejor = 0
  for (const d of deltas) {
    const n = deltas.filter((x) => Math.abs(x - d) <= TOL).length
    if (n > mejor) mejor = n
  }
  return mejor / deltas.length >= 0.9
}

// grupos de T.9
const grupos = new Map()
for (const o of observaciones) {
  const c = `${o.perfil}|${o.fn}|${o.formula}`
  if (!grupos.has(c)) grupos.set(c, [])
  grupos.get(c).push(o)
}
const inestables = [...grupos.entries()].filter(([, obs]) => !estable(obs.map((o) => o.delta)))
const piezasInestables = inestables.reduce((a, [, o]) => a + o.length, 0)
console.log(`Grupos de T.9: ${grupos.size}   inestables: ${inestables.length}   piezas afectadas: ${piezasInestables}`)

// ¿un discriminante adicional los estabiliza?
const EXTRA = [
  ['+ estructura', (o) => o.estructura],
  ['+ serie', (o) => o.serie],
  ['+ DisTipoHoja', (o) => col(o.fila, 'DisTipoHoja')],
  ['+ DisNHoja', (o) => col(o.fila, 'DisNHoja')],
  ['+ acabado', (o) => o.acabado],
  ['+ DisIdIt', (o) => o.idIt],
]
console.log('\n--- ¿algún discriminante adicional estabiliza los grupos inestables? ---')
for (const [nombre, fn] of EXTRA) {
  let recuperadas = 0, subgrupos = 0
  for (const [, obs] of inestables) {
    const sub = new Map()
    for (const o of obs) {
      const c = fn(o) ?? ''
      if (!sub.has(c)) sub.set(c, [])
      sub.get(c).push(o)
    }
    subgrupos += sub.size
    for (const [, s] of sub) if (estable(s.map((o) => o.delta))) recuperadas += s.length
  }
  console.log(`  ${nombre.padEnd(16)} subgrupos=${String(subgrupos).padStart(5)}   piezas recuperadas: ${recuperadas}/${piezasInestables} (${(100 * recuperadas / piezasInestables).toFixed(1)}%)`)
}

// ¿el contexto observable determina el rebaje? (test de S.9.8)
const firmas = new Map()
for (const o of observaciones) {
  const f = JSON.stringify([o.perfil, o.fn, o.formula, o.estructura, o.idIt, Math.round(o.previsto)])
  if (!firmas.has(f)) firmas.set(f, [])
  firmas.get(f).push(Math.round(o.delta * 10) / 10)
}
let ambiguos = 0, obsAmbiguas = 0
for (const [, ds] of firmas) {
  const min = Math.min(...ds), max = Math.max(...ds)
  if (max - min > TOL) { ambiguos++; obsAmbiguas += ds.length }
}
console.log('\n--- ¿el contexto observable determina el rebaje? ---')
console.log(`  firmas de contexto idéntico: ${firmas.size}`)
console.log(`  firmas con rebajes DISTINTOS: ${ambiguos}  (${obsAmbiguas} observaciones)`)
console.log(`  techo teórico con estas entradas: ${observaciones.length - obsAmbiguas}/${observaciones.length} (${(100 * (observaciones.length - obsAmbiguas) / observaciones.length).toFixed(1)}%)`)

// --- regla combinada: perfil + eje + fórmula + serie ---
{
  const g = new Map()
  for (const o of observaciones) {
    const c = `${o.perfil}|${o.fn}|${o.formula}|${o.serie}`
    if (!g.has(c)) g.set(c, [])
    g.get(c).push(o)
  }
  let estables = 0, triviales = 0, piezasTriviales = 0, robustos = 0, piezasRobustas = 0
  for (const [, obs] of g) {
    if (!estable(obs.map((o) => o.delta))) continue
    estables++
    const medidas = new Set(obs.map((o) => Math.round(o.previsto)))
    if (medidas.size <= 1) { triviales++; piezasTriviales += obs.length }
    else { robustos++; piezasRobustas += obs.length }
  }
  console.log('\n--- REGLA COMBINADA: perfil + eje + fórmula + serie ---')
  console.log(`  grupos: ${g.size}   estables: ${estables}`)
  console.log(`  de ellos triviales (una sola medida): ${triviales}  (${piezasTriviales} piezas)`)
  console.log(`  robustos (medidas variadas):          ${robustos}  (${piezasRobustas} piezas)`)
  console.log(`  COBERTURA HONESTA: ${piezasRobustas}/${observaciones.length} (${(100 * piezasRobustas / observaciones.length).toFixed(1)}%)`)
  console.log(`  (T.9 sin serie: 79,6%   techo del contexto: 94,4%)`)
}

console.log('\n--- los grupos inestables mayores ---')
for (const [c, obs] of inestables.sort((a, b) => b[1].length - a[1].length).slice(0, 10)) {
  const m = new Map()
  for (const o of obs) {
    const d = Math.round(o.delta * 10) / 10
    m.set(d, (m.get(d) ?? 0) + 1)
  }
  const top = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
  const [cod, fn] = c.split('|')
  console.log(`  ${cod.padEnd(10)} ${fn}  n=${String(obs.length).padStart(4)}  valores=${String(m.size).padStart(3)}  ${top.map(([d, n]) => `${d}×${n}`).join('  ')}   ${(descArt.get(cod) ?? '').slice(0, 24)}`)
}
