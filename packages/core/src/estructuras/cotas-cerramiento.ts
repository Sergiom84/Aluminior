/**
 * Cotas de instancia por elemento del cerramiento (GR1: fijo inferior FI y
 * fijo superior FS de VEstructurasVariables).
 *
 * Se separa de `fiMm` (v2, exclusivo de la geometría visual de 1OFI y su
 * bloqueo de valoración) para admitir `FI` y `FS` en cualquier módulo de una
 * composición v3 (`1OFI`, `2OFI`, `2O+1OFI`, `1FS`, `1PFS`, `2OPFS`…) sin
 * alterar los snapshots v1/v2/v3 ya guardados.
 */
import type { ModuloCerramiento } from './cerramiento.ts'
import { cotasDisenoPropioModulo } from './diseno-propio-cerramiento.ts'

export const SIMBOLOS_COTA_ALTO = ['FI', 'FS', 'VS'] as const
export const SIMBOLOS_COTA_ANCHO = ['TD', 'F', 'FD', 'FZ'] as const
export const SIMBOLOS_COTA_MODULO = [...SIMBOLOS_COTA_ALTO, ...SIMBOLOS_COTA_ANCHO] as const
export type SimboloCotaModulo = (typeof SIMBOLOS_COTA_MODULO)[number]
export type CotasModulo = Readonly<Partial<Record<SimboloCotaModulo, number>>>
/** `null` quita el símbolo y vuelve al valor del catálogo. */
export type CambiosCotasModulo = Partial<Record<SimboloCotaModulo, number | null>>

/** Fila de `estructura_cotas` que el panel puede mostrar. Sin I/O. */
export interface CotaCatalogo {
  simbolo: SimboloCotaModulo
  nombre: string | null
  valorPorDefecto: number | null
  orientacion: string | null
}
export type CotasCatalogoPorEstructura = Readonly<Record<string, readonly CotaCatalogo[]>>

export function cotasModuloValidas(valor: unknown, altoMm: number, anchoMm = altoMm): valor is CotasModulo | undefined {
  if (valor === undefined) return true
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return false
  const entradas = Object.entries(valor)
  return entradas.length > 0 && entradas.every(([simbolo, cota]) => {
    if (!(SIMBOLOS_COTA_MODULO as readonly string[]).includes(simbolo)) return false
    const limite = (SIMBOLOS_COTA_ANCHO as readonly string[]).includes(simbolo) ? anchoMm : altoMm
    return typeof cota === 'number' && Number.isFinite(cota) && cota > 0 && cota < limite
  })
}

/**
 * Cotas que recibe el motor de despiece para el módulo: prioriza `cotas`,
 * conserva `fiMm` como `FI` cuando esté presente y toma las cotas variables
 * por defecto del diseño propio (`TipoCota = 1` en `disenoPropio`).
 */
export function cotasEfectivasModulo(
  modulo: Pick<ModuloCerramiento, 'fiMm' | 'cotas' | 'disenoPropio'>,
): Readonly<Record<string, number>> | null {
  const cotas: Record<string, number> = { ...cotasDisenoPropioModulo(modulo) }
  if (typeof modulo.fiMm === 'number' && Number.isFinite(modulo.fiMm)) cotas.FI = modulo.fiMm
  if (modulo.cotas) {
    for (const [simbolo, valor] of Object.entries(modulo.cotas)) {
      if (typeof valor === 'number' && Number.isFinite(valor)) cotas[simbolo] = valor
    }
  }
  return Object.keys(cotas).length ? cotas : null
}
