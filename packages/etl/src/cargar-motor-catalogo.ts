/**
 * Carga dirigida del catálogo del motor (0023_motor_catalogo) para producción.
 *
 * NO es el importador completo: no vacía presupuestos, clientes ni el catálogo
 * base. Sustituye solo las tablas de la 0023, en una transacción, y simula por
 * defecto; solo escribe con `--apply`.
 *
 * Uso:
 *   npx tsx packages/etl/src/cargar-motor-catalogo.ts --origen <dir>           (simulación)
 *   npx tsx packages/etl/src/cargar-motor-catalogo.ts --origen <dir> --apply   (escribe)
 *
 * DATABASE_URL y RUTA_CSV_ORIGEN se leen del entorno o, si existe, del `.env` raíz.
 */
import { existsSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import postgres from 'postgres'
import { imprimirInforme } from './importacion/informe.ts'
import { destinoVisible } from './rellenar-diseno.ts'
import { AbortoMotor, cargarMotorCatalogo, type InformeMotor } from './motor-catalogo/aplicar.ts'

function cargarEntorno() {
  const env = new URL('../../../.env', import.meta.url)
  if (!existsSync(env)) return
  for (const linea of readFileSync(env, 'utf8').split('\n')) {
    const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
    if (m) process.env[m[1]] ??= m[2].trim()
  }
}

function imprimir(informe: InformeMotor) {
  const lista = (r: Record<string, number>) => Object.entries(r).map(([t, n]) => `${t} ${n}`).join(' · ')
  console.log(`\nFilas previas en las tablas del motor: ${lista(informe.previas)}`)
  imprimirInforme(informe.resultados)
  console.log(`Tablas protegidas sin cambios: ${lista(informe.protegidas)}`)
  console.log(informe.aplicado
    ? '\nAplicado en una transacción.'
    : '\nSIMULACIÓN: transacción revertida, no se ha escrito nada. Añade --apply para escribir.')
}

async function main() {
  const { values } = parseArgs({ options: {
    origen: { type: 'string' }, apply: { type: 'boolean', default: false }, help: { type: 'boolean' },
  } })
  if (values.help) {
    console.log('Uso: npm run etl:motor-catalogo -- --origen <dir> [--apply]\nSin --apply: simulación con rollback.')
    return
  }
  cargarEntorno()
  const url = process.env.DATABASE_URL
  const origen = values.origen ?? process.env.RUTA_CSV_ORIGEN
  if (!url) throw new AbortoMotor('Falta DATABASE_URL')
  if (!origen) throw new AbortoMotor('Falta el origen CSV (--origen o RUTA_CSV_ORIGEN)')
  const aplicar = values.apply
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname)

  console.log(`Destino: ${destinoVisible(url)} · ${aplicar ? 'ESCRITURA' : 'simulación'} · origen ${origen}`)
  const sql = postgres(url, { ssl: local ? false : 'require', max: 1, connect_timeout: 20, onnotice: () => {} })
  try {
    imprimir(await cargarMotorCatalogo(sql, origen, { aplicar }))
  } finally {
    await sql.end({ timeout: 5 })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`ABORTADO: ${error instanceof Error ? error.message : 'Error de carga'}`)
    process.exitCode = 1
  })
}
