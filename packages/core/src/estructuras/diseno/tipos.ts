/**
 * Vocabulario visual verificado contra Estructuras/EstructurasDiseño.
 *
 * Los códigos son identificadores opacos. Cada composición se declara a partir
 * de filas observadas; nunca se intenta descifrar la forma leyendo el código.
 */
export type AperturaVisual =
  | 'fijo'
  | 'abatible-izquierda'
  | 'abatible-derecha'
  | 'oscilobatiente-izquierda'
  | 'oscilobatiente-derecha'

export type EjeDivision = 'horizontal' | 'vertical'

export type ClaseSeparador = 'travesano' | 'division-invisible' | 'union'

export interface HuecoVisual {
  tipo: 'hueco'
  id: string
  apertura: AperturaVisual
  /** Por defecto, toda hoja móvil conserva manilla y un fijo no la tiene. */
  manilla?: boolean
}

export interface HijoVisual {
  proporcion: number
  nodo: NodoVisual
}

export interface DivisionVisual {
  tipo: 'division'
  id: string
  eje: EjeDivision
  separador: ClaseSeparador
  hijos: readonly HijoVisual[]
}

export type NodoVisual = HuecoVisual | DivisionVisual

export type FamiliaVisual =
  | 'FIJOS'
  | 'OSCILOBATIENTES'
  | 'VENTANAS ABATIBLES'
  | 'COMBINACIONES'

export interface PlantillaDiseno {
  codigo: string
  descripcion: string
  familia: FamiliaVisual
  /** Familia real de Productor; independiente de la etiqueta visual histórica. */
  familiaCodigo?: string
  anchoMm: number
  altoMm: number
  composicion: NodoVisual
}

export interface UnionVisual {
  codigo: string
  descripcion: string
  grosorMm: number
}

export interface RectVisual { x: number; y: number; ancho: number; alto: number }

export interface HuecoColocado extends RectVisual {
  tipo: 'hueco'
  id: string
  apertura: AperturaVisual
  manilla: boolean
}

export interface SeparadorColocado extends RectVisual {
  tipo: 'separador'
  id: string
  eje: EjeDivision
  clase: ClaseSeparador
}

export type ElementoColocado = HuecoColocado | SeparadorColocado
