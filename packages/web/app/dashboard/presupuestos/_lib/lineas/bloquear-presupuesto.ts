import { sql } from 'drizzle-orm'
import type { ClienteEscritura } from '../cliente-db.ts'

/**
 * Serializa las mutaciones de líneas de un mismo presupuesto.
 *
 * El bloqueo se toma sobre la cabecera, que existe antes que cualquiera de sus
 * líneas y permanece estable durante toda la vida del documento. Así, dos
 * altas concurrentes no pueden leer el mismo MAX(orden), y el recálculo de
 * totales no compite con otra alta o un borrado del mismo presupuesto.
 */
export async function bloquearPresupuesto(
  cliente: ClienteEscritura,
  presupuestoId: string,
): Promise<boolean> {
  const filas = (await cliente.execute<{ id: string }>(sql`
    SELECT id FROM presupuestos
    WHERE id = ${presupuestoId}
    FOR UPDATE
  `)) as unknown as { id: string }[]

  return filas.length === 1
}
