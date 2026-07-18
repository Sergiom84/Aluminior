/**
 * Extrae el vocabulario de fórmulas del motor de despiece.
 *
 * `EstructurasArticulos.FormulaLargo` y `FormulaLargoCorte` no son datos:
 * son EXPRESIONES que el sistema original evalúa para obtener la medida de
 * corte de cada componente. Ejemplos: "L", "L-CAJ+0", "(REF)/2", "A".
 *
 * Para reconstruir el motor hay que saber primero:
 *   - qué identificadores (variables) aparecen
 *   - qué operadores y funciones se usan
 *   - cuántas fórmulas distintas hay que soportar
 *
 * Uso: node scripts/analizar-formulas.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const linea of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

const ORIGEN = process.env.RUTA_CSV_ORIGEN
const ruta = join(ORIGEN, 'EstructurasArticulos.csv')
if (!existsSync(ruta)) throw new Error(`No encontrado: ${ruta}`)

const filas = parse(readFileSync(ruta), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})

const CAMPOS = ['FormulaLargo', 'FormulaLargoCorte', 'FormulaAncho', 'DisFRefLargo']

const formulas = new Map()   // expresión -> nº de usos
const identificadores = new Map()
const operadores = new Map()

for (const f of filas) {
  for (const campo of CAMPOS) {
    const expr = (f[campo] ?? '').trim()
    if (!expr) continue

    formulas.set(expr, (formulas.get(expr) ?? 0) + 1)

    // Identificadores: secuencias alfabéticas (L, A, CAJ, REF...)
    for (const m of expr.matchAll(/[A-Za-zÑñ_][A-Za-z0-9Ññ_]*/g)) {
      identificadores.set(m[0], (identificadores.get(m[0]) ?? 0) + 1)
    }
    // Operadores y símbolos
    for (const m of expr.matchAll(/[+\-*/()<>=,.:;[\]{}!?%^]/g)) {
      operadores.set(m[0], (operadores.get(m[0]) ?? 0) + 1)
    }
  }
}

const orden = (m) => [...m.entries()].sort((a, b) => b[1] - a[1])

console.log(`\nFilas analizadas      : ${filas.length}`)
console.log(`Fórmulas distintas    : ${formulas.size}`)
console.log(`Identificadores       : ${identificadores.size}`)
console.log(`Operadores/símbolos   : ${operadores.size}\n`)

console.log('--- Identificadores (variables del motor), por frecuencia ---')
for (const [id, n] of orden(identificadores).slice(0, 40)) {
  console.log(`  ${String(n).padStart(6)} × ${id}`)
}

console.log('\n--- Operadores y símbolos ---')
for (const [op, n] of orden(operadores)) {
  console.log(`  ${String(n).padStart(6)} × "${op}"`)
}

console.log('\n--- Las 30 fórmulas más usadas ---')
for (const [expr, n] of orden(formulas).slice(0, 30)) {
  console.log(`  ${String(n).padStart(6)} × ${expr}`)
}

console.log('\n--- 20 fórmulas complejas (más de 12 caracteres) ---')
for (const [expr, n] of orden(formulas).filter(([e]) => e.length > 12).slice(0, 20)) {
  console.log(`  ${String(n).padStart(6)} × ${expr}`)
}

// Se guarda el inventario completo para trabajar sobre él
const csv = [
  'Formula,Usos,Longitud',
  ...orden(formulas).map(([e, n]) => `"${e.replace(/"/g, '""')}",${n},${e.length}`),
].join('\n')
writeFileSync(
  new URL('../esquema/perfil/_formulas_despiece.csv', import.meta.url).pathname.replace(/^\//, ''),
  csv, 'utf8',
)
console.log(`\nInventario completo -> esquema/perfil/_formulas_despiece.csv (${formulas.size} fórmulas)`)
