import { plantillaDiseno } from './diseno.ts'
import type { ConfiguracionCerramiento } from './cerramiento.ts'

export const PREFERENCIAS_MEDIDAS = ['PREGUNTAR', 'COPIAR_PRIMERA', 'MODELO'] as const
export type PreferenciaMedidas = typeof PREFERENCIAS_MEDIDAS[number]

/** La referencia es el primer elemento creado, no el situado a la izquierda. */
export function medidasPrimeraVentana(configuracion: ConfiguracionCerramiento | null) {
  const primera = configuracion?.modulos[0]
  return primera ? { anchoMm: primera.anchoMm, altoMm: primera.altoMm } : null
}

export function primeraVentanaModificada(configuracion: ConfiguracionCerramiento | null): boolean {
  const primera = configuracion?.modulos[0]
  const plantilla = primera && plantillaDiseno(primera.estructuraCodigo)
  return Boolean(primera && plantilla &&
    (primera.anchoMm !== plantilla.anchoMm || primera.altoMm !== plantilla.altoMm))
}

export function decidirMedidasInsercion(configuracion: ConfiguracionCerramiento | null,
  preferencia: PreferenciaMedidas): 'PREGUNTAR' | 'COPIAR' | 'MODELO' {
  if (!configuracion) return 'MODELO'
  if (preferencia === 'COPIAR_PRIMERA') return 'COPIAR'
  if (preferencia === 'MODELO') return 'MODELO'
  return primeraVentanaModificada(configuracion) ? 'PREGUNTAR' : 'MODELO'
}
