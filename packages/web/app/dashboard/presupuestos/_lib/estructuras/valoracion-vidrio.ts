/**
 * Valoración del vidrio: metraje, PVP de la tarifa, coste y pieza persistible.
 *
 * Extraído de `acciones.ts` en T.70.1. Es la PRIMERA de las seis
 * responsabilidades del bloque del vidrio, y se saca antes que las demás porque
 * era la única **duplicada**: las dos rutas del cálculo —la simple, de un solo
 * par de medidas repetido por cristal, y la mixta, con una medida por
 * alojamiento— repetían la consulta de PVP, la de coste, el empujado de la pieza
 * `VIDRIO` y el aviso de «sin valorar», con dos formas distintas de sumar el
 * metraje. Aquí hay una sola.
 *
 * Lo que unifica y lo que NO:
 *
 *  - Unifica la forma: ambas rutas se expresan como una lista de cristales con
 *    cantidad. La simple es un cristal con `cantidad = nCristales`; la mixta,
 *    N cristales de cantidad 1. La aritmética resultante es la misma que había
 *    en cada una, no una nueva: `metraje × cantidad` sumado y multiplicado una
 *    vez por el precio.
 *  - NO unifica el desempate del coste con el del despiece. Aquí gana el acabado
 *    de la línea, luego el comodín `*`, luego el alfabético, y **siempre se elige
 *    uno**; el despiece, en cambio, deja el coste sin resolver cuando hay varios
 *    distintos (`coste-articulos.ts`). Son dos criterios y sólo uno puede ser el
 *    correcto, pero decidirlo cambia costes ya persistidos y necesita su propia
 *    medición. Se conserva el del vidrio.
 *
 * ARITMÉTICA: se conserva la que había, en `number`. El contrato decimal exacto
 * de `@aluminior/core/precios/decimal` cubre hoy la mano de obra; traerlo aquí
 * movería importes de vidrio ya calculados y es una unidad aparte.
 */

import { sql } from 'drizzle-orm'
import { metrajeVidrioM2, type ReglasMetrajeVidrio } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { PiezaDespiece } from '../lineas/guardar-linea.ts'

/** Un vidrio a valorar: sus medidas de corte y cuántas veces se repite. */
export interface CristalValorable {
  largoMm: number
  anchoMm: number
  /**
   * Cuántos cristales idénticos. La ruta simple manda uno con la cuenta de
   * ranuras; la mixta, uno por alojamiento con cantidad 1.
   */
  cantidad: number
}

export interface EntradaValoracionVidrio {
  vidrioCodigo: string
  cristales: readonly CristalValorable[]
  reglasMetraje: ReglasMetrajeVidrio
  /** Tarifa del documento. */
  tarifa: number
  /** Acabado de la línea. `null` = la línea no fija acabado. */
  acabadoCodigo: string | null
}

export type ValoracionVidrio =
  /** Sin PVP en la tarifa: ni importe ni piezas. El vidrio queda sin valorar. */
  | { ok: false; aviso: string }
  | {
    ok: true
    /**
     * Importe de venta del vidrio, SIN redondear.
     *
     * El redondeo a céntimo lo hace quien acumula, sobre la suma con el resto
     * de la línea: `Math.round((precioUnitario + importe) * 100) / 100`. Es lo
     * que hacían ambas rutas, y redondear aquí además cambiaría el total.
     */
    importe: number
    piezas: PiezaDespiece[]
  }

/**
 * Precio por m² del vidrio en la tarifa. `null` si no tiene fila.
 *
 * Desempate por acabado: el de la línea, luego el comodín `*`, luego el
 * alfabético. Es el mismo `ORDER BY` que estaba escrito dos veces en
 * `acciones.ts`.
 */
async function leerPrecioVidrio(
  cliente: ClienteEscritura,
  entrada: { vidrioCodigo: string; tarifa: number; acabadoCodigo: string | null },
): Promise<number | null> {
  const [fila] = (await cliente.execute<{ precio: string }>(sql`
    SELECT precio FROM articulos_pvp
    WHERE articulo_codigo = ${entrada.vidrioCodigo} AND tarifa = ${entrada.tarifa}
    ORDER BY (acabado_codigo = ${entrada.acabadoCodigo ?? ''}) DESC,
             (acabado_codigo = '*') DESC, acabado_codigo
    LIMIT 1
  `)) as unknown as { precio: string }[]
  return fila ? Number(fila.precio) : null
}

/**
 * Coste por m² del vidrio. `null` si no tiene fila.
 *
 * Sin tarifa: `articulos_coste` no la tiene. Un coste ausente NO deja la línea
 * sin valorar; sólo deja la pieza sin coste, como el resto del despiece.
 */
async function leerCosteVidrio(
  cliente: ClienteEscritura,
  entrada: { vidrioCodigo: string; acabadoCodigo: string | null },
): Promise<number | null> {
  const [fila] = (await cliente.execute<{ coste: string }>(sql`
    SELECT coste FROM articulos_coste
    WHERE articulo_codigo = ${entrada.vidrioCodigo}
    ORDER BY (acabado_codigo = ${entrada.acabadoCodigo ?? ''}) DESC,
             (acabado_codigo = '*') DESC, acabado_codigo
    LIMIT 1
  `)) as unknown as { coste: string }[]
  return fila ? Number(fila.coste) : null
}

/**
 * Importe y piezas del vidrio, ya con precio y coste resueltos. Función PURA.
 *
 * Una pieza `VIDRIO` por entrada de la lista, en el mismo orden y sin agregar:
 * dos alojamientos con medidas distintas son dos filas de `lineas_despiece`.
 */
export function prepararValoracionVidrio(entrada: {
  vidrioCodigo: string
  cristales: readonly CristalValorable[]
  reglasMetraje: ReglasMetrajeVidrio
  precioM2: number
  costeM2: number | null
}): { importe: number; piezas: PiezaDespiece[] } {
  const metrajes = entrada.cristales.map(
    (c) => metrajeVidrioM2(c.largoMm, c.anchoMm, entrada.reglasMetraje),
  )
  const metrajeTotal = metrajes.reduce(
    (acc, m, i) => acc + m * entrada.cristales[i].cantidad,
    0,
  )
  const piezas = entrada.cristales.map((c, i): PiezaDespiece => {
    const costeTotal = entrada.costeM2 === null
      ? null
      : Math.round(entrada.costeM2 * metrajes[i] * c.cantidad * 10000) / 10000
    return {
      articuloCodigo: entrada.vidrioCodigo,
      cantidad: String(c.cantidad),
      largoCorteMm: String(c.largoMm),
      anchoCorteMm: String(c.anchoMm),
      anguloIzquierdo: null,
      anguloDerecho: null,
      funcion: 'VIDRIO',
      costeUnitario: entrada.costeM2 === null ? null : String(entrada.costeM2),
      costeTotal: costeTotal === null ? null : String(costeTotal),
    }
  })
  return { importe: metrajeTotal * entrada.precioM2, piezas }
}

/**
 * Lee PVP y coste y devuelve el importe con sus piezas.
 *
 * Sin PVP no hay importe NI piezas: el vidrio no se persiste a medias. Es lo que
 * hacían las dos rutas, y el mensaje del aviso se conserva palabra por palabra
 * porque es el que ve el operador.
 */
export async function resolverValoracionVidrio(
  cliente: ClienteEscritura,
  entrada: EntradaValoracionVidrio,
): Promise<ValoracionVidrio> {
  const precioM2 = await leerPrecioVidrio(cliente, entrada)
  if (precioM2 === null) {
    return {
      ok: false,
      aviso: `vidrio sin valorar: ${entrada.vidrioCodigo} no tiene precio en la tarifa ${entrada.tarifa}`,
    }
  }
  const costeM2 = await leerCosteVidrio(cliente, entrada)
  return { ok: true, ...prepararValoracionVidrio({ ...entrada, precioM2, costeM2 }) }
}
