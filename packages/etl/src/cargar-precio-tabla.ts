/** Carga dirigida; simulación por defecto. Remoto exige URL explícita y TLS. No lee .env. */
import { parseArgs } from 'node:util'
import postgres from 'postgres'
import { destinoPrecioTabla } from './precio-tabla/destino.ts'
import { cargarPreciosTabla } from './precio-tabla/aplicar.ts'

const { values } = parseArgs({ options: { origen: { type: 'string' }, url: { type: 'string' },
  remoto: { type: 'boolean' }, apply: { type: 'boolean' } } })
if (!values.origen) throw new Error('Falta --origen con la proyección CSV de una misma copia verificada')
const destino = destinoPrecioTabla(values)
const sql = postgres(destino.url, { max: 1, ssl: destino.ssl, connect_timeout: 10, onnotice: () => {} })
try {
  const r = await cargarPreciosTabla(sql, values.origen, values.apply ?? false)
  console.log(JSON.stringify({ destino: destino.resumen, ...r }, null, 2))
} catch (error) {
  console.error(`Carga no aplicada: ${error instanceof Error ? error.message : 'error operativo'}`)
  process.exitCode = 1
} finally { await sql.end({ timeout: 5 }) }
