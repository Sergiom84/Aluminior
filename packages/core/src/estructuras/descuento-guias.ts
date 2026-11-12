/**
 * Estrechamiento de la ventana por las guías de persiana del compacto.
 *
 * Cada conjunto de guía (familia 051) trae en `Conjuntos.DescuentoGuia` los mm
 * que quita al ancho de la ventana. Productor resta el de cada guía colocada;
 * el compacto sigue midiendo el hueco entero.
 *
 * Contrastado en Productor el 12/11/2026 (empresa de pruebas, presupuesto 260504):
 * 2O de 1.200 con GMG010 a ambos lados queda en 1.094 (2 × 53) y con PSG002 solo
 * a la izquierda en 1.160 (40). El presupuesto 970 de EMP0016 da lo mismo en su
 * primera pieza (1.070 → 964) y, en las tres siguientes de la fila, un solo
 * descuento (1.469 → 1.416; 1.070 → 1.017): la guía izquierda no descuenta cuando
 * la pieza tiene otra a su izquierda. Esta segunda parte sale de ese único
 * documento.
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
