import type { schema } from '@aluminior/db'

type Linea = typeof schema.lineas.$inferSelect
/** Semántica del alta actual: Number, multiplicación y redondeo a céntimos. */
const totalActual = (precio: string, cantidad: number) => Math.round(Number(precio) * cantidad * 100) / 100

export function prepararCantidadArticulo(linea: Linea, cantidad: number) {
  const ausencia = linea.precioUnitario === null && linea.total === null && !linea.valoracionCompleta
  const ordinaria = linea.precioUnitario !== null && linea.total !== null && linea.valoracionCompleta &&
    Number(linea.total) === totalActual(linea.precioUnitario, Number(linea.cantidad))
  if (Number(linea.descuento) !== 0 || Number(linea.descuento2) !== 0 || linea.pvpManual ||
      linea.costeManual !== null || (!ausencia && !ordinaria)) {
    return { ok: false as const, mensaje: 'Esta línea histórica sólo admite editar la ubicación' }
  }
  const total = ausencia ? null : totalActual(linea.precioUnitario!, cantidad)
  if (total !== null && (!Number.isFinite(total) || total < 0 || total > 999_999_999_999.99))
    return { ok: false as const, mensaje: 'El importe de la línea está fuera de rango' }
  return { ok: true as const, total: total === null ? null : String(total) }
}
