'use server'

/**
 * Copia idéntica de un presupuesto como nueva revisión (T.72.1, T.72.1.1).
 *
 * Única superficie productiva de `_lib/copia/`. Fija por dentro
 * `MISMO_NUMERO_NUEVA_REVISION` y `MAPA_VACIO`: esta acción no es el
 * configurador avanzado de sustitución masiva (G3), que sigue sin consumidor.
 * No acepta mapa, selección de líneas, destino manual ni regeneración desde
 * fuera — son valores fijos, nunca los del `FormData` de quien la invoque.
 *
 * Orden de guardas (T.72.1.1, decisión deliberada): el UUID se valida ANTES
 * de tocar la sesión, y la sesión se exige ANTES de abrir conexión. Ni
 * `usuarioActual` ni `crearDb` se alcanzan con una entrada que ya se sabe
 * inválida. `usuarioActual` sigue devolviendo `null` en cualquier fallo para
 * los flujos que la toleran (T.61); esta acción es la que decide que, para
 * crear un documento, `null` no es aceptable.
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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Nunca expone SQL, nombres de restricción ni el detalle de `copiarPresupuesto`. */
const ERROR_GENERICO = 'No se pudo copiar el presupuesto como nueva revisión'
const ERROR_ID_INVALIDO = 'Presupuesto no válido'
const ERROR_SIN_SESION = 'Sesión no válida'

export async function copiarComoRevision(presupuestoId: string): Promise<ResultadoCopiarRevision> {
  if (typeof presupuestoId !== 'string' || !UUID.test(presupuestoId)) {
    return { ok: false, error: ERROR_ID_INVALIDO }
  }

  const creadoPor = await usuarioActual()
  if (!creadoPor) {
    return { ok: false, error: ERROR_SIN_SESION }
  }

  try {
    const db = crearDb()
    const resultado = await copiarPresupuesto(db, {
      presupuestoId,
      destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO },
      creadoPor,
    })

    if (!resultado.ok) return { ok: false, error: ERROR_GENERICO }

    revalidatePath('/dashboard/presupuestos')
    revalidatePath(`/dashboard/presupuestos/${resultado.presupuestoId}`)
    return { ok: true, presupuestoId: resultado.presupuestoId }
  } catch {
    return { ok: false, error: ERROR_GENERICO }
  }
}
