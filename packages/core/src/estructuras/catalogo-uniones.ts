import { UNIONES_VISUALES, type UnionVisual } from './diseno.ts'
import { unionConfigurada } from './composicion-cerramiento.ts'
import type { UnionCerramiento } from './cerramiento.ts'

/** El catálogo inyectado manda; `UNIONES_VISUALES` solo cubre lo que aquel no trae. */
export function fusionarCatalogoUniones(
  cargadas: readonly UnionVisual[],
  reserva: readonly UnionVisual[] = UNIONES_VISUALES,
): UnionVisual[] {
  const porCodigo = new Map(reserva.map(union => [union.codigo, union]))
  for (const union of cargadas) porCodigo.set(union.codigo, { ...porCodigo.get(union.codigo), ...union })
  return [...porCodigo.values()].sort((a, b) => a.codigo.localeCompare(b.codigo, 'es'))
}

export function buscarUnion(catalogo: readonly UnionVisual[], codigo: string) {
  return catalogo.find(union => union.codigo === codigo)
}

/** Sin serie concreta, una unión limitada no se ofrece. */
export function unionOfrecida(union: UnionVisual, serieCodigo: string | null): boolean {
  if (!union.seriesEspecificas) return true
  if (!serieCodigo) return false
  return (union.series ?? []).includes(serieCodigo)
}

export function unionesOfrecidas(catalogo: readonly UnionVisual[], serieCodigo: string | null) {
  return catalogo.filter(union => unionOfrecida(union, serieCodigo))
}

/**
 * Lectura de un snapshot ya guardado. Se validó contra el catálogo al escribirse
 * y trae su propio grosor; leerlo no consulta catálogo.
 */
export const CATALOGO_SNAPSHOT = 'SNAPSHOT' as const
export type CatalogoAdmision = readonly UnionVisual[] | typeof CATALOGO_SNAPSHOT

/**
 * Al escribir, el código debe estar en el catálogo recibido o en la reserva.
 * El grosor cero solo es válido en un esquinero (tipo 4) de ese catálogo.
 */
export function unionAdmitida(
  union: Pick<UnionCerramiento, 'codigo' | 'grosorMm'>,
  catalogo: CatalogoAdmision = UNIONES_VISUALES,
): boolean {
  if (!Number.isFinite(union.grosorMm) || union.grosorMm < 0) return false
  if (!unionConfigurada(union)) return union.grosorMm > 0
  if (catalogo === CATALOGO_SNAPSHOT) return true
  const conocida = buscarUnion(catalogo, union.codigo) ?? buscarUnion(UNIONES_VISUALES, union.codigo)
  if (!conocida) return false
  return union.grosorMm > 0 || (union.grosorMm === 0 && conocida.unionTipo === 4)
}

export function aplicarGrosorCatalogo(
  union: UnionCerramiento,
  catalogo: readonly UnionVisual[] = UNIONES_VISUALES,
): UnionCerramiento {
  if (!unionConfigurada(union)) return union
  const conocida = buscarUnion(catalogo, union.codigo) ?? buscarUnion(UNIONES_VISUALES, union.codigo)
  return conocida ? { ...union, grosorMm: conocida.grosorMm } : union
}

/** 400 mm de perfil a 10,30 €/m = 4,12 €. No inventa un cero si falta el precio. */
export function precioLinealUnion(metros: number, eurosPorMetro: number): number | null {
  if (!Number.isFinite(metros) || metros <= 0 || !Number.isFinite(eurosPorMetro) || eurosPorMetro < 0) return null
  return Math.round(metros * eurosPorMetro * 100) / 100
}
