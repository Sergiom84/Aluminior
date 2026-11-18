import { UNIONES_VISUALES, type UnionVisual } from './diseno.ts'
import { UNION_SIN_CONFIGURAR, unionConfigurada } from './composicion-cerramiento.ts'
import { aplicarGrosorCatalogo } from './catalogo-uniones.ts'
import { asignarMaterialesUnion } from './materiales-cerramiento.ts'
import type { ConfiguracionCerramiento, UnionCerramiento } from './cerramiento.ts'

/** El grosor pertenece al catálogo; no se deriva del nombre comercial. */
export function unionConGrosorCatalogo(
  union: UnionCerramiento,
  catalogo: readonly UnionVisual[] = UNIONES_VISUALES,
): UnionCerramiento {
  if (!unionConfigurada(union)) return { ...union, grosorMm: UNION_SIN_CONFIGURAR.grosorMm }
  return aplicarGrosorCatalogo(union, catalogo)
}

/**
 * «Actualizar todas las uniones» de Productor: el código de la unión origen
 * (con el grosor de su catálogo) y sus dos acabados pasan a todas las demás.
 * Cada unión conserva su longitud, que es la de su lado, y su serie: el panel
 * de unión no tiene serie. Evidencia e hipótesis en fase-4/01.
 */
export function actualizarTodasLasUniones(
  configuracion: ConfiguracionCerramiento,
  origenId: string,
  catalogo: readonly UnionVisual[] = UNIONES_VISUALES,
): ConfiguracionCerramiento {
  const origen = configuracion.uniones.find(union => union.id === origenId)
  if (!origen) return configuracion
  const acabados = {
    acabadoCodigo: origen.materiales?.acabadoCodigo ?? null,
    acabadoAccesoriosCodigo: origen.materiales?.acabadoAccesoriosCodigo ?? null,
  }
  let siguiente: ConfiguracionCerramiento = { ...configuracion, uniones: configuracion.uniones.map(union =>
    union.id === origenId ? union : unionConGrosorCatalogo({ ...union, codigo: origen.codigo }, catalogo)) }
  for (const union of siguiente.uniones) {
    if (union.id !== origenId) siguiente = asignarMaterialesUnion(siguiente, union.id, acabados)
  }
  return siguiente
}

/** Solo en edición/alta. Leer un snapshot histórico no cambia sus medidas. */
export function normalizarUnionesCerramiento(
  configuracion: ConfiguracionCerramiento,
  catalogo: readonly UnionVisual[] = UNIONES_VISUALES,
): ConfiguracionCerramiento {
  return { ...configuracion, uniones: configuracion.uniones.map(union => unionConGrosorCatalogo(union, catalogo)) }
}
