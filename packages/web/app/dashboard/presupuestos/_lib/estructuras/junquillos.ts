/**
 * Junquillos y juntas del acristalamiento (PLAN.md anexos M y N).
 *
 * Responsabilidad cerrada: recibe cristales YA dimensionados y clasificados
 * como HOJA o FIJO, consulta la tabla de acristalamiento de la serie y devuelve
 * las piezas `JUNQ`, `JEXT` y `JINT` con sus avisos. No calcula la medida del
 * vidrio, no lo valora y no decide si la línea queda sin valorar: eso sigue en
 * `acciones.ts`, que compone los problemas.
 *
 * La regla, medida contra el oráculo:
 *
 *   tabla de la serie (TablaHojas o TablaFijos según el alojamiento)
 *     -> fila con el MENOR grosor >= TamJunqGoma del vidrio
 *     -> juntas a las medidas del MÓDULO del cristal
 *     -> junquillo a la medida del VIDRIO + ajuste medido de la serie
 *
 * Extraído de `acciones.ts` en T.69.5 SIN cambiar comportamiento: las mismas
 * consultas en el mismo orden, el mismo redondeo, los mismos textos de aviso y
 * las mismas omisiones silenciosas. Lo que cambia es que ahora recibe el cliente
 * en vez de la conexión concreta, y que el reparto de piezas y avisos está
 * separado de la lectura y se puede probar sin base de datos.
 */

import { and, asc, eq, gte } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { PiezaCortada } from '@aluminior/core/despiece'
import type { ClienteEscritura } from '../cliente-db.ts'

/**
 * Un cristal ya resuelto: su medida real y la de su módulo.
 *
 * `largoMm`/`anchoMm` son la medida del VIDRIO (corte menos galce) y gobiernan
 * el junquillo; `moduloLargoMm`/`moduloAnchoMm` son las de su alojamiento y
 * gobiernan las juntas. No son intercambiables.
 */
export interface CristalAcris {
  slot: number
  contexto: 'HOJA' | 'FIJO'
  largoMm: number
  anchoMm: number
  moduloLargoMm: number
  moduloAnchoMm: number
}

/** Fila de `tacris_filas` ya elegida para el grosor del vidrio. */
export interface FilaAcristalamiento {
  junquillo: string | null
  juntaExterior: string | null
  juntaInterior: string | null
}

/** Ajuste medido del junquillo para la serie, de hoja o de fijo. */
export interface AjusteJunquillo {
  ajusteLargoMm: string
  ajusteAnchoMm: string
}

/**
 * Piezas y avisos de UNA ranura. Función PURA.
 *
 * Cuatro omisiones silenciosas, todas heredadas y conservadas:
 *
 * - sin artículo no hay pieza. Es el marcador "sin junquillos" (V1000) y los
 *   huecos del catálogo: no generan corte y tampoco aviso;
 * - una longitud que no sea positiva no genera pieza. Protege de un ajuste que
 *   se come la medida, pero lo hace sin decirlo;
 * - sin fila aplicable, la ranura entera se salta con su aviso;
 * - si hay junquillo pero falta el ajuste medido, las juntas SÍ se emiten y
 *   sólo se pierde el junquillo, con aviso. Un junquillo nulo no avisa: no
 *   falta nada que medir.
 */
export function piezasDeRanura(
  cristal: CristalAcris,
  fila: FilaAcristalamiento | null,
  ajuste: AjusteJunquillo | null,
): { piezas: PiezaCortada[]; avisos: string[] } {
  const piezas: PiezaCortada[] = []
  const avisos: string[] = []

  if (!fila) {
    avisos.push(`ranura ${cristal.slot}: sin tabla de acristalamiento aplicable`)
    return { piezas, avisos }
  }

  const anyadir = (articulo: string | null, largoMm: number, funcion: string) => {
    if (!articulo || largoMm <= 0) return
    piezas.push({
      articuloCodigo: articulo, cantidad: 2, largoMm: Math.round(largoMm * 100) / 100,
      formula: null, tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null,
      funcion, incidencia: null,
    })
  }

  // Cantidad 2 por dimensión: las juntas y los junquillos van a los cuatro
  // lados del cristal, dos cortes de cada medida. No se agrupan.
  anyadir(fila.juntaExterior, cristal.moduloLargoMm, 'JEXT')
  anyadir(fila.juntaExterior, cristal.moduloAnchoMm, 'JEXT')
  anyadir(fila.juntaInterior, cristal.moduloLargoMm, 'JINT')
  anyadir(fila.juntaInterior, cristal.moduloAnchoMm, 'JINT')
  if (fila.junquillo && ajuste) {
    anyadir(fila.junquillo, cristal.largoMm + Number(ajuste.ajusteLargoMm), 'JUNQ')
    anyadir(fila.junquillo, cristal.anchoMm + Number(ajuste.ajusteAnchoMm), 'JUNQ')
  } else if (fila.junquillo) {
    avisos.push(
      `ranura ${cristal.slot}: sin ajuste medido de junquillo ${cristal.contexto.toLowerCase()}`,
    )
  }

  return { piezas, avisos }
}

export interface EntradaAcristalamiento {
  opcionAcristalamiento?: number
  serieCodigo: string
  /** `TamJunqGoma` del vidrio elegido. 0 = desconocido: no hay fila aplicable. */
  tamJunquillo: number
  cristales: readonly CristalAcris[]
}

/**
 * Lee la tabla de la serie y emite las piezas de todas las ranuras.
 *
 * El orden del resultado es el de las ranuras, y dentro de cada una el de las
 * funciones: juntas antes que junquillos. Lo consume la valoración, que sí
 * agrupa por artículo, pero el despiece persistido conserva este orden.
 */
export async function piezasAcristalamiento(
  cliente: ClienteEscritura,
  entrada: EntradaAcristalamiento,
): Promise<{ piezas: PiezaCortada[]; avisos: string[] }> {
  const opcion = entrada.opcionAcristalamiento ?? 1
  const [alternativa] = entrada.opcionAcristalamiento === undefined ? [] : await cliente.select().from(schema.conjuntoAcristalamientos)
    .where(and(eq(schema.conjuntoAcristalamientos.conjuntoCodigo, entrada.serieCodigo),
      eq(schema.conjuntoAcristalamientos.opcion, opcion))).limit(1)
  const [predeterminada] = await cliente.select({
    tablaHojas: schema.conjuntos.tablaHojas,
    tablaFijos: schema.conjuntos.tablaFijos,
  }).from(schema.conjuntos)
    .where(eq(schema.conjuntos.codigo, entrada.serieCodigo)).limit(1)

  const conjunto = alternativa ?? (opcion === 1 ? predeterminada : undefined)
  const piezas: PiezaCortada[] = []
  const avisos: string[] = []

  for (const cristal of entrada.cristales) {
    const tabla = (cristal.contexto === 'FIJO' ? conjunto?.tablaFijos : conjunto?.tablaHojas) || null

    // El menor grosor >= TamJunqGoma, resuelto en SQL. Sin tabla o sin grosor
    // conocido no se consulta: la ranura se salta con su aviso.
    const [fila] = tabla && entrada.tamJunquillo > 0
      ? await cliente.select().from(schema.tacrisFilas)
          .where(and(
            eq(schema.tacrisFilas.tabla, tabla),
            gte(schema.tacrisFilas.grosor, String(entrada.tamJunquillo)),
          ))
          .orderBy(asc(schema.tacrisFilas.grosor)).limit(1)
      : []

    // El ajuste medido sólo acredita la tabla original, nunca otra opción.
    const tablaBase = cristal.contexto === 'FIJO' ? predeterminada?.tablaFijos : predeterminada?.tablaHojas
    // Ajustes históricos medidos por serie: sólo demostrados para la tabla original.
    const ajuste = fila && tabla === tablaBase
      ? await leerAjuste(cliente, entrada.serieCodigo, cristal.contexto)
      : null

    const ranura = piezasDeRanura(cristal, fila ?? null, ajuste)
    piezas.push(...ranura.piezas)
    avisos.push(...ranura.avisos)
  }

  return { piezas, avisos }
}

/**
 * Ajustes de hoja y de fijo son tablas distintas y valores distintos
 * (ELEGANTPVC: hoja −28/+16, fijo −50/0). Confundirlas cambia el corte.
 */
async function leerAjuste(
  cliente: ClienteEscritura,
  serieCodigo: string,
  contexto: 'HOJA' | 'FIJO',
): Promise<AjusteJunquillo | null> {
  const tabla = contexto === 'FIJO' ? schema.junquilloAjustesFijo : schema.junquilloAjustes
  const [ajuste] = await cliente.select().from(tabla)
    .where(eq(tabla.serieCodigo, serieCodigo)).limit(1)
  return ajuste ?? null
}
