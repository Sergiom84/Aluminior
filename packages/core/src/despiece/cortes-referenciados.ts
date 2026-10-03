import { evaluar, variablesDe, type Contexto } from './formula.ts'

export interface NodoCorteReferenciado {
  id: number
  referencia: number | null
  formula: string | null
  formulaReferencia: string | null
  grupo: string | null
  grupoInicio: string | null
  grupoFin: string | null
  tipoHoja: string | null
  perfilAdicional: number | null
  /** `DisGrupoAdicional`, `DisGrupoAd2`, `DisGrupoAd3`, `DisGrupoAdIndep`. */
  gruposAdicionales?: readonly (string | null)[]
}

/** Verticales de la propia hoja corredera: sus descuentos se restan completos. */
const VERTICALES_CORREDERA = new Set(['HVL', 'HVC'])

export interface DescuentoCorte {
  grupoPrincipal: string
  grupo: string
  tipoHoja: string
  mm: number
}

export interface CorteCatalogo {
  largoMm: number | null
  incidencia: string | null
  aviso?: string | null
}

/**
 * REF es el corte calculado del antecedente, antes de los descuentos propios.
 * No recibe medidas históricas. Cada nodo necesita ambos extremos explícitos.
 * El llamante delimita las plantillas verificadas; no interpreta perfiles
 * alternativos ni descuentos diferenciales sin una precedencia acreditada.
 *
 * Grupos adicionales (división del hueco en varias hojas), contrastados con
 * las facturas de 2026 (fase-7/06):
 * - verticales de corredera `HVL`/`HVC`: se restan también sus descuentos;
 * - batiente central `B`: `F(REF) − (dto(inicio) + dto(fin))/2 − dto(B)/2`; con
 *   extremos iguales es `F(REF) − dto(extremo) − dto(B)/2`. Extremos distintos
 *   contrastados en 3HO ELEGANTPVC (TMG 22, MV 35, B 5,8): 858,6 / 818,6 / 643,6.
 * Cualquier otra combinación bloquea la pieza.
 */
export function resolverCortesReferenciados(
  nodos: readonly NodoCorteReferenciado[],
  descuentos: readonly DescuentoCorte[],
  contexto: Contexto,
): ReadonlyMap<number, CorteCatalogo> {
  const indice = new Map<number, NodoCorteReferenciado[]>()
  const resultados = new Map<number, CorteCatalogo>()
  const visitando = new Set<number>()
  for (const nodo of nodos) indice.set(nodo.id, [...(indice.get(nodo.id) ?? []), nodo])
  const error = (incidencia: string): CorteCatalogo => ({ largoMm: null, incidencia })
  const descuento = (nodo: NodoCorteReferenciado, extremo: string | null) => {
    if (!extremo || !nodo.grupo || !nodo.tipoHoja) throw new Error('grupos o tipo de hoja ausentes')
    const candidatas = descuentos.filter(d => d.grupoPrincipal === extremo && d.grupo === nodo.grupo)
    const especificas = candidatas.filter(d => d.tipoHoja === nodo.tipoHoja)
    const aplicables = especificas.length ? especificas : candidatas.filter(d => d.tipoHoja === 'G')
    if (aplicables.length !== 1 || !Number.isFinite(aplicables[0]?.mm)) {
      throw new Error(`descuento ausente o ambiguo para ${extremo} → ${nodo.grupo} (${nodo.tipoHoja})`)
    }
    return aplicables[0]!.mm
  }
  const descuentosExtremos = (nodo: NodoCorteReferenciado) => {
    const adicionales = (nodo.gruposAdicionales ?? []).filter((g): g is string => !!g)
    if (!adicionales.length) return descuento(nodo, nodo.grupoInicio) + descuento(nodo, nodo.grupoFin)
    if (adicionales.every(g => VERTICALES_CORREDERA.has(g))) {
      return descuento(nodo, nodo.grupoInicio) + descuento(nodo, nodo.grupoFin) +
        adicionales.reduce((s, g) => s + descuento(nodo, g), 0)
    }
    if (adicionales.length === 1 && adicionales[0] === 'B') {
      return (descuento(nodo, nodo.grupoInicio) + descuento(nodo, nodo.grupoFin)) / 2 + descuento(nodo, 'B') / 2
    }
    throw new Error(`división de hueco con grupos ${adicionales.join('/')} sin contrastar`)
  }
  const resolver =(id: number): CorteCatalogo => {
    const previo = resultados.get(id)
    if (previo) return previo
    if (visitando.has(id)) return error(`ciclo de referencias en pieza ${id}`)
    const candidatas = indice.get(id) ?? []
    if (candidatas.length !== 1) return error(`referencia ${id} ausente o ambigua`)
    const nodo = candidatas[0]!
    visitando.add(id)
    let resultado: CorteCatalogo
    try {
      if (nodo.perfilAdicional !== null && nodo.perfilAdicional !== -1) {
        throw new Error('perfil adicional pendiente de resolver')
      }
      let formula = nodo.formula
      const variables = { ...contexto }
      delete variables.REF
      if (nodo.referencia === null && nodo.formulaReferencia && variablesDe(nodo.formulaReferencia).includes('REF')) {
        throw new Error('fórmula REF sin identificador de antecedente')
      }
      if (nodo.referencia !== null) {
        const ref = resolver(nodo.referencia)
        if (ref.largoMm === null) throw new Error(`antecedente ${nodo.referencia}: ${ref.incidencia}`)
        if (!nodo.formulaReferencia) throw new Error('sin fórmula de referencia')
        variables.REF = ref.largoMm
        formula = nodo.formulaReferencia
      }
      if (!formula) throw new Error('sin fórmula de corte')
      const largoMm = evaluar(formula, variables) - descuentosExtremos(nodo)
      if (!Number.isFinite(largoMm) || largoMm <= 0) throw new Error('medida de corte no positiva o no finita')
      resultado = { largoMm, incidencia: null }
    } catch (e) {
      resultado = error(`pieza ${id}: ${(e as Error).message}`)
    } finally {
      visitando.delete(id)
    }
    resultados.set(id, resultado)
    return resultado
  }
  for (const nodo of nodos) resultados.set(nodo.id, resolver(nodo.id))
  return resultados
}
