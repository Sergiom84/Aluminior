import { getTableName, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../../cliente-db.ts'

/** Tablas de la migración `0023_motor_catalogo`. */
export const TABLAS_MOTOR_CATALOGO = [
  schema.estructuraReferenciasCorte, schema.conjuntoDescuentosCorte, schema.estructuraPlantillaCatalogo,
  schema.conjuntoAsociaciones, schema.gruposAsociacion, schema.tiposHojaCatalogo, schema.manoObraConceptos,
  schema.articulosIncrementosPrecio, schema.articulosDespiece, schema.conjuntoParametrosDespiece,
  schema.conjuntoRanurasVacias,
].map(getTableName)

/**
 * La base tiene las tablas del motor de catálogo. Sin la migración, la
 * valoración sigue por la vía anterior. Se comprueba con `to_regclass`, que no
 * falla: una consulta a una tabla ausente abortaría la transacción del alta.
 */
export async function tablasMotorCatalogo(cliente: ClienteEscritura): Promise<boolean> {
  const presentes = sql.join(TABLAS_MOTOR_CATALOGO.map(t => sql`to_regclass(${`public.${t}`}) is not null`), sql` and `)
  const [fila] = await cliente.execute<{ ok: boolean }>(sql`select ${presentes} as ok`)
  return fila?.ok === true
}
