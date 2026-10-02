import { plantillaDiseno } from '@aluminior/core/estructuras'

/**
 * Indica si una composición enviada por el navegador usa estructuras que aún
 * no están registradas. Solo entonces merece la pena leer el catálogo antes de
 * validar: una entrada malformada se rechaza sin abrir conexión.
 */
export function necesitaCatalogoDiseno(configuracionSerializada: string | null | undefined): boolean {
  let valor: unknown
  try {
    valor = JSON.parse(configuracionSerializada ?? '')
  } catch {
    return false
  }
  const modulos = (valor as { modulos?: unknown } | null)?.modulos
  if (!Array.isArray(modulos)) return false
  return modulos.some((modulo) => typeof modulo?.estructuraCodigo === 'string' &&
    !plantillaDiseno(modulo.estructuraCodigo))
}
