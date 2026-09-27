/** CLI de importación. La carga y sus reglas viven en importacion/. */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'
import { importarCatalogo } from './importacion/index.ts'
import { imprimirInforme } from './importacion/informe.ts'
import { importarCortesCatalogo } from './importacion/cortes-catalogo.ts'
import { importarCatalogoDespiece } from './importacion/catalogo-despiece.ts'

// --- Entorno ---
for (const linea of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

const ORIGEN = process.env.RUTA_CSV_ORIGEN

if (!ORIGEN) throw new Error('Falta RUTA_CSV_ORIGEN en .env')

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 5 })

try {
  const resultados = await importarCatalogo(sql, ORIGEN)
  resultados.push(...await importarCortesCatalogo(sql, ORIGEN))
  resultados.push(...await importarCatalogoDespiece(sql, ORIGEN))
  imprimirInforme(resultados)
} finally {
  // También cerrar si la carga suplementaria se revierte por datos incompletos.
  await sql.end({ timeout: 5 })
}
