import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import { bloquearPresupuesto } from './bloquear-presupuesto.ts'

type Db = Pick<ReturnType<typeof crearDb>, 'transaction'>
export type CabeceraBloqueada = typeof schema.presupuestos.$inferSelect

/** Todos los escritores de líneas adquieren cabecera antes de sus satélites. */
export async function conPresupuestoBloqueado<T>(db: Db, presupuestoId: string,
  operacion: (tx: ClienteEscritura, cabecera: CabeceraBloqueada) => Promise<T>,
): Promise<T> {
  return db.transaction(async tx => {
    if (!await bloquearPresupuesto(tx, presupuestoId)) throw new Error('Presupuesto no encontrado')
    const [cabecera] = await tx.select().from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, presupuestoId)).limit(1)
    if (!cabecera) throw new Error('Presupuesto no encontrado')
    return operacion(tx, cabecera)
  })
}
