/**
 * Opciones de herraje marcadas por conjunto para evaluar asociaciones.
 *
 * Si el documento guardó la selección de un conjunto, manda esa selección.
 * Si no guardó ninguna fila de ese conjunto, rige `SelecDefSN` del catálogo:
 * las líneas facturadas sin selección guardada llevan exactamente los
 * asociados de las opciones por defecto (C2 GMC400, 34 de 34).
 */

export interface OpcionCatalogo {
  conjunto: string
  opcion: string
  porDefecto: boolean
}

export interface SeleccionGuardada {
  conjunto: string
  opcion: string
  marcada: boolean
}

export function opcionesMarcadas(
  conjuntos: readonly string[],
  catalogo: readonly OpcionCatalogo[],
  guardadas: readonly SeleccionGuardada[],
): Map<string, Set<string>> {
  const resultado = new Map<string, Set<string>>()
  for (const conjunto of new Set(conjuntos)) {
    const propias = guardadas.filter(g => g.conjunto === conjunto)
    const marcadas = propias.length
      ? propias.filter(g => g.marcada).map(g => g.opcion)
      : catalogo.filter(o => o.conjunto === conjunto && o.porDefecto).map(o => o.opcion)
    resultado.set(conjunto, new Set(marcadas.map(o => String(Number(o)))))
  }
  return resultado
}
