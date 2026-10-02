import type { AperturaVisual } from './diseno.ts'

/**
 * `EstructurasDiseño.TipoHoja` (y `nHoja` en parejas) → apertura dibujada.
 *
 * Evidencia: descripciones de las estructuras que usan cada tipo en el
 * catálogo EMP0016. El sufijo de la apertura es el lado de bisagras, con el
 * mismo convenio que las plantillas verificadas 1OD/1OI (5/6).
 * Un tipo ausente queda sin dibujar: no se inventa su apertura.
 */
const POR_TIPO: Readonly<Record<number, AperturaVisual>> = {
  1: 'abatible-derecha', // 1, 1D: VENTANA ABATIBLE DE 1 HOJA, MANO DERECHA
  2: 'abatible-izquierda', // 1I: MANO IZQUIERDA
  5: 'oscilobatiente-derecha', // 1OD
  6: 'oscilobatiente-izquierda', // 1OI
  // Hipótesis: puertas balconeras de una hoja sin mano en la descripción;
  // se dibujan con la mano de la abatible (1) y la oscilobatiente (1O) por defecto.
  58: 'abatible-derecha', // 1PE, 1PFS
  43: 'oscilobatiente-derecha', // 1OP
  44: 'oscilobatiente-derecha', // 1OP+VS, 1OP2FLFS
}

/** Parejas de dos hojas: índice 1 izquierda, 2 derecha. */
const POR_PAREJA: Readonly<Record<number, readonly [AperturaVisual, AperturaVisual]>> = {
  7: ['abatible-izquierda', 'abatible-derecha'], // 2: VENTANA ABATIBLE DE DOS HOJAS
  8: ['abatible-izquierda', 'oscilobatiente-derecha'], // 2O: UNA OSCILOBATIENTE
  15: ['abatible-izquierda', 'abatible-derecha'], // 2P: PUERTA BALCONERA DE DOS HOJAS
  26: ['abatible-izquierda', 'oscilobatiente-derecha'], // 2OP: PUERTA ... UNA OSCILOBATIENTE
}

/**
 * Correderas: C2/PC2 (10), C3 (13), C4/PC4 (14), C2P (16), C3P (17), C4P (18),
 * C6 (19), C6P (20), monocarriles PCM1D/PCM1I/PCM2 (70/71/72), C312/C321 (79/80).
 */
const CORREDERAS: ReadonlySet<number> = new Set([10, 13, 14, 16, 17, 18, 19, 20, 70, 71, 72, 79, 80])

export function aperturaTipoHoja(tipoHoja: number, numeroHoja: number): AperturaVisual | null {
  if (CORREDERAS.has(tipoHoja)) return 'corredera'
  const pareja = POR_PAREJA[tipoHoja]
  if (pareja) return numeroHoja === 1 || numeroHoja === 2 ? pareja[numeroHoja - 1] : null
  return POR_TIPO[tipoHoja] ?? null
}

/** Marcos dibujados como perímetro normal; la diferencia es de fabricación. */
export const MARCOS_DIBUJABLES: ReadonlySet<string> = new Set(['NOR', 'PTA', '3C', 'VEN', 'SOL'])
