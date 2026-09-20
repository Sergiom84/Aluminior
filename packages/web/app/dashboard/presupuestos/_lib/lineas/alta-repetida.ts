import { eq } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import { ErrorOperacionCerramiento } from '../cerramientos/error-operativo.ts'

/** Consultar dentro del bloqueo de cabecera, antes de valorar o escribir satélites.
 * La primera alta confirmada consume el UUID. Un reenvío nunca edita esa línea.
 * Si hubo rollback, el UUID queda libre para reintentar con los campos corregidos.
 */
export async function leerAltaRepetida(tx: ClienteEscritura, presupuestoId: string, id?: string) {
  if (!id) return null
  const [existente] = await tx.select().from(schema.lineas).where(eq(schema.lineas.id, id)).limit(1)
  if (!existente) return null
  if (existente.presupuestoId !== presupuestoId) {
    throw new ErrorOperacionCerramiento('La solicitud pertenece a otro presupuesto')
  }
  return existente
}
