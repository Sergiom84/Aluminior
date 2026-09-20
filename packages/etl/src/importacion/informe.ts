import type { Resultado } from './resultado.ts'

export function imprimirInforme(resultados: readonly Resultado[]) {
  // --- Informe ---

  console.log('\n=== Importación ===\n')

  let totalInsertadas = 0

  let totalDescartadas = 0

  for (const r of resultados) {
    // El objetivo real son las filas aplicables: leídas menos las excluidas aposta.
    const aplicables = r.leidas - r.excluidas
    const pct = aplicables ? Math.round((100 * r.insertadas) / aplicables) : 0
    const marca = r.leidas === 0 ? '·' : r.descartadas === 0 ? 'ok' : '!'

    console.log(
      `${marca} ${r.tabla.padEnd(24)} ${String(r.insertadas).padStart(7)} / ${String(aplicables).padStart(7)}  (${pct}%)`,
    )
    for (const [motivo, n] of r.motivos) {
      console.log(`     ${String(n).padStart(7)} × ${motivo}`)
    }

    totalInsertadas += r.insertadas
    totalDescartadas += r.descartadas
  }

  console.log(`\n  Insertadas: ${totalInsertadas.toLocaleString('es-ES')} filas`)

  if (totalDescartadas > 0) {
    console.log(`  ${totalDescartadas} filas descartadas que deberían haber entrado. Revísalo.`)
    process.exitCode = 1
  } else {
    console.log('  Sin descartes: todas las filas aplicables se cargaron.')
  }
}
