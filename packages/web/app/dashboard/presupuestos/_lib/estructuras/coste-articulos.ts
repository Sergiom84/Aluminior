/**
 * Coste de catálogo por artículo: lectura y desempate. Compartido.
 *
 * El criterio de desempate vive en `resolverCosteCatalogo` (core) desde T.68,
 * pero la secuencia que lo rodea —traer las filas sin filtrar, agruparlas por
 * artículo y colapsar el resultado a `number | null`— estaba copiada en tres
 * sitios de `acciones.ts`. Aquí existe una sola vez.
 *
 * Lo que NO vive aquí es qué se hace después con ese coste: el despiece y el
 * acristalamiento tienen reglas distintas sobre el largo, y cada uno conserva su
 * contrato. Compartir el desempate no es unificar los casos de uso.
 */

import { inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { resolverCosteCatalogo } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'

/** Fila de `articulos_coste` tal y como la necesita el desempate. */
export interface FilaCosteArticulo {
  articuloCodigo: string
  acabadoCodigo: string
  coste: string
}

/**
 * Costes de los artículos pedidos, SIN filtrar por acabado.
 *
 * Sin filtrar a propósito: el desempate necesita ver todas las filas para saber
 * si hay ambigüedad, y filtrar en SQL escondería justo el caso a detectar.
 */
export async function leerCostesArticulos(
  cliente: ClienteEscritura,
  codigos: readonly string[],
): Promise<FilaCosteArticulo[]> {
  if (!codigos.length) return []
  return cliente.select({
    articuloCodigo: schema.articulosCoste.articuloCodigo,
    acabadoCodigo: schema.articulosCoste.acabadoCodigo,
    coste: schema.articulosCoste.coste,
  }).from(schema.articulosCoste)
    // `[...codigos]` porque `inArray` pide un array mutable; la entrada es
    // `readonly` para dejar claro que este módulo no la toca.
    .where(inArray(schema.articulosCoste.articuloCodigo, [...codigos]))
}

/**
 * Un coste por artículo, o `null` si no se puede decidir.
 *
 * Se colapsa a `null` porque ni el despiece ni el acristalamiento distinguen
 * «sin coste» de «ambiguo»: los dos significan que no hay coste que persistir.
 * La mano de obra sí los distingue, y por eso `resolverCosteCatalogo` devuelve
 * los tres estados en vez de un valor opcional.
 *
 * El resultado NO depende del orden de las filas: la clave de `articulos_coste`
 * es `(artículo, proveedor, acabado)`, así que un acabado puede venir repetido
 * con proveedores distintos, y sin `ORDER BY` PostgreSQL no promete orden.
 */
export function costePorArticuloDe(
  costes: readonly FilaCosteArticulo[],
  acabadoAplicado: string | null,
): Map<string, number | null> {
  const porArticulo = new Map<string, FilaCosteArticulo[]>()
  for (const fila of costes) {
    const filas = porArticulo.get(fila.articuloCodigo) ?? []
    filas.push(fila)
    porArticulo.set(fila.articuloCodigo, filas)
  }

  const resultado = new Map<string, number | null>()
  for (const [articuloCodigo, filas] of porArticulo) {
    const resolucion = resolverCosteCatalogo(filas, acabadoAplicado)
    resultado.set(
      articuloCodigo,
      resolucion.estado === 'RESUELTO' ? Number(resolucion.coste) : null,
    )
  }
  return resultado
}
