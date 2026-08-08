'use server'

/**
 * Copia idéntica de un presupuesto como nueva revisión (T.72.1, T.72.1.1, T.72.1.2).
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
 *
 * Tres fases separadas (T.72.1.2): validación/autorización, copia, y
 * revalidación posterior. La copia ya puede estar confirmada en PostgreSQL
 * antes de llegar a `revalidatePath`; si esa última fase lanza y la acción
 * respondiera `ok:false`, el operador reintentaría y crearía OTRA revisión
 * sobre un documento que ya se copió bien. Un fallo de revalidación se
 * registra y se ignora: el `presupuestoId` ya existe y el resultado sigue
 * siendo `ok:true`.
 */

import { revalidatePath } from 'next/cache'
import { crearDb } from '@aluminior/db'
import { usuarioActual } from '../usuario-actual.ts'
import { registrarFallo } from '../errores.ts'
import { fechaLocalMadrid } from '../fecha-local.ts'
import { copiarPresupuesto, type ResultadoCopia } from './copiar-presupuesto.ts'
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

  let resultado: ResultadoCopia
  try {
    const db = crearDb()
    resultado = await copiarPresupuesto(db, {
      presupuestoId,
      destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
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
    registrarFallo(`copiarComoRevision: revalidación tras copiar ${resultado.presupuestoId}`, error)
  }

  return { ok: true, presupuestoId: resultado.presupuestoId }
}
