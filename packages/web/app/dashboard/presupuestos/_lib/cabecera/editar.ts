import { eq } from 'drizzle-orm'
import { schema, type Db } from '@aluminior/db'
import { conPresupuestoBloqueado } from '../lineas/con-presupuesto-bloqueado'
import { esquemaCabeceraEdicion } from './esquema'

/** La tarifa y el resto de la identidad quedan fuera de la escritura. */
export async function actualizarCabecera(db: Pick<Db, 'transaction'>, entrada: unknown) {
  const p = esquemaCabeceraEdicion.safeParse(entrada)
  if (!p.success) return { ok: false as const, errores: p.error.flatten().fieldErrors,
    mensaje: 'Revisa los campos de la cabecera' }
  const { presupuestoId, ...campos } = p.data
  return conPresupuestoBloqueado(db, presupuestoId, async (tx, cabecera) => {
    if (cabecera.estado !== 'PENDIENTE') return { ok: false as const, errores: {},
      mensaje: 'Sólo se puede editar un presupuesto pendiente' }
    for (const [codigo, tabla, campo] of [
      [campos.clienteCodigo, schema.clientes, 'clienteCodigo'],
      [campos.potencialCodigo, schema.clientesPotenciales, 'potencialCodigo'],
    ] as const) {
      if (codigo) {
        const filas = await tx.select({ codigo: tabla.codigo }).from(tabla).where(eq(tabla.codigo, codigo)).limit(1)
        if (!filas.length) return { ok: false as const, errores: { [campo]: ['Código no encontrado'] },
          mensaje: 'Revisa el destinatario' }
      }
    }
    await tx.update(schema.presupuestos).set(campos).where(eq(schema.presupuestos.id, presupuestoId))
    return { ok: true as const, mensaje: 'Cabecera actualizada' }
  })
}
