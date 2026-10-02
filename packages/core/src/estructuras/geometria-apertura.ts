import type { AperturaVisual, RectVisual } from './diseno.ts'

export type LadoVisual = 'izquierda' | 'derecha'

export interface PuntoVisual { x: number; y: number }

export interface GeometriaAperturaVisual {
  ladoBisagras: LadoVisual
  ladoCierre: LadoVisual
  xBisagras: number
  xCierre: number
  /** Falso en hojas deslizantes: no se dibujan bisagras. */
  bisagras: boolean
  trazos: readonly (readonly PuntoVisual[])[]
}

/**
 * Flecha doble horizontal centrada: indica hoja corredera sin afirmar su
 * sentido, que el catálogo no codifica.
 */
function trazosCorredera(rect: RectVisual): PuntoVisual[][] {
  const y = rect.y + rect.alto / 2
  const x1 = rect.x + rect.ancho * .2
  const x2 = rect.x + rect.ancho * .8
  const punta = Math.min(rect.ancho * .08, rect.alto * .08)
  return [
    [{ x: x1, y }, { x: x2, y }],
    [{ x: x1 + punta, y: y - punta }, { x: x1, y }, { x: x1 + punta, y: y + punta }],
    [{ x: x2 - punta, y: y - punta }, { x: x2, y }, { x: x2 - punta, y: y + punta }],
  ]
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
  if (apertura === 'corredera') {
    return {
      ladoBisagras: 'izquierda', ladoCierre: 'derecha',
      xBisagras: rect.x, xCierre: rect.x + rect.ancho,
      bisagras: false, trazos: trazosCorredera(rect),
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
  return { ladoBisagras, ladoCierre, xBisagras, xCierre, bisagras: true, trazos }
}
