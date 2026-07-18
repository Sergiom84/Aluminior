/**
 * Busca dónde guarda el sistema original la medida de corte YA CALCULADA.
 *
 * Sin ese dato no se puede despejar el valor de FI, FS, etc.: haría falta la
 * entrada (L, A), la fórmula y el resultado. Tenemos las dos primeras.
 *
 * Uso: node scripts/buscar-medidas.mjs
 */
import { readFileSync } from 'node:fs'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN

const filas = parse(readFileSync(`${ORIGEN}/EstructurasArticulos.csv`), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})

// Una instancia real: tiene documento asociado y fórmula con variable incógnita
const instancia =
  filas.find((f) => f.TipoDoc?.trim() && /(^|[^A-Z])(FI|FS)([^A-Z]|$)/.test(f.FormulaLargo ?? '')) ??
  filas.find((f) => f.TipoDoc?.trim())

console.log('=== Una instancia con fórmula que usa FI o FS ===\n')
for (const [k, v] of Object.entries(instancia)) {
  if (v !== null && String(v).trim() !== '' && String(v) !== '0') {
    console.log(`  ${k.padEnd(24)} ${v}`)
  }
}

console.log('\n=== ¿Hay alguna columna con la medida resultante? ===')
console.log('Columnas numéricas grandes (>100) en esta fila:')
for (const [k, v] of Object.entries(instancia)) {
  const n = Number(String(v).replace(',', '.'))
  if (Number.isFinite(n) && Math.abs(n) > 100) console.log(`  ${k.padEnd(24)} ${v}`)
}
