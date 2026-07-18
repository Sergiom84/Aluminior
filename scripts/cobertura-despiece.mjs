/**
 * Mide qué porcentaje del despiece se puede calcular hoy, sabiendo sólo
 * L (ancho) y A (alto) del hueco.
 *
 * El resto de variables (REF, FI, FS, CAJ…) aún no sabemos de dónde toman
 * su valor — PLAN.md anexo F. Este número dice cuánto queda por delante.
 *
 * Uso: node scripts/cobertura-despiece.mjs
 */
import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { variablesDe } from '../packages/core/src/despiece/formula.ts'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 3 })

try {
  const filas = await sql`
    SELECT estructura_codigo, formula_largo
    FROM estructura_componentes
    WHERE formula_largo IS NOT NULL AND formula_largo <> ''
  `

  const CONOCIDAS = new Set(['L', 'A'])
  const faltantes = new Map()
  const porEstructura = new Map()
  let resueltas = 0

  for (const f of filas) {
    let vars
    try { vars = variablesDe(f.formula_largo) } catch { vars = ['<sintaxis inválida>'] }
    const faltan = vars.filter((v) => !CONOCIDAS.has(v))

    const e = porEstructura.get(f.estructura_codigo) ?? { total: 0, ok: 0 }
    e.total++
    if (faltan.length === 0) { resueltas++; e.ok++ }
    else for (const v of faltan) faltantes.set(v, (faltantes.get(v) ?? 0) + 1)
    porEstructura.set(f.estructura_codigo, e)
  }

  const completas = [...porEstructura.values()].filter((e) => e.ok === e.total).length

  console.log(`\nComponentes con fórmula      : ${filas.length.toLocaleString('es-ES')}`)
  console.log(`  Calculables con L y A      : ${resueltas.toLocaleString('es-ES')} (${Math.round(100*resueltas/filas.length)}%)`)
  console.log(`  Requieren otras variables  : ${(filas.length-resueltas).toLocaleString('es-ES')}\n`)
  console.log(`Estructuras con despiece     : ${porEstructura.size}`)
  console.log(`  Calculables por completo   : ${completas} (${Math.round(100*completas/porEstructura.size)}%)\n`)

  console.log('--- Variables que faltan, por impacto ---')
  for (const [v, n] of [...faltantes].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(6)} componentes bloqueados por  ${v}`)
  }
} finally {
  await sql.end()
}
