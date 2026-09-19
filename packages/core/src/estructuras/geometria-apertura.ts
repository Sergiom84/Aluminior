import type { AperturaVisual, RectVisual } from './diseno.ts'

export type LadoVisual = 'izquierda' | 'derecha'

export interface PuntoVisual { x: number; y: number }

export interface GeometriaAperturaVisual {
  ladoBisagras: LadoVisual
  ladoCierre: LadoVisual
  xBisagras: number
  xCierre: number
  trazos: readonly (readonly PuntoVisual[])[]
}

/**
 * Traduce una apertura declarativa a su geometría física. El sufijo expresa
 * siempre el lado de bisagras en la vista representada.
 */
export function geometriaAperturaVisual(
  apertura: AperturaVisual,
  rect: RectVisual,
): GeometriaAperturaVisual | null {
  if (apertura === 'fijo') return null

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
