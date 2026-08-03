import { sql } from 'drizzle-orm'
import type { ClienteEscritura } from './cliente-db.ts'

/**
 * Recalcula los totales del presupuesto desde sus líneas.
 *
 * Se hace en SQL, en una sola sentencia: si se hiciera leyendo y escribiendo
 * desde la aplicación, dos usuarios editando a la vez dejarían el documento
 * descuadrado.
 *
 * Acepta el cliente para poder ejecutarse dentro de la transacción que acaba
 * de insertar la línea. Si esa transacción se deshace, el total tampoco queda
 * escrito.
 */
export async function actualizarTotales(cliente: ClienteEscritura, presupuestoId: string) {
  await cliente.execute(sql`
    UPDATE presupuestos p SET
      subtotal       = t.suma,
      base_imponible = t.suma,
      cuota_iva      = ROUND(t.suma * p.tipo_iva / 100, 2),
      total          = t.suma + ROUND(t.suma * p.tipo_iva / 100, 2)
    FROM (
      SELECT COALESCE(SUM(total), 0) AS suma FROM lineas WHERE presupuesto_id = ${presupuestoId}
    ) t
    WHERE p.id = ${presupuestoId}
  `)
}
