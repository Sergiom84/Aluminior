import { sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'

export interface DatosPersistenciaCerramiento {
  lineaId: string
  configuracion: ConfiguracionCerramiento
  serieCodigo: string | null
  vidrioCodigo: string | null
  acabadoCodigo: string | null
  varianteAcristalamiento: '1' | '2'
}

/**
 * Impide crear una línea GRUPO sin su configuración editable cuando el
 * despliegue todavía no ha recibido la migración satélite.
 */
export async function comprobarPersistenciaCerramientos(
  cliente: ClienteEscritura,
): Promise<boolean> {
  const [estadoEsquema] = (await cliente.execute<{ tabla: string | null }>(sql`
    SELECT to_regclass('public.lineas_cerramiento')::text AS tabla
  `)) as unknown as { tabla: string | null }[]
  return Boolean(estadoEsquema?.tabla)
}

/** Guarda el snapshot editable asociado a una línea CERRAMIENTO ya creada. */
export async function persistirCerramiento(
  cliente: ClienteEscritura,
  datos: DatosPersistenciaCerramiento,
) {
  await cliente.insert(schema.lineasCerramiento).values({
    lineaId: datos.lineaId,
    version: datos.configuracion.version,
    configuracion: datos.configuracion as unknown as Record<string, unknown>,
    serieCodigo: datos.serieCodigo,
    vidrioCodigo: datos.vidrioCodigo,
    acabadoCodigo: datos.acabadoCodigo,
    varianteAcristalamiento: datos.varianteAcristalamiento,
    // `ajuste_fabricacion` y `ajuste_colocacion` NO se escriben: estaban en
    // euros por un error de unidad (T.67.1) y los sustituye `lineas_mano_obra`
    // en horas. Siguen en la tabla, con su DEFAULT 0, hasta la migración
    // sustractiva (§5 de SPEC-MANO-DE-OBRA.md).
  })
}
