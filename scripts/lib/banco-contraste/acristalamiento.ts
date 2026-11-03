import { varianteSegunGrosor } from '@aluminior/core/despiece'
import { numero } from './datos.ts'

/**
 * VDatosLinEstr.nTAcris: 0 conserva la selección base y 1 identifica la
 * primera opción. Contrastado por artículos de junquillo/juntas con las
 * tablas de Conjuntos en la copia del banco (informe, iteración 3).
 * No extrapolar a 2..5: necesitan su propia evidencia y soporte del motor.
 */
export function opcionAcristalamientoOrigen(valor: unknown): 1 | null {
  const n = numero(valor)
  return n === 0 || n === 1 ? 1 : null
}

export interface ElementoAcristalado { serie: string | null; vidrio: string | null }
export interface DatosVidrio { grosorAcristalar: number; dobleAcristalamiento: boolean }

/**
 * Variante de acristalamiento de cada elemento con la regla del motor: manda
 * el rango de grosor de su serie y, solo si la serie no lo declara, la marca
 * de doble acristalamiento del vidrio. El banco comparaba antes por la marca,
 * de modo que separaba elementos que el motor resuelve con la misma variante.
 */
export function variantesPorElemento(
  elementos: readonly ElementoAcristalado[],
  vidrio: (codigo: string) => DatosVidrio | null,
  grosorMaximoSimple: (serie: string | null) => number,
): Map<string, '1' | '2'> {
  const variantes = new Map<string, '1' | '2'>()
  for (const e of elementos) {
    if (!e.vidrio) continue
    variantes.set(`${e.serie ?? ''}|${e.vidrio}`,
      varianteSegunGrosor({ grosorMaximoSimple: grosorMaximoSimple(e.serie) }, vidrio(e.vidrio)))
  }
  return variantes
}
