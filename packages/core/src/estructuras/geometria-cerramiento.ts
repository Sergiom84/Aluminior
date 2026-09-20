import { type ConfiguracionCerramiento, medidasCerramiento } from './cerramiento.ts'
import { distribuirModuloCerramiento } from './geometria-modulo-cerramiento.ts'
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
  altoVisibleMm: number
  modulos: readonly ModuloGeometriaCerramiento[]
  uniones: readonly UnionGeometriaCerramiento[]
}

/** Geometría física común. No contiene píxeles ni decisiones del soporte. */
export function geometriaCerramiento(configuracion: ConfiguracionCerramiento): GeometriaCerramiento {
  const medidas = medidasCerramiento(configuracion)
  const altoVisibleMm = Math.max(medidas.altoMm, ...configuracion.uniones.map((union) => union.longitudMm))
  let cursor = 0
  const modulos = configuracion.modulos.map((modulo, indice) => {
    const rect = { x: cursor, y: 0, ancho: modulo.anchoMm, alto: modulo.altoMm }
    const elementos = distribuirModuloCerramiento(modulo, rect)
    cursor += modulo.anchoMm + (configuracion.uniones[indice]?.grosorMm ?? 0)
    return { id: modulo.id, rect, elementos }
  })
  cursor = 0
  const uniones = configuracion.uniones.map((union, indice) => {
    cursor += configuracion.modulos[indice].anchoMm
    const rect = { x: cursor, y: 0, ancho: union.grosorMm, alto: union.longitudMm }
    cursor += union.grosorMm
    return { id: union.id, codigo: union.codigo, rect }
  })
  return { anchoMm: medidas.anchoMm, altoContractualMm: medidas.altoMm, altoVisibleMm, modulos, uniones }
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
  const valores = [geometria.anchoMm, geometria.altoVisibleMm, disponibleX, disponibleY]
  if (!valores.every((valor) => Number.isFinite(valor) && valor > 0)) {
    throw new Error('Las medidas del cerramiento no son representables')
  }
  const escala = Math.min(disponibleX / geometria.anchoMm, disponibleY / geometria.altoVisibleMm)
  const origenX = margenX + (disponibleX - geometria.anchoMm * escala) / 2
  const origenY = margenY + (disponibleY - geometria.altoVisibleMm * escala) / 2
  const redondear = (valor: number) => Math.round(valor * 1e10) / 1e10
  return { escala, origenX, origenY, transformar: (rect) => ({
    x: redondear(origenX + rect.x * escala), y: redondear(origenY + rect.y * escala),
    ancho: redondear(rect.ancho * escala), alto: redondear(rect.alto * escala),
  }) }
}
