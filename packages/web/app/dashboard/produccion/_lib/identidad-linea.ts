/** El orden comercial distingue ubicaciones repetidas sin exponer UUID al taller. */
export function etiquetaLineaProduccion(linea: { orden: number; referencia: string | null }): string {
  return `Línea ${linea.orden}${linea.referencia ? ` · ${linea.referencia}` : ''}`
}
