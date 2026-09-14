import { compararDecimal } from '../../precios/decimal.ts'

export function objeto(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}
export function texto(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}
export const textoNullable = (v: unknown): v is string | null => v === null || texto(v)
export const entero = (v: unknown): v is number => Number.isSafeInteger(v) && Number(v) >= 0
export const tarifa = (v: unknown): v is number => entero(v) && v >= 1 && v <= 32767
export const variante = (v: unknown): v is '1' | '2' => v === '1' || v === '2'

/** Rechaza pérdida de precisión ANTES de llegar a numeric(p,s). */
export function decimal(v: unknown, precision = 12, escala = 4): v is string {
  if (typeof v !== 'string' || v.length > precision + 2) return false
  const partes = /^(0|[1-9]\d*)(?:\.(\d+))?$/.exec(v)
  return !!partes && partes[1].length <= precision - escala &&
    (partes[2]?.length ?? 0) <= escala
}
export const decimalNullable = (v: unknown, p = 12, s = 4): v is string | null =>
  v === null || decimal(v, p, s)
export function positivo(v: unknown, p: number, s: number): v is string {
  return decimal(v, p, s) && compararDecimal(v, '0') > 0
}
export function unicos<T>(valores: readonly T[], clave: (v: T) => unknown): boolean {
  const claves = valores.map(v => JSON.stringify(clave(v)))
  return new Set(claves).size === claves.length
}
