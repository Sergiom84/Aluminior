/**
 * Composición de un doble acristalamiento a partir de la descripción del
 * catálogo: «DOBLE ACRISTALAMIENTO <exterior>/<cámara>[ ARGON]/<interior>».
 *
 * Evidencia (EMP0016, familia 050, 04/10/2026): 14.652 artículos siguen este
 * patrón y su coste se reproduce sin residuo como base de la cámara más un
 * suplemento por cada vidrio. Los nombres de vidrio pueden contener «/»
 * («PARSOL GRIS/BRONCE 4»): la cámara se reconoce como el primer tramo
 * numérico seguido de la barra del vidrio interior.
 */

export interface ComposicionDobleAcristalamiento {
  /** Nombre del vidrio exterior tal y como lo escribe el catálogo. */
  exterior: string
  camaraMm: number
  argon: boolean
  interior: string
}

const PATRON = /^DOBLE ACRISTALAMIENTO (.+?)\/(\d+)( ARGON)?\/(.+)$/

/** `null` si la descripción no es un doble acristalamiento compuesto. */
export function parsearComposicion(descripcion: string): ComposicionDobleAcristalamiento | null {
  const m = PATRON.exec(descripcion.trim().replace(/\s+/g, ' '))
  if (!m) return null
  const exterior = m[1].trim()
  const interior = m[4].trim()
  if (!exterior || !interior) return null
  return { exterior, camaraMm: Number(m[2]), argon: m[3] !== undefined, interior }
}
