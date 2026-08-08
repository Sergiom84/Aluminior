'use server'

/**
 * Copia idéntica de un presupuesto como nueva revisión DEL MISMO documento
 * (T.72.1, T.72.2). Único destino fijo: `MISMO_NUMERO_NUEVA_REVISION`.
 *
 * No acepta mapa, selección de líneas, destino manual, número, revisión,
 * serie ni regeneración desde fuera — son valores fijos, nunca los de un
 * `FormData`. Toda la orquestación (autorización, UUID, fecha, error
 * genérico, revalidación postcommit) vive en `copia-identica.ts`, compartida
 * con `copiarComoNuevo`.
 */

import { copiarIdentica, type ResultadoCopiaIdentica } from './copia-identica.ts'

export type ResultadoCopiarRevision = ResultadoCopiaIdentica

export async function copiarComoRevision(presupuestoId: string): Promise<ResultadoCopiarRevision> {
  return copiarIdentica('MISMO_NUMERO_NUEVA_REVISION', presupuestoId)
}
