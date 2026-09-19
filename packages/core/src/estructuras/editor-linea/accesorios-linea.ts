/**
 * Accesorios que viven DENTRO de una línea de estructura: compacto y
 * mosquitera (`RECON-CERRAMIENTOS.md` §5, empresa 0017).
 *
 * - El compacto se valora a la medida de hueco (1200 x 1200) y resta el cajón
 *   al alto de la ventana (1200 -> 1045).
 * - La mosquitera se elige con el botón `Mosquiteras` (familia MOSQUITERAS), no
 *   crea línea aparte y se valora a la medida de la ventana tras el cajón
 *   (`PSM001` 1200 x 1045, 1,25 M2 x 56,76 = 70,95).
 * - Aceptar con compacto o registro y sin guías pide confirmación.
 *
 * Sólo artículos por M2 sin precio en tabla: `PSM004` (UD, precio en tabla) y
 * cualquier otra unidad quedan sin valorar en vez de inventar la regla.
 */

import { multiplicarDecimal, type Decimal } from '../../precios/decimal.ts'
import { metrajeSuperficie, type ReglaMetrajeSuperficie } from '../../precios/metraje-superficie.ts'
import { medidasConCompacto } from './compacto.ts'

export interface ArticuloSuperficie extends ReglaMetrajeSuperficie {
  readonly codigo: string
  readonly tipoMetraje: string
  readonly precioEnTabla: boolean
  /** Precio por M2 para la tarifa y el acabado; null si no está tarifado. */
  readonly precio: Decimal | null
}

export interface CompactoLinea {
  readonly altoCajonMm: number
  readonly descontarCajon: boolean
  readonly descuentoAdicionalMm?: number
}

export type AccesorioValorado =
  | {
    readonly completo: true
    readonly anchoMm: number
    readonly altoMm: number
    readonly metraje: Decimal
    readonly importe: Decimal
  }
  | {
    readonly completo: false
    readonly anchoMm: number
    readonly altoMm: number
    readonly metraje: Decimal | null
    readonly importe: null
    readonly incidencia: string
  }

function valorarSuperficie(articulo: ArticuloSuperficie, anchoMm: number, altoMm: number): AccesorioValorado {
  if (articulo.tipoMetraje !== 'M2' || articulo.precioEnTabla) {
    return {
      completo: false, anchoMm, altoMm, metraje: null, importe: null,
      incidencia: `${articulo.codigo}: valoración ${articulo.precioEnTabla ? 'por tabla' : articulo.tipoMetraje} sin regla verificada`,
    }
  }
  const metraje = metrajeSuperficie(anchoMm, altoMm, articulo)
  if (articulo.precio === null) {
    return { completo: false, anchoMm, altoMm, metraje, importe: null, incidencia: `${articulo.codigo}: sin precio en esta tarifa` }
  }
  return { completo: true, anchoMm, altoMm, metraje, importe: multiplicarDecimal(metraje, articulo.precio, 2) }
}

/** Compacto de la línea, valorado a su propia medida (CHM 5.1.2.13.1.1). */
export function valorarCompactoLinea(entrada: {
  anchoHuecoMm: number
  altoHuecoMm: number
  compacto: CompactoLinea
  articulo: ArticuloSuperficie
}): AccesorioValorado {
  const { compacto } = medidasConCompacto({ ...entrada, ...entrada.compacto })
  return valorarSuperficie(entrada.articulo, compacto.anchoMm, compacto.altoMm)
}

/** Mosquitera de la línea, a la medida de la ventana tras el compacto si lo hay. */
export function valorarMosquiteraLinea(entrada: {
  anchoHuecoMm: number
  altoHuecoMm: number
  compacto: CompactoLinea | null
  articulo: ArticuloSuperficie
}): AccesorioValorado {
  const ventana = entrada.compacto
    ? medidasConCompacto({ ...entrada, ...entrada.compacto }).ventana
    : { anchoMm: entrada.anchoHuecoMm, altoMm: entrada.altoHuecoMm }
  return valorarSuperficie(entrada.articulo, ventana.anchoMm, ventana.altoMm)
}

export const AVISO_COMPACTO_SIN_GUIAS =
  'Ha seleccionado Compacto o Registro, pero no ha seleccionado Guías de Persiana. ¿Desea Continuar?'

/**
 * Confirmación previa a aceptar la línea. No bloquea: el operador puede seguir.
 *
 * HIPÓTESIS: basta una guía para no avisar; sólo se observó el caso sin
 * ninguna.
 */
export function avisoCompactoSinGuias(complementos: {
  compacto: string | null
  registro: string | null
  guiaIzquierda: string | null
  guiaDerecha: string | null
}): string | null {
  const conPersiana = Boolean(complementos.compacto?.trim() || complementos.registro?.trim())
  const conGuia = Boolean(complementos.guiaIzquierda?.trim() || complementos.guiaDerecha?.trim())
  return conPersiana && !conGuia ? AVISO_COMPACTO_SIN_GUIAS : null
}
