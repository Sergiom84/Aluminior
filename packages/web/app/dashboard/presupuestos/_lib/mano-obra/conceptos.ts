/**
 * Qué conceptos de mano de obra genera una línea, a partir de lo tecleado.
 *
 * Función PURA: decide cuántas filas habrá antes de tocar el catálogo o la base.
 * Cero, una o dos, nunca tres —`FABRICACION_BASE` depende del recuento de
 * módulos (T.31) y no se implementa en esta fase—.
 */

import { signoDecimal, type ConceptoManoObra, type Decimal } from '@aluminior/core/precios'

/**
 * Acabado con el que se valora la mano de obra.
 *
 * Constante, no el acabado de la línea: medido en T.67.1, las filas de PVP y de
 * coste de los artículos de mano de obra están todas en `UNI`. Un cerramiento
 * lacado no encarece el minuto de taller.
 */
export const ACABADO_MANO_OBRA = 'UNI'

/** Horas tecleadas por concepto, ya validadas como texto decimal. */
export interface HorasTecleadas {
  fabricacion: Decimal
  colocacion: Decimal
}

export interface ConceptoConHoras {
  concepto: ConceptoManoObra
  horas: Decimal
}

/**
 * Los conceptos con horas > 0, en orden estable.
 *
 * Un `0` tecleado es «no hay mano de obra adicional», no «hay cero minutos de
 * trabajo»: no genera fila. Una fila de cero minutos sería ruido que después
 * habría que filtrar en cada consulta, y además el `CHECK` de `minutos > 0` la
 * rechazaría.
 */
export function conceptosConHoras(horas: HorasTecleadas): ConceptoConHoras[] {
  const candidatos: ConceptoConHoras[] = [
    { concepto: 'FABRICACION_ADICIONAL', horas: horas.fabricacion },
    { concepto: 'COLOCACION', horas: horas.colocacion },
  ]
  return candidatos.filter((c) => signoDecimal(c.horas) > 0)
}
