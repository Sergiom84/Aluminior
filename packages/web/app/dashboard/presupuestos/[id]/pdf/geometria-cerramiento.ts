import {
  esConfiguracionCerramiento, geometriaAperturaVisual, geometriaCerramiento,
  medidasCerramiento, proyectarCerramiento,
  type AperturaVisual, type ConfiguracionCerramiento, type RectVisual,
} from '@aluminior/core/estructuras'

/** Adaptación de coordenadas al soporte PDF; el reparto interior pertenece a core. */
export function geometriaCerramientoPdf(configuracion: ConfiguracionCerramiento, ancho = 240, alto = 150) {
  if (!esConfiguracionCerramiento(configuracion)) throw new Error('Configuración de cerramiento inválida')
  if (!Number.isFinite(ancho) || !Number.isFinite(alto) || ancho < 100 || alto < 80) {
    throw new Error('El dibujo PDF requiere al menos 100 × 80 puntos')
  }
  const medidas = medidasCerramiento(configuracion)
  const geometria = geometriaCerramiento(configuracion)
  const proyeccionBase = (() => {
    try {
      return proyectarCerramiento(geometria, { ancho: ancho - 16, alto: alto - 28 })
    } catch {
      throw new Error('Las medidas del cerramiento no son representables en PDF')
    }
  })()
  const transformar = (rect: RectVisual): RectVisual => {
    const proyectado = proyeccionBase.transformar(rect)
    return { ...proyectado, x: proyectado.x + 8, y: proyectado.y + 8 }
  }
  const modulos = geometria.modulos.map((modulo) => ({
    id: modulo.id,
    rect: transformar(modulo.rect),
    elementos: modulo.elementos.map((elemento) => ({
      ...elemento, ...transformar(elemento),
    })),
  }))
  const uniones = geometria.uniones.map((union) => ({
    id: union.id, rect: transformar(union.rect),
  }))
  return { ancho, alto, escala: proyeccionBase.escala, medidas, modulos, uniones }
}

/** Mismo sentido de los triángulos del diseñador; sólo cambia la primitiva SVG. */
export function trazosAperturaPdf(apertura: AperturaVisual, rect: RectVisual): string[] {
  const geometria = geometriaAperturaVisual(apertura, rect)
  return geometria?.trazos.map((trazo) => trazo
    .map((punto, indice) => `${indice === 0 ? 'M' : 'L'} ${punto.x} ${punto.y}`)
    .join(' ')) ?? []
}

/** Accesorios gráficos acotados al rectángulo de hoja; no son cotas de fabricación. */
export function geometriaHerrajesPdf(
  apertura: AperturaVisual,
  manilla: boolean,
  rect: RectVisual,
): { bisagras: readonly [RectVisual, RectVisual]; manilla: RectVisual | null } | null {
  const geometria = geometriaAperturaVisual(apertura, rect)
  if (!geometria) return null
  const margenMarco = Math.min(3, rect.ancho / 6, rect.alto / 6)
  const anchoHerraje = Math.min(1.8, margenMarco)
  const altoBisagra = Math.min(8, rect.alto / 8)
  const margenVertical = Math.min(6, rect.alto / 6)
  const limitarX = (centro: number) => Math.max(rect.x, Math.min(
    rect.x + rect.ancho - anchoHerraje, centro - anchoHerraje / 2,
  ))
  const xBisagra = limitarX(geometria.xBisagras)
  const bisagras: [RectVisual, RectVisual] = [
    { x: xBisagra, y: rect.y + margenVertical, ancho: anchoHerraje, alto: altoBisagra },
    { x: xBisagra, y: rect.y + rect.alto - margenVertical - altoBisagra,
      ancho: anchoHerraje, alto: altoBisagra },
  ]
  if (!manilla) return { bisagras, manilla: null }
  const altoManilla = Math.min(10, rect.alto / 4)
  const xCentroManilla = geometria.ladoCierre === 'izquierda'
    ? rect.x + margenMarco / 2 : rect.x + rect.ancho - margenMarco / 2
  return { bisagras, manilla: {
    x: limitarX(xCentroManilla), y: rect.y + (rect.alto - altoManilla) / 2,
    ancho: anchoHerraje, alto: altoManilla,
  } }
}
