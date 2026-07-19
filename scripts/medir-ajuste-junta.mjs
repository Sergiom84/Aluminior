/**
 * MEDICIÓN: ajuste de la junta perimetral de hoja.
 *
 *   largo de junta = corte del perfil de hoja emparejado − delta
 *
 * Cada tramo de junta (Cdad=1) se empareja con el corte HV/HH real más
 * cercano de la misma línea (±200 mm). El delta se agrupa por
 * (serie, artículo de junta, perfil de hoja, eje) y se emite la moda con
 * los umbrales de siempre: ≥3 muestras y ≥90% de consistencia.
 *
 * Sin fórmulas: todo sale del histórico materializado.
 *
 * Solo lectura. Uso: node scripts/medir-ajuste-junta.mjs
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

const vLin = leer('VPresupuestosLin.csv')
const datosLin = leer('VDatosLinEstr.csv')
const JUNTAS = new Set(['GM4055', 'GM5085'])

const seriePorLinea = new Map()
for (const f of datosLin) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  seriePorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}

const padres = new Map()
const hijasPorPadre = new Map()
for (const f of vLin) {
  if (col(f, 'EstructuraSN') === 'True') { padres.set(col(f, 'nLinea'), f); continue }
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

const deltas = new Map() // serie|junta|perfil|eje -> Map(delta -> n)
let tramos = 0, sinPareja = 0
for (const [nLinea, p] of padres) {
  const hijas = hijasPorPadre.get(nLinea) ?? []
  const juntas = hijas.filter((h) => JUNTAS.has(col(h, 'Articulo')))
  if (!juntas.length) continue
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${nLinea}`)
  if (!serie) continue
  const cortes = hijas
    .filter((h) => ['HV', 'HH'].includes(col(h, 'Funcion')) && col(h, 'Articulo') !== '0')
    .map((h) => ({ perfil: col(h, 'Articulo'), eje: col(h, 'Funcion'), corte: num(h, 'LargoCorte') }))
    .filter((c) => c.corte > 0)
  if (!cortes.length) continue
  for (const j of juntas) {
    const n = Math.max(1, Math.round(num(j, 'Cdad')))
    const largo = num(j, 'LargoCorte') || num(j, 'Largo')
    if (largo <= 0) continue
    let mejor = null
    for (const c of cortes) {
      const d = c.corte - largo
      if (d < -5 || d > 200) continue // la junta nunca es más larga que el perfil
      if (!mejor || Math.abs(d) < Math.abs(mejor.d)) mejor = { ...c, d }
    }
    tramos += n
    if (!mejor) { sinPareja += n; continue }
    const k = `${serie}|${col(j, 'Articulo')}|${mejor.perfil}|${mejor.eje}`
    if (!deltas.has(k)) deltas.set(k, new Map())
    const m = deltas.get(k)
    const delta = Math.round(mejor.d * 10) / 10
    m.set(delta, (m.get(delta) ?? 0) + n)
  }
}
console.log(`Tramos de junta emparejables: ${tramos - sinPareja}/${tramos}`)
console.log('\n(serie | junta | perfil | eje)  ajuste_moda  muestras/total')
let estables = 0, cubiertos = 0, totalObs = 0
for (const [k, m] of [...deltas.entries()].sort()) {
  const total = [...m.values()].reduce((a, b) => a + b, 0)
  const [delta, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
  totalObs += total
  const ok = total >= 3 && n / total >= 0.9
  if (ok) { estables++; cubiertos += total }
  console.log(`  ${ok ? '✔' : '✘'} ${k.padEnd(38)} ${String(delta).padStart(7)}  ${n}/${total}`)
}
console.log(`\nReglas estables (≥3, ≥90%): ${estables} de ${deltas.size}  (${cubiertos}/${totalObs} tramos cubiertos)`)
