/**
 * MEDICIÓN: la junta perimetral es un ESPEJO de los perfiles de hoja.
 *
 * Cada pieza de junta (GM4055/GM5085) tiene Cdad=1 y Largo = corte de un
 * perfil de la hoja. Hipótesis: el multiconjunto de largos de junta de una
 * línea es exactamente el de los cortes HV/HH de sus hojas (cada lado, dos
 * caras... o una — lo dice el propio recuento).
 *
 * Solo lectura. Uso: node scripts/medir-junta-espejo.mjs
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
const JUNTAS = new Set(['GM4055', 'GM5085'])

const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

const clave = (xs) => xs.map((x) => x.toFixed(1)).sort().join(',')
let casos = 0, espejoExacto = 0, espejoUna = 0
const otros = []
for (const [, hijas] of hijasPorPadre) {
  const juntas = hijas.filter((h) => JUNTAS.has(col(h, 'Articulo')))
  if (!juntas.length) continue
  casos++
  const largosJunta = juntas.flatMap((h) => {
    const n = Math.max(1, Math.round(num(h, 'Cdad')))
    return Array(n).fill(num(h, 'LargoCorte') || num(h, 'Largo'))
  })
  const cortesHoja = hijas
    .filter((h) => ['HV', 'HH'].includes(col(h, 'Funcion')))
    .flatMap((h) => {
      const n = Math.max(1, Math.round(num(h, 'Cdad')))
      return Array(n).fill(num(h, 'LargoCorte'))
    })
  if (clave(largosJunta) === clave(cortesHoja)) espejoExacto++
  else if (clave(largosJunta) === clave(cortesHoja.filter((_, i) => i % 2 === 0))) espejoUna++
  else if (otros.length < 6) {
    otros.push(`junta[${largosJunta.length}]: ${clave(largosJunta).slice(0, 60)}  hojas[${cortesHoja.length}]: ${clave(cortesHoja).slice(0, 60)}`)
  }
}
console.log(`Líneas con junta perimetral: ${casos}`)
console.log(`  espejo EXACTO de los cortes de hoja: ${espejoExacto} (${(100 * espejoExacto / casos).toFixed(1)}%)`)
console.log(`  espejo de la mitad: ${espejoUna}`)
console.log('  no coinciden (ejemplos):')
for (const o of otros) console.log('   ', o)
