import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import type { MetodoPagoPresupuesto } from '@aluminior/db/schema'
import { conPresupuestoBloqueado } from '../lineas/con-presupuesto-bloqueado.ts'
import { actualizarTotales } from '../totales.ts'

type Db = Pick<ReturnType<typeof crearDb>, 'transaction'>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type ResultadoGuardadoPresupuesto =
  | { ok: true; guardadoEn: string }
  | { ok: false; mensaje: string }

export type ResultadoPagoPresupuesto =
  | { ok: true; estado: 'ABONADO'; metodoPago: MetodoPagoPresupuesto }
  | { ok: false; mensaje: string }

export async function confirmarGuardadoPresupuesto(
  db: Db,
  presupuestoId: string,
): Promise<ResultadoGuardadoPresupuesto> {
  if (!UUID.test(presupuestoId)) return { ok: false, mensaje: 'Presupuesto no válido' }
  return conPresupuestoBloqueado(db, presupuestoId, async (tx, cabecera) => {
    if (cabecera.estado !== 'PENDIENTE') {
      return { ok: false, mensaje: 'Sólo se puede guardar un presupuesto pendiente' }
    }
    await actualizarTotales(tx, presupuestoId)
    const ahora = new Date()
    await tx.update(schema.presupuestos).set({ guardadoEn: ahora }).where(eq(schema.presupuestos.id, presupuestoId))
    return { ok: true, guardadoEn: ahora.toISOString() }
  })
}

export async function registrarPagoPresupuesto(
  db: Db,
  entrada: { presupuestoId: string; metodoPago: MetodoPagoPresupuesto; usuario: string },
): Promise<ResultadoPagoPresupuesto> {
  if (!UUID.test(entrada.presupuestoId)) return { ok: false, mensaje: 'Presupuesto no válido' }
  if (!schema.METODOS_PAGO_PRESUPUESTO.includes(entrada.metodoPago)) {
    return { ok: false, mensaje: 'Método de pago no válido' }
  }
  return conPresupuestoBloqueado(db, entrada.presupuestoId, async (tx, cabecera) => {
    if (cabecera.estado !== 'PENDIENTE') {
      return { ok: false, mensaje: `El presupuesto ya está ${cabecera.estado}` }
    }
    await actualizarTotales(tx, entrada.presupuestoId)
    const formaPagoPorDefecto = entrada.metodoPago === 'METALICO' ? '01-CONTADO' : '02-TRANSFERENCIA'
    await tx.update(schema.presupuestos).set({
      estado: 'ABONADO',
      metodoPago: entrada.metodoPago,
      pagadoEn: new Date(),
      pagadoPor: entrada.usuario,
      formaPago: cabecera.formaPago?.trim() ? cabecera.formaPago : formaPagoPorDefecto,
    }).where(eq(schema.presupuestos.id, entrada.presupuestoId))
    return { ok: true, estado: 'ABONADO', metodoPago: entrada.metodoPago }
  })
}
