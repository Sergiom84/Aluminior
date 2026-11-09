import { sql, type AnyColumn } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'

export interface ClienteCoincidente {
  codigo: string
  nombre: string
}

/**
 * Clientes activos cuyo teléfono fijo o móvil acaba en esas 9 cifras.
 * Los teléfonos de la ficha vienen con espacios, puntos o prefijo.
 */
export async function clientesPorTelefono(cifras: string): Promise<ClienteCoincidente[]> {
  if (!/^\d{9}$/.test(cifras)) return []
  const c = schema.clientes
  const ultimas = (columna: AnyColumn) =>
    sql`right(regexp_replace(coalesce(${columna}, ''), '\\D', '', 'g'), 9)`
  return crearDb()
    .select({ codigo: c.codigo, nombre: c.nombre })
    .from(c)
    .where(sql`${c.activo} and (${ultimas(c.telefono)} = ${cifras} or ${ultimas(c.telefonoMovil)} = ${cifras})`)
    .limit(5)
}
