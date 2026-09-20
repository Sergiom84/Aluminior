/**
 * Orientación del palo. Es DATO, no color: Productor pinta en granate los
 * horizontales y en negro los verticales, pero el color es decisión de la
 * vista y aquí no aparece.
 */
export type Orientacion = 'horizontal' | 'vertical' | 'desconocida'

export interface OrientacionResuelta {
  orientacion: Orientacion
  motivo: string
}

/**
 * Vocabulario de función medido en los datos (`db/schema/despiece.ts`):
 * MV/MH marco vertical/horizontal, HV/HH hoja vertical/horizontal.
 *
 * Es una allowlist a propósito. Hay 110 valores distintos de `funcion` y
 * deducir la orientación de la última letra clasificaría mal cosas como
 * `infHAesc`. Un travesaño (`TM`) puede ir en cualquier sentido: sin más dato,
 * es desconocido. Quien conozca la geometría puede pasar la orientación
 * explícita y entonces manda esa.
 */
const ORIENTACION_POR_FUNCION: Record<string, Orientacion> = {
  MH: 'horizontal',
  HH: 'horizontal',
  MV: 'vertical',
  HV: 'vertical',
}

export function orientacionDePalo(pieza: {
  funcion?: string | null
  orientacion?: Orientacion | null
}): OrientacionResuelta {
  if (pieza.orientacion === 'horizontal' || pieza.orientacion === 'vertical') {
    return { orientacion: pieza.orientacion, motivo: 'orientación aportada por el origen' }
  }
  const funcion = (pieza.funcion ?? '').trim()
  const conocida = ORIENTACION_POR_FUNCION[funcion]
  if (conocida) return { orientacion: conocida, motivo: `función "${funcion}"` }
  return {
    orientacion: 'desconocida',
    motivo: funcion === ''
      ? 'sin función ni orientación explícita'
      : `la función "${funcion}" no determina la orientación`,
  }
}
