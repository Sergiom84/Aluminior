/**
 * Selección de líneas de la copia.
 *
 * Evidencia (§8): el diálogo tiene una pestaña «Selección de Líneas» que
 * permite aplicar el cambio sólo a algunas; en el ejemplo del vídeo se aplica
 * a todas.
 *
 * Distinción que el motor debe respetar: seleccionar afecta a QUÉ líneas se
 * modifican, no a cuáles se copian. Una selección vacía produce una copia
 * completa del documento sin ninguna sustitución, nunca un documento con
 * menos líneas.
 */

export type SeleccionLineas =
  | { readonly modo: 'TODAS' }
  | { readonly modo: 'SUBCONJUNTO'; readonly lineaIds: ReadonlySet<string> }

export const TODAS_LAS_LINEAS: SeleccionLineas = { modo: 'TODAS' }

/** Subconjunto explícito. Con la lista vacía no se modifica ninguna línea. */
export function seleccionDeLineas(lineaIds: Iterable<string>): SeleccionLineas {
  return { modo: 'SUBCONJUNTO', lineaIds: new Set(lineaIds) }
}

export function lineaSeleccionada(seleccion: SeleccionLineas, lineaId: string): boolean {
  return seleccion.modo === 'TODAS' || seleccion.lineaIds.has(lineaId)
}

/** Ids pedidos que no existen en el documento origen. Se informan, no se ignoran. */
export function seleccionSobrante(
  seleccion: SeleccionLineas,
  lineaIdsExistentes: Iterable<string>,
): readonly string[] {
  if (seleccion.modo === 'TODAS') return []
  const existentes = new Set(lineaIdsExistentes)
  return [...seleccion.lineaIds].filter((id) => !existentes.has(id))
}
