/** CLI de importación. La carga y sus reglas viven en importacion/. */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'
import { importarCatalogo } from './importacion/index.ts'
import { imprimirInforme } from './importacion/informe.ts'

// --- Entorno ---
for (const linea of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

const ORIGEN = process.env.RUTA_CSV_ORIGEN

if (!ORIGEN) throw new Error('Falta RUTA_CSV_ORIGEN en .env')

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 5 })

const resultados = await importarCatalogo(sql, ORIGEN)
// Cierre acotado: sin timeout, un socket que el servidor ya cerró por su
// lado deja el end() colgado para siempre y el proceso muere con
// "unsettled top-level await" sin llegar a imprimir el informe.
await sql.end({ timeout: 5 })
imprimirInforme(resultados)
