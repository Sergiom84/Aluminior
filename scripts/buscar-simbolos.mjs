/**
 * Busca el origen de las variables del despiece (FI, FS, FD, FZ…).
 *
 * Hipótesis: EstructurasDiseño define cotas con nombre simbólico, y el
 * símbolo es justo el identificador que usan las fórmulas.
 *
 * Uso: node scripts/buscar-simbolos.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const fichero = readdirSync(ORIGEN).find((f) => /^EstructurasDise.o\.csv$/i.test(f))

const filas = parse(readFileSync(join(ORIGEN, fichero)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})

const INCOGNITAS = new Set(['FI','FS','FD','FZ','F','ZO','TD','DV','VS','CAJ','II','LB','TR','HO','TI','HB','REF'])

const simbolos = new Map()
for (const f of filas) {
  const s = (f.Simbolo ?? '').trim()
  if (s) simbolos.set(s, (simbolos.get(s) ?? 0) + 1)
}

console.log(`Filas de EstructurasDiseño : ${filas.length}`)
console.log(`Símbolos distintos          : ${simbolos.size}\n`)

console.log('--- Símbolos, por frecuencia ---')
const orden = [...simbolos].sort((a, b) => b[1] - a[1])
for (const [s, n] of orden.slice(0, 30)) {
  const marca = INCOGNITAS.has(s) ? '  <-- INCÓGNITA DEL DESPIECE' : ''
  console.log(`  ${String(n).padStart(5)} × ${s.padEnd(8)}${marca}`)
}

const encontradas = orden.filter(([s]) => INCOGNITAS.has(s)).map(([s]) => s)
console.log(`\nIncógnitas explicadas por Simbolo: ${encontradas.join(', ') || 'ninguna'}`)

// Ejemplo completo de una fila que define una de ellas
const ej = filas.find((f) => INCOGNITAS.has((f.Simbolo ?? '').trim()))
if (ej) {
  console.log(`\n--- Fila que define "${ej.Simbolo.trim()}" ---`)
  for (const [k, v] of Object.entries(ej)) {
    if (v != null && String(v).trim() !== '' && String(v) !== '0' && String(v) !== 'False' && String(v) !== '-1') {
      console.log(`  ${k.padEnd(22)} ${v}`)
    }
  }
}
