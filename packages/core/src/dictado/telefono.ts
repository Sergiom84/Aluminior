/**
 * Teléfono español en 9 cifras. Quita espacios, guiones y el prefijo +34/0034.
 * Devuelve null si no queda un número nacional válido.
 */
export function normalizarTelefono(valor: string | null | undefined): string | null {
  if (!valor) return null
  let cifras = valor.replace(/\D/g, '')
  if (cifras.length === 13 && cifras.startsWith('0034')) cifras = cifras.slice(4)
  else if (cifras.length === 11 && cifras.startsWith('34')) cifras = cifras.slice(2)
  return /^[6789]\d{8}$/.test(cifras) ? cifras : null
}

/** 612345678 -> 612 345 678 */
export function formatearTelefono(cifras: string): string {
  return `${cifras.slice(0, 3)} ${cifras.slice(3, 6)} ${cifras.slice(6)}`
}
