/**
 * Cálculo de despiece: de una estructura y unas medidas, a la lista de piezas.
 *
 * Este es el corazón del sistema. Toma la plantilla de la estructura, evalúa
 * las fórmulas con las medidas del hueco y las cotas, y devuelve qué hay que
 * cortar y de qué medida.
 *
 * Principio de diseño: NUNCA inventar un valor. Si una fórmula no se puede
 * resolver, la pieza sale marcada como incalculable con el motivo. Un cero
 * silencioso en una medida de corte es material desperdiciado y una ventana
 * que no encaja.
 */

import { evaluar, variablesDe, type Contexto } from './formula.ts'

/** Plantilla de un componente, tal como viene del catálogo. */
export interface ComponentePlantilla {
  articuloCodigo: string
  cantidad: string | number | null
  formulaLargo: string | null
  tipoCorte: string | null
  anguloIzquierdo: string | number | null
  anguloDerecho: string | number | null
  funcion: string | null
  /** Rango de medidas en que aplica; fuera de él, el componente no entra. */
  medidaMinima?: string | number | null
  medidaMaxima?: string | number | null
}

/** Pieza resultante, ya con su medida de corte. */
export interface PiezaCortada {
  articuloCodigo: string
  cantidad: number
  /** Medida de corte en mm. null si no se pudo calcular. */
  largoMm: number | null
  formula: string | null
  tipoCorte: string | null
  anguloIzquierdo: number | null
  anguloDerecho: number | null
  funcion: string | null
  /** Motivo por el que no se pudo calcular, si aplica. */
  incidencia: string | null
}

export interface ResultadoDespiece {
  piezas: PiezaCortada[]
  /** Piezas cuya medida no se pudo determinar. */
  incalculables: number
  /** Variables que faltaron, agrupadas. */
  variablesFaltantes: string[]
  /** Metros lineales totales por artículo, para valorar. */
  consumoPorArticulo: Map<string, { unidades: number; metrosLineales: number }>
}

function aNumero(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * Calcula el despiece de una estructura.
 *
 * @param plantilla  Componentes del catálogo para esa estructura
 * @param medidas    Ancho (L) y alto (A) del hueco, en mm
 * @param cotas      Valores de las cotas simbólicas: FI, FS, TD…
 */
export function calcularDespiece(
  plantilla: ComponentePlantilla[],
  medidas: { anchoMm: number; altoMm: number },
  cotas: Record<string, number> = {},
): ResultadoDespiece {
  const contexto: Contexto = {
    L: medidas.anchoMm,
    A: medidas.altoMm,
    ...cotas,
  }

  const piezas: PiezaCortada[] = []
  const faltantes = new Set<string>()
  const consumo = new Map<string, { unidades: number; metrosLineales: number }>()

  for (const c of plantilla) {
    const cantidad = aNumero(c.cantidad) ?? 1

    // Componentes condicionales: sólo entran dentro de su rango de medida.
    const min = aNumero(c.medidaMinima)
    const max = aNumero(c.medidaMaxima)
    const referencia = Math.max(medidas.anchoMm, medidas.altoMm)
    if (min !== null && min > 0 && referencia < min) continue
    if (max !== null && max > 0 && referencia > max) continue

    let largoMm: number | null = null
    let incidencia: string | null = null

    if (c.formulaLargo) {
      try {
        largoMm = evaluar(c.formulaLargo, contexto)
        if (!Number.isFinite(largoMm)) {
          largoMm = null
          incidencia = 'resultado no numérico'
        } else if (largoMm < 0) {
          // Medida negativa: la fórmula es correcta pero las cotas no encajan
          // en el hueco. Hay que avisar, no cortar en negativo.
          incidencia = `medida negativa (${Math.round(largoMm)} mm): revisa las cotas`
          largoMm = null
        }
      } catch {
        const faltan = variablesDe(c.formulaLargo).filter((v) => !(v in contexto))
        faltan.forEach((v) => faltantes.add(v))
        incidencia = faltan.length
          ? `faltan valores: ${faltan.join(', ')}`
          : 'fórmula no evaluable'
      }
    } else {
      incidencia = 'sin fórmula de largo'
    }

    piezas.push({
      articuloCodigo: c.articuloCodigo,
      cantidad,
      largoMm,
      formula: c.formulaLargo,
      tipoCorte: c.tipoCorte,
      anguloIzquierdo: aNumero(c.anguloIzquierdo),
      anguloDerecho: aNumero(c.anguloDerecho),
      funcion: c.funcion,
      incidencia,
    })

    const acc = consumo.get(c.articuloCodigo) ?? { unidades: 0, metrosLineales: 0 }
    acc.unidades += cantidad
    if (largoMm !== null) acc.metrosLineales += (largoMm / 1000) * cantidad
    consumo.set(c.articuloCodigo, acc)
  }

  return {
    piezas,
    incalculables: piezas.filter((p) => p.largoMm === null).length,
    variablesFaltantes: [...faltantes].sort(),
    consumoPorArticulo: consumo,
  }
}
