/**
 * Resolución genérico -> perfil real de la plantilla de una estructura
 * (PLAN.md anexo J).
 *
 * La plantilla referencia RANURAS (`componente_disenyo`), no perfiles. Quién va
 * en cada ranura lo decide la serie, a través de su cadena de conjuntos. El
 * mecanismo puro —expandir la cadena, indexar las resoluciones, resolver un
 * componente con su variante— vive en `@aluminior/core/series`; lo que se
 * extrae aquí es la SECUENCIA que lo rodea: qué se lee de la base, qué artículo
 * de la plantilla es genérico, y qué se hace con lo que la serie no resuelve.
 *
 * Lo que sale es una FOTO explícita, no un efecto: la plantilla con los
 * artículos reales sustituidos, más los tres conjuntos que el aviso de la línea
 * necesita para decir la verdad sobre lo que falta. Antes eran variables sueltas
 * mutadas dentro de un `map`, y sólo se podían mirar desde `acciones.ts`.
 *
 * Extraído de `acciones.ts` en T.69.4 SIN cambiar comportamiento: las mismas
 * consultas en el mismo orden, la misma precedencia, las mismas heurísticas y
 * los mismos códigos. Lo que cambia es que ahora recibe el cliente en vez de
 * abrir el suyo, y que existen pruebas que fijan ese comportamiento.
 *
 * Principio de diseño heredado, y la razón de que `sinResolver` salga separado
 * de `sinResolverAsoc`: NUNCA inventar. Una ranura sin resolver deja la línea
 * sin valorar, y el presupuestador tiene que poder saber cuál de los dos frentes
 * —perfiles (anexo J, mecanismo demostrado) o asociados (anexo S, abierto)— le
 * está bloqueando la línea.
 */

import { and, inArray, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import {
  expandirCadena, construirResoluciones, resolverComponente,
  type VarianteAcristalamiento,
} from '@aluminior/core/series'
import type { ClienteEscritura } from '../cliente-db.ts'
import { COMPONENTE_CRISTAL, COMPONENTES_HERRAJE } from './componentes-disenyo.ts'

/**
 * Lo mínimo que este módulo necesita de una fila de la plantilla. El resto de
 * columnas viaja intacto: quien llama recupera SUS componentes, no una copia
 * recortada (ver `resolverPerfiles`).
 */
export interface ComponentePlantillaBruto {
  articuloCodigo: string
  funcion: string | null
  componenteDisenyo: string | null
}

export interface ResolucionPerfiles<C extends ComponentePlantillaBruto> {
  /** La plantilla con el artículo real donde la serie lo resuelve. */
  plantillaResuelta: C[]
  /** Artículos de la plantilla que son ranura genérica ("(**…"). */
  genericos: ReadonlySet<string>
  /** Ranuras genéricas de PERFIL que la serie no resuelve. */
  sinResolver: ReadonlySet<string>
  /** Ranuras genéricas de ASOCIADO (herraje, escuadra, mano de obra). */
  sinResolverAsoc: ReadonlySet<string>
  /** Cuántos componentes se resolvieron por la variante de acristalamiento. */
  variantesAplicadas: number
}

/**
 * Índice componente -> artículo real para una serie.
 *
 * La tabla de delegaciones se lee ENTERA y sin filtro: son ~700 filas, y la
 * cadena se expande transitivamente, así que filtrar por la serie sólo traería
 * el primer salto. La de resoluciones sí se filtra, ya con la cadena resuelta.
 */
async function leerResoluciones(
  cliente: ClienteEscritura,
  serieCodigo: string,
): Promise<Map<string, string>> {
  const delegacionesFilas = await cliente.select({
    conjuntoCodigo: schema.conjuntoDelegaciones.conjuntoCodigo,
    delegadoCodigo: schema.conjuntoDelegaciones.delegadoCodigo,
  }).from(schema.conjuntoDelegaciones)

  const delegaciones = new Map<string, string[]>()
  for (const f of delegacionesFilas) {
    const lista = delegaciones.get(f.conjuntoCodigo) ?? []
    lista.push(f.delegadoCodigo)
    delegaciones.set(f.conjuntoCodigo, lista)
  }

  const cadena = expandirCadena(serieCodigo, delegaciones)
  const resolucionesFilas = await cliente.select({
    conjuntoCodigo: schema.conjuntoResoluciones.conjuntoCodigo,
    componente: schema.conjuntoResoluciones.componente,
    articuloCodigo: schema.conjuntoResoluciones.articuloCodigo,
  }).from(schema.conjuntoResoluciones)
    .where(inArray(schema.conjuntoResoluciones.conjuntoCodigo, cadena))

  return construirResoluciones(cadena, resolucionesFilas)
}

/**
 * Qué artículos de la plantilla son ranuras genéricas.
 *
 * El marcador es la descripción del catálogo: `(**…`. Son los que DEBEN
 * sustituirse para poder valorar.
 *
 * Este conjunto gobierna ÚNICAMENTE los avisos: qué artículos entran en
 * `sinResolver` y `sinResolverAsoc`. NO condiciona la sustitución, que se
 * intenta para todo componente con `componenteDisenyo` salvo el CRISTAL. Un
 * artículo ya real también se sustituye si la serie resuelve su componente.
 * Es comportamiento heredado, conservado tal cual y fijado por una prueba.
 */
async function leerGenericos(
  cliente: ClienteEscritura,
  codigos: readonly string[],
): Promise<Set<string>> {
  if (!codigos.length) return new Set()
  const filas = await cliente.select({ codigo: schema.articulos.codigo })
    .from(schema.articulos)
    .where(and(
      inArray(schema.articulos.codigo, [...codigos]),
      sql`${schema.articulos.descripcion} LIKE '(**%'`,
    ))
  return new Set(filas.map((a) => a.codigo))
}

/**
 * Asociado por `funcion`: mano de obra (`inf*`) y accesorios (`Acc*`).
 *
 * Distingue mayúsculas y minúsculas, tal y como estaba. Es la heurística
 * original; la lista de `COMPONENTES_HERRAJE` es ADITIVA a ella.
 */
const esAsociado = (fn: string | null) =>
  !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))

export interface EntradaResolucionPerfiles<C extends ComponentePlantillaBruto> {
  serieCodigo: string
  plantilla: readonly C[]
  /** Elección visible del formulario: '1' sencillo, '2' doble. */
  variante: VarianteAcristalamiento
}

/**
 * Resuelve la plantilla contra la serie.
 *
 * El tipo de los componentes es genérico a propósito: la plantilla lleva
 * columnas que este módulo no mira (fórmulas, cotas, diseño) y que los pasos
 * siguientes —despiece, vidrio, junquillos— sí necesitan. Devolverlas con su
 * tipo evita que quien llama tenga que recuperarlas por su cuenta.
 */
export async function resolverPerfiles<C extends ComponentePlantillaBruto>(
  cliente: ClienteEscritura,
  entrada: EntradaResolucionPerfiles<C>,
): Promise<ResolucionPerfiles<C>> {
  const resoluciones = await leerResoluciones(cliente, entrada.serieCodigo)
  const genericos = await leerGenericos(
    cliente,
    [...new Set(entrada.plantilla.map((c) => c.articuloCodigo))],
  )

  // Dos clases de ranura sin resolver, y conviene no mezclarlas en el aviso: un
  // usuario que lee "20 ranuras que la serie no resuelve" no puede saber cuál de
  // los dos frentes le está bloqueando la línea.
  const sinResolver = new Set<string>()
  const sinResolverAsoc = new Set<string>()
  const anotarSinResolver = (c: ComponentePlantillaBruto) => {
    if (!genericos.has(c.articuloCodigo)) return
    if (esAsociado(c.funcion) ||
      (c.componenteDisenyo !== null && COMPONENTES_HERRAJE.has(c.componenteDisenyo))) {
      sinResolverAsoc.add(c.articuloCodigo)
    } else {
      sinResolver.add(c.articuloCodigo)
    }
  }

  let variantesAplicadas = 0
  const plantillaResuelta = entrada.plantilla.map((c) => {
    if (!c.componenteDisenyo) {
      anotarSinResolver(c)
      return c
    }
    // El componente 1 es el CRISTAL, y la serie no tiene que resolverlo: lo
    // elige el usuario y se valora por la vía del acristalamiento (anexos L, M,
    // N, Q). El paso 4 del anexo J ya lo decía. Contarlo aquí metía un
    // `problema` en TODA línea con cristal y la dejaba sin valorar: 1.864 de
    // 7.000 apariciones del histórico (T.21.3).
    //
    // Esto NO se traga fallos de esa vía: si el acristalamiento no se puede
    // calcular o valorar, sus propios avisos siguen entrando en `problemas`.
    if (c.componenteDisenyo === COMPONENTE_CRISTAL) return c
    const res = resolverComponente(c.componenteDisenyo, resoluciones, entrada.variante)
    if (res.articuloCodigo) {
      if (res.via === 'variante') variantesAplicadas++
      return { ...c, articuloCodigo: res.articuloCodigo }
    }
    anotarSinResolver(c)
    return c
  })

  return { plantillaResuelta, genericos, sinResolver, sinResolverAsoc, variantesAplicadas }
}
