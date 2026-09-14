/**
 * PVP de catálogo por artículo: lectura y desempate. Compartido.
 *
 * Gemelo de `coste-articulos.ts`, y por el mismo motivo: el criterio vive en
 * `resolverPvpCatalogo` (core, T.73) y la secuencia que lo rodea —traer las
 * filas de la tarifa sin filtrar por acabado, agruparlas por artículo y decidir
 * qué se hace con lo que no resuelve— estaba escrita como subconsulta en
 * `valorar-estructura.ts` y en `acristalamiento-estructura.ts`. Aquí existe una
 * sola vez.
 *
 * El cambio de T.73 no es sólo dónde vive el criterio, sino cuál es: aquellas
 * subconsultas terminaban en `ORDER BY ... p.acabado_codigo LIMIT 1`, de modo
 * que un artículo sin precio en el acabado de la línea ni en el genérico cobraba
 * el del primer acabado por orden de código. Ahora queda sin precio.
 */

import { and, eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { resolverPvpCatalogo, type ResolucionPvp } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'

/** Fila de `articulos_pvp` tal y como la necesita el desempate. */
export interface FilaPvpArticulo {
  articuloCodigo: string
  acabadoCodigo: string
  precio: string
}

/**
 * PVP de los artículos pedidos en UNA tarifa, SIN filtrar por acabado.
 *
 * Sin filtrar a propósito: el desempate necesita ver todas las filas del
 * artículo para saber si hay ambigüedad, y filtrar en SQL escondería justo el
 * caso a detectar. La tarifa sí se filtra: es la del documento y no admite
 * desempate —un precio de otra tarifa no es un candidato peor, es otro precio.
 */
export async function leerPvpArticulos(
  cliente: ClienteEscritura,
  codigos: readonly string[],
  tarifa: number,
): Promise<FilaPvpArticulo[]> {
  if (!codigos.length) return []
  return cliente.select({
    articuloCodigo: schema.articulosPvp.articuloCodigo,
    acabadoCodigo: schema.articulosPvp.acabadoCodigo,
    precio: schema.articulosPvp.precio,
  }).from(schema.articulosPvp)
    // `[...codigos]` porque `inArray` pide un array mutable; la entrada es
    // `readonly` para dejar claro que este módulo no la toca.
    .where(and(
      inArray(schema.articulosPvp.articuloCodigo, [...codigos]),
      eq(schema.articulosPvp.tarifa, tarifa),
    ))
}

/**
 * Una resolución por artículo, con los tres estados sin colapsar.
 *
 * A diferencia del coste —que se colapsa a `number | null` porque el despiece no
 * distingue «sin coste» de «ambiguo»—, aquí se conservan separados: los dos
 * dejan la línea sin valorar, pero el operador necesita saber si el artículo
 * falta en la tarifa o si sobra un precio, porque se arreglan en sitios
 * distintos del catálogo.
 *
 * Un artículo sin ninguna fila NO aparece en el mapa: quien llama lo trata como
 * `SIN_PRECIO`, igual que antes trataba el `null` de la subconsulta.
 */
export function pvpPorArticuloDe(
  filas: readonly FilaPvpArticulo[],
  acabadoAplicado: string | null,
): Map<string, ResolucionPvp> {
  const porArticulo = new Map<string, FilaPvpArticulo[]>()
  for (const fila of filas) {
    const acumuladas = porArticulo.get(fila.articuloCodigo) ?? []
    acumuladas.push(fila)
    porArticulo.set(fila.articuloCodigo, acumuladas)
  }

  const resultado = new Map<string, ResolucionPvp>()
  for (const [articuloCodigo, delArticulo] of porArticulo) {
    resultado.set(articuloCodigo, resolverPvpCatalogo(delArticulo, acabadoAplicado))
  }
  return resultado
}

/**
 * El precio aplicable, o `null` si no lo hay.
 *
 * `AMBIGUO` cae a `null` igual que `SIN_PRECIO`: ninguno de los dos autoriza a
 * cobrar. La distinción sobrevive en el mapa para el aviso, no en el importe.
 */
export function precioDe(resolucion: ResolucionPvp | undefined): number | null {
  return resolucion?.estado === 'RESUELTO' ? Number(resolucion.precio) : null
}

/** Artículos con varios precios y ninguno aplicable, para el aviso. Ordenados. */
export function articulosAmbiguos(pvp: ReadonlyMap<string, ResolucionPvp>): string[] {
  return [...pvp]
    .filter(([, resolucion]) => resolucion.estado === 'AMBIGUO')
    .map(([codigo]) => codigo)
    .sort()
}

/**
 * Aviso único para los artículos ambiguos, o `null` si no hay ninguno.
 *
 * Se nombran los códigos —hasta tres— porque el operador tiene que ir al
 * catálogo a mirarlos, y un recuento sin nombres no le dice a cuál.
 */
export function avisoAmbiguos(codigos: readonly string[], contexto: string): string | null {
  if (!codigos.length) return null
  const muestra = codigos.slice(0, 3).join(', ')
  const resto = codigos.length > 3 ? ` y ${codigos.length - 3} más` : ''
  return `${codigos.length} ${contexto} con varios precios en la tarifa y ninguno aplicable al acabado (${muestra}${resto})`
}
