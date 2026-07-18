/**
 * Cálculo de vidrio: medidas y metraje facturable.
 *
 * Modelo validado contra el histórico real (PLAN.md anexo L):
 *
 *  1. MEDIDA:   vidrio = medida de corte de la hoja − delta(serie, perfil)
 *     donde delta es el descuento de galce MEDIDO del histórico
 *     (constante al 100% por serie y perfil de hoja).
 *
 *  2. METRAJE:  cada dimensión se redondea HACIA ARRIBA al múltiplo del
 *     artículo (los múltiplos están en cm), se multiplica el área y se aplica
 *     el metraje mínimo. Validado: 98,7% de coincidencia exacta con 2.273
 *     vidrios reales.
 *
 * Principio: si falta el delta o el emparejamiento de hojas es ambiguo, NO
 * se calcula: el vidrio queda "sin calcular" con motivo. Nunca se adivina.
 */

export interface ReglasMetrajeVidrio {
  /** Metraje mínimo facturable, en m². */
  metrajeMinimo: number | null
  /** Múltiplo de redondeo del largo, en cm. */
  multiploLargoCm: number | null
  /** Múltiplo de redondeo del ancho, en cm. */
  multiploAnchoCm: number | null
}

/** Medidas del vidrio a partir de los cortes de la hoja y el delta medido. */
export function medidasVidrio(
  corteHvMm: number,
  corteHhMm: number,
  deltaMm: number,
): { largoMm: number; anchoMm: number } | null {
  const largoMm = Math.round((corteHvMm - deltaMm) * 100) / 100
  const anchoMm = Math.round((corteHhMm - deltaMm) * 100) / 100
  if (largoMm <= 0 || anchoMm <= 0) return null
  return { largoMm, anchoMm }
}

/** Metraje facturable en m², con redondeo por múltiplos (cm) y mínimo. */
export function metrajeVidrioM2(
  largoMm: number,
  anchoMm: number,
  reglas: ReglasMetrajeVidrio,
): number {
  let largoCm = largoMm / 10
  let anchoCm = anchoMm / 10
  if (reglas.multiploLargoCm && reglas.multiploLargoCm > 0) {
    largoCm = Math.ceil(largoCm / reglas.multiploLargoCm - 1e-9) * reglas.multiploLargoCm
  }
  if (reglas.multiploAnchoCm && reglas.multiploAnchoCm > 0) {
    anchoCm = Math.ceil(anchoCm / reglas.multiploAnchoCm - 1e-9) * reglas.multiploAnchoCm
  }
  let m2 = (largoCm / 100) * (anchoCm / 100)
  m2 = Math.round(m2 * 100) / 100
  if (reglas.metrajeMinimo && reglas.metrajeMinimo > 0 && m2 < reglas.metrajeMinimo) {
    m2 = reglas.metrajeMinimo
  }
  return m2
}
