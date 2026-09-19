/**
 * Opciones de acristalamiento (tablas de junquillo) de una serie, para la
 * pestaña `Acristalamiento` de la edición de línea.
 *
 * Lee el mismo registro de `conjuntos` que `junquillos.ts` (conjunto = serie).
 * Hoy la base sólo tiene la opción 1 (`tabla_hojas` / `tabla_fijos`); las
 * opciones 2..5 y las descripciones de `TAcristalamiento` esperan a la
 * carga de `conjunto_acristalamientos` (migración 0021, tabla aún vacía). La regla de
 * qué se ofrece vive en core (`opcionesAcristalamiento`).
 */

import { eq } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { opcionesAcristalamiento, type OpcionAcristalamiento } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'

export async function opcionesAcristalamientoDeSerie(
  cliente: ClienteEscritura,
  serieCodigo: string,
): Promise<OpcionAcristalamiento[]> {
  if (!serieCodigo) return []
  const [conjunto] = await cliente.select({
    tablaHojas: schema.conjuntos.tablaHojas,
    tablaFijos: schema.conjuntos.tablaFijos,
  })
    .from(schema.conjuntos)
    .where(eq(schema.conjuntos.codigo, serieCodigo)).limit(1)
  if (!conjunto) return []
  return opcionesAcristalamiento([{ hojas: conjunto.tablaHojas, fijos: conjunto.tablaFijos }])
}
