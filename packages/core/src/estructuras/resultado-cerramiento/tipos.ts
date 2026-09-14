import type { ConfiguracionCerramiento } from '../cerramiento.ts'
import type { Decimal } from '../../precios/decimal.ts'

export interface OrigenCerramiento { tipo: 'MODULO' | 'UNION'; id: string }
export interface DiagnosticoCerramiento {
  codigo: string
  ambito: 'VENTA' | 'COSTE' | 'FABRICACION'
  bloqueante: boolean
  detalle: string
}
export interface ImporteSnapshot { completo: boolean; importe: Decimal | null }
export interface PiezaSnapshotCerramiento {
  ordinal: number
  articuloCodigo: string
  acabadoCodigo: string | null
  unidad: string | null
  cantidad: Decimal
  largoCorteMm: Decimal | null
  anchoCorteMm: Decimal | null
  anguloIzquierdo: Decimal | null
  anguloDerecho: Decimal | null
  funcion: string | null
  posicionTrabajo: string | null
  costeUnitario: Decimal | null
  costeTotal: Decimal | null
}
export interface RanuraSnapshotCerramiento {
  slot: number
  vidrioHojas: string | null
  vidrioFijos: string | null
  variante: '1' | '2'
}
export interface HerrajeSnapshotCerramiento {
  categoria: string
  opcionCodigo: string
  descripcion: string | null
}
/** Una partida conserva el agrupamiento del motor, incluidos mínimos de metraje. */
export interface PartidaValoracionCerramiento {
  ordinal: number
  grupoValoracion: 'MATERIALES' | 'VIDRIO' | 'ACRISTALAMIENTO'
  articuloCodigo: string
  unidad: string | null
  cantidadFacturable: Decimal | null
  precioUnitario: Decimal | null
  /** Producto exacto (hasta escala 10), sin redondear cada partida a céntimos. */
  importeExacto: Decimal | null
  incidencia: string | null
  tarifa: number
  criterioPrecio: 'EXACTO' | 'GENERICO' | 'SIN_PRECIO' | 'AMBIGUO'
  /** Acabado realmente aplicado por el precio, puede ser UNI aunque el origen pida L. */
  acabadoCodigo: string | null
}
export interface ResultadoOrigenCerramiento {
  origen: OrigenCerramiento
  codigo: string
  serieCodigo: string | null
  acabadoCodigo: string | null
  vidrioCodigo: string | null
  varianteAcristalamiento: '1' | '2'
  reglaMaterial: string | null
  venta: ImporteSnapshot
  coste: ImporteSnapshot
  piezas: readonly PiezaSnapshotCerramiento[]
  partidasValoracion: readonly PartidaValoracionCerramiento[]
  acristalamiento: readonly RanuraSnapshotCerramiento[]
  opcionesHerraje: readonly HerrajeSnapshotCerramiento[]
  diagnosticos: readonly DiagnosticoCerramiento[]
}
/** Materiales de UNA composición; la mano de obra manual vive en su propio snapshot. */
export interface ResultadoCerramientoV1 {
  version: 1
  redondeoVenta: 'ESTRUCTURA_NUMBER_V1'
  configuracion: ConfiguracionCerramiento
  motor: { codigo: string; version: string }
  tarifa: number
  unidadMateriales: 'COMPOSICION'
  ambitoManoObraManual: 'LINEA'
  origenes: readonly ResultadoOrigenCerramiento[]
  ventaMateriales: ImporteSnapshot
  costeMateriales: ImporteSnapshot
}
