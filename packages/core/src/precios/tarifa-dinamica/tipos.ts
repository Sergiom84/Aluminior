import type { Decimal } from '../decimal.ts'

/** Criterios de un registro, sin precio, fórmula, activación ni grupo inferido. */
export interface RegistroTarifaDinamica {
  readonly id: string
  readonly clienteCodigo: string
  readonly grupoAcabadoCodigo: string
  readonly tipoArticuloCodigo: string
  readonly tamanoCodigo: string
  readonly metrajeDesde: Decimal
  readonly metrajeHasta: Decimal
}

export interface EntradaSeleccionRegistroTarifaDinamica {
  readonly clienteCodigo: string | null
  readonly grupoAcabadoCodigo: string | null
  readonly tipoArticuloCodigo: string | null
  readonly tamanoCodigo: string | null
  readonly metraje: Decimal | null
  /** Catálogo completo; el grupo debe llegar resuelto por un contrato externo. */
  readonly registros: readonly RegistroTarifaDinamica[]
}

export type EtapaSeleccionTarifaDinamica =
  | 'TAMANO_EXACTO_INTERVALO'
  | 'TAMANO_EXACTO_GENERAL'
  | 'TAMANO_COMODIN_INTERVALO'
  | 'TAMANO_COMODIN_GENERAL'

interface OrigenSeleccion {
  readonly fuente: 'TARIFA_DINAMICA_REGISTRO'
}

/** RESUELTO solo acredita selección de registro, nunca un precio comercial. */
export type SeleccionRegistroTarifaDinamica = OrigenSeleccion & (
  | { readonly estado: 'RESUELTO'; readonly etapa: EtapaSeleccionTarifaDinamica;
      readonly registro: RegistroTarifaDinamica; readonly registrosAmbiguos: readonly [];
      readonly incidencias: readonly [] }
  | { readonly estado: 'AMBIGUO'; readonly etapa: EtapaSeleccionTarifaDinamica;
      readonly registro: null; readonly registrosAmbiguos: readonly string[];
      readonly incidencias: readonly [] }
  | { readonly estado: 'SIN_COINCIDENCIA' | 'BLOQUEADO'; readonly etapa: null;
      readonly registro: null; readonly registrosAmbiguos: readonly [];
      readonly incidencias: readonly string[] }
)
