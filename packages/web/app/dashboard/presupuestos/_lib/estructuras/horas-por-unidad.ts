/**
 * Horas manuales por unidad de una estructura (`HorasAdFabr`, `HorasColoc`).
 *
 * En EMP0016, 117/117 estructuras independientes con `Cdad` > 1 y horas llevan
 * MO (fabricación) y MOCOL (colocación) en el despiece de cada unidad, en
 * minutos, e `ImporteTotal = Cdad × Precio` (BANCO-CONTRASTE, iteración 5).
 * El motor de catálogo las valora; la vía anterior no sabe hacerlo y las
 * conserva como piezas sin valorar para que la línea quede incompleta, nunca
 * con un total que las omita.
 */

import { multiplicarDecimal, normalizarDecimal } from '@aluminior/core/precios'
import type { PiezaDespiece } from '../lineas/guardar-linea.ts'

export const MOTIVO_HORAS_SIN_CATALOGO = 'horas por unidad sin valorar: necesitan el catálogo de despiece completo'

/** Horas tecleadas a dos decimales -> minutos exactos (6,07 h = 364,2 min, SPEC-MANO-DE-OBRA §13). */
export function minutosDeHoras(horas: string | null | undefined): number {
  if (!horas?.trim()) return 0
  const valor = Number(multiplicarDecimal(normalizarDecimal(horas, 2), '60', 2))
  if (!Number.isFinite(valor) || valor < 0) throw new Error('Horas manuales no válidas')
  return valor
}

export interface HorasPorUnidad {
  horasFabricacion?: string | null
  horasColocacion?: string | null
  /** Acabado de accesorios, el mismo que les da el motor de catálogo; omitido, UNI. */
  acabadoAccesoriosCodigo?: string | null
}

/** Filas MO y MOCOL de una unidad, sin coste: la vía anterior no las valora. */
export function piezasHorasSinValorar(h: HorasPorUnidad): PiezaDespiece[] {
  return ([['MO', minutosDeHoras(h.horasFabricacion)], ['MOCOL', minutosDeHoras(h.horasColocacion)]] as const)
    .filter(([, minutos]) => minutos > 0)
    .map(([codigo, minutos]) => ({
      articuloCodigo: codigo, acabadoCodigo: h.acabadoAccesoriosCodigo || 'UNI', cantidad: String(minutos), largoCorteMm: null,
      anguloIzquierdo: null, anguloDerecho: null, funcion: codigo, costeUnitario: null, costeTotal: null,
    }))
}
