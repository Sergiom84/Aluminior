import { getTableName, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../../cliente-db.ts'

/** Tablas del motor de catálogo (`0023`, más `0026`). */
export const TABLAS_MOTOR_CATALOGO = [
  schema.estructuraReferenciasCorte, schema.conjuntoDescuentosCorte, schema.estructuraPlantillaCatalogo,
  schema.conjuntoAsociaciones, schema.gruposAsociacion, schema.tiposHojaCatalogo, schema.manoObraConceptos,
  schema.articulosIncrementosPrecio, schema.articulosDespiece, schema.conjuntoParametrosDespiece,
  schema.conjuntoRanurasVacias, schema.estructuraParametrosDespiece,
].map(getTableName)

/** Columnas añadidas después de 0023 que la lectura del motor necesita. */
const COLUMNAS_MOTOR_CATALOGO = [['estructura_plantilla_catalogo', 'formula_seleccion'], ['mano_obra_conceptos', 'categoria']] as const

/**
 * La base tiene las tablas del motor de catálogo. Sin la migración, la
 * valoración sigue por la vía anterior. Se comprueba con `to_regclass`, que no
 * falla: una consulta a una tabla ausente abortaría la transacción del alta.
 */
export async function tablasMotorCatalogo(cliente: ClienteEscritura): Promise<boolean> {
  const presentes = sql.join(TABLAS_MOTOR_CATALOGO.map(t => sql`to_regclass(${`public.${t}`}) is not null`), sql` and `)
  // 0025 y 0026 añaden columnas; sin ellas, la lectura del motor fallaría.
  const columnas = sql.join(COLUMNAS_MOTOR_CATALOGO.map(([tabla, columna]) => sql`exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = ${tabla} and column_name = ${columna})`), sql` and `)
  const [fila] = await cliente.execute<{ ok: boolean }>(sql`select ${presentes} and ${columnas} as ok`)
  return fila?.ok === true
}
