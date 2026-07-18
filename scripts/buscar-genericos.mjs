/**
 * Busca cómo se resuelve un artículo GENÉRICO del despiece a un perfil real.
 *
 * Hipótesis a comprobar: existe una tabla que, dada una serie (o un conjunto
 * de serie) y una ranura genérica, devuelve el artículo real.
 *
 * Uso: node scripts/buscar-genericos.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})

// Genéricos que usa el despiece de 1+1
const GENERICOS = ['1', '2', '3', '10', '15', '97', '105', '148', '73', '8', '47', '72', '85', '205']

for (const fichero of ['Conjuntos.csv', 'ConjuntosLin.csv', 'ConjuntosAsoc.csv', 'ConfigSeriesAsoc.csv']) {
  let filas
  try { filas = leer(fichero) } catch { console.log(`${fichero}: no encontrado\n`); continue }
  if (!filas.length) { console.log(`${fichero}: vacío\n`); continue }

  const cols = Object.keys(filas[0])
  console.log(`=== ${fichero} — ${filas.length} filas, ${cols.length} columnas ===`)
  console.log(`  ${cols.slice(0, 14).join(', ')}`)

  // ¿Alguna columna contiene los códigos genéricos?
  const impacto = new Map()
  for (const c of cols) {
    const n = filas.filter((f) => GENERICOS.includes((f[c] ?? '').trim())).length
    if (n > 0) impacto.set(c, n)
  }
  if (impacto.size) {
    console.log('  Columnas que contienen códigos genéricos:')
    for (const [c, n] of [...impacto].sort((a, b) => b[1] - a[1])) {
      console.log(`    ${c.padEnd(20)} ${n} filas`)
    }
    // Muestra de filas relevantes
    const col = [...impacto][0][0]
    const muestra = filas.filter((f) => GENERICOS.includes((f[col] ?? '').trim())).slice(0, 4)
    console.log('  Muestra:')
    for (const m of muestra) {
      const util = Object.entries(m)
        .filter(([, v]) => v != null && String(v).trim() !== '' && String(v) !== '0' && String(v) !== 'False')
        .slice(0, 9)
        .map(([k, v]) => `${k}=${v}`)
      console.log(`    ${util.join('  ')}`)
    }
  } else {
    console.log('  (ninguna columna con códigos genéricos)')
  }
  console.log()
}
