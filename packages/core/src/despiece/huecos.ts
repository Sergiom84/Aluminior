/** GeometrÃ­a limpia de EstructurasDiseÃ±o para localizar los lÃ­mites de un hueco. */

import { evaluar, type Contexto } from './formula.ts'

export interface NodoDisenyo {
  idItem: number
  /** 1=marco, 2=hueco, 3=hoja, 5=vidrio, 6=travesaÃ±o/divisiÃ³n. */
  tipo: number
  contenidoEn: number | null
  idTravesano: number | null
  posicionHueco: number | null
  tipoTravesano: string | null
  invisible: boolean
}

export interface LimiteHueco {
  clase: 'MARCO' | 'TRAVESANO' | 'INVISIBLE'
  orientacion: 'H' | 'V'
  idItem: number
  tipoTravesano: string | null
}

export interface LimitesHueco {
  superior: LimiteHueco
  inferior: LimiteHueco
  izquierdo: LimiteHueco
  derecho: LimiteHueco
}

export interface AlojamientoVidrio {
  huecoId: number
  /** null si el vidrio estÃ¡ directamente en un fijo. */
  hojaId: number | null
}

export function alojamientoDeVidrio(
  nodos: Map<number, NodoDisenyo>,
  vidrioId: number,
): AlojamientoVidrio | null {
  const vidrio = nodos.get(vidrioId)
  if (!vidrio || vidrio.tipo !== 5 || vidrio.contenidoEn === null) return null
  const padre = nodos.get(vidrio.contenidoEn)
  if (!padre) return null
  if (padre.tipo === 3 && padre.contenidoEn !== null) {
    return { huecoId: padre.contenidoEn, hojaId: padre.idItem }
  }
  if (padre.tipo === 2) return { huecoId: padre.idItem, hojaId: null }
  return null
}

export function limitesDeHueco(
  nodos: Map<number, NodoDisenyo>,
  huecoId: number,
): LimitesHueco | null {
  const visitar = (id: number, vistos: Set<number>): LimitesHueco | null => {
    const nodo = nodos.get(id)
    if (!nodo || vistos.has(id)) return null
    vistos.add(id)

    if (nodo.tipo === 1) {
      const h = (): LimiteHueco => ({ clase: 'MARCO', orientacion: 'H', idItem: id, tipoTravesano: null })
      const v = (): LimiteHueco => ({ clase: 'MARCO', orientacion: 'V', idItem: id, tipoTravesano: null })
      return { superior: h(), inferior: h(), izquierdo: v(), derecho: v() }
    }
    if (nodo.tipo !== 2 || nodo.contenidoEn === null) return null

    const limites = visitar(nodo.contenidoEn, vistos)
    if (!limites || nodo.idTravesano === null) return limites
    const trav = nodos.get(nodo.idTravesano)
    if (!trav || trav.tipo !== 6) return limites
    const tipo = (trav.tipoTravesano ?? '').toUpperCase()
    const orientacion: 'H' | 'V' = tipo.startsWith('H') ? 'H' : 'V'
    const borde: LimiteHueco = {
      clase: trav.invisible ? 'INVISIBLE' : 'TRAVESANO',
      orientacion,
      idItem: trav.idItem,
      tipoTravesano: tipo || null,
    }
    if (orientacion === 'H') {
      if (nodo.posicionHueco === 1) limites.inferior = borde
      else if (nodo.posicionHueco === 2) limites.superior = borde
    } else {
      if (nodo.posicionHueco === 1) limites.derecho = borde
      else if (nodo.posicionHueco === 2) limites.izquierdo = borde
    }
    return limites
  }

  return visitar(huecoId, new Set())
}

export function marcadorLimiteInvisible(limite: LimiteHueco): string | null {
  if (limite.clase !== 'INVISIBLE') return null
  return `@INVISIBLE:${limite.tipoTravesano ?? limite.orientacion}`
}

export interface PiezaGeometria {
  articuloCodigo: string
  funcion: string | null
  idItemDisenyo?: number | null
  grupoDisenyo?: string | null
}

/** Resuelve un límite a perfil real sólo cuando el despiece lo identifica sin ambigüedad. */
export function articuloDeLimite(
  piezas: PiezaGeometria[],
  limite: LimiteHueco,
): string | null {
  const invisible = marcadorLimiteInvisible(limite)
  if (invisible) return invisible
  const candidatas = limite.clase === 'MARCO'
    ? piezas.filter((p) => p.funcion === (limite.orientacion === 'V' ? 'MV' : 'MH'))
    : piezas.filter((p) => p.funcion === 'TM' && p.idItemDisenyo === limite.idItem)
  const articulos = new Set(candidatas.map((p) => p.articuloCodigo).filter(Boolean))
  return articulos.size === 1 ? [...articulos][0] : null
}

/** Perfil de hoja que actúa sobre un eje del vidrio, ligado al nodo de hoja exacto. */
export function articuloDeHoja(
  piezas: PiezaGeometria[],
  hojaId: number,
  funcion: 'HH' | 'HV',
): string | null {
  const articulos = new Set(
    piezas
      .filter((p) => p.idItemDisenyo === hojaId && p.grupoDisenyo === 'HP' && p.funcion === funcion)
      .map((p) => p.articuloCodigo)
      .filter(Boolean),
  )
  return articulos.size === 1 ? [...articulos][0] : null
}

export interface RanuraVidrio {
  idItemDisenyo: number | null
  formulaLargo: string | null
  formulaAncho: string | null
}

export interface ReglaAlojamiento {
  eje: 'L' | 'A'
  limite1: string
  limite2: string
  perfilHoja: string
  deltaMm: number
}

export interface VidrioDeAlojamiento {
  slot: number
  contexto: 'HOJA' | 'FIJO'
  largoMm: number
  anchoMm: number
  moduloLargoMm: number
  moduloAnchoMm: number
}

export type ResultadoVidriosAlojamiento =
  | { ok: true; vidrios: VidrioDeAlojamiento[] }
  | { ok: false; slot: number; motivo: string }

/** Calcula cada vidrio por sus límites. Una ranura incierta invalida el conjunto. */
export function calcularVidriosPorAlojamiento(
  ranuras: RanuraVidrio[],
  contexto: Contexto,
  nodos: Map<number, NodoDisenyo>,
  piezas: PiezaGeometria[],
  reglas: ReglaAlojamiento[],
): ResultadoVidriosAlojamiento {
  const porFirma = new Map(reglas.map((r) => [
    JSON.stringify([r.eje, r.limite1, r.limite2, r.perfilHoja]), r.deltaMm,
  ]))
  const firma = (eje: 'L' | 'A', x: string, y: string, perfil: string) => {
    const [limite1, limite2] = [x, y].sort()
    return JSON.stringify([eje, limite1, limite2, perfil])
  }
  const vidrios: VidrioDeAlojamiento[] = []
  for (let i = 0; i < ranuras.length; i++) {
    const slot = i + 1
    const r = ranuras[i]
    if (r.idItemDisenyo === null || !r.formulaLargo || !r.formulaAncho) {
      return { ok: false, slot, motivo: 'ranura sin geometría completa' }
    }
    let moduloLargoMm: number, moduloAnchoMm: number
    try {
      moduloLargoMm = evaluar(r.formulaLargo, contexto)
      moduloAnchoMm = evaluar(r.formulaAncho, contexto)
    } catch {
      return { ok: false, slot, motivo: 'fórmula de módulo no evaluable' }
    }
    const alojamiento = alojamientoDeVidrio(nodos, r.idItemDisenyo)
    const limites = alojamiento ? limitesDeHueco(nodos, alojamiento.huecoId) : null
    if (!alojamiento || !limites) return { ok: false, slot, motivo: 'hueco no reconstruible' }
    const sup = articuloDeLimite(piezas, limites.superior)
    const inf = articuloDeLimite(piezas, limites.inferior)
    const izq = articuloDeLimite(piezas, limites.izquierdo)
    const der = articuloDeLimite(piezas, limites.derecho)
    const hh = alojamiento.hojaId === null ? '' : articuloDeHoja(piezas, alojamiento.hojaId, 'HH')
    const hv = alojamiento.hojaId === null ? '' : articuloDeHoja(piezas, alojamiento.hojaId, 'HV')
    if (!sup || !inf || !izq || !der || hh === null || hv === null) {
      return { ok: false, slot, motivo: 'perfil delimitador ambiguo' }
    }
    const deltaL = porFirma.get(firma('L', sup, inf, hh))
    const deltaA = porFirma.get(firma('A', izq, der, hv))
    if (deltaL === undefined || deltaA === undefined) {
      return { ok: false, slot, motivo: 'sin regla histórica estable' }
    }
    const largoMm = moduloLargoMm - deltaL
    const anchoMm = moduloAnchoMm - deltaA
    if (largoMm <= 0 || anchoMm <= 0) {
      return { ok: false, slot, motivo: 'el descuento no cabe en el módulo' }
    }
    vidrios.push({
      slot, contexto: alojamiento.hojaId === null ? 'FIJO' : 'HOJA',
      largoMm, anchoMm, moduloLargoMm, moduloAnchoMm,
    })
  }
  return { ok: true, vidrios }
}
