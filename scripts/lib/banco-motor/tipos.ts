import type {
  ComponentePlantilla,
  PiezaCortada,
} from '@aluminior/core/despiece'
import type { LineaValorada } from '@aluminior/core/precios'
import type { Decimal } from '@aluminior/core/precios'

export type ValorJson =
  | null
  | boolean
  | number
  | string
  | readonly ValorJson[]
  | { readonly [clave: string]: ValorJson }

export type CuatroSeries = readonly [
  string | null,
  string | null,
  string | null,
  string | null,
]

export type DosAcabados = readonly [string | null, string | null]

export interface AjustesConfiguracion {
  readonly horasFabricacion: number | null
  readonly horasInstalacion: number | null
  readonly precioManual: number | null
}

export interface ConfiguracionTecnicaOriginal {
  readonly codigo: string
  readonly series: CuatroSeries
  readonly acabados: DosAcabados
  readonly medidasMm: { readonly ancho: number; readonly alto: number }
  readonly cantidadComercial: number
  readonly opciones: ValorJson
  readonly acristalamiento: ValorJson
  readonly ajustes: AjustesConfiguracion
}

export interface DeclaracionesPendientes {
  readonly disenoEspecificoNoReconstruido: boolean
  readonly herrajeDesconocido: boolean
  readonly vidrioOSuperficieRequerido: boolean
  readonly ajustesManualesPresentes: boolean
}

export interface ComponentePreparado extends ComponentePlantilla {
  readonly cantidad: string | number
  readonly medidaMinima: string | number | null
  readonly medidaMaxima: string | number | null
}

export interface ArticuloMaterialPreparado {
  readonly codigo: string
  readonly tipoMetraje: 'ML' | 'UD'
  readonly metrajeMinimo: number | null
  readonly metrajeMultiploLargo: number | null
}

export interface ReglaRebajePreparada {
  readonly articuloCodigo: string
  readonly funcion: string
  readonly formula: string
  readonly serie: string
  readonly mm: number
  readonly muestras: number
  readonly totalMuestras: number
}

export interface ContextoMaterialPreparado {
  readonly alcance: 'materiales-parciales'
  readonly serieResuelta: string
  readonly plantilla: readonly ComponentePreparado[]
  readonly cotas: Readonly<Record<string, number>>
  readonly articulos: readonly ArticuloMaterialPreparado[]
  readonly rebajes: readonly ReglaRebajePreparada[]
  readonly procedencias: readonly string[]
}

export interface FilaPvpPreparada {
  readonly articuloCodigo: string
  readonly tarifaId: string
  readonly acabadoCodigo: string
  readonly precio: Decimal
}

export interface ContextoPrecioPreparado {
  readonly tarifaId: string
  readonly fechaReferencia: string
  readonly vigencia: {
    readonly desde: string
    readonly hasta: string | null
  }
  readonly modo: 'despiece'
  readonly acabadoAplicado: string
  readonly filasPvp: readonly FilaPvpPreparada[]
}

export interface EntradaDiagnosticoMotor {
  readonly configuracion: ConfiguracionTecnicaOriginal
  readonly contextoMaterial: ContextoMaterialPreparado
  readonly declaraciones: DeclaracionesPendientes
  readonly contextoPrecio?: ContextoPrecioPreparado
}

export interface IncidenciaMaterial {
  readonly indicePieza: number
  readonly articuloCodigo: string
  readonly mensaje: string
}

export interface ResultadoMateriales {
  readonly estado: 'completo' | 'incompleto' | 'no-ejecutado'
  readonly piezas: readonly PiezaCortada[]
  readonly incidencias: readonly IncidenciaMaterial[]
  readonly avisos: readonly string[]
  readonly variablesFaltantes: readonly string[]
}

export interface ResultadoPrecio {
  readonly estado:
    | 'completo'
    | 'sin-contexto'
    | 'contexto-invalido'
    | 'material-incompleto'
    | 'incompleto'
    | 'desbordamiento'
    | 'no-ejecutado'
  readonly importeMateriales: number | null
  readonly lineas: readonly LineaValorada[]
  readonly incidencias: readonly string[]
}

export interface ResultadoDiagnosticoMotor {
  readonly estado: 'ejecutado' | 'parcial' | 'bloqueado'
  readonly entrada: EntradaDiagnosticoMotor
  readonly procedencias: readonly string[]
  readonly alcance: 'materiales-parciales'
  readonly bloqueos: readonly string[]
  readonly materiales: ResultadoMateriales
  readonly precio: ResultadoPrecio
  readonly paridadComercialVerificada: false
}

export interface PiezaFisica {
  readonly articuloCodigo: string
  readonly funcion: string | null
  readonly cantidad: number
  readonly largoMm: number | null
  readonly tipoCorte: string | null
  readonly anguloIzquierdo: number | null
  readonly anguloDerecho: number | null
}

export interface DiferenciaMulticonjunto {
  readonly pieza: PiezaFisica
  readonly multiplicidad: number
}

export type CampoFisico = Exclude<keyof PiezaFisica, 'articuloCodigo' | 'funcion'>

export interface CambioFisico {
  readonly articuloCodigo: string
  readonly funcion: string | null
  readonly diferencias: readonly {
    readonly campo: CampoFisico
    readonly referencia: number | string | null
    readonly actual: number | string | null
  }[]
}

export interface ComparacionMateriales {
  readonly estado: 'igual-parcial' | 'diferente' | 'entrada-distinta' | 'no-comparable'
  readonly faltantesEnActual: readonly DiferenciaMulticonjunto[]
  readonly sobrantesEnActual: readonly DiferenciaMulticonjunto[]
  readonly cambios: readonly CambioFisico[]
  readonly camposExcluidos: readonly string[]
  readonly advertencia: string
}
