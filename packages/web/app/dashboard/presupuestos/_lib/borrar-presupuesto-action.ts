'use server'

import { revalidatePath } from 'next/cache'
import { crearDb } from '@aluminior/db'
import { usuarioActual } from './usuario-actual.ts'
import { registrarFallo } from './errores.ts'
import { borrarPresupuesto, enTransaccionDrizzle, type ResultadoBorradoPresupuesto } from './borrado/index.ts'

export type ResultadoEliminarPresupuesto =
  | { ok: true }
  | { ok: false; mensaje: string }

/**
 * Elimina un presupuesto PENDIENTE. La regla vive en `borrado/`; aquí sólo se
 * conecta, se traduce el resultado y se revalida. La navegación al listado
 * tras borrar desde el detalle la hace el cliente (`router.replace`), para que
 * el historial no conserve la URL de un documento que ya no existe.
 */
export async function eliminarPresupuesto(presupuestoId: string): Promise<ResultadoEliminarPresupuesto> {
  let resultado: ResultadoBorradoPresupuesto
  try {
    resultado = await borrarPresupuesto({
      usuarioActual,
      enTransaccion: (trabajo) => enTransaccionDrizzle(crearDb())(trabajo),
    }, presupuestoId)
  } catch (error) {
    return { ok: false, mensaje: registrarFallo('eliminarPresupuesto', error) }
  }
  if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje }
  for (const ruta of ['/dashboard/presupuestos', `/dashboard/presupuestos/${presupuestoId}`]) {
    try { revalidatePath(ruta) }
    catch (error) { registrarFallo(`eliminarPresupuesto: revalidación tras borrar (${ruta})`, error) }
  }
  return { ok: true }
}
