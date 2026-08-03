/**
 * Cómo se elige el coste de un artículo cuando el catálogo ofrece varios.
 *
 * `articulos_coste` tiene una fila por `(artículo, proveedor, acabado)`, así que
 * un mismo artículo puede traer costes distintos y hay que decidir cuál aplica.
 * El criterio ya existía dentro del despiece, escrito a mano en `acciones.ts`;
 * aquí vive una sola vez para que despiece y mano de obra no puedan divergir.
 * Duplicarlo habría sido inventar un segundo criterio con el mismo nombre.
 *
 * La regla, en orden:
 *
 *   1. Si hay filas del acabado aplicado, deciden ELLAS y sólo ellas: si todas
 *      coinciden se usa ese coste, y si difieren es ambiguo. No se mira más
 *      allá: el acabado aplicado es la respuesta, aunque no sea unánime.
 *   2. Si no hay ninguna fila de ese acabado, y todas las del artículo valen lo
 *      mismo, se usa ese valor: no hay ambigüedad que resolver.
 *   3. Si no, NO se elige uno. Un coste adivinado falsearía el margen.
 *   4. Sin filas, no hay coste.
 *
 * **El resultado no depende del orden de las filas.** La clave de
 * `articulos_coste` es `(artículo, proveedor, acabado)`, así que un mismo
 * acabado puede venir repetido con proveedores distintos y precios distintos.
 * Quedarse con la primera fila —lo que hacía el despiece— convertía el margen
 * en algo que dependía del plan de la consulta: sin `ORDER BY`, PostgreSQL no
 * promete ningún orden, y el mismo presupuesto podía costar dos cosas.
 *
 * Función PURA. La lectura del catálogo es de quien la llama.
 */

import { normalizarDecimal, type Decimal } from './decimal.ts'

/** Escala de `articulos_coste.coste`: `numeric(12,4)`. */
export const ESCALA_COSTE_CATALOGO = 4

export interface FilaCosteCatalogo {
  acabadoCodigo: string
  /** Texto decimal tal y como lo devuelve `numeric`. */
  coste: Decimal
}

/**
 * Los tres desenlaces posibles, distinguidos.
 *
 * El despiece los colapsaba en `null` porque sólo necesitaba «hay coste o no».
 * La mano de obra sí distingue: `SIN_COSTE` y `AMBIGUO` se persisten con
 * códigos distintos porque significan cosas distintas —el artículo no tiene
 * coste, frente a tiene varios y ninguno aplica— y se investigan distinto.
 */
export type ResolucionCoste =
  | { estado: 'RESUELTO'; coste: Decimal }
  | { estado: 'SIN_COSTE' }
  | { estado: 'AMBIGUO' }

export function resolverCosteCatalogo(
  filas: readonly FilaCosteCatalogo[],
  acabadoAplicado: string | null,
): ResolucionCoste {
  if (!filas.length) return { estado: 'SIN_COSTE' }

  if (acabadoAplicado !== null) {
    const delAcabado = filas.filter((fila) => fila.acabadoCodigo === acabadoAplicado)
    if (delAcabado.length) return unanime(delAcabado)
  }
  return unanime(filas)
}

/**
 * Un coste sólo si todas las filas coinciden.
 *
 * Se normaliza antes de comparar: `0.5` y `0.5000` son el mismo coste, y
 * compararlos como texto los haría parecer dos candidatos y daría un `AMBIGUO`
 * falso. El conjunto ignora el orden, que es lo que hace el resultado estable.
 */
function unanime(filas: readonly FilaCosteCatalogo[]): ResolucionCoste {
  const distintos = new Set<Decimal>(
    filas.map((fila) => normalizarDecimal(fila.coste, ESCALA_COSTE_CATALOGO)),
  )
  if (distintos.size === 1) return { estado: 'RESUELTO', coste: [...distintos][0] }
  return { estado: 'AMBIGUO' }
}
