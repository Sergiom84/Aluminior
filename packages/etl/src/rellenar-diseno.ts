/**
 * Relleno dirigido de los campos de dibujo del catálogo (migración 0022).
 *
 * NO es el importador: no vacía ni inserta. Solo actualiza dis_ancho_mm/dis_alto_mm
 * de `estructuras` y tipo_hoja…tipo_curva de `estructura_diseno_nodos` en filas
 * existentes. Simula por defecto; solo escribe con `--apply`.
 *
 * Uso:
 *   npx tsx packages/etl/src/rellenar-diseno.ts                  (simulación)
 *   npx tsx packages/etl/src/rellenar-diseno.ts --apply          (escribe)
 *   npx tsx packages/etl/src/rellenar-diseno.ts --origen <dir>   (CSV; por defecto RUTA_CSV_ORIGEN)
 *
 * DATABASE_URL y RUTA_CSV_ORIGEN se leen del entorno o, si existe, del `.env` raíz.
 */
import { existsSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import postgres from 'postgres'
import { leerPlanRelleno } from './relleno-diseno/plan.ts'
import { AbortoRelleno, rellenarDiseno, type InformeRelleno } from './relleno-diseno/aplicar.ts'

function cargarEntorno() {
  const env = new URL('../../../.env', import.meta.url)
  if (!existsSync(env)) return
  for (const linea of readFileSync(env, 'utf8').split('\n')) {
    const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
    if (m) process.env[m[1]] ??= m[2].trim()
  }
}

/** Host y base, nunca usuario ni contraseña. */
export function destinoVisible(url: string): string {
  const u = new URL(url.replace(/^postgres(ql)?:/, 'http:'))
  return `${u.hostname}:${u.port || '5432'}${u.pathname}`
}

function imprimir(informe: InformeRelleno) {
  const { estructuras: e, nodos: n } = informe
  console.log(`\nEstructuras: ${e.enOrigen} en origen · ${e.ausentesEnBase} sin fila en la base · ` +
    `${e.enBaseSinOrigen} de la base sin origen`)
  console.log(`  sin cambios ${e.sinCambios} · a actualizar ${e.aActualizar} · actualizadas ${e.actualizadas}`)
  console.log(`Nodos de diseño: ${n.enOrigen} en origen (${n.duplicadosEnOrigen} duplicados ignorados) · ` +
    `${n.ausentesEnBase} sin fila en la base · ${n.enBaseSinOrigen} de la base sin origen`)
  console.log(`  identidad distinta (no se tocan) ${n.identidadDistinta} · sin cambios ${n.sinCambios} · ` +
    `a actualizar ${n.aActualizar} · actualizados ${n.actualizados}`)
  console.log(informe.aplicado
    ? '\nAplicado en una transacción.'
    : '\nSIMULACIÓN: transacción revertida, no se ha escrito nada. Añade --apply para escribir.')
}

async function main() {
  cargarEntorno()
  const args = process.argv.slice(2)
  const valor = (nombre: string) => { const i = args.indexOf(nombre); return i >= 0 ? args[i + 1] : undefined }
  const url = process.env.DATABASE_URL
  const origen = valor('--origen') ?? process.env.RUTA_CSV_ORIGEN
  if (!url) throw new AbortoRelleno('Falta DATABASE_URL')
  if (!origen) throw new AbortoRelleno('Falta el origen CSV (--origen o RUTA_CSV_ORIGEN)')
  const aplicar = args.includes('--apply')
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url)

  console.log(`Destino: ${destinoVisible(url)} · ${aplicar ? 'ESCRITURA' : 'simulación'}`)
  const plan = await leerPlanRelleno(origen)
  console.log(`Origen: ${plan.estructuras.length} estructuras, ${plan.nodos.length} nodos de plantilla ` +
    `(${plan.descartadas} filas descartadas: instancias o claves incompletas)`)

  const sql = postgres(url, { ssl: local ? false : 'require', max: 1, onnotice: () => {} })
  try {
    imprimir(await rellenarDiseno(sql, plan, { aplicar }))
  } finally {
    await sql.end({ timeout: 5 })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof AbortoRelleno ? `ABORTADO: ${error.message}` : error)
    process.exitCode = 1
  })
}
