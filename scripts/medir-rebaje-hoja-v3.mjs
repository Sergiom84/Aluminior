/**
 * MEDICIÓN v3 del rebaje de hoja: ¿cuál es la segunda condición?
 *
 * T.8 estableció que la distribución del rebaje por perfil es BIMODAL con
 * muy pocos valores distintos (1 a 5): falta una condición que distinga dos
 * casos, no es ruido. La hipótesis física es que la hoja se rebaja distinto
 * según contra qué apoye — marco o cruce con otra hoja.
 *
 * No hace falta reconstruir el árbol: la propia fila de plantilla declara
 * sus vecinos (DisIdPerAdSup/Inf/Iz/De, DisGrupoI/D/Sup/Inf) y su papel
 * (DisTipoHoja, DisPosPerf, DisNHoja). Aquí se prueban como discriminantes
 * y se mide cuál estabiliza los grupos.
 *
 * Correcciones sobre v2, ambas anotadas en T.8:
 *  - se agrupa con tolerancia 0,51 mm (v2 redondeaba a 0,1 mm y partía en
 *    dos grupos valores que son el mismo, como 4 y 4,1)
 *  - se conserva la fila de plantilla completa, no sólo su fórmula
 *
 * Solo lectura. Uso: npx tsx scripts/medir-rebaje-hoja-v3.mjs
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

const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const detallePorLinea = new Map(detalles.map((f) => [col(f, 'nVLinea'), f]))

// fila de plantilla completa por (estructura, función, DisIdIt)
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

// --- recoger observaciones con su fila de plantilla ---
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
    let previsto
    try { previsto = evaluar(col(fila, 'FormulaLargoCorte') || col(fila, 'FormulaLargo'), contexto) } catch { continue }
    observaciones.push({
      perfil, fn, fila, delta: previsto - corte, previsto,
      serie: seriePorLinea.get(k) ?? '?',
    })
  }
}
console.log(`Observaciones: ${observaciones.length}\n`)

/** Agrupa deltas con tolerancia: dos valores a menos de TOL son el mismo. */
function evaluarClave(nombre, clave) {
  const grupos = new Map()
  for (const o of observaciones) {
    const c = clave(o)
    if (c === null) continue
    if (!grupos.has(c)) grupos.set(c, [])
    grupos.get(c).push(o.delta)
  }
  let estables = 0, cubiertos = 0, total = 0
  for (const [, deltas] of grupos) {
    total += deltas.length
    // moda con tolerancia: el valor que más vecinos reúne a menos de TOL
    let mejor = 0
    for (const d of deltas) {
      const n = deltas.filter((x) => Math.abs(x - d) <= TOL).length
      if (n > mejor) mejor = n
    }
    if (deltas.length >= 3 && mejor / deltas.length >= 0.9) { estables++; cubiertos += deltas.length }
  }
  return { nombre, grupos: grupos.size, estables, cubiertos, total }
}

const c = (f, n) => col(f, n)
const CANDIDATOS = [
  ['perfil + eje (T.7, referencia)', (o) => `${o.perfil}|${o.fn}`],
  ['perfil + eje + DisTipoHoja', (o) => `${o.perfil}|${o.fn}|${c(o.fila, 'DisTipoHoja')}`],
  ['perfil + eje + DisPosPerf', (o) => `${o.perfil}|${o.fn}|${c(o.fila, 'DisPosPerf')}`],
  ['perfil + eje + DisGrupo', (o) => `${o.perfil}|${o.fn}|${c(o.fila, 'DisGrupo')}`],
  ['perfil + eje + grupos I/D', (o) => `${o.perfil}|${o.fn}|${c(o.fila, 'DisGrupoI')}|${c(o.fila, 'DisGrupoD')}`],
  ['perfil + eje + grupos Sup/Inf', (o) => `${o.perfil}|${o.fn}|${c(o.fila, 'DisGrupoSup')}|${c(o.fila, 'DisGrupoInf')}`],
  ['perfil + eje + ¿tiene vecino I/D?', (o) => {
    const i = c(o.fila, 'DisIdPerAdIz'), d = c(o.fila, 'DisIdPerAdDe')
    return `${o.perfil}|${o.fn}|${i && i !== '0' ? 'I' : '-'}${d && d !== '0' ? 'D' : '-'}`
  }],
  ['perfil + eje + ¿tiene vecino Sup/Inf?', (o) => {
    const s = c(o.fila, 'DisIdPerAdSup'), i = c(o.fila, 'DisIdPerAdInf')
    return `${o.perfil}|${o.fn}|${s && s !== '0' ? 'S' : '-'}${i && i !== '0' ? 'I' : '-'}`
  }],
  ['perfil + eje + los 4 vecinos', (o) => {
    const v = ['DisIdPerAdSup', 'DisIdPerAdInf', 'DisIdPerAdIz', 'DisIdPerAdDe']
      .map((x) => (c(o.fila, x) && c(o.fila, x) !== '0') ? '1' : '0').join('')
    return `${o.perfil}|${o.fn}|${v}`
  }],
  ['perfil + eje + DisNHoja', (o) => `${o.perfil}|${o.fn}|${c(o.fila, 'DisNHoja')}`],
  ['perfil + eje + fórmula', (o) => `${o.perfil}|${o.fn}|${c(o.fila, 'FormulaLargoCorte') || c(o.fila, 'FormulaLargo')}`],
]

console.log('discriminante                            grupos  estables  piezas cubiertas')
const resultados = CANDIDATOS.map(([n, f]) => evaluarClave(n, f))
for (const r of resultados) {
  console.log(`  ${r.nombre.padEnd(38)} ${String(r.grupos).padStart(5)}  ${String(r.estables).padStart(7)}   ${r.cubiertos}/${r.total} (${(100 * r.cubiertos / r.total).toFixed(1)}%)`)
}

// VALIDEZ: un grupo cuyos miembros tienen todos la MISMA medida evaluada no
// demuestra nada — la constancia del rebaje sería trivial. La regla sólo
// sirve si se sostiene con medidas distintas dentro del grupo.
{
  const grupos = new Map()
  for (const o of observaciones) {
    const c2 = `${o.perfil}|${o.fn}|${col(o.fila, 'FormulaLargoCorte') || col(o.fila, 'FormulaLargo')}`
    if (!grupos.has(c2)) grupos.set(c2, [])
    grupos.get(c2).push(o)
  }
  let triviales = 0, piezasTriviales = 0, robustos = 0, piezasRobustas = 0
  for (const [, obsG] of grupos) {
    const deltas = obsG.map((o) => o.delta)
    let mejorN = 0
    for (const d of deltas) {
      const n = deltas.filter((x) => Math.abs(x - d) <= TOL).length
      if (n > mejorN) mejorN = n
    }
    if (!(obsG.length >= 3 && mejorN / obsG.length >= 0.9)) continue
    const medidas = new Set(obsG.map((o) => Math.round(o.previsto)))
    if (medidas.size <= 1) { triviales++; piezasTriviales += obsG.length }
    else { robustos++; piezasRobustas += obsG.length }
  }
  console.log('\n--- validez: ¿los grupos estables abarcan medidas distintas? ---')
  console.log(`  grupos estables con UNA sola medida (no demuestran nada): ${triviales}  (${piezasTriviales} piezas)`)
  console.log(`  grupos estables con medidas VARIADAS (regla real):        ${robustos}  (${piezasRobustas} piezas)`)
  console.log(`  cobertura honesta: ${piezasRobustas}/${observaciones.length} (${(100 * piezasRobustas / observaciones.length).toFixed(1)}%)`)
}

const mejor = resultados.slice(1).sort((a, b) => b.cubiertos - a.cubiertos)[0]
const base = resultados[0]
console.log(`\nMejor discriminante: ${mejor.nombre}`)
console.log(`  ${(100 * mejor.cubiertos / mejor.total).toFixed(1)}% frente al ${(100 * base.cubiertos / base.total).toFixed(1)}% de la referencia`)
