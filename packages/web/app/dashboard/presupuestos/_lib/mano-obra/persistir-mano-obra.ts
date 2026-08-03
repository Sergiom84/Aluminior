import { sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { SnapshotManoObra } from './resolver-mano-obra.ts'

export const MENSAJE_MIGRACION_MANO_OBRA =
  'La mano de obra en horas está preparada, pero su migración de base de datos aún no está aplicada en este entorno.'

/**
 * Impide crear una línea con mano de obra cuando el despliegue todavía no ha
 * recibido la migración 0018.
 *
 * Sólo hay que comprobarlo cuando de verdad se van a escribir filas: una línea
 * sin horas no toca esta tabla, y bloquearla obligaría a desplegar la migración
 * para seguir haciendo lo que ya funcionaba.
 */
export async function comprobarPersistenciaManoObra(
  cliente: ClienteEscritura,
): Promise<boolean> {
  const [estadoEsquema] = (await cliente.execute<{ tabla: string | null }>(sql`
    SELECT to_regclass('public.lineas_mano_obra')::text AS tabla
  `)) as unknown as { tabla: string | null }[]
  return Boolean(estadoEsquema?.tabla)
}

/**
 * Escribe los snapshots de mano de obra de una línea recién insertada.
 *
 * Contrato: `cliente` debe ser la MISMA transacción que insertó la línea. Una
 * línea con mano de obra sin sus filas cobraría de menos sin que nada lo dijera,
 * y una fila sin su línea no tendría documento al que pertenecer.
 */
export async function persistirManoObra(
  cliente: ClienteEscritura,
  lineaId: string,
  filas: readonly SnapshotManoObra[],
) {
  if (!filas.length) return
  await cliente.insert(schema.lineasManoObra)
    .values(filas.map((fila) => ({ lineaId, ...fila })))
}
