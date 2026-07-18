/**
 * Verifica la hipótesis del anexo G: las variables del despiece son cotas de
 * diseño definidas en EstructurasDiseño (Simbolo -> Cota) por estructura.
 *
 * Si es cierta, al aportar esas cotas la cobertura debe subir mucho respecto
 * al 84% que se lograba sólo con L y A.
 *
 * Uso: node scripts/cobertura-con-cotas.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { evaluar, variablesDe } from '../packages/core/src/despiece/formula.ts'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (patron) => {
  const f = readdirSync(ORIGEN).find((x) => patron.test(x))
  return parse(readFileSync(join(ORIGEN, f)), {
    columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
  })
}

const disenyo = leer(/^EstructurasDise.o\.csv$/i)
const componentes = leer(/^EstructurasArticulos\.csv$/i).filter((f) => !f.TipoDoc?.trim())

// Simbolo -> Cota, por estructura
const cotas = new Map()
for (const d of disenyo) {
  const est = (d.Estructura ?? '').trim()
  const sim = (d.Simbolo ?? '').trim()
  if (!est || !sim) continue
  const val = Number(String(d.Cota ?? '').replace(',', '.'))
  if (!Number.isFinite(val)) continue
  if (!cotas.has(est)) cotas.set(est, {})
  // Si el símbolo se repite, se conserva el primero: son cotas por travesaño.
  cotas.get(est)[sim] ??= val
}

console.log(`Estructuras con cotas simbólicas: ${cotas.size}`)

let ok = 0, fallo = 0
const faltan = new Map()
const porEstructura = new Map()

for (const c of componentes) {
  const f = (c.FormulaLargo ?? '').trim()
  if (!f) continue
  const est = (c.Estructura ?? '').trim()

  const ctx = { L: 1600, A: 1230, ...(cotas.get(est) ?? {}) }
  const e = porEstructura.get(est) ?? { total: 0, ok: 0 }
  e.total++

  try {
    const r = evaluar(f, ctx)
    if (Number.isFinite(r)) { ok++; e.ok++ } else throw new Error('no finito')
  } catch {
    fallo++
    for (const v of variablesDe(f).filter((v) => !(v in ctx))) {
      faltan.set(v, (faltan.get(v) ?? 0) + 1)
    }
  }
  porEstructura.set(est, e)
}

const total = ok + fallo
const completas = [...porEstructura.values()].filter((e) => e.ok === e.total).length

console.log(`\nComponentes con fórmula   : ${total.toLocaleString('es-ES')}`)
console.log(`  Resueltos               : ${ok.toLocaleString('es-ES')} (${Math.round(100*ok/total)}%)`)
console.log(`  Sin resolver            : ${fallo.toLocaleString('es-ES')}`)
console.log(`\nEstructuras               : ${porEstructura.size}`)
console.log(`  Completas               : ${completas} (${Math.round(100*completas/porEstructura.size)}%)`)

console.log('\n--- Lo que sigue faltando ---')
for (const [v, n] of [...faltan].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(5)} × ${v}`)
}
