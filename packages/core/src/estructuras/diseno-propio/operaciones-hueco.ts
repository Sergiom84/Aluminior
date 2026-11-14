/**
 * Operaciones inmutables sobre un hueco o cristal en `Diseño V3`:
 * hojas practicables/oscilobatientes (`1 Hoja` o pareja `2O`), vidrio propio y
 * barrotillo interior (`BI`).
 */
import { TIPO_COTA, TIPO_NODO, type NodoDiseno } from '../../despiece/diseno-propio/index.ts'
import type { BarrotilloVisual } from '../diseno.ts'
import type { DisenoPropioModulo } from './composicion-visual.ts'
import { normalizarArbolDiseno } from './normalizar.ts'
import { descendientesDe, siguienteIdLibre } from './operaciones-division.ts'

export type SeleccionHojaHueco =
  | { readonly modo: 'fijo' }
  | { readonly modo: 'hoja'; readonly tipoHoja: 1 | 2 | 5 | 6; readonly vierteaguas?: boolean; readonly manilla?: boolean }
  | { readonly modo: 'pareja'; readonly tipoHoja: 8 | 9 }

export function cambiarHojaHuecoDisenoPropio(
  diseno: DisenoPropioModulo,
  regionId: number,
  seleccion: SeleccionHojaHueco,
): DisenoPropioModulo {
  const { nodos } = diseno
  if (nodos.some(n => n.tipo === TIPO_NODO.travesano && !n.invisible && n.contenidoEn === regionId)) {
    return diseno
  }
  const desc = descendientesDe(nodos, new Set([regionId]))
  const primerVidrio = nodos.find(n => n.tipo === TIPO_NODO.vidrio && desc.has(n.id))
  const primerBarrotillo = primerVidrio
    ? nodos.find(n => n.tipo === TIPO_NODO.barrotillo && n.contenidoEn === primerVidrio.id)
    : undefined

  const base = nodos.filter(n => !desc.has(n.id))
  const sig = siguienteIdLibre(base)
  const nuevos: NodoDiseno[] = [...base]

  const adjuntarSuperficie = (contenedorVidrio: number, conservar: boolean) => {
    const vId = sig()
    nuevos.push({ id: vId, tipo: TIPO_NODO.vidrio, contenidoEn: contenedorVidrio, vidrio: conservar ? (primerVidrio?.vidrio ?? null) : null })
    if (conservar && primerBarrotillo) {
      nuevos.push({
        id: sig(), tipo: TIPO_NODO.barrotillo, contenidoEn: vId,
        articulo: primerBarrotillo.articulo ?? 'BI',
        horizontales: primerBarrotillo.horizontales ?? 0,
        verticales: primerBarrotillo.verticales ?? 0,
      })
    }
  }

  if (seleccion.modo === 'fijo') {
    adjuntarSuperficie(regionId, true)
  } else if (seleccion.modo === 'hoja') {
    const hojaId = sig()
    nuevos.push({
      id: hojaId, tipo: TIPO_NODO.hoja, contenidoEn: regionId,
      tipoHoja: seleccion.tipoHoja, clase: 'V',
      vierteaguas: seleccion.vierteaguas ?? true,
      cortes: [1, 1, 1, 1],
      accesorios: (seleccion.manilla ?? true) ? ['MI'] : [],
    })
    adjuntarSuperficie(hojaId, true)
  } else {
    const divId = sig(), hIzq = sig(), hDer = sig(), hojaIzq = sig(), hojaDer = sig()
    const osciloIzq = seleccion.tipoHoja === 9
    nuevos.push(
      { id: divId, tipo: TIPO_NODO.travesano, contenidoEn: regionId, posicion: 'VI', division: divId, orden: 1, tipoCota: TIPO_COTA.equidistante, material: 'M', clase: null, invisible: true },
      { id: hIzq, tipo: TIPO_NODO.hueco, contenidoEn: regionId, division: divId, orden: 1 },
      { id: hDer, tipo: TIPO_NODO.hueco, contenidoEn: regionId, division: divId, orden: 2 },
      { id: hojaIzq, tipo: TIPO_NODO.hoja, contenidoEn: hIzq, tipoHoja: seleccion.tipoHoja, clase: 'V', vierteaguas: true, cortes: [1, 1, 1, 1], accesorios: osciloIzq ? ['MI'] : [] },
      { id: hojaDer, tipo: TIPO_NODO.hoja, contenidoEn: hDer, tipoHoja: seleccion.tipoHoja, clase: 'V', vierteaguas: true, cortes: [1, 1, 1, 1], accesorios: osciloIzq ? [] : ['MI'] },
    )
    adjuntarSuperficie(hojaIzq, true)
    adjuntarSuperficie(hojaDer, false)
  }

  return normalizarArbolDiseno(nuevos)
}

export function cambiarVidrioHuecoDisenoPropio(
  diseno: DisenoPropioModulo,
  regionSuperficieId: number,
  vidrioCodigo: string | null,
): DisenoPropioModulo {
  const { nodos } = diseno
  const hoja = nodos.find(n => n.tipo === TIPO_NODO.hoja && n.contenidoEn === regionSuperficieId)
  const contenedor = hoja ? hoja.id : regionSuperficieId
  const limpio = vidrioCodigo?.trim().toUpperCase() || null
  return normalizarArbolDiseno(nodos.map(n =>
    n.tipo === TIPO_NODO.vidrio && n.contenidoEn === contenedor ? { ...n, vidrio: limpio } : n,
  ))
}

export function cambiarBarrotilloHuecoDisenoPropio(
  diseno: DisenoPropioModulo,
  regionSuperficieId: number,
  barrotillo: BarrotilloVisual | null,
): DisenoPropioModulo {
  const { nodos } = diseno
  const hoja = nodos.find(n => n.tipo === TIPO_NODO.hoja && n.contenidoEn === regionSuperficieId)
  const vidrio = nodos.find(n => n.tipo === TIPO_NODO.vidrio && n.contenidoEn === (hoja ? hoja.id : regionSuperficieId))
  if (!vidrio) return diseno

  const sinPrevios = nodos.filter(n => !(n.tipo === TIPO_NODO.barrotillo && n.contenidoEn === vidrio.id))
  const h = Math.max(0, Math.min(12, Math.trunc(barrotillo?.horizontales ?? 0)))
  const v = Math.max(0, Math.min(12, Math.trunc(barrotillo?.verticales ?? 0)))
  if (h === 0 && v === 0) return normalizarArbolDiseno(sinPrevios)

  const sig = siguienteIdLibre(sinPrevios)
  return normalizarArbolDiseno([
    ...sinPrevios,
    { id: sig(), tipo: TIPO_NODO.barrotillo, contenidoEn: vidrio.id, articulo: 'BI', horizontales: h, verticales: v },
  ])
}
