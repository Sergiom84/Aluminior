import {
  distribuirComposicion, esConfiguracionCerramiento, geometriaAperturaVisual,
  medidasCerramiento, plantillaDiseno,
  type AperturaVisual, type ConfiguracionCerramiento, type RectVisual,
} from '@aluminior/core/estructuras'

/** Adaptación de coordenadas al soporte PDF; el reparto interior pertenece a core. */
export function geometriaCerramientoPdf(configuracion: ConfiguracionCerramiento, ancho = 240, alto = 150) {
  if (!esConfiguracionCerramiento(configuracion)) throw new Error('Configuración de cerramiento inválida')
  if (!Number.isFinite(ancho) || !Number.isFinite(alto) || ancho < 100 || alto < 80) {
    throw new Error('El dibujo PDF requiere al menos 100 × 80 puntos')
  }
  const medidas = medidasCerramiento(configuracion)
  // Las uniones pueden superar la altura de los módulos: no se cortan ni alteran las cotas.
  const altoVisible = Math.max(medidas.altoMm, ...configuracion.uniones.map((u) => u.longitudMm))
  const escala = Math.min((ancho - 16) / medidas.anchoMm, (alto - 28) / altoVisible)
  if (![medidas.anchoMm, medidas.altoMm, altoVisible, escala].every((valor) => Number.isFinite(valor) && valor > 0)) {
    throw new Error('Las medidas del cerramiento no son representables en PDF')
  }
  const origenX = (ancho - medidas.anchoMm * escala) / 2
  const origenY = 8 + (alto - 28 - altoVisible * escala) / 2
  const puntos = (valor: number) => Math.round(valor * 1e10) / 1e10
  const transformar = (rect: RectVisual): RectVisual => ({
    x: puntos(origenX + rect.x * escala), y: puntos(origenY + rect.y * escala),
    ancho: puntos(rect.ancho * escala), alto: puntos(rect.alto * escala),
  })
  let cursor = 0
  const modulos = configuracion.modulos.map((modulo, indice) => {
    const rectMm = { x: cursor, y: 0, ancho: modulo.anchoMm, alto: modulo.altoMm }
    const elementos = distribuirComposicion(plantillaDiseno(modulo.estructuraCodigo)!.composicion, rectMm)
      .map((elemento) => ({ ...elemento, ...transformar(elemento) }))
    cursor += modulo.anchoMm + (configuracion.uniones[indice]?.grosorMm ?? 0)
    return { id: modulo.id, rect: transformar(rectMm), elementos }
  })
  cursor = 0
  const uniones = configuracion.uniones.map((union, indice) => {
    cursor += configuracion.modulos[indice].anchoMm
    const rect = transformar({ x: cursor, y: 0, ancho: union.grosorMm, alto: union.longitudMm })
    cursor += union.grosorMm
    return { id: union.id, rect }
  })
  return { ancho, alto, escala, medidas, modulos, uniones }
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
