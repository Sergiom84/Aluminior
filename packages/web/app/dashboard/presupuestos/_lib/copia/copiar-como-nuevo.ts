'use server'

/**
 * Copia idéntica de un presupuesto como NUEVO presupuesto (T.72.2): siguiente
 * número automático del ejercicio de la fecha comercial, revisión 0, misma
 * serie. Único destino fijo: `NUEVO_NUMERO`.
 *
 * No acepta mapa, selección de líneas, destino manual, número, revisión,
 * serie ni regeneración desde fuera — son valores fijos, nunca los de un
 * `FormData`. Toda la orquestación (autorización, UUID, fecha, error
 * genérico, revalidación postcommit) vive en `copia-identica.ts`, compartida
 * con `copiarComoRevision`.
 */

import { copiarIdentica, type ResultadoCopiaIdentica } from './copia-identica.ts'

export type ResultadoCopiarComoNuevo = ResultadoCopiaIdentica

export async function copiarComoNuevo(presupuestoId: string): Promise<ResultadoCopiarComoNuevo> {
  return copiarIdentica('NUEVO_NUMERO', presupuestoId)
}
