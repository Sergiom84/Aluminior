import { and, eq } from 'drizzle-orm'
import { schema, type Db } from '@aluminior/db'
import { conPresupuestoBloqueado } from '../../lineas/con-presupuesto-bloqueado'
import { actualizarTotales } from '../../totales'
import { esquemaEdicionArticulo } from './esquema'
import { prepararCantidadArticulo } from './importes'

export async function actualizarArticulo(db: Pick<Db, 'transaction'>, entrada: unknown) {
  const p = esquemaEdicionArticulo.safeParse(entrada)
  if (!p.success) return { ok: false as const, errores: p.error.flatten().fieldErrors,
    mensaje: 'Revisa los campos del artículo' }
  const d = p.data
  return conPresupuestoBloqueado(db, d.presupuestoId, async (tx, cabecera) => {
    if (cabecera.estado !== 'PENDIENTE') return { ok: false as const, errores: {},
      mensaje: 'Sólo se puede editar un presupuesto pendiente' }
    const [linea] = await tx.select().from(schema.lineas).where(and(eq(schema.lineas.id, d.lineaId),
      eq(schema.lineas.presupuestoId, d.presupuestoId), eq(schema.lineas.tipo, 'ARTICULO'))).limit(1)
    if (!linea) return { ok: false as const, errores: {}, mensaje: 'La línea no pertenece al presupuesto o no es un artículo' }
    if (Number(linea.cantidad) === d.cantidad) {
      await tx.update(schema.lineas).set({ referencia: d.referencia }).where(eq(schema.lineas.id, linea.id))
    } else {
      if ([cabecera.descuento, cabecera.descuentoPp, cabecera.recargoEquivalencia, cabecera.retencion]
        .some(valor => valor !== null && Number(valor) !== 0)) {
        return { ok: false as const, errores: {}, mensaje: 'Este presupuesto histórico sólo admite editar la ubicación del artículo' }
      }
      const importes = prepararCantidadArticulo(linea, d.cantidad)
      if (!importes.ok) return { ...importes, errores: { cantidad: [importes.mensaje] } }
      await tx.update(schema.lineas).set({ cantidad: String(d.cantidad), referencia: d.referencia,
        total: importes.total }).where(eq(schema.lineas.id, linea.id))
      await actualizarTotales(tx, d.presupuestoId)
    }
    return { ok: true as const, mensaje: 'Artículo actualizado' }
  })
}
