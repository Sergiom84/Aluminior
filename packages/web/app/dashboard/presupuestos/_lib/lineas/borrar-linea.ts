import { and, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { actualizarTotales } from '../totales.ts'
import { bloquearPresupuesto } from './bloquear-presupuesto.ts'

type Db = ReturnType<typeof crearDb>

/**
 * Borra una línea sólo cuando pertenece al documento indicado.
 *
 * La pertenencia forma parte del propio DELETE, no de una comprobación previa:
 * por tanto no existe una ventana en la que la línea pueda cambiar entre leerla
 * y borrarla. El total se recalcula desde el presupuesto que realmente devolvió
 * PostgreSQL, dentro de la misma transacción.
 */
export async function borrarLineaDePresupuesto(
  db: Db,
  lineaId: string,
  presupuestoId: string,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    if (!await bloquearPresupuesto(tx, presupuestoId)) return false

    const [eliminada] = await tx.delete(schema.lineas)
      .where(and(
        eq(schema.lineas.id, lineaId),
        eq(schema.lineas.presupuestoId, presupuestoId),
      ))
      .returning({ presupuestoId: schema.lineas.presupuestoId })

    if (!eliminada) return false

    await actualizarTotales(tx, eliminada.presupuestoId)
    return true
  })
}

