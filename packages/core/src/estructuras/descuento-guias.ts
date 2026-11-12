/**
 * Estrechamiento de la ventana por las guías de persiana del compacto.
 *
 * Cada conjunto de guía (familia 051) trae en `Conjuntos.DescuentoGuia` los mm
 * que quita al ancho de la ventana. Productor resta el de cada guía colocada;
 * el compacto sigue midiendo el hueco entero.
 *
 * Contrastado en Productor el 12/11/2026 (empresa de pruebas, presupuesto 260504):
 * 2O de 1.200 con GMG010 a ambos lados queda en 1.094 (2 × 53) y con PSG002 solo
 * a la izquierda en 1.160 (40). En cerramientos de varias columnas, la primera
 * pieza por la izquierda descuenta ambas guías y las siguientes con otra pieza a
 * su izquierda descuentan una sola (`guiaDerecha`), incluso cuando la pieza
 * contigua izquierda no lleva compacto: confirmado en 21 cerramientos multicolumna
 * (59 módulos con guías) de EMP0013–EMP0016 (en EMP0016: presupuestos 970 y 1034,
 * albarán 280 y factura 365, 1.070 → 964 en el primer módulo y 1.469 → 1.416,
 * 1.070 → 1.017 en los tres siguientes; en EMP0013: 14 GRUPO, incluidos 159 y 269
 * con fijo sin compacto a la izquierda; en EMP0014: 8 GRUPO, incluidos 1042 y 1074).
 *
 * Valores de `Conjuntos.csv` de EMP0016. Una guía ausente de la tabla no descuenta.
 */
import type { ConfiguracionCerramiento } from './cerramiento.ts'
import type { CompactoModulo } from './compacto-cerramiento.ts'
import { posicionesCerramiento } from './composicion-cerramiento.ts'

export const DESCUENTO_GUIA_MM: Readonly<Record<string, number>> = {
  GMG001: 40.5, GMG002: 40.5, GMG003: 40.5, GMG004: 40.5, GMG005: 0, GMG006: 2, GMG007: 2, GMG008: 2,
  GMG009: 0, GMG010: 53, GMG011: 53, GMG012: 53, GMG013: 53, GMG014: 53,
  PSG001: 40, PSG002: 40, PSG003: 40, PSG004: 40, PSG005: 40, PSG006: 45, PSG007: 46, PSG008: 45,
  PSG009: 45, PSG010: 47.5, PSG011: 1.5, G: 0,
}

const descuento = (guia: string | undefined) => DESCUENTO_GUIA_MM[guia?.trim().toUpperCase() ?? ''] ?? 0

/** Mm que las guías quitan al ancho de la ventana; 0 si el compacto no descuenta del hueco. */
export function descuentoGuiasCompactoMm(
  compacto: Pick<CompactoModulo, 'descontarHueco' | 'guiaIzquierda' | 'guiaDerecha'> | null | undefined,
  piezaALaIzquierda = false,
): number {
  if (!compacto?.descontarHueco) return 0
  return (piezaALaIzquierda ? 0 : descuento(compacto.guiaIzquierda)) + descuento(compacto.guiaDerecha)
}

/** Módulos que tienen otra pieza a su izquierda a la misma altura. */
export function modulosConPiezaALaIzquierda(configuracion: ConfiguracionCerramiento): ReadonlySet<string> {
  const rects = [...posicionesCerramiento(configuracion).modulos]
  return new Set(rects.filter(([id, r]) => rects.some(([otro, o]) =>
    otro !== id && o.x < r.x && o.y < r.y + r.alto && r.y < o.y + o.alto)).map(([id]) => id))
}
