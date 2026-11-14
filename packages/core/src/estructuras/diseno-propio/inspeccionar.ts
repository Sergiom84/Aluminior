/**
 * Inspección sin I/O de un diseño propio para el editor `Diseño V3`:
 * conecta cada división real y cada hueco editable con su ID visual del SVG y
 * sus medidas físicas resueltas.
 */
import {
  resolverRegiones, TIPO_COTA, TIPO_NODO, type PosicionTravesano,
} from '../../despiece/diseno-propio/index.ts'
import type { BarrotilloVisual, RectVisual } from '../diseno.ts'
import { resolverGeometriaComposicion, type GeometriaComposicion } from '../geometria-composicion.ts'
import { composicionVisualDisenoPropio, type DisenoPropioModulo } from './composicion-visual.ts'

export type ModoHuecoEditable =
  | { readonly modo: 'fijo' }
  | { readonly modo: 'hoja'; readonly tipoHoja: 1 | 2 | 5 | 6; readonly vierteaguas: boolean; readonly manilla: boolean }
  | { readonly modo: 'pareja'; readonly tipoHoja: 8 | 9; readonly indiceHoja: 1 | 2 }

export interface DivisionEditableDiseno {
  readonly divisionId: number
  readonly elementoVisualId: string
  readonly contenidaEn: number
  readonly posicion: PosicionTravesano
  readonly tipoCota: 0 | 1 | 2
  readonly huecos: number
  readonly cotaMm: number
  readonly simbolo: string | null
  readonly anchoContenedorMm: number | null
  readonly altoContenedorMm: number | null
}

export interface HuecoEditableDiseno {
  readonly regionId: number
  readonly regionSuperficieId: number
  readonly elementoVisualId: string
  readonly indice: number
  readonly rectMm: RectVisual | null
  readonly contenido: ModoHuecoEditable
  readonly vidrioPropio: string | null
  readonly barrotillo: BarrotilloVisual | null
}

export interface InspeccionDisenoPropio {
  readonly valido: boolean
  readonly divisiones: readonly DivisionEditableDiseno[]
  readonly huecos: readonly HuecoEditableDiseno[]
}

function indexarRectsVisuales(geo: GeometriaComposicion, mapa: Map<string, RectVisual>) {
  mapa.set(geo.nodo.id, geo.rect)
  for (const h of geo.hijos) indexarRectsVisuales(h, mapa)
}
export function inspeccionarDisenoPropio(
  diseno: DisenoPropioModulo,
  anchoMm: number,
  altoMm: number,
  cotasModulo?: Readonly<Record<string, number>> | null,
): InspeccionDisenoPropio {
  const { nodos } = diseno
  const raiz = nodos.find(n => n.tipo === TIPO_NODO.marco)
  if (!raiz) return { valido: false, divisiones: [], huecos: [] }

  const composicion = composicionVisualDisenoPropio(diseno, cotasModulo)
  const geometria = composicion ? resolverGeometriaComposicion(composicion, anchoMm, altoMm) : null
  const rectsPorIdVisual = new Map<string, RectVisual>()
  if (geometria?.valido) indexarRectsVisuales(geometria.geometria, rectsPorIdVisual)

  let regionesInfo
  try {
    regionesInfo = resolverRegiones(nodos, raiz)
  } catch {
    return { valido: false, divisiones: [], huecos: [] }
  }

  const divisiones: DivisionEditableDiseno[] = []
  const parejasPorHueco = new Map<number, { contenidaEn: number; indice: 1 | 2 }>()

  for (const d of regionesInfo.divisiones.values()) {
    const primero = d.travesanos[0]!
    if (d.invisible) {
      d.huecos.forEach((h, idx) => parejasPorHueco.set(h.id, { contenidaEn: d.contenidaEn, indice: (idx + 1) as 1 | 2 }))
      continue
    }
    const idVisual = `division-${primero.id}`
    const rectContenedor = rectsPorIdVisual.get(idVisual) ?? null
    const tipoCota = (primero.tipoCota ?? TIPO_COTA.equidistante) as 0 | 1 | 2
    const simbolo = primero.simbolo?.trim() || null
    const cotaLinea = tipoCota === TIPO_COTA.variable && simbolo ? cotasModulo?.[simbolo] : undefined
    divisiones.push({
      divisionId: primero.division ?? primero.id,
      elementoVisualId: `${idVisual}-1`,
      contenidaEn: d.contenidaEn,
      posicion: (primero.posicion ?? 'HB') as PosicionTravesano,
      tipoCota,
      huecos: d.huecos.length,
      cotaMm: typeof cotaLinea === 'number' && Number.isFinite(cotaLinea) ? cotaLinea : (primero.cota ?? 0),
      simbolo,
      anchoContenedorMm: rectContenedor?.ancho ?? null,
      altoContenedorMm: rectContenedor?.alto ?? null,
    })
  }

  const regionesFinales: number[] = []
  const recolectarFinales = (regId: number) => {
    const div = [...regionesInfo.divisiones.values()].find(d => d.contenidaEn === regId)
    if (!div) { regionesFinales.push(regId); return }
    for (const h of div.huecos) recolectarFinales(h.id)
  }
  recolectarFinales(raiz.id)

  const huecos: HuecoEditableDiseno[] = regionesFinales.map((regId, idx) => {
    const hoja = nodos.find(n => n.tipo === TIPO_NODO.hoja && n.contenidoEn === regId)
    const vidrio = nodos.find(n => n.tipo === TIPO_NODO.vidrio && n.contenidoEn === (hoja ? hoja.id : regId))
    const barrotillos = vidrio ? nodos.filter(n => n.tipo === TIPO_NODO.barrotillo && n.contenidoEn === vidrio.id) : []
    const hBarr = barrotillos.reduce((s, b) => s + (b.horizontales ?? 0), 0)
    const vBarr = barrotillos.reduce((s, b) => s + (b.verticales ?? 0), 0)
    const elementoVisualId = hoja ? `nodo-${hoja.id}` : `nodo-${vidrio?.id ?? regId}`
    const infoPareja = parejasPorHueco.get(regId)

    let contenido: ModoHuecoEditable = { modo: 'fijo' }
    if (hoja && infoPareja && (hoja.tipoHoja === 8 || hoja.tipoHoja === 9)) {
      contenido = { modo: 'pareja', tipoHoja: hoja.tipoHoja, indiceHoja: infoPareja.indice }
    } else if (hoja && (hoja.tipoHoja === 1 || hoja.tipoHoja === 2 || hoja.tipoHoja === 5 || hoja.tipoHoja === 6)) {
      contenido = {
        modo: 'hoja',
        tipoHoja: hoja.tipoHoja,
        vierteaguas: hoja.vierteaguas ?? true,
        manilla: hoja.accesorios !== undefined ? hoja.accesorios.includes('MI') : true,
      }
    }

    return {
      regionId: infoPareja ? infoPareja.contenidaEn : regId,
      regionSuperficieId: regId,
      elementoVisualId,
      indice: idx + 1,
      rectMm: rectsPorIdVisual.get(elementoVisualId) ?? null,
      contenido,
      vidrioPropio: vidrio?.vidrio?.trim() || null,
      barrotillo: hBarr > 0 || vBarr > 0 ? { horizontales: hBarr, verticales: vBarr } : null,
    }
  })

  return { valido: Boolean(geometria?.valido), divisiones, huecos }
}

