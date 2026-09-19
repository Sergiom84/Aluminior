/**
 * Compacto de persiana en la edición de línea: altura de cajón propuesta.
 *
 * Evidencia: CHM 5.3.1.3.2 («el programa rellenará automáticamente la altura de
 * cajón en función de la altura de la estructura actual y de la configuración
 * de la ficha del compacto»), CHM 5.1.2.13.1.1 (tabla `Alto Cajón / Altura
 * Desde / Altura Hasta`, casilla `Descontar cajón a la medida de hueco` y
 * `Dto. Vert. adicional a hueco`, con el ejemplo 1000x1000 -> ventana
 * 1000x845 con cajón 155) y vídeo de Javi 05:05 (155, y 185 por encima de
 * 1,60 m). Datos: `VAccesorios.AltoCajon` toma 155, 185 y 200.
 *
 * La tabla de tramos de cada compacto no está en la exportación revisada: se
 * recibe como entrada. El operador puede forzar otra altura; eso lo guarda la
 * línea, no esta función.
 */

export interface TramoAlturaCajon {
  readonly altoCajonMm: number
  /** Altura de la estructura desde la que aplica, incluida. */
  readonly desdeMm: number
  /** Altura de la estructura hasta la que aplica, incluida. */
  readonly hastaMm: number
}

/** Altura de cajón para un alto dado; `null` si ningún tramo lo cubre. */
export function alturaCajonCompacto(
  tramos: readonly TramoAlturaCajon[],
  altoEstructuraMm: number,
): number | null {
  const tramo = tramos.find((t) => altoEstructuraMm >= t.desdeMm && altoEstructuraMm <= t.hastaMm)
  return tramo ? tramo.altoCajonMm : null
}

export interface MedidasConCompacto {
  readonly compacto: { anchoMm: number; altoMm: number }
  readonly ventana: { anchoMm: number; altoMm: number }
}

/**
 * Reparto de la medida de hueco entre compacto y ventana (CHM 5.1.2.13.1.1).
 *
 * Con `descontarCajon` el cajón va dentro del hueco: el compacto ocupa el
 * hueco y la ventana pierde el cajón y el descuento adicional. Sin él, el
 * cajón va por encima: la ventana ocupa el hueco y el compacto crece.
 *
 * HIPÓTESIS: el descuento adicional sólo se aplica cuando se descuenta el
 * cajón; el manual lo define como adicional «a la altura de cajón».
 */
export function medidasConCompacto(entrada: {
  anchoHuecoMm: number
  altoHuecoMm: number
  altoCajonMm: number
  descontarCajon: boolean
  descuentoAdicionalMm?: number
}): MedidasConCompacto {
  const { anchoHuecoMm, altoHuecoMm, altoCajonMm, descontarCajon } = entrada
  if (descontarCajon) {
    return {
      compacto: { anchoMm: anchoHuecoMm, altoMm: altoHuecoMm },
      ventana: { anchoMm: anchoHuecoMm, altoMm: altoHuecoMm - altoCajonMm - (entrada.descuentoAdicionalMm ?? 0) },
    }
  }
  return {
    compacto: { anchoMm: anchoHuecoMm, altoMm: altoHuecoMm + altoCajonMm },
    ventana: { anchoMm: anchoHuecoMm, altoMm: altoHuecoMm },
  }
}
