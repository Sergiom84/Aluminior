import { plantillaDiseno, resolverGeometriaComposicion } from '@aluminior/core/estructuras'

/** La vía de estructura simple respeta la misma geometría que una GRUPO. */
export function erroresMedidasCatalogo(entrada: {
  codigo: string; anchoMm: number | null; altoMm: number | null; cotas?: Record<string, number>
}): Record<string, string[]> | null {
  // Las fórmulas del catálogo validan las cotas de instancia. El dibujo solo
  // conoce las cotas estándar y no puede invalidar una instancia distinta.
  if (entrada.cotas && Object.keys(entrada.cotas).length) return null
  const plantilla = plantillaDiseno(entrada.codigo)
  // Los modelos todavía no dibujables conservan su validación de valoración.
  if (!plantilla || entrada.anchoMm === null || entrada.altoMm === null) return null
  const geometria = resolverGeometriaComposicion(plantilla.composicion, entrada.anchoMm, entrada.altoMm)
  if (geometria.valido) return null
  const campo = geometria.campo ?? (geometria.motivo === 'ancho-invalido' ? 'anchoMm' : 'altoMm')
  return { [campo]: ['Las medidas no admiten las cotas de esta estructura.'] }
}
