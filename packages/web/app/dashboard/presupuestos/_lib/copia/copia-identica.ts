/**
 * Implementación interna y compartida de la copia idéntica de un presupuesto
 * (T.72.1, T.72.2).
 *
 * Recibe una estrategia YA cerrada — nunca la decide, nunca la lee de fuera —
 * y hace todo lo que las dos acciones productivas necesitan: autorización,
 * validación de id, fecha explícita Europe/Madrid, llamada al motor con la
 * copia idéntica fija (`MAPA_VACIO`, `OPCIONES_COPIA_IDENTICA`), y
 * revalidación posterior que no invalida una copia ya confirmada.
 *
 * `copiarComoRevision` (MISMO_NUMERO_NUEVA_REVISION) y `copiarComoNuevo`
 * (NUEVO_NUMERO) son wrappers finos de una única línea sobre esta función:
 * los dos destinos observados en EVIDENCIA-VIDEO-PRESUPUESTO.md §8. Esta
 * función NO se marca `'use server'` ni se expone como Server Action: no es
 * alcanzable desde ningún formulario, sólo desde las dos acciones que sí lo
 * son.
 */

import { revalidatePath } from 'next/cache'
import { crearDb } from '@aluminior/db'
import { usuarioActual } from '../usuario-actual.ts'
import { registrarFallo } from '../errores.ts'
import { fechaLocalMadrid } from '../fecha-local.ts'
import { copiarPresupuesto, type ResultadoCopia } from './copiar-presupuesto.ts'
import type { EstrategiaDestino } from './destino-documento.ts'
import { MAPA_VACIO } from './mapa-sustitucion.ts'
import { OPCIONES_COPIA_IDENTICA } from './plan-copia.ts'

export type ResultadoCopiaIdentica =
  | { readonly ok: true; readonly presupuestoId: string }
  | { readonly ok: false; readonly error: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Nunca expone SQL, nombres de restricción ni el detalle de `copiarPresupuesto`. */
const ERROR_GENERICO = 'No se pudo copiar el presupuesto'
const ERROR_ID_INVALIDO = 'Presupuesto no válido'
const ERROR_SIN_SESION = 'Sesión no válida'

export async function copiarIdentica(
  estrategia: EstrategiaDestino,
  presupuestoId: string,
): Promise<ResultadoCopiaIdentica> {
  if (typeof presupuestoId !== 'string' || !UUID.test(presupuestoId)) {
    return { ok: false, error: ERROR_ID_INVALIDO }
  }

  const creadoPor = await usuarioActual()
  if (!creadoPor) {
    return { ok: false, error: ERROR_SIN_SESION }
  }

  let resultado: ResultadoCopia
  try {
    const db = crearDb()
    resultado = await copiarPresupuesto(db, {
      presupuestoId,
      destino: { estrategia },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
      creadoPor,
      fecha: fechaLocalMadrid(),
    })
  } catch {
    return { ok: false, error: ERROR_GENERICO }
  }

  if (!resultado.ok) return { ok: false, error: ERROR_GENERICO }

  // La copia YA está confirmada. Lo que siga es limpieza de caché, no la
  // operación: su fallo no puede leerse como que la copia no se hizo.
  try {
    revalidatePath('/dashboard/presupuestos')
    revalidatePath(`/dashboard/presupuestos/${resultado.presupuestoId}`)
  } catch (error) {
    registrarFallo(`copiarIdentica(${estrategia}): revalidación tras copiar ${resultado.presupuestoId}`, error)
  }

  return { ok: true, presupuestoId: resultado.presupuestoId }
}
