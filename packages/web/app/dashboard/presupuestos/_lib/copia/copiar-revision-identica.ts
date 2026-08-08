'use server'

/**
 * Copia idéntica de un presupuesto como nueva revisión (T.72.1).
 *
 * Única superficie productiva de `_lib/copia/`. Fija por dentro
 * `MISMO_NUMERO_NUEVA_REVISION` y `MAPA_VACIO`: esta acción no es el
 * configurador avanzado de sustitución masiva (G3), que sigue sin consumidor.
 * No acepta mapa, selección de líneas, destino manual ni regeneración desde
 * fuera — son valores fijos, nunca los del `FormData` de quien la invoque.
 *
 * Sólo autentica, valida el id, delega en `copiarPresupuesto` y revalida. La
 * lectura del origen, la numeración y la escritura viven en sus módulos.
 */

import { revalidatePath } from 'next/cache'
import { crearDb } from '@aluminior/db'
import { usuarioActual } from '../usuario-actual.ts'
import { copiarPresupuesto } from './copiar-presupuesto.ts'
import { MAPA_VACIO } from './mapa-sustitucion.ts'
import { OPCIONES_COPIA_IDENTICA } from './plan-copia.ts'

export type ResultadoCopiarRevision =
  | { readonly ok: true; readonly presupuestoId: string }
  | { readonly ok: false; readonly error: string }

export async function copiarComoRevision(presupuestoId: string): Promise<ResultadoCopiarRevision> {
  if (typeof presupuestoId !== 'string' || !presupuestoId.trim()) {
    return { ok: false, error: 'Presupuesto no válido' }
  }

  const creadoPor = await usuarioActual()
  const db = crearDb()

  const resultado = await copiarPresupuesto(db, {
    presupuestoId,
    destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
    opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
    creadoPor,
  })

  if (!resultado.ok) {
    return { ok: false, error: 'No se pudo copiar el presupuesto como nueva revisión' }
  }

  revalidatePath('/dashboard/presupuestos')
  revalidatePath(`/dashboard/presupuestos/${resultado.presupuestoId}`)
  return { ok: true, presupuestoId: resultado.presupuestoId }
}
