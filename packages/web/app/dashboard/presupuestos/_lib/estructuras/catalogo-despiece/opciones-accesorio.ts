/**
 * Opciones predeterminadas de las estructuras accesorias (`EstructurasOpcOpciones`,
 * migración 0033). Si la tabla no existe o no tiene filas de esa estructura,
 * se usan las predeterminadas del catálogo exportado: sin ellas el despiece
 * no decide la guía y deja toda la ventana sin valorar.
 */
import { and, eq, inArray, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { fusionarOpcionesPredeterminadas } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../../cliente-db.ts'

export async function leerOpcionesPredeterminadas(cliente: ClienteEscritura,
  estructuras: readonly string[]): Promise<ReadonlyMap<string, readonly string[]>> {
  if (!estructuras.length) return new Map()
  const [fila] = await cliente.execute<{ ok: boolean }>(sql`select to_regclass('public.estructura_opciones_accesorio') is not null as ok`)
  const m = new Map<string, string[]>()
  if (fila?.ok === true) {
    const t = schema.estructuraOpcionesAccesorio
    const filas = await cliente.select().from(t).where(and(inArray(t.estructuraCodigo, [...estructuras]), eq(t.predeterminada, true)))
    for (const f of filas) {
      const clave = f.estructuraCodigo.trim().toUpperCase()
      m.set(clave, [...m.get(clave) ?? [], `G${f.grupo}O${f.opcion}`])
    }
  }
  return fusionarOpcionesPredeterminadas(estructuras, m)
}
