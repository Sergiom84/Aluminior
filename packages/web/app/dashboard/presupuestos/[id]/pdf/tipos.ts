import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'

export interface CerramientoPdf {
  configuracion: ConfiguracionCerramiento
  estadoSnapshot: 'con-snapshot' | 'anterior-sin-snapshot'
  manoObra: readonly {
    concepto: string; horas: string | null; importe: string | null; valoracionCompleta: boolean
  }[]
}

export interface LineaPdf {
  id: string
  orden: number
  tipo: string
  descripcion: string
  referencia: string | null
  anchoMm: number | null
  altoMm: number | null
  cantidad: string
  precioUnitario: string | null
  total: string | null
  valoracionCompleta: boolean
  avisoValoracion: string | null
  cerramiento: CerramientoPdf | null
}

export interface DatosPresupuestoPdf {
  id: string
  serie: string
  numero: number
  revision: number
  fecha: string | null
  estado: string
  destinatario: string
  obra: string | null
  formaPago: string | null
  observaciones: string | null
  tarifa: number
  tipoIva: number
  baseImponible: number
  cuotaIva: number
  total: number
  incompleto: boolean
  lineas: LineaPdf[]
}
