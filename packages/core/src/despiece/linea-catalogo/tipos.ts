/**
 * Contratos del despiece completo de una línea de estructura a partir del
 * catálogo de Productor. El catálogo se inyecta: la web lo lee de PostgreSQL
 * y el contraste con facturas, de los CSV de la copia verificada.
 */

import type { DescuentoCorte } from '../cortes-referenciados.ts'
import type { OpcionCatalogo, ReglaAsociacion, SeleccionGuardada } from '../asociaciones/index.ts'
import type { FilaTablaAcristalamiento } from '../acristalamiento-catalogo.ts'
import type { ConceptoManoObraCatalogo } from '../mano-obra-fabricacion.ts'
import type { ArticuloTarifado } from '../../precios/importe-fila.ts'
import type { VarianteAcristalamiento } from '../../series/resolver.ts'

/** Fila de plantilla (`EstructurasArticulos` con `TipoDoc` vacío). */
export interface FilaPlantillaCatalogo {
  id: number
  articulo: string
  componente: string | null
  funcion: string | null
  cantidad: number
  posicionTrabajo: string | null
  tipoHoja: string | null
  mano: string | null
  hoja: number
  /** `DisVidrio`: módulo de mano de obra en filas `infMOmof`. */
  disVidrio: string | null
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
  perfilAdicional: number | null
  /** `OPCformulaSelec`: términos `G{grupo}O{opcion}` que deben estar marcados; vacío = siempre. */
  formulaSeleccion?: string | null
}

export interface ArticuloCatalogo {
  codigo: string
  tipoMetraje: string
  componente: string | null
  /** Grosor para acristalar (`TamJunqGoma`). */
  grosorAcristalar: number
  /** Doble acristalamiento (`DAcrisSN`). */
  dobleAcristalamiento: boolean
  /** Ranura genérica de plantilla (`GenericoSN`): debe resolverla la serie. */
  generico: boolean
}

export interface SerieCatalogo {
  codigo: string
  /** Columnas `herr*` y `mo*` sin prefijo: `2HC` -> `HU315`. */
  herrajes: Readonly<Record<string, string>>
  manoObra: Readonly<Record<string, string>>
  tablaHojas: string | null
  tablaFijos: string | null
  /**
   * Rangos de grosor de vidrio de la serie (`CorrGrosorVid`, `CorrGrosorVidDA`):
   * hasta el primero, perfil de vidrio simple (variante 1); por encima, doble
   * (variante 2). CHM 5.1.2.12.3.2. 0 = sin rango configurado.
   */
  grosorMaximoSimple: number
  grosorMaximoDoble: number
}

export interface CatalogoLinea {
  plantilla(estructura: string): readonly FilaPlantillaCatalogo[]
  esAccesorio(estructura: string): boolean
  articulo(codigo: string): ArticuloCatalogo | null
  serie(codigo: string): SerieCatalogo | null
  /** Artículo de la cadena de la serie para un componente; `'0'` = explícitamente vacío. */
  resolverComponente(serie: string, componente: string, variante: VarianteAcristalamiento): string | null
  descuentos(serie: string): readonly DescuentoCorte[]
  /** Nombre del tipo de hoja (`SeriesAsocV2TiposHoja.tipo`) por su id. */
  nombreTipoHoja(id: string): string | null
  asociaciones(conjunto: string): readonly ReglaAsociacion[]
  opciones(conjunto: string): readonly OpcionCatalogo[]
  gruposAsociacion(): ReadonlyMap<string, ReadonlySet<string>>
  tablaAcristalamiento(codigo: string): readonly FilaTablaAcristalamiento[]
  conceptosManoObra(): readonly ConceptoManoObraCatalogo[]
  /** `Estructuras.TipoPerf` de la estructura; null o ausente si no está en el catálogo. */
  tipoPerfil?(estructura: string): string | null
  /** PVP y reglas de metraje del artículo en ese acabado; null si no está en catálogo. */
  tarifa(articulo: string, acabado: string): ArticuloTarifado | null
}

/** Accesorio de línea (`VAccesorios` + `VOpciones`): estructura propia, acabado y opciones. */
export interface AccesorioLineaCatalogo {
  /** Estructura del accesorio (`Accesorio`: COM009, PSM001, GMT004…). */
  estructura: string
  acabado: string
  /** Opciones marcadas del accesorio, `G{grupo}O{opcion}`. */
  opciones: readonly string[]
}

/** Compacto de persiana de la línea. */
export interface CompactoLineaCatalogo extends AccesorioLineaCatalogo {
  altoCajonMm: number
  vueloIzquierdoMm: number
  vueloDerechoMm: number
  posicionGuiaCentralMm: number
  /** `DtoHuecoV`; solo 0 está contrastado. */
  descuentoVerticalMm: number
}

export interface EntradaLineaCatalogo {
  estructura: string
  serie: string
  anchoMm: number
  altoMm: number
  /** Vidrio de la línea (`Conjunto2`); null si la estructura no lleva. */
  vidrio: string | null
  acabado: string
  acabadoAccesorios: string
  opcionesGuardadas: readonly SeleccionGuardada[]
  /** Cotas de la instancia (FI, TD…) cuando la plantilla las usa. */
  cotas?: Readonly<Record<string, number>>
  /** Ajuste manual de fabricación de la línea (`HorasAdFabr`) en minutos. */
  minutosFabricacionAdicionales?: number
  /**
   * Colocación de la línea (`HorasColoc`) en minutos, fila `MOCOL` por unidad:
   * en EMP0016, 117/117 estructuras con `Cdad` > 1 y horas la llevan en el
   * despiece unitario y `ImporteTotal = Cdad × Precio`.
   */
  minutosColocacion?: number
  compacto?: CompactoLineaCatalogo | null
  /** Mosquitera y tapajuntas de la línea. */
  accesorios?: readonly AccesorioLineaCatalogo[]
}

export type OrigenFila = 'plantilla' | 'vidrio' | 'asociado' | 'acristalamiento' | 'mano-obra' | 'compacto'

export interface FilaDespieceCatalogo {
  origen: OrigenFila
  articulo: string
  acabado: string
  cantidad: number
  largoMm: number | null
  anchoMm: number | null
  funcion: string | null
  metraje: number | null
  /** Precio unitario efectivo de la fila (PVP con incremento por medida). */
  precio?: number | null
  importe: number | null
}

export interface ResultadoLineaCatalogo {
  filas: FilaDespieceCatalogo[]
  /** Suma de importes; null si falta cualquier dato: nunca un total parcial. */
  importe: number | null
  incidencias: string[]
  avisos: string[]
}
