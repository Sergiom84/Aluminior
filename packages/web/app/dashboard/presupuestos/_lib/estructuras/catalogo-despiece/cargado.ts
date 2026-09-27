import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../../cliente-db.ts'

/** El catálogo de despiece completo (migración 0023 y su carga) está disponible. */
export async function catalogoDespieceCargado(cliente: ClienteEscritura): Promise<boolean> {
  const filas = await cliente.select({ codigo: schema.conjuntoParametrosDespiece.conjuntoCodigo })
    .from(schema.conjuntoParametrosDespiece).limit(1)
  return filas.length > 0
}
