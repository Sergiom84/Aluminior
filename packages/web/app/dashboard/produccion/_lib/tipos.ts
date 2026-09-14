import type { schema } from '@aluminior/db'
import type { PiezaSnapshotCerramiento } from '@aluminior/core/estructuras'
import type { ReferenciaDocumento } from '@aluminior/core/produccion'

export type FilaDespieceProduccion = typeof schema.lineasDespiece.$inferSelect
export interface LineaDatosProduccion {
  id: string; orden: number; tipo: string; cantidad: string; descripcion: string; referencia: string | null
  anchoMm: number | null; altoMm: number | null
  configuracion: unknown; versionConfiguracion: number | null; resultado: unknown; versionResultado: number | null
  piezas: readonly FilaDespieceProduccion[]
}
export interface ArticuloProduccion {
  codigo: string; descripcion: string; apareceEnHojaCorte: boolean; apareceEnHojaDespiece: boolean
}
export interface DatosProduccion {
  id: string; documento: ReferenciaDocumento; lineas: readonly LineaDatosProduccion[]
  articulos: readonly ArticuloProduccion[]
}
export interface ReferenciaPiezaProduccion {
  documentoId: string; lineaId: string; tipoOrigen: 'MODULO' | 'UNION'
  origenId: string; ordinal: number
}
export interface PiezaProduccionValidada {
  referencia: ReferenciaPiezaProduccion; etiqueta: string; pieza: PiezaSnapshotCerramiento
  cantidadLinea: string; descripcionLinea: string; referenciaLinea: string | null
  anchoMm: number; altoMm: number
}
export interface IncidenciaProduccion { referencia: string; detalle: string; bloqueante: boolean }
