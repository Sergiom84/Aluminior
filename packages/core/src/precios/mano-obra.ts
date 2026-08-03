/**
 * Mano de obra: conversión y valoración. Funciones PURAS, sin E/S.
 *
 * El operador teclea HORAS; el sistema valora MINUTOS. Medido en PLAN.md T.67.1
 * contra el original: `minutos = horas × 60`, sin redondear a entero —hay 11
 * líneas históricas con minutos decimales, y son exactamente esa multiplicación—.
 *
 * Todo el dinero se mueve en decimal exacto (`decimal.ts`), en las mismas
 * escalas que las columnas: minutos 2, precio y coste 4, importes 2. Entra y
 * sale texto persistible, así que un valor leído de `numeric` se puede valorar y
 * volver a escribir sin pasar por coma flotante en ningún punto. La frontera es
 * estricta: NINGUNA de estas funciones acepta `number`. El formulario debe
 * conservar el texto que valida y entregarlo tal cual, sin `parseFloat`.
 *
 * Contrato completo en `SPEC-MANO-DE-OBRA.md`. Aquí vive sólo la regla; la
 * persistencia y la lectura del catálogo son de otro módulo.
 */

import {
  compararDecimal, multiplicarDecimal, normalizarDecimal, signoDecimal,
  type Decimal,
} from './decimal.ts'

/** Texto, no `60`: el factor entra en la misma aritmética que el resto. */
export const MINUTOS_POR_HORA: Decimal = '60'

/** Escalas de las columnas de `lineas_mano_obra`. Fijan dónde se redondea. */
export const ESCALA_MINUTOS = 2
export const ESCALA_PRECIO = 4
export const ESCALA_IMPORTE = 2

/** Techo de `numeric(14,2)`: 12 dígitos enteros y 2 decimales. */
export const MAXIMO_IMPORTE: Decimal = '999999999999.99'

export type ConceptoManoObra = 'FABRICACION_ADICIONAL' | 'COLOCACION'

/** Por qué no hay importe de venta. Código estable: la lógica no compara frases. */
export type MotivoVentaManoObra =
  | 'SIN_PVP' | 'PVP_CERO' | 'PVP_NEGATIVO' | 'IMPORTE_FUERA_RANGO'

/** Por qué no hay coste. Independiente de la venta. */
export type MotivoCosteManoObra =
  | 'SIN_COSTE' | 'COSTE_AMBIGUO' | 'COSTE_NEGATIVO' | 'COSTE_FUERA_RANGO'

const ARTICULOS: Record<ConceptoManoObra, string> = {
  FABRICACION_ADICIONAL: 'MO',
  COLOCACION: 'MOCOL',
}

/** Artículo que valora cada concepto. Medido en T.67.1. */
export function articuloDeConcepto(concepto: ConceptoManoObra): string {
  return ARTICULOS[concepto]
}

/**
 * Horas tecleadas a minutos valorables.
 *
 * No redondea a entero: `2,37 h` son `142,2 min` en el original, no 142.
 * Redondear cambiaría el importe del documento.
 */
export function minutosDeHoras(horas: Decimal): Decimal {
  if (signoDecimal(horas) < 0) throw new Error(`horas no válidas: ${horas}`)
  return multiplicarDecimal(horas, MINUTOS_POR_HORA, ESCALA_MINUTOS)
}

export interface EntradaManoObra {
  minutos: Decimal
  /** PVP por minuto en la tarifa del documento. `null` = no hay fila. */
  precioMinuto: Decimal | null
  /** Coste por minuto. `null` = no hay fila. */
  costeMinuto: Decimal | null
  /** El artículo tiene costes distintos por acabado y ninguno aplica. */
  costeAmbiguo?: boolean
}

export interface ValoracionManoObra {
  /** El precio REAL del catálogo, también cuando no se pudo valorar. */
  precioMinuto: Decimal | null
  importe: Decimal | null
  valoracionCompleta: boolean
  motivoCodigo: MotivoVentaManoObra | null
  costeMinuto: Decimal | null
  costeTotal: Decimal | null
  motivoCosteCodigo: MotivoCosteManoObra | null
}

/**
 * Valora un concepto de mano de obra.
 *
 * Venta y coste son independientes: un coste que falta, es ambiguo, es negativo
 * o desborda NO invalida la venta. Lo que decide si el documento está valorado
 * es el precio.
 *
 * El valor defectuoso se conserva siempre —también cuando es negativo—. Ponerlo
 * a `null` al no poder valorar borraría la evidencia de que ese artículo tiene
 * un precio imposible, que es justo lo que hay que poder investigar después.
 */
export function valorarManoObra(entrada: EntradaManoObra): ValoracionManoObra {
  const minutos = normalizarDecimal(entrada.minutos, ESCALA_MINUTOS)
  if (signoDecimal(minutos) <= 0) {
    throw new Error(`minutos no válidos: ${entrada.minutos}`)
  }
  return {
    ...valorarVenta(minutos, entrada.precioMinuto),
    ...valorarCoste(minutos, entrada.costeMinuto, entrada.costeAmbiguo ?? false),
  }
}

function valorarVenta(minutos: Decimal, precioBruto: Decimal | null) {
  if (precioBruto === null) {
    return incompleta(null, 'SIN_PVP')
  }
  const precioMinuto = normalizarDecimal(precioBruto, ESCALA_PRECIO)
  const signo = signoDecimal(precioMinuto)
  if (signo < 0) {
    // Un PVP negativo es catálogo corrupto. Se conserva tal cual: si se dejara
    // llegar a PostgreSQL, la escritura reventaría con un error crudo en vez de
    // dar un documento sin valorar con su motivo.
    return incompleta(precioMinuto, 'PVP_NEGATIVO')
  }
  if (signo === 0) {
    // Cero en la tarifa no es mano de obra gratis: es catálogo sin rellenar.
    return incompleta(precioMinuto, 'PVP_CERO')
  }
  const importe = multiplicarDecimal(minutos, precioMinuto, ESCALA_IMPORTE)
  if (compararDecimal(importe, MAXIMO_IMPORTE) > 0) {
    return incompleta(precioMinuto, 'IMPORTE_FUERA_RANGO')
  }
  return {
    precioMinuto,
    importe,
    valoracionCompleta: true,
    motivoCodigo: null,
  } as const
}

function incompleta(precioMinuto: Decimal | null, motivoCodigo: MotivoVentaManoObra) {
  return { precioMinuto, importe: null, valoracionCompleta: false, motivoCodigo } as const
}

function valorarCoste(minutos: Decimal, costeBruto: Decimal | null, ambiguo: boolean) {
  if (ambiguo) {
    // No se elige uno: un coste adivinado falsearía el margen.
    return sinCoste(null, 'COSTE_AMBIGUO')
  }
  if (costeBruto === null) {
    return sinCoste(null, 'SIN_COSTE')
  }
  const costeMinuto = normalizarDecimal(costeBruto, ESCALA_PRECIO)
  if (signoDecimal(costeMinuto) < 0) {
    return sinCoste(costeMinuto, 'COSTE_NEGATIVO')
  }
  const costeTotal = multiplicarDecimal(minutos, costeMinuto, ESCALA_IMPORTE)
  if (compararDecimal(costeTotal, MAXIMO_IMPORTE) > 0) {
    return sinCoste(costeMinuto, 'COSTE_FUERA_RANGO')
  }
  return { costeMinuto, costeTotal, motivoCosteCodigo: null } as const
}

function sinCoste(costeMinuto: Decimal | null, motivoCosteCodigo: MotivoCosteManoObra) {
  return { costeMinuto, costeTotal: null, motivoCosteCodigo } as const
}
