/** Cotas explícitas del caso de uso. La procedencia se resuelve antes de llamarlo. */
export function validarCotasEntrada(entrada: unknown):
  { ok: true; cotas: Record<string, number> } | { ok: false; error: string } {
  if (entrada === undefined) return { ok: true, cotas: {} }
  if (entrada === null || typeof entrada !== 'object' || Array.isArray(entrada)) {
    return { ok: false, error: 'Cotas de instancia inválidas' }
  }
  const cotas: Record<string, number> = {}
  for (const [clave, valor] of Object.entries(entrada)) {
    const simbolo = clave.trim().toUpperCase()
    if (!/^[A-Z][A-Z0-9_]*$/.test(simbolo) || ['A', 'L', 'REF'].includes(simbolo) ||
      typeof valor !== 'number' || !Number.isFinite(valor)) {
      return { ok: false, error: 'Cota no finita, símbolo inválido o reservado' }
    }
    if (cotas[simbolo] !== undefined && cotas[simbolo] !== valor) {
      return { ok: false, error: 'Cotas duplicadas incompatibles' }
    }
    cotas[simbolo] = valor
  }
  return { ok: true, cotas }
}
