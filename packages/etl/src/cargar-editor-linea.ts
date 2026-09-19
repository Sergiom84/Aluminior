/** Carga acotada; dry-run por defecto. No usar el importador completo. */
import { pathToFileURL } from 'node:url'
import postgres from 'postgres'
import { cargarCatalogoEditor, leerCatalogoEditor, type BaseCatalogo, type ConexionCatalogo } from './editor-linea/carga.ts'
import { validarDestinoEditor } from './editor-linea/destino.ts'
export { cargarCatalogoEditor, leerCatalogoEditor } from './editor-linea/carga.ts'
export { validarDestinoEditor } from './editor-linea/destino.ts'

async function main() {
  const args = process.argv.slice(2)
  const arg = (nombre: string) => { const i = args.indexOf(nombre); return i < 0 ? undefined : args[i + 1] }
  const carpeta = arg('--csv') ?? process.env.RUTA_CSV_ORIGEN
  if (!carpeta) throw new Error('Falta --csv o RUTA_CSV_ORIGEN')
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Falta DATABASE_URL')
  const destino = validarDestinoEditor(url, process.env.DATABASE_URL_EFIMERA_EDITOR)
  const catalogo = await leerCatalogoEditor(carpeta)
  const sql = postgres(url, { ssl: destino === 'supabase' ? 'require' : false, max: 1 })
  const adaptar = (tx: { unsafe: Function; json: Function }): ConexionCatalogo => ({
    // Los parámetros del cargador son arrays JSON serializados para PGlite.
    // postgres.js serializa jsonb automáticamente: evitar una segunda codificación.
    query: async (texto, parametros = []) => ({ rows: await tx.unsafe(texto,
      parametros.map(p => typeof p === 'string' ? tx.json(JSON.parse(p)) : p)) }),
  })
  const db: BaseCatalogo = {
    ...adaptar(sql),
    transaction: fn => sql.begin(tx => fn(adaptar(tx))) as Promise<Awaited<ReturnType<typeof fn>>>,
  }
  try { console.log(JSON.stringify(await cargarCatalogoEditor(db, catalogo, args.includes('--apply')), null, 2)) }
  finally { await sql.end() }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('Carga cancelada. Revisar destino, CSV y esquema; no se muestran credenciales.'); process.exitCode = 1 })
}
