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

export const SIMBOLOS_COTA_ALTO = ['FI', 'FS', 'VS'] as const
export const SIMBOLOS_COTA_ANCHO = ['TD', 'F', 'FD', 'FZ'] as const
export const SIMBOLOS_COTA_MODULO = [...SIMBOLOS_COTA_ALTO, ...SIMBOLOS_COTA_ANCHO] as const
export type SimboloCotaModulo = (typeof SIMBOLOS_COTA_MODULO)[number]
export type CotasModulo = Readonly<Partial<Record<SimboloCotaModulo, number>>>

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
 * Cotas que recibe el motor de despiece para el módulo: prioriza `cotas` y
 * conserva `fiMm` como `FI` cuando esté presente.
 */
export function cotasEfectivasModulo(
  modulo: Pick<ModuloCerramiento, 'fiMm' | 'cotas'>,
): Readonly<Record<string, number>> | null {
  const cotas: Record<string, number> = {}
  if (typeof modulo.fiMm === 'number' && Number.isFinite(modulo.fiMm)) cotas.FI = modulo.fiMm
  if (modulo.cotas) {
    for (const [simbolo, valor] of Object.entries(modulo.cotas)) {
      if (typeof valor === 'number' && Number.isFinite(valor)) cotas[simbolo] = valor
    }
  }
  return Object.keys(cotas).length ? cotas : null
}
