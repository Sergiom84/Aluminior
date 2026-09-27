import type { AperturaVisual, RectVisual } from './diseno.ts'

export type LadoVisual = 'izquierda' | 'derecha'

export interface PuntoVisual { x: number; y: number }

export interface GeometriaAperturaVisual {
  ladoBisagras: LadoVisual | null
  ladoCierre: LadoVisual
  xBisagras: number | null
  xCierre: number
  trazos: readonly (readonly PuntoVisual[])[]
}

/**
 * Traduce una apertura declarativa a su geometría física. El sufijo expresa
 * el lado de bisagras en batientes; en correderas, el sentido de desplazamiento.
 */
export function geometriaAperturaVisual(
  apertura: AperturaVisual,
  rect: RectVisual,
): GeometriaAperturaVisual | null {
  if (apertura === 'fijo') return null
  if (apertura === 'corredera-izquierda' || apertura === 'corredera-derecha') {
    const derecha = apertura === 'corredera-derecha'
    const inicio = rect.x + rect.ancho * (derecha ? .25 : .75)
    const fin = rect.x + rect.ancho * (derecha ? .75 : .25)
    const y = rect.y + rect.alto / 2
    const punta = Math.min(rect.ancho, rect.alto) * .1
    const base = fin + (derecha ? -punta : punta)
    return {
      ladoBisagras: null, xBisagras: null,
      ladoCierre: derecha ? 'izquierda' : 'derecha',
      xCierre: derecha ? rect.x : rect.x + rect.ancho,
      trazos: [[{ x: inicio, y }, { x: fin, y },
        { x: base, y: y - punta }, { x: fin, y }, { x: base, y: y + punta }]],
    }
  }

  const ladoBisagras: LadoVisual = apertura === 'abatible-izquierda' ||
    apertura === 'oscilobatiente-izquierda' ? 'izquierda' : 'derecha'
  const ladoCierre: LadoVisual = ladoBisagras === 'izquierda' ? 'derecha' : 'izquierda'
  const xBisagras = ladoBisagras === 'izquierda' ? rect.x : rect.x + rect.ancho
  const xCierre = ladoCierre === 'izquierda' ? rect.x : rect.x + rect.ancho
  const trazos: PuntoVisual[][] = [[
    { x: xBisagras, y: rect.y },
    { x: xCierre, y: rect.y + rect.alto / 2 },
    { x: xBisagras, y: rect.y + rect.alto },
  ]]
  if (apertura === 'oscilobatiente-izquierda' || apertura === 'oscilobatiente-derecha') {
    trazos.push([
      { x: rect.x, y: rect.y + rect.alto },
      { x: rect.x + rect.ancho / 2, y: rect.y },
      { x: rect.x + rect.ancho, y: rect.y + rect.alto },
    ])
  }
  return { ladoBisagras, ladoCierre, xBisagras, xCierre, trazos }
}
