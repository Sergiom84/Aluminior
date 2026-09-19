/**
 * Metraje facturable de un artículo por M2 (compactos, mosquiteras).
 *
 * Evidencia (empresa 0017, copia de la MDB en solo lectura, 19/09):
 * - `COM001`: M2, `MetrajeMultiploAncho` 5, `MetrajeMultiploLargo` 5 (cm),
 *   `MetrajeMinimo` 1,5. Observado a 1200 x 1200: 1,44 M2 -> **1,50 M2**
 *   x 74,65 = 111,98 (`RECON-CERRAMIENTOS.md` §5, `Det.Estructura`).
 * - `PSM001`: M2, sin múltiplos, `MetrajeMinimo` 1,25. Observado a 1200 x 1045:
 *   1,254 -> **1,25 M2** x 56,76 = 70,95.
 * - CHM 5.1.2.13.1: los múltiplos al ancho y al largo se expresan en cm.
 *
 * HIPÓTESIS: el múltiplo redondea hacia arriba cada dimensión (ningún caso
 * observado lo discrimina) y la superficie se redondea a 2 decimales antes del
 * mínimo. Redondear hacia arriba la superficie daría 1,26 y 71,52, que no es
 * lo observado.
 */

import { multiplicarDecimal, normalizarDecimal, compararDecimal, type Decimal } from './decimal.ts'

export const ESCALA_METRAJE_SUPERFICIE = 2

export interface ReglaMetrajeSuperficie {
  /** Múltiplo al ancho en cm; 0 o null sin múltiplo. */
  readonly multiploAnchoCm: number | null
  /** Múltiplo al largo (alto) en cm; 0 o null sin múltiplo. */
  readonly multiploLargoCm: number | null
  /** Metraje mínimo en M2 como texto decimal; null o '0' sin mínimo. */
  readonly minimo: Decimal | null
}

const alMultiplo = (mm: number, multiploCm: number | null) => {
  if (!multiploCm || multiploCm <= 0) return mm
  const paso = multiploCm * 10
  return Math.ceil(mm / paso) * paso
}

/** Superficie facturable en M2, con 2 decimales. */
export function metrajeSuperficie(anchoMm: number, altoMm: number, regla: ReglaMetrajeSuperficie): Decimal {
  if (!Number.isInteger(anchoMm) || !Number.isInteger(altoMm) || anchoMm <= 0 || altoMm <= 0) {
    throw new Error(`medidas no válidas para metraje por M2: ${anchoMm} x ${altoMm}`)
  }
  const ancho = alMultiplo(anchoMm, regla.multiploAnchoCm)
  const alto = alMultiplo(altoMm, regla.multiploLargoCm)
  const superficie = multiplicarDecimal(multiplicarDecimal(String(ancho), String(alto), 0), '0.000001', ESCALA_METRAJE_SUPERFICIE)
  const minimo = regla.minimo?.trim()
  if (minimo && compararDecimal(minimo, '0') > 0 && compararDecimal(superficie, minimo) < 0) {
    return normalizarDecimal(minimo, ESCALA_METRAJE_SUPERFICIE)
  }
  return superficie
}
