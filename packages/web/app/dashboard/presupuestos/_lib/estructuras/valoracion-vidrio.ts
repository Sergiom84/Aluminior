import { partidasValoracion } from './partidas-valoracion.ts'
import type { PartidaValoracionCerramiento } from '@aluminior/core/estructuras'
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
 *  - Desde T.73 SÍ unifica el desempate con el del despiece, que era la deuda
 *    que este comentario declaraba. Aquí ganaba el acabado de la línea, luego el
 *    comodín `*`, luego el alfabético, y **siempre se elegía uno**: un vidrio sin
 *    precio en su acabado se facturaba al del acabado que saliera antes por
 *    orden de código. Ahora el PVP y el coste pasan por el mismo criterio por
 *    acabado que gobierna el resto de la línea: exacto, genérico, o nada.
 *    Consecuencia buscada: un vidrio que sólo tenga precio en acabados ajenos
 *    deja de valorarse en vez de valorarse mal.
 *
 *    El coste NO usa `resolverCosteCatalogo`, aunque sea un coste: aquel no
 *    conoce el comodín. El porqué está en `leerCosteVidrio`, y cambiarlo es una
 *    regresión, no una limpieza.
 *
 * ARITMÉTICA: se conserva la que había, en `number`. El contrato decimal exacto
 * de `@aluminior/core/precios/decimal` cubre hoy la mano de obra; traerlo aquí
 * movería importes de vidrio ya calculados y es una unidad aparte.
 */

import {
  ESCALA_COSTE_CATALOGO, metrajeVidrioM2, resolverPorAcabado, resolverPvpCatalogo,
  type ReglasMetrajeVidrio,
} from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { PiezaDespiece } from '../lineas/guardar-linea.ts'
import { leerCostesArticulos } from './coste-articulos.ts'
import { leerPvpArticulos } from './pvp-articulos.ts'

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
  trazabilidad?: boolean
  /** Tarifa del documento. */
  tarifa: number
  /** Acabado de la línea. `null` = la línea no fija acabado. */
  acabadoCodigo: string | null
}

export type ValoracionVidrio =
  /** Sin PVP en la tarifa: ni importe ni piezas. El vidrio queda sin valorar. */
  | { ok: false; aviso: string; piezas?: PiezaDespiece[]; partidas?: PartidaValoracionCerramiento[] }
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
    partidas?: PartidaValoracionCerramiento[]
  }

/**
 * Coste por m² del vidrio. `null` si no hay uno aplicable.
 *
 * Sin tarifa: `articulos_coste` no la tiene. Un coste ausente NO deja la línea
 * sin valorar; sólo deja la pieza sin coste, como el resto del despiece.
 *
 * T.73 retira también aquí el desempate alfabético, con el MISMO criterio que el
 * PVP —exacto, genérico, o nada— y no con `resolverCosteCatalogo`. La razón es
 * el comodín: `articulos_coste` del vidrio lo usa, y aquel resolvedor no lo
 * conoce, de modo que `AAA = 5` junto a `* = 8` le resultaría ambiguo cuando el
 * catálogo declara que el genérico son 8. Unificar por ahí habría cambiado
 * costes que hoy se resuelven bien, que es más de lo que esta unidad pide.
 */
async function leerCosteVidrio(
  cliente: ClienteEscritura,
  entrada: { vidrioCodigo: string; acabadoCodigo: string | null },
): Promise<number | null> {
  const filas = await leerCostesArticulos(cliente, [entrada.vidrioCodigo])
  const resolucion = resolverPorAcabado(
    filas.map((fila) => ({ acabadoCodigo: fila.acabadoCodigo, valor: fila.coste })),
    entrada.acabadoCodigo,
    ESCALA_COSTE_CATALOGO,
  )
  return resolucion.estado === 'RESUELTO' ? Number(resolucion.valor) : null
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
  const piezas = prepararPiezasVidrio(entrada)
  return { importe: metrajeTotal * entrada.precioM2, piezas }
}

/** El coste y las medidas sobreviven a un PVP ausente. */
function prepararPiezasVidrio(entrada: {
  vidrioCodigo: string; cristales: readonly CristalValorable[];
  reglasMetraje: ReglasMetrajeVidrio; costeM2: number | null;
}): PiezaDespiece[] {
  const metrajes = entrada.cristales.map(c => metrajeVidrioM2(c.largoMm, c.anchoMm, entrada.reglasMetraje))
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
  return piezas
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
  const filasPvp = await leerPvpArticulos(cliente, [entrada.vidrioCodigo], entrada.tarifa)
  const pvp = resolverPvpCatalogo(filasPvp, entrada.acabadoCodigo)
  const avisoOriginal = pvp.estado === 'AMBIGUO'
    ? `vidrio sin valorar: ${entrada.vidrioCodigo} tiene varios precios en la tarifa ${entrada.tarifa} y ninguno aplicable al acabado`
    : `vidrio sin valorar: ${entrada.vidrioCodigo} no tiene precio en la tarifa ${entrada.tarifa}`
  if (!entrada.trazabilidad && pvp.estado !== 'RESUELTO') return { ok: false, aviso: avisoOriginal }
  const costeM2 = await leerCosteVidrio(cliente, entrada)
  const cantidad = entrada.cristales.reduce((total, c) => total + metrajeVidrioM2(c.largoMm, c.anchoMm, entrada.reglasMetraje) * c.cantidad, 0)
  const precio = pvp.estado === 'RESUELTO' ? Number(pvp.precio) : null
  const aviso = pvp.estado === 'AMBIGUO'
    ? 'Vidrio con precio ambiguo en la tarifa y acabado solicitados'
    : 'Vidrio sin precio en la tarifa y acabado solicitados'
  const partidas = entrada.trazabilidad ? partidasValoracion([{ articuloCodigo: entrada.vidrioCodigo,
    tipoMetraje: 'M2', cantidadFacturable: cantidad, precioUnitario: precio,
    importe: precio === null ? null : cantidad * precio, incidencia: precio === null ? aviso : null }], entrada, 'VIDRIO', filasPvp) : []
  const piezas = prepararPiezasVidrio({ ...entrada, costeM2 })
  if (precio === null) return { ok: false, aviso: avisoOriginal, piezas, partidas }
  return { ok: true, importe: cantidad * precio, piezas, partidas }
}
