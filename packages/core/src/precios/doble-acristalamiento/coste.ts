/**
 * Coste €/m² de un doble acristalamiento según la tarifa de un proveedor
 * expresada por componentes: precio base (4/cámara/4 incolora), suplemento por
 * cámara y gas, y suplemento por cada vidrio que sustituye a un float de 4 mm.
 *
 * Es la estructura que reproduce exactamente el coste guardado del catálogo
 * actual y la de las tarifas impresas de doble acristalamiento. La traducción
 * de una tarifa concreta a esta forma (qué incluye la base, qué vidrio del
 * catálogo corresponde a cada línea impresa) es un dato de entrada, no una
 * regla de aquí.
 *
 * Nunca inventa: un vidrio ausente, «a consultar» o una cámara sin precio
 * dejan el artículo sin coste y con motivo.
 */
import { normalizarDecimal, sumarDecimal, type Decimal } from '../decimal.ts'
import type { ComposicionDobleAcristalamiento } from './composicion.ts'

export interface SuplementoCamara {
  /** Suplemento sin gas sobre la base. `0` = incluida en la base. */
  sinGas: Decimal
  /** Suplemento total con argón. Si falta, se usa `sinGas + argonM2`. */
  argon?: Decimal
}

export interface TarifaDobleAcristalamiento {
  /** €/m² de la composición base. */
  base: Decimal
  /** Por milímetros de cámara. Una cámara ausente no tiene precio. */
  camaras: Readonly<Record<number, SuplementoCamara>>
  /** Suplemento de argón uniforme, cuando la tarifa no lo da por cámara. */
  argonM2?: Decimal
  /**
   * Suplemento por vidrio, con el nombre del catálogo. `null` = la tarifa
   * remite a consultar: el vidrio existe pero no tiene precio.
   */
  vidrios: Readonly<Record<string, Decimal | null>>
}

export type MotivoSinCoste =
  | 'VIDRIO_NO_TARIFADO'
  | 'VIDRIO_A_CONSULTAR'
  | 'CAMARA_NO_TARIFADA'
  | 'ARGON_NO_TARIFADO'

export type CosteDobleAcristalamiento =
  | { estado: 'CALCULADO'; coste: Decimal }
  | { estado: 'SIN_COSTE'; motivo: MotivoSinCoste; detalle: string }

const ESCALA = 2

export function costeDobleAcristalamiento(
  composicion: ComposicionDobleAcristalamiento,
  tarifa: TarifaDobleAcristalamiento,
): CosteDobleAcristalamiento {
  const camara = tarifa.camaras[composicion.camaraMm]
  if (!camara) return sinCoste('CAMARA_NO_TARIFADA', `cámara ${composicion.camaraMm} mm`)
  const suplementoCamara = composicion.argon ? argonDe(camara, tarifa.argonM2) : camara.sinGas
  if (suplementoCamara === null) return sinCoste('ARGON_NO_TARIFADO', `cámara ${composicion.camaraMm} mm`)

  let coste = sumarDecimal(tarifa.base, suplementoCamara, ESCALA)
  for (const vidrio of [composicion.exterior, composicion.interior]) {
    if (!Object.hasOwn(tarifa.vidrios, vidrio)) return sinCoste('VIDRIO_NO_TARIFADO', vidrio)
    const suplemento = tarifa.vidrios[vidrio]
    if (suplemento === null) return sinCoste('VIDRIO_A_CONSULTAR', vidrio)
    coste = sumarDecimal(coste, suplemento, ESCALA)
  }
  return { estado: 'CALCULADO', coste: normalizarDecimal(coste, ESCALA) }
}

function argonDe(camara: SuplementoCamara, argonM2: Decimal | undefined): Decimal | null {
  if (camara.argon !== undefined) return camara.argon
  return argonM2 === undefined ? null : sumarDecimal(camara.sinGas, argonM2, ESCALA)
}

function sinCoste(motivo: MotivoSinCoste, detalle: string): CosteDobleAcristalamiento {
  return { estado: 'SIN_COSTE', motivo, detalle }
}
