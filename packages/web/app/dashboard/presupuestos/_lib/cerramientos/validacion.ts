import {
  CATALOGO_SNAPSHOT, esConfiguracionCerramiento, normalizarUnionesCerramiento, UNIONES_VISUALES,
  type CatalogoAdmision, type ConfiguracionCerramiento,
} from '@aluminior/core/estructuras'

export type ResultadoConfiguracionCerramiento =
  | { ok: true; configuracion: ConfiguracionCerramiento }
  | { ok: false; mensaje: string }

/**
 * Convierte el snapshot enviado por el configurador en un modelo de dominio
 * válido antes de que ninguna escritura de presupuesto pueda comenzar.
 * El catálogo de uniones viene de la base: valida el código y fija su grosor.
 * Con `CATALOGO_SNAPSHOT` solo se lee lo ya guardado y no se renormaliza.
 */
export function validarConfiguracionCerramiento(
  configuracionSerializada: string | null,
  catalogo: CatalogoAdmision = UNIONES_VISUALES,
): ResultadoConfiguracionCerramiento {
  try {
    const valor = JSON.parse(configuracionSerializada ?? '') as unknown
    if (!esConfiguracionCerramiento(valor, catalogo)) throw new Error('configuración no válida')
    return { ok: true, configuracion: catalogo === CATALOGO_SNAPSHOT ? valor : normalizarUnionesCerramiento(valor, catalogo) }
  } catch {
    return { ok: false, mensaje: 'La composición del cerramiento no es válida' }
  }
}
