/**
 * Diseño propio de un elemento (`Diseño V3` de Productor): el árbol que el
 * operador modifica y del que sale la plantilla de despiece del documento.
 * Los nodos conservan la forma plana de `EstructurasDiseño` para poder
 * contrastar el generador con las plantillas que guardó Productor.
 */
import type { FilaPlantillaCatalogo } from '../linea-catalogo/tipos.ts'

/** `EstructurasDiseño.Tipo` de los nodos que el generador entiende. */
export const TIPO_NODO = { marco: 1, hueco: 2, hoja: 3, vidrio: 5, travesano: 6, barrotillo: 7 } as const

/** `TipoTrav`: horizontal contando desde arriba o abajo, vertical desde la izquierda o la derecha. */
export type PosicionTravesano = 'HA' | 'HB' | 'VI' | 'VD'

/** `TipoCota`: 0 reparte el hueco a partes iguales, 1 lo mide una cota variable con símbolo, 2 fija una medida en mm. */
export const TIPO_COTA = { equidistante: 0, variable: 1, fija: 2 } as const

export interface NodoDiseno {
  /** `Id` dentro del diseño; la raíz es 0. Las filas salen en este orden. */
  id: number
  tipo: number
  /** `ContenidoEn`: id del marco o del hueco que lo contiene (del vidrio, en un barrotillo). */
  contenidoEn: number
  /** Marco: `TipoMarco` (`NOR`) y corte de sus cuatro esquinas (1 a inglete, 2 recto). */
  tipoMarco?: string | null
  cortes?: readonly number[]
  /** Cualquier nodo: `TipoCurva` distinto de 0 es un diseño con curva o tirada. */
  curva?: number
  /** Travesaño y hueco: grupo de división (`idTrav`) y orden dentro de él (`nTrav` / `posHueco`). */
  posicion?: PosicionTravesano | null
  division?: number
  orden?: number
  /** Travesaño: `TipoCota`, `Cota` en mm, material (`travMH`) y clase (`TravVP`; en la hoja, `moVP`). */
  tipoCota?: number
  cota?: number
  /** Símbolo de la cota variable (`FI`, `FS`…): su valor lo da la línea, no la plantilla. */
  simbolo?: string | null
  material?: string | null
  clase?: string | null
  /** Hoja: `TipoHoja` de `SeriesAsocV2TiposHoja`, vierteaguas (`bVAG`), accesorios de diseño (`lstAccDis`),
   *  apertura exterior (`bApertExt`) y hoja inferior (`CompHojaInf`). Su clase es `moVP`; sus cortes, como el marco. */
  tipoHoja?: number
  vierteaguas?: boolean
  accesorios?: readonly string[]
  aperturaExterior?: boolean
  hojaInferior?: boolean
  /** Vidrio: artículo propio del hueco; vacío hereda el de la línea. */
  vidrio?: string | null
  /** Barrotillo: artículo y número de barras. */
  articulo?: string | null
  horizontales?: number
  verticales?: number
}

export interface EntradaDisenoPropio {
  nodos: readonly NodoDiseno[]
  /** `Estructuras.DisFIsn`: fijo independiente de corredera, con otro marco. */
  fijoIndependiente?: boolean
}

export type PlantillaDisenoPropio =
  | { ok: true; filas: FilaPlantillaCatalogo[] }
  /** El diseño usa algo cuya regla no está demostrada: no se inventa una plantilla. */
  | { ok: false; motivo: string }
