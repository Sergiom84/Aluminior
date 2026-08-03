import {
  esConfiguracionCerramiento, type ConfiguracionCerramiento,
} from '@aluminior/core/estructuras'

export type ResultadoConfiguracionCerramiento =
  | { ok: true; configuracion: ConfiguracionCerramiento }
  | { ok: false; mensaje: string }

/**
 * Convierte el snapshot enviado por el configurador en un modelo de dominio
 * válido antes de que ninguna escritura de presupuesto pueda comenzar.
 */
export function validarConfiguracionCerramiento(
  configuracionSerializada: string | null,
): ResultadoConfiguracionCerramiento {
  try {
    const valor = JSON.parse(configuracionSerializada ?? '') as unknown
    if (!esConfiguracionCerramiento(valor)) throw new Error('configuración no válida')
    return { ok: true, configuracion: valor }
  } catch {
    return { ok: false, mensaje: 'La composición del cerramiento no es válida' }
  }
}
