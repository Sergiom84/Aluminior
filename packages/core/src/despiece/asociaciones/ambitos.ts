/**
 * Ámbitos de evaluación de las asociaciones de una estructura.
 *
 * Al generar el herraje, Productor deja en el conjunto de la serie las
 * asociaciones «Aplicable en» marco y general, y en cada código de herraje las
 * de sus hojas (`ConfigSeriesAsoc.TipoHoja` frente a `ConjuntosAsoc`). En
 * ejecución, el conjunto de la serie se evalúa contra el marco y cada código
 * de herraje contra los elementos de su grupo de hojas. Ambos ven los
 * virtuales ANCHO y ALTO. Las estructuras accesorio (uniones) no reciben las
 * asociaciones de la serie: 0 de 60 uniones facturadas las llevan.
 */

import { esTipoHojaMarco } from './tipos-hoja.ts'
import type { AmbitoAsociacion, ElementoAsociable } from './tipos.ts'

export interface ElementoPlantilla extends ElementoAsociable {
  /** `DisTipoHoja` de la fila: -1/0 marco, otro valor = grupo de hojas. */
  tipoHoja: string | null
}

export interface EntradaAmbitos {
  serie: string
  esAccesorio: boolean
  anchoMm: number
  altoMm: number
  elementos: readonly ElementoPlantilla[]
  /** Código de herraje (`Conjuntos.herr*`) para un tipo de hoja; null si no hay. */
  conjuntoHerraje: (tipoHoja: string) => string | null
}

export function construirAmbitos(entrada: EntradaAmbitos): { ambitos: AmbitoAsociacion[]; incidencias: string[] } {
  const virtuales: ElementoAsociable[] = [
    { componente: 'A', cantidad: 1, medidaMm: entrada.anchoMm },
    { componente: 'L', cantidad: 1, medidaMm: entrada.altoMm },
  ]
  const ambitos: AmbitoAsociacion[] = []
  const incidencias: string[] = []
  if (!entrada.esAccesorio) {
    ambitos.push({
      conjunto: entrada.serie, tipoHoja: null,
      elementos: [...entrada.elementos.filter(e => esTipoHojaMarco(e.tipoHoja)), ...virtuales],
    })
  }
  const tipos = [...new Set(entrada.elementos.map(e => e.tipoHoja).filter(t => !esTipoHojaMarco(t)))] as string[]
  for (const tipoHoja of tipos) {
    const conjunto = entrada.conjuntoHerraje(tipoHoja)
    if (!conjunto) {
      incidencias.push(`la serie ${entrada.serie} no tiene código de herraje para el tipo de hoja ${tipoHoja}`)
      continue
    }
    ambitos.push({
      conjunto, tipoHoja,
      elementos: [...entrada.elementos.filter(e => e.tipoHoja === tipoHoja), ...virtuales],
    })
  }
  return { ambitos, incidencias }
}
