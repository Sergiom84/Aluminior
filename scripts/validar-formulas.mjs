/**
 * Valida el evaluador contra las 417 fórmulas reales del catálogo.
 * Cobertura esperada: 100%. Cualquier fallo es un hueco del evaluador.
 *
 * Uso: node scripts/validar-formulas.mjs
 */
import { readFileSync } from 'node:fs'
import { parse } from 'csv-parse/sync'
import { evaluar, variablesDe, esValida } from '../packages/core/src/despiece/formula.ts'

const filas = parse(
  readFileSync(new URL('../esquema/perfil/_formulas_despiece.csv', import.meta.url)),
  { columns: true, bom: true, skip_empty_lines: true, relax_quotes: true },
)

let ok = 0
const fallos = []

for (const f of filas) {
  const formula = f.Formula
  try {
    const vars = variablesDe(formula)
    const ctx = Object.fromEntries(vars.map((v) => [v, 100]))
    const r = evaluar(formula, ctx)
    if (!Number.isFinite(r)) throw new Error(`resultado no finito: ${r}`)
    ok++
  } catch (e) {
    fallos.push({ formula, usos: Number(f.Usos), error: e.message })
  }
}

const total = filas.length
console.log(`\nFórmulas del catálogo : ${total}`)
console.log(`  Evaluadas OK        : ${ok} (${Math.round((100 * ok) / total)}%)`)
console.log(`  Fallidas            : ${fallos.length}\n`)

if (fallos.length) {
  console.log('--- Fallos (ordenados por impacto) ---')
  for (const f of fallos.sort((a, b) => b.usos - a.usos).slice(0, 20)) {
    console.log(`  ${String(f.usos).padStart(6)} usos  ${f.formula.padEnd(24)} ${f.error}`)
  }
  process.exitCode = 1
}

// --- Comprobaciones de comportamiento sobre casos reales ---
console.log('--- Casos concretos ---')
const casos = [
  ['L', { L: 1600 }, 1600],
  ['(A)/2', { A: 1230 }, 615],
  ['L-FS', { L: 1600, FS: 40 }, 1560],
  ['L-FS-FI', { L: 1600, FS: 40, FI: 30 }, 1530],
  ['(REF-FI-FD)/2', { REF: 1000, FI: 50, FD: 50 }, 450],
  ['L+CAJ+2*30,00', { L: 1000, CAJ: 200 }, 1260],   // coma decimal
  ['((A)/2)/2', { A: 1200 }, 300],
  ['L-850', { L: 1600 }, 750],
]

let casosOk = 0
for (const [formula, ctx, esperado] of casos) {
  try {
    const r = evaluar(formula, ctx)
    const bien = Math.abs(r - esperado) < 1e-9
    console.log(`  ${bien ? 'ok' : 'NO'}  ${formula.padEnd(18)} = ${r}${bien ? '' : `  (esperado ${esperado})`}`)
    if (bien) casosOk++
  } catch (e) {
    console.log(`  NO  ${formula.padEnd(18)} ${e.message}`)
  }
}
console.log(`\n  ${casosOk}/${casos.length} casos correctos`)
if (casosOk !== casos.length) process.exitCode = 1

// --- El evaluador debe FALLAR, no devolver cero, si falta una variable ---
console.log('\n--- Seguridad: variable ausente ---')
try {
  evaluar('L-FS', { L: 1600 })
  console.log('  NO  debería haber fallado por falta de FS')
  process.exitCode = 1
} catch (e) {
  console.log(`  ok  falla como debe: ${e.message.slice(0, 70)}`)
}
