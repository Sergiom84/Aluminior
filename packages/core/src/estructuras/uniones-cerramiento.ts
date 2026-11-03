import { UNIONES_VISUALES, type UnionVisual } from './diseno.ts'
import { UNION_SIN_CONFIGURAR, unionConfigurada } from './composicion-cerramiento.ts'
import { aplicarGrosorCatalogo } from './catalogo-uniones.ts'
import type { ConfiguracionCerramiento, UnionCerramiento } from './cerramiento.ts'

/** El grosor pertenece al catálogo; no se deriva del nombre comercial. */
export function unionConGrosorCatalogo(
  union: UnionCerramiento,
  catalogo: readonly UnionVisual[] = UNIONES_VISUALES,
): UnionCerramiento {
  if (!unionConfigurada(union)) return { ...union, grosorMm: UNION_SIN_CONFIGURAR.grosorMm }
  return aplicarGrosorCatalogo(union, catalogo)
}

/** Solo en edición/alta. Leer un snapshot histórico no cambia sus medidas. */
export function normalizarUnionesCerramiento(
  configuracion: ConfiguracionCerramiento,
  catalogo: readonly UnionVisual[] = UNIONES_VISUALES,
): ConfiguracionCerramiento {
  return { ...configuracion, uniones: configuracion.uniones.map(union => unionConGrosorCatalogo(union, catalogo)) }
}
