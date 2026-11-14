import {
  actualizarDisenoPropioModuloCerramiento, esConfiguracionCerramiento,
  type ConfiguracionCerramiento, type DisenoPropioModulo,
} from '@aluminior/core/estructuras'

type Catalogo = Parameters<typeof esConfiguracionCerramiento>[1]

/**
 * Aplica el diseño y devuelve la configuración nueva, o `null` si el núcleo
 * lo rechaza. Un rechazo devuelve la misma configuración: no se puede tomar
 * por un guardado.
 */
export function configuracionTrasAceptarDiseno(
  configuracion: ConfiguracionCerramiento,
  id: string,
  diseno: DisenoPropioModulo | null,
  catalogo: Catalogo,
): ConfiguracionCerramiento | null {
  const siguiente = actualizarDisenoPropioModuloCerramiento(configuracion, id, diseno)
  if (diseno !== null && siguiente === configuracion) return null
  if (!esConfiguracionCerramiento(siguiente, catalogo)) return null
  return siguiente
}
