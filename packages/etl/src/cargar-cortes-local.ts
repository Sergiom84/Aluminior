/** Carga suplementaria de QA; sin .env, sin destinos remotos ni importación de documentos. */
import { parseArgs } from 'node:util'
import postgres from 'postgres'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { importarCortesCatalogo } from './importacion/cortes-catalogo.ts'
import { imprimirInforme } from './importacion/informe.ts'

const { values } = parseArgs({ options: {
  origen: { type: 'string' }, base: { type: 'string' },
}, strict: true, allowPositionals: false })
if (!values.origen || !values.base || !/^[a-z0-9_]+_test$/.test(values.base)) {
  throw new Error('Uso: --origen <carpeta CSV> --base <nombre_test>. Solo PostgreSQL local de QA en 55433.')
}
const url = urlDePruebasValidada(`postgres://aluminior:aluminior@localhost:55433/${values.base}`)
const sql = postgres(url, { max: 1, connect_timeout: 10 })
try {
  imprimirInforme(await importarCortesCatalogo(sql, values.origen))
} finally {
  await sql.end({ timeout: 5 })
}
