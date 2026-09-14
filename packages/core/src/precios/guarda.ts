/**
 * Guarda "todo o sin valorar" (T.54, formalizada y testeada en T.59).
 *
 * Una línea muestra un total SOLO si su precio resuelve por completo. Si falta
 * cualquier componente —una pieza sin medida o un artículo sin precio en la
 * tarifa— la línea queda SIN VALORAR (precio `null`), nunca con un total parcial
 * ni cero (regla 3). Un importe parcial no es el precio de la estructura.
 *
 * Función PURA: es la regla del dinero aislada del camino de servidor de
 * `acciones.ts` (que la usa) para poder protegerla con un test unitario.
 */

import {
  textoMotivoCoste, textoMotivoVenta,
  type ConceptoManoObra, type MotivoCosteManoObra, type MotivoVentaManoObra,
} from './mano-obra.ts'
export interface VeredictoGuarda {
  /** true = la línea se puede valorar (todos sus componentes resuelven). */
  valorable: boolean
  /** Motivos por los que NO se valora (vacío si `valorable`). Mensajes de usuario. */
  motivos: string[]
  /**
   * Problemas que NO impiden valorar, pero que deben quedar registrados.
   *
   * Hoy son los del coste de la mano de obra: un coste ausente, ambiguo,
   * negativo o desbordado no cambia lo que se cobra, así que no puede tumbar la
   * valoración; pero callarlo dejaría el margen mal calculado sin que nadie lo
   * supiera. Se separan de `motivos` a propósito, para que la regla del dinero
   * no se relaje por el camino.
   */
  advertencias: string[]
}

/** Lo que un concepto de mano de obra aporta a la guarda, ya valorado. */
export interface ManoObraEnGuarda {
  concepto: ConceptoManoObra
  motivoCodigo: MotivoVentaManoObra | null
  motivoCosteCodigo: MotivoCosteManoObra | null
}

/**
 * Decide si una línea es valorable.
 *
 * @param incalculables      nº de piezas sin medida (de `calcularDespiece`).
 * @param sinPrecio          artículos sin precio en la tarifa (de `valorarDespiece`).
 * @param variablesFaltantes cotas/variables que faltaron al evaluar fórmulas (opcional).
 * @param manoObra           conceptos de mano de obra ya valorados (opcional).
 *
 * La mano de obra entra por la misma puerta que el resto: si un concepto no
 * tiene importe —falta el PVP, es cero, es negativo o el producto desborda—, la
 * línea entera queda sin valorar. Nunca un total parcial que se cobraría de
 * menos, ni un cero que parecería mano de obra regalada.
 */
export function lineaValorable(args: {
  incalculables: number
  sinPrecio: readonly string[]
  sinMedida?: readonly string[]
  variablesFaltantes?: readonly string[]
  manoObra?: readonly ManoObraEnGuarda[]
}): VeredictoGuarda {
  const motivos: string[] = []
  const advertencias: string[] = []
  if (args.incalculables > 0) {
    motivos.push(
      `${args.incalculables} piezas sin medida` +
      (args.variablesFaltantes?.length ? ` (faltan ${args.variablesFaltantes.join(', ')})` : ''),
    )
  }
  if (args.sinPrecio.length) {
    motivos.push(`${args.sinPrecio.length} artículos sin precio en la tarifa`)
  }
  if (args.sinMedida?.length) {
    motivos.push(`${args.sinMedida.length} artículos sin medidas suficientes para calcular el metraje`)
  }
  for (const mo of args.manoObra ?? []) {
    if (mo.motivoCodigo) motivos.push(textoMotivoVenta(mo.concepto, mo.motivoCodigo))
    if (mo.motivoCosteCodigo) {
      advertencias.push(textoMotivoCoste(mo.concepto, mo.motivoCosteCodigo))
    }
  }
  return { valorable: motivos.length === 0, motivos, advertencias }
}

/**
 * ¿Está el presupuesto INCOMPLETO? (regla del dinero a nivel documento).
 *
 * Una línea se persiste con `valoracionCompleta = false` cuando `lineaValorable`
 * (arriba) la dejó sin valorar al añadirla (ver `acciones.ts`). El documento
 * entero es "incompleto" si CUALQUIER línea quedó sin valorar: sus totales
 * (subtotal/IVA/total) no son un importe válido y no deben mostrarse como cifra.
 *
 * Fuente ÚNICA del criterio "incompleto": la usan tanto la página de detalle
 * (web) como el PDF, para que ambos coincidan al céntimo. NO revalora: consume
 * el veredicto ya persistido por la guarda al añadir cada línea.
 */
export function presupuestoIncompleto(
  lineas: readonly { valoracionCompleta: boolean }[],
): boolean {
  return lineas.some((l) => !l.valoracionCompleta)
}
