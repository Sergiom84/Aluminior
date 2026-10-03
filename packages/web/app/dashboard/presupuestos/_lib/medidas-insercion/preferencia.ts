import { eq } from 'drizzle-orm'
import { schema, type Db } from '@aluminior/db'
import { PREFERENCIAS_MEDIDAS } from '@aluminior/core/estructuras'
import { z } from 'zod'
import { conPresupuestoBloqueado } from '../lineas/con-presupuesto-bloqueado.ts'

const entradaPreferencia = z.object({ presupuestoId: z.uuid(), preferencia: z.enum(PREFERENCIAS_MEDIDAS) })

export async function guardarPreferenciaMedidas(db: Pick<Db, 'transaction'>, entrada: unknown) {
  const p = entradaPreferencia.safeParse(entrada)
  if (!p.success) return { ok: false as const, mensaje: 'Preferencia de medidas no válida' }
  return conPresupuestoBloqueado(db, p.data.presupuestoId, async (tx, cabecera) => {
    if (cabecera.estado !== 'PENDIENTE') return { ok: false as const,
      mensaje: 'Sólo se puede editar un presupuesto pendiente' }
    await tx.update(schema.presupuestos).set({ medidasNuevasVentanas: p.data.preferencia })
      .where(eq(schema.presupuestos.id, p.data.presupuestoId))
    return { ok: true as const }
  })
}
