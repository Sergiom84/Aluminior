/**
 * Opciones predeterminadas de las estructuras accesorias (`EstructurasOpcOpciones`,
 * migración 0033). Sin la tabla, el mapa queda vacío y el despiece declara
 * incompleto el grupo sin opción, como antes de cargarla.
 */
import { and, eq, inArray, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../../cliente-db.ts'

export async function leerOpcionesPredeterminadas(cliente: ClienteEscritura,
  estructuras: readonly string[]): Promise<ReadonlyMap<string, readonly string[]>> {
  if (!estructuras.length) return new Map()
  const [fila] = await cliente.execute<{ ok: boolean }>(sql`select to_regclass('public.estructura_opciones_accesorio') is not null as ok`)
  if (fila?.ok !== true) return new Map()
  const t = schema.estructuraOpcionesAccesorio
  const filas = await cliente.select().from(t).where(and(inArray(t.estructuraCodigo, [...estructuras]), eq(t.predeterminada, true)))
  const m = new Map<string, string[]>()
  for (const f of filas) m.set(f.estructuraCodigo, [...m.get(f.estructuraCodigo) ?? [], `G${f.grupo}O${f.opcion}`])
  return m
}
