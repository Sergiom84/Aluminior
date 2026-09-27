/**
 * Medidas de todas las filas de una plantilla a partir del catálogo.
 *
 * - Filas con grupo de descuento: corte por referencia y descuentos de
 *   extremo (`resolverCortesReferenciados`). Una fila con referencia de ancho
 *   (el vidrio) es bidimensional: su largo toma los extremos superior e
 *   inferior y su ancho, la referencia horizontal con los extremos izquierdo y
 *   derecho. C2 GMC400: 502,25 − 2×31,375 = 439,5 y 1257 − 2×40,25 = 1176,5.
 * - Informativos sin grupo (escuadras, bisagras, zona de apertura): la
 *   fórmula de referencia sin descuentos, o la plana si no referencian.
 *
 * Contraste con facturas 2026 en docs/paridad/fase-7/06.
 */

import { evaluar, type Contexto } from './formula.ts'
import {
  resolverCortesReferenciados, type DescuentoCorte, type NodoCorteReferenciado,
} from './cortes-referenciados.ts'

export interface FilaMedible {
  id: number
  referenciaLargo: number | null
  referenciaAncho: number | null
  formulaLargo: string | null
  formulaAncho: string | null
  formulaReferenciaLargo: string | null
  formulaReferenciaAncho: string | null
  grupo: string | null
  grupoIzquierdo: string | null
  grupoDerecho: string | null
  grupoSuperior: string | null
  grupoInferior: string | null
  gruposAdicionales: readonly (string | null)[]
  /** Clave de `ConjuntosDescuentos.TipoHoja` (`G`, `2HC`, `2HA1O`…). */
  tipoHoja: string | null
  perfilAdicional: number | null
}

export interface MedidaPlantilla {
  largoMm: number | null
  anchoMm: number | null
  incidencia: string | null
  /** Filas bidimensionales: fórmula de referencia antes de sus descuentos (junquillos). */
  referenciaLargoMm?: number | null
  referenciaAnchoMm?: number | null
}

const DESPLAZAMIENTO_ANCHO = 1_000_000
const vacio = (v: string | null | undefined) => !v || !v.trim()

function nodoLargo(f: FilaMedible): NodoCorteReferenciado {
  const bidimensional = f.referenciaAncho !== null
  return {
    id: f.id, referencia: f.referenciaLargo, formula: f.formulaLargo, formulaReferencia: f.formulaReferenciaLargo,
    grupo: f.grupo, tipoHoja: f.tipoHoja, perfilAdicional: f.perfilAdicional,
    grupoInicio: bidimensional ? f.grupoSuperior : f.grupoIzquierdo,
    grupoFin: bidimensional ? f.grupoInferior : f.grupoDerecho,
    gruposAdicionales: bidimensional ? [] : f.gruposAdicionales,
  }
}

function nodoAncho(f: FilaMedible): NodoCorteReferenciado {
  return {
    id: DESPLAZAMIENTO_ANCHO + f.id, referencia: f.referenciaAncho, formula: f.formulaAncho,
    formulaReferencia: f.formulaReferenciaAncho, grupo: f.grupo, tipoHoja: f.tipoHoja,
    perfilAdicional: f.perfilAdicional, grupoInicio: f.grupoIzquierdo, grupoFin: f.grupoDerecho,
  }
}

export function medirPlantilla(
  filas: readonly FilaMedible[],
  descuentos: readonly DescuentoCorte[],
  contexto: Contexto,
): Map<number, MedidaPlantilla> {
  const conGrupo = filas.filter(f => !vacio(f.grupo))
  const nodos = [...conGrupo.map(nodoLargo), ...conGrupo.filter(f => f.referenciaAncho !== null).map(nodoAncho)]
  const cortes = resolverCortesReferenciados(nodos, descuentos, contexto)
  const medidas = new Map<number, MedidaPlantilla>()

  const referencia = (id: number | null, formula: string | null) => {
    const ref = id === null ? null : cortes.get(id)?.largoMm
    if (ref == null) return null
    try { return evaluar(vacio(formula) ? 'REF' : formula!, { ...contexto, REF: ref }) } catch { return null }
  }
  for (const f of conGrupo) {
    const largo = cortes.get(f.id)
    const bidimensional = f.referenciaAncho !== null
    const ancho = bidimensional ? cortes.get(DESPLAZAMIENTO_ANCHO + f.id) : undefined
    medidas.set(f.id, {
      largoMm: largo?.largoMm ?? null,
      anchoMm: ancho?.largoMm ?? null,
      incidencia: largo?.incidencia ?? ancho?.incidencia ?? null,
      ...(bidimensional ? {
        referenciaLargoMm: referencia(f.referenciaLargo, f.formulaReferenciaLargo),
        referenciaAnchoMm: referencia(f.referenciaAncho, f.formulaReferenciaAncho),
      } : {}),
    })
  }
  for (const f of filas) {
    if (!vacio(f.grupo)) continue
    try {
      let largoMm: number
      if (f.referenciaLargo !== null) {
        const ref = medidas.get(f.referenciaLargo)?.largoMm
        if (ref == null) throw new Error(`antecedente ${f.referenciaLargo} sin medida`)
        largoMm = evaluar(vacio(f.formulaReferenciaLargo) ? 'REF' : f.formulaReferenciaLargo!, { ...contexto, REF: ref })
      } else {
        if (vacio(f.formulaLargo)) throw new Error('sin fórmula')
        largoMm = evaluar(f.formulaLargo!, contexto)
      }
      medidas.set(f.id, { largoMm, anchoMm: null, incidencia: null })
    } catch (e) {
      medidas.set(f.id, { largoMm: null, anchoMm: null, incidencia: `pieza ${f.id}: ${(e as Error).message}` })
    }
  }
  return medidas
}
