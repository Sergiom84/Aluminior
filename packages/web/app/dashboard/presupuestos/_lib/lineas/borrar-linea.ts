import { and, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { actualizarTotales } from '../totales.ts'
import { bloquearPresupuesto } from './bloquear-presupuesto.ts'

type Db = ReturnType<typeof crearDb>
export type ResultadoBorradoLinea = { ok: true } | { ok: false; mensaje: string }

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
): Promise<ResultadoBorradoLinea> {
  return db.transaction(async (tx) => {
    if (!await bloquearPresupuesto(tx, presupuestoId)) return { ok: false, mensaje: 'Presupuesto no encontrado' }
    const [cabecera] = await tx.select({ estado: schema.presupuestos.estado })
      .from(schema.presupuestos).where(eq(schema.presupuestos.id, presupuestoId)).limit(1)
    if (cabecera?.estado !== 'PENDIENTE') return { ok: false,
      mensaje: 'Sólo se pueden borrar líneas de un presupuesto pendiente' }

    const [eliminada] = await tx.delete(schema.lineas)
      .where(and(
        eq(schema.lineas.id, lineaId),
        eq(schema.lineas.presupuestoId, presupuestoId),
      ))
      .returning({ presupuestoId: schema.lineas.presupuestoId })

    if (!eliminada) return { ok: false, mensaje: 'La línea no pertenece al presupuesto o ya se ha borrado' }

    await actualizarTotales(tx, eliminada.presupuestoId)
    return { ok: true }
  })
}
