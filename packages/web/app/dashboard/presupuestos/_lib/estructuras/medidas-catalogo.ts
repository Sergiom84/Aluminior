import { plantillaDiseno, resolverGeometriaComposicion } from '@aluminior/core/estructuras'

/** La vía de estructura simple respeta la misma geometría que una GRUPO. */
export function erroresMedidasCatalogo(entrada: {
  codigo: string; anchoMm: number | null; altoMm: number | null
}): Record<string, string[]> | null {
  const plantilla = plantillaDiseno(entrada.codigo)
  // Los modelos todavía no dibujables conservan su validación de valoración.
  if (!plantilla || entrada.anchoMm === null || entrada.altoMm === null) return null
  const geometria = resolverGeometriaComposicion(plantilla.composicion, entrada.anchoMm, entrada.altoMm)
  if (geometria.valido) return null
  const campo = geometria.motivo === 'ancho-invalido' ? 'anchoMm' : 'altoMm'
  return { [campo]: ['Las medidas no admiten las cotas de esta estructura.'] }
}
