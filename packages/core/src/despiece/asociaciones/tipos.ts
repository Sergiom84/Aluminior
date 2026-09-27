/**
 * Contratos del motor de asociaciones (`ConjuntosAsoc` de Productor).
 *
 * Semántica documentada en el manual (CHM 5.1.2.12.7.7.1) y contrastada con
 * el despiece guardado de las facturas de 2026:
 * docs/paridad/fase-7/06-reglas-catalogo-despiece-completo.md.
 */

/**
 * Un elemento de la estructura al que se puede asociar un artículo: una fila
 * de plantilla (perfil, informativo, módulo de mano de obra) o uno de los
 * virtuales ANCHO (`A`) y ALTO (`L`).
 */
export interface ElementoAsociable {
  /** Componente (`Articulos.Componente` del genérico o `DisComponente`). */
  componente: string
  /** Componente con variante de acristalamiento resuelta, p. ej. `23.2`. */
  componenteVariante?: string | null
  /** Grupo de descuento (`DisGrupo`). */
  grupo?: string | null
  /** Cantidad de la fila de plantilla: cuatro escuadras, dos bisagras… */
  cantidad: number
  /** Corte del elemento en mm; null si no se pudo calcular. */
  medidaMm: number | null
  /** Artículo real que ocupa el elemento (perfiles), para el artículo principal. */
  articulo?: string | null
  funcion?: string | null
  /** `L` vertical, `A` horizontal. */
  posicionTrabajo?: string | null
  mano?: string | null
  /** Número de hoja (`DisNHoja`); 0 para el marco. */
  hoja?: number
  /** Módulo de mano de obra de las filas `infMOmof`. */
  modulo?: string | null
}

/** Conjunto de asociaciones y elementos contra los que se evalúa. */
export interface AmbitoAsociacion {
  conjunto: string
  /** Tipo de hoja del grupo (filtro `AperturaTH`); null en el ámbito de serie. */
  tipoHoja: string | null
  elementos: readonly ElementoAsociable[]
}

/** Una fila de `ConjuntosAsoc`. Números ya convertidos; vacío = 0 o null. */
export interface ReglaAsociacion {
  id: string
  conjunto: string
  articulo: string
  cantidad: number
  /** Código o comodín (`---A` accesorios, `---P` perfiles). */
  acabado: string
  intervalo: number
  medidaMin: number
  medidaMax: number
  unidadesMin: number
  unidadesMax: number
  /** `C` medida de corte. */
  tipoMedida: string
  descuento: number
  formulaLargo: string | null
  formulaAncho: string | null
  soloUna: boolean
  /** `!` = sin componente. */
  componente: string
  /** `!` = sin grupo de descuento. */
  grupo: string
  grupoAsociacion: string | null
  /** Lista de módulos (`15;16;`) o null. */
  modulos: string | null
  articuloPrincipal: string | null
  opcion: string | null
  formulaOpcion: string | null
  /** Tipo de hoja; 0 = general. */
  apertura: number
  mano: string | null
  posicionTrabajo: string | null
  /** Texto «Asociado A»; vacío en filas sin destino. */
  asociadoA: string
  /** Rasgos que el motor no interpreta todavía; si la regla aplica, bloquea. */
  noContrastado?: readonly string[]
}

export interface AsociadoEmitido {
  articulo: string
  cantidad: number
  /** Corte en mm para artículos por metro; null en unidades. */
  largoMm: number | null
  acabado: string
  reglaId: string
  conjunto: string
}

export interface ResultadoAsociaciones {
  asociados: AsociadoEmitido[]
  /** Motivos que impiden dar el resultado por completo. */
  incidencias: string[]
}
