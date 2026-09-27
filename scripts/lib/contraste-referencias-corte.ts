import { evaluar } from '../../packages/core/src/despiece/formula.ts'

export interface PiezaReferencia {
  documento: string
  estructura: string
  id: string
  referencia: string | null
  formula: string | null
  largo: number
  descuentoInicio: number
  descuentoFin: number
}

/**
 * Diagnóstico retrospectivo, NO generador: usa el corte observado de la pieza
 * referenciada. Un acierto prueba la relación, no permite predecir ese corte.
 * La clave incluye documento y estructura; una colisión nunca elige una fila.
 */
export function contrastarReferencias(piezas: PiezaReferencia[]) {
  const clave = (p: PiezaReferencia, id = p.id) =>
    JSON.stringify([p.documento, p.estructura, id])
  const indice = new Map<string, PiezaReferencia[]>()
  for (const p of piezas) {
    const k = clave(p)
    indice.set(k, [...(indice.get(k) ?? []), p])
  }
  return piezas.filter(p => p.referencia !== null && p.formula !== null).map(p => {
    const candidatas = indice.get(clave(p, p.referencia!)) ?? []
    if (candidatas.length !== 1) {
      return { pieza: p, estado: candidatas.length ? 'ambigua' : 'ausente' } as const
    }
    const referencia = candidatas[0]!
    if (![p.largo, p.descuentoInicio, p.descuentoFin, referencia.largo].every(Number.isFinite)) {
      return { pieza: p, estado: 'dato-invalido' } as const
    }
    try {
      const esperado = evaluar(p.formula!, { REF: referencia.largo })
        - p.descuentoInicio - p.descuentoFin
      if (!Number.isFinite(esperado)) return { pieza: p, estado: 'dato-invalido' } as const
      return { pieza: p, estado: 'comparada', esperado, diferencia: esperado - p.largo } as const
    } catch {
      return { pieza: p, estado: 'formula-no-resuelta' } as const
    }
  })
}
