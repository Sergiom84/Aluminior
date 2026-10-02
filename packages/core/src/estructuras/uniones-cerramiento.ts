import { UNIONES_VISUALES } from './diseno.ts'
import { UNION_SIN_CONFIGURAR, unionConfigurada } from './composicion-cerramiento.ts'
import type { ConfiguracionCerramiento, UnionCerramiento } from './cerramiento.ts'

/** El grosor pertenece al catálogo; no se deriva del nombre comercial. */
export function unionConGrosorCatalogo(union: UnionCerramiento): UnionCerramiento {
  const catalogo = unionConfigurada(union)
    ? UNIONES_VISUALES.find(item => item.codigo === union.codigo)
    : UNION_SIN_CONFIGURAR
  return catalogo ? { ...union, grosorMm: catalogo.grosorMm } : union
}

/** Solo en edición/alta. Leer un snapshot histórico no cambia sus medidas. */
export function normalizarUnionesCerramiento(configuracion: ConfiguracionCerramiento): ConfiguracionCerramiento {
  return { ...configuracion, uniones: configuracion.uniones.map(unionConGrosorCatalogo) }
}
