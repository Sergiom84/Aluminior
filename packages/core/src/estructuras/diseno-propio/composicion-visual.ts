/**
 * Proyección visual de un diseño propio (`Diseño V3`) a `NodoVisual`.
 *
 * No reimplementa el árbol ni el catálogo de hojas: consume `resolverRegiones`
 * (la misma lectura que `generarPlantillaDisenoPropio`), `aperturaTipoHoja` y
 * los nodos de barrotillo interior (`BI`) que también valora el motor.
 *
 * En travesaños de cota variable (`TipoCota = 1`), la medida sale únicamente
 * de la línea (`cotasModulo`); nunca de un número oculto en el nodo.
 */
import {
  generarPlantillaDisenoPropio, resolverRegiones, TIPO_COTA, TIPO_NODO,
  type Division, type NodoDiseno,
} from '../../despiece/diseno-propio/index.ts'
import type { BarrotilloVisual, NodoVisual, RectVisual } from '../diseno.ts'
import { aperturaTipoHoja } from '../tipos-hoja-catalogo.ts'

export interface DisenoPropioModulo {
  readonly nodos: readonly NodoDiseno[]
}

export interface SegmentoBarrotillo {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
}

/** Segmentos interiores equidistantes de un barrotillo sobre el rectángulo del cristal. */
export function lineasBarrotilloVisual(
  vidrio: RectVisual,
  barrotillo?: BarrotilloVisual,
): readonly SegmentoBarrotillo[] {
  if (!barrotillo || vidrio.ancho <= 0 || vidrio.alto <= 0) return []
  const h = Math.max(0, Math.trunc(barrotillo.horizontales))
  const v = Math.max(0, Math.trunc(barrotillo.verticales))
  const lineas: SegmentoBarrotillo[] = []
  for (let i = 1; i <= h; i++) {
    const y = vidrio.y + (vidrio.alto * i) / (h + 1)
    lineas.push({ x1: vidrio.x, y1: y, x2: vidrio.x + vidrio.ancho, y2: y })
  }
  for (let j = 1; j <= v; j++) {
    const x = vidrio.x + (vidrio.ancho * j) / (v + 1)
    lineas.push({ x1: x, y1: vidrio.y, x2: x, y2: vidrio.y + vidrio.alto })
  }
  return lineas
}

function barrotilloDeVidrio(nodos: readonly NodoDiseno[], vidrioId: number | undefined): BarrotilloVisual | undefined {
  if (vidrioId === undefined) return undefined
  const horizontales = nodos
    .filter(n => n.tipo === TIPO_NODO.barrotillo && n.contenidoEn === vidrioId)
    .reduce((suma, n) => suma + (n.horizontales ?? 0), 0)
  const verticales = nodos
    .filter(n => n.tipo === TIPO_NODO.barrotillo && n.contenidoEn === vidrioId)
    .reduce((suma, n) => suma + (n.verticales ?? 0), 0)
  return horizontales > 0 || verticales > 0 ? { horizontales, verticales } : undefined
}

export function composicionVisualDisenoPropio(
  diseno: DisenoPropioModulo,
  cotasModulo?: Readonly<Record<string, number>> | null,
): NodoVisual | null {
  const { nodos } = diseno
  if (new Set(nodos.map(n => n.id)).size !== nodos.length) return null
  if (!generarPlantillaDisenoPropio({ nodos }).ok) return null
  const raiz = nodos.find(n => n.tipo === TIPO_NODO.marco)
  if (!raiz) return null

  const { divisiones, divididas } = resolverRegiones(nodos, raiz)
  const divisionPorContenedor = new Map<number, Division>()
  for (const d of divisiones.values()) divisionPorContenedor.set(d.contenidaEn, d)

  const cotaDeLinea = (trav: NodoDiseno): number | null => {
    const simbolo = trav.simbolo?.trim()
    const mm = simbolo ? cotasModulo?.[simbolo] : undefined
    return typeof mm === 'number' && Number.isFinite(mm) && mm > 0 ? mm : null
  }

  const proyectar = (regionId: number, numeroEnPareja = 0): NodoVisual | null => {
    if (divididas.has(regionId)) {
      const d = divisionPorContenedor.get(regionId)
      if (!d) return null
      const primero = d.travesanos[0]!
      const eje = d.horizontal ? 'horizontal' as const : 'vertical' as const
      const separador = d.invisible ? 'division-invisible' as const : 'travesano' as const
      const esParejaHojas = d.invisible && !d.horizontal && d.huecos.length === 2 &&
        d.huecos.every(h => nodos.some(n => n.tipo === TIPO_NODO.hoja && n.contenidoEn === h.id))

      const tipoCota = primero.tipoCota ?? TIPO_COTA.equidistante
      let cotaFija: { desde: 'inicio' | 'fin'; mm: number } | undefined
      if (tipoCota === TIPO_COTA.fija || tipoCota === TIPO_COTA.variable) {
        const mm = tipoCota === TIPO_COTA.variable ? cotaDeLinea(primero) : (primero.cota ?? 0)
        if (mm === null || !(mm > 0)) return null
        cotaFija = { desde: primero.posicion === 'HB' || primero.posicion === 'VD' ? 'fin' : 'inicio', mm }
      }

      const hijos: { proporcion: number; nodo: NodoVisual }[] = []
      for (const [i, h] of d.huecos.entries()) {
        const nodo = proyectar(h.id, esParejaHojas ? i + 1 : 0)
        if (!nodo) return null
        hijos.push({ proporcion: 1, nodo })
      }
      return {
        tipo: 'division', id: `division-${primero.id}`, eje, separador,
        ...(cotaFija ? { cotaFija } : {}),
        hijos,
      }
    }

    const hoja = nodos.find(n => n.tipo === TIPO_NODO.hoja && n.contenidoEn === regionId)
    if (hoja) {
      const apertura = aperturaTipoHoja(hoja.tipoHoja ?? 0, numeroEnPareja)
      if (!apertura) return null
      const vidrio = nodos.find(n => n.tipo === TIPO_NODO.vidrio && n.contenidoEn === hoja.id)
      const barrotillo = barrotilloDeVidrio(nodos, vidrio?.id)
      const manilla = hoja.accesorios !== undefined
        ? hoja.accesorios.includes('MI')
        : apertura.startsWith('oscilobatiente') || numeroEnPareja === 0
      return {
        tipo: 'hueco', id: `nodo-${hoja.id}`, apertura, manilla,
        ...(barrotillo ? { barrotillo } : {}),
      }
    }

    const vidrio = nodos.find(n => n.tipo === TIPO_NODO.vidrio && n.contenidoEn === regionId)
    const barrotillo = barrotilloDeVidrio(nodos, vidrio?.id)
    return {
      tipo: 'hueco', id: `nodo-${vidrio?.id ?? regionId}`, apertura: 'fijo',
      ...(barrotillo ? { barrotillo } : {}),
    }
  }

  return proyectar(raiz.id)
}
