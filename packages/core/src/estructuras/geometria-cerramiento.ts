import { type ConfiguracionCerramiento, medidasCerramiento } from './cerramiento.ts'
import { distribuirModuloCerramiento } from './geometria-modulo-cerramiento.ts'
import { posicionesCerramiento } from './composicion-cerramiento.ts'
import type { ElementoColocado, RectVisual } from './diseno.ts'

export interface ModuloGeometriaCerramiento {
  id: string
  rect: RectVisual
  elementos: readonly ElementoColocado[]
}

export interface UnionGeometriaCerramiento {
  id: string
  codigo: string
  rect: RectVisual
}

export interface GeometriaCerramiento {
  anchoMm: number
  altoContractualMm: number
  /** Caja que incluye uniones más largas que los elementos; no cambia la medida contractual. */
  anchoVisibleMm: number
  altoVisibleMm: number
  modulos: readonly ModuloGeometriaCerramiento[]
  uniones: readonly UnionGeometriaCerramiento[]
}

/** Geometría física común. No contiene píxeles ni decisiones del soporte. */
export function geometriaCerramiento(configuracion: ConfiguracionCerramiento): GeometriaCerramiento {
  const medidas = medidasCerramiento(configuracion)
  const posiciones = posicionesCerramiento(configuracion)
  const modulos = configuracion.modulos.map((modulo) => {
    const rect = posiciones.modulos.get(modulo.id)!
    return { id: modulo.id, rect, elementos: distribuirModuloCerramiento(modulo, rect) }
  })
  const uniones = configuracion.uniones.flatMap((union) => {
    const rect = posiciones.uniones.get(union.id)
    return rect ? [{ id: union.id, codigo: union.codigo, rect }] : []
  })
  const rects = [...modulos, ...uniones].map((item) => item.rect)
  return {
    anchoMm: medidas.anchoMm, altoContractualMm: medidas.altoMm,
    anchoVisibleMm: Math.max(medidas.anchoMm, ...rects.map((rect) => rect.x + rect.ancho)),
    altoVisibleMm: Math.max(medidas.altoMm, ...rects.map((rect) => rect.y + rect.alto)),
    modulos, uniones,
  }
}

export interface ProyeccionCerramiento {
  escala: number
  origenX: number
  origenY: number
  transformar: (rect: RectVisual) => RectVisual
}

/** Una única transformación uniforme para cualquier viewport. */
export function proyectarCerramiento(
  geometria: GeometriaCerramiento,
  viewport: { ancho: number; alto: number; margenX?: number; margenY?: number },
): ProyeccionCerramiento {
  const margenX = viewport.margenX ?? 0
  const margenY = viewport.margenY ?? 0
  const disponibleX = viewport.ancho - margenX * 2
  const disponibleY = viewport.alto - margenY * 2
  const valores = [geometria.anchoVisibleMm, geometria.altoVisibleMm, disponibleX, disponibleY]
  if (!valores.every((valor) => Number.isFinite(valor) && valor > 0)) {
    throw new Error('Las medidas del cerramiento no son representables')
  }
  const escala = Math.min(disponibleX / geometria.anchoVisibleMm, disponibleY / geometria.altoVisibleMm)
  const origenX = margenX + (disponibleX - geometria.anchoVisibleMm * escala) / 2
  const origenY = margenY + (disponibleY - geometria.altoVisibleMm * escala) / 2
  const redondear = (valor: number) => Math.round(valor * 1e10) / 1e10
  return { escala, origenX, origenY, transformar: (rect) => ({
    x: redondear(origenX + rect.x * escala), y: redondear(origenY + rect.y * escala),
    ancho: redondear(rect.ancho * escala), alto: redondear(rect.alto * escala),
  }) }
}
