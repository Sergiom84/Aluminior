/**
 * Frontera explícita de colisión de numeración (T.71.2, decisión #9).
 *
 * Detecta SQLSTATE 23505 por código y por el nombre de la restricción, nunca
 * comparando el texto del mensaje de error (que cambia con el idioma del
 * servidor y no es un contrato estable).
 */

import { diagnosticoPostgres, type crearDb } from '@aluminior/db'
import type { Tx } from './tipos.ts'

type Db = Pick<ReturnType<typeof crearDb>, 'transaction'>

export function esColisionIdentidad(error: unknown): boolean {
  const e = diagnosticoPostgres(error)
  return e?.code === '23505' && e?.constraint_name === 'presupuestos_identidad_uq'
}

/**
 * Ejecuta `intento` dentro de una transacción. Si choca con la identidad y
 * `automatico` es `true` (asignación automática, decisión #9), repite la
 * transacción COMPLETA una sola vez. Si `automatico` es `false` (destino
 * manual) o el error no es una colisión de identidad, propaga sin reintentar.
 *
 * Reserva e inserción de cabecera viven ambas dentro de `intento` (decisión
 * #6): un fallo posterior a reservar la numeración deshace también la
 * cabecera, porque es la misma transacción la que hace rollback.
 */
export async function ejecutarConNumeracion<T>(
  db: Db,
  intento: (tx: Tx) => Promise<T>,
  opciones: { readonly automatico: boolean },
): Promise<T> {
  try {
    return await db.transaction(intento)
  } catch (error) {
    if (opciones.automatico && esColisionIdentidad(error)) {
      return await db.transaction(intento)
    }
    throw error
  }
}
