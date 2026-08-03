/**
 * Lectura del catálogo para valorar mano de obra.
 *
 * Sólo lee y agrupa; no decide nada. Quién gana entre varios costes y qué
 * significa que falte un precio se resuelve en `resolver-mano-obra.ts`, sobre
 * datos ya en memoria, para que esa regla se pueda probar sin base de datos.
 */

import { and, eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { Decimal, FilaCosteCatalogo } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import { ACABADO_MANO_OBRA } from './conceptos.ts'

/**
 * Unidad en la que se valora la mano de obra. Constante, no leída del catálogo:
 * el operador teclea horas y el sistema valora minutos (T.67.1). Se congela en
 * el snapshot para que un documento antiguo pueda explicar qué se cobró.
 */
export const UNIDAD_MANO_OBRA = 'MINUTO'

/** Lo que el catálogo dice hoy de un artículo de mano de obra. */
export interface ArticuloManoObra {
  /** `null` si el artículo no está en `articulos`. */
  descripcion: string | null
  /** PVP por minuto en la tarifa pedida. `null` = no hay fila. */
  precio: Decimal | null
  /** Todas las filas de coste del artículo, sin filtrar por acabado. */
  costes: FilaCosteCatalogo[]
}

export type CatalogoManoObra = Map<string, ArticuloManoObra>

/**
 * Lee descripción, PVP y costes de los artículos indicados.
 *
 * El PVP se pide por `(artículo, tarifa, acabado)` con el acabado de la mano de
 * obra, que es constante. Los costes se traen SIN filtrar: el desempate por
 * acabado necesita ver todas las filas para saber si hay ambigüedad, y filtrar
 * en SQL escondería justo el caso que hay que detectar.
 *
 * Recibe `ClienteEscritura` para poder leer dentro de la misma transacción que
 * escribirá después. Abrir su propia conexión leería fuera de ella.
 */
export async function leerCatalogoManoObra(
  cliente: ClienteEscritura,
  codigos: readonly string[],
  tarifa: number,
): Promise<CatalogoManoObra> {
  const catalogo: CatalogoManoObra = new Map()
  if (!codigos.length) return catalogo

  const unicos = [...new Set(codigos)]
  const [articulos, precios, costes] = await Promise.all([
    cliente.select({
      codigo: schema.articulos.codigo,
      descripcion: schema.articulos.descripcion,
    }).from(schema.articulos).where(inArray(schema.articulos.codigo, unicos)),

    cliente.select({
      articuloCodigo: schema.articulosPvp.articuloCodigo,
      precio: schema.articulosPvp.precio,
    }).from(schema.articulosPvp).where(and(
      inArray(schema.articulosPvp.articuloCodigo, unicos),
      eq(schema.articulosPvp.tarifa, tarifa),
      eq(schema.articulosPvp.acabadoCodigo, ACABADO_MANO_OBRA),
    )),

    cliente.select({
      articuloCodigo: schema.articulosCoste.articuloCodigo,
      acabadoCodigo: schema.articulosCoste.acabadoCodigo,
      coste: schema.articulosCoste.coste,
    }).from(schema.articulosCoste)
      .where(inArray(schema.articulosCoste.articuloCodigo, unicos)),
  ])

  for (const codigo of unicos) {
    catalogo.set(codigo, { descripcion: null, precio: null, costes: [] })
  }
  for (const a of articulos) catalogo.get(a.codigo)!.descripcion = a.descripcion
  for (const p of precios) catalogo.get(p.articuloCodigo)!.precio = p.precio
  for (const c of costes) {
    catalogo.get(c.articuloCodigo)!.costes
      .push({ acabadoCodigo: c.acabadoCodigo, coste: c.coste })
  }
  return catalogo
}
