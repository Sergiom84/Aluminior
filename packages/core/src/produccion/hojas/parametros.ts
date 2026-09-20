/**
 * Parámetros físicos del corte. Son ENTRADA EXPLÍCITA del ensamblado, nunca
 * constantes enterradas en el cálculo: dependen de la sierra y de la práctica
 * de cada taller, y el operador los cambia en pantalla.
 */
export interface ParametrosCorte {
  /** mm que se sanean de la punta inicial de la barra antes del primer corte. */
  saneamientoInicialMm: number
  /** mm que se sanean de la punta final. */
  saneamientoFinalMm: number
  /** Grosor del disco cuando el extremo va a inglete. */
  discoIngleteMm: number
  /** Grosor del disco cuando el extremo va a corte recto. */
  discoRectoMm: number
}

/**
 * Valores observados en el ejemplo del vídeo (24:50): saneamiento de punta
 * inicial 30 mm, final 30 mm, disco 7 mm en inglete y 5 mm en corte recto.
 *
 * ⚠️ Son los del taller de ESE vídeo, no una verdad universal ni un dato del
 * catálogo. Se exponen como punto de partida visible y editable, igual que
 * `LONGITUD_BARRA_POR_DEFECTO_MM` en `optimizar.ts`. Ningún cálculo los usa
 * por su cuenta: hay que pasarlos.
 */
export const PARAMETROS_CORTE_VIDEO: ParametrosCorte = {
  saneamientoInicialMm: 30,
  saneamientoFinalMm: 30,
  discoIngleteMm: 7,
  discoRectoMm: 5,
}

export function validarParametrosCorte(p: ParametrosCorte): void {
  const campos: [keyof ParametrosCorte, number][] = [
    ['saneamientoInicialMm', p.saneamientoInicialMm],
    ['saneamientoFinalMm', p.saneamientoFinalMm],
    ['discoIngleteMm', p.discoIngleteMm],
    ['discoRectoMm', p.discoRectoMm],
  ]
  for (const [nombre, valor] of campos) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error(`${nombre} debe ser un número ≥ 0, recibido: ${valor}`)
    }
  }
}

/**
 * Longitud realmente utilizable de una barra tras sanear las dos puntas.
 *
 * No es una regla inventada: es la definición del saneamiento de punta. Se
 * ofrece como helper para que quien llame al optimizador decida si optimiza
 * sobre la barra bruta o sobre la aprovechable; el ensamblado de la hoja no lo
 * decide por él.
 */
export function longitudAprovechableMm(
  longitudBarraMm: number,
  parametros: ParametrosCorte,
): number {
  validarParametrosCorte(parametros)
  if (!Number.isFinite(longitudBarraMm) || longitudBarraMm <= 0) {
    throw new Error(`longitudBarraMm debe ser un número positivo, recibido: ${longitudBarraMm}`)
  }
  return redondearMm(
    longitudBarraMm - parametros.saneamientoInicialMm - parametros.saneamientoFinalMm,
  )
}

/** Redondeo a la milésima de mm, como en `optimizar.ts`, contra el ruido binario. */
export function redondearMm(mm: number): number {
  return Math.round(mm * 1000) / 1000
}
