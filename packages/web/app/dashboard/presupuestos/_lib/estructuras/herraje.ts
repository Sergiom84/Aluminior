/**
 * Opciones de herraje de una (serie, estructura).
 *
 * Dos usos del mismo catálogo, y por eso viven juntos: lo que se OFRECE al
 * configurar y lo que se PERSISTE al añadir la línea. No son la misma lista —el
 * original oculta opciones que aun así se guardan con su default— y tenerlos
 * separados en dos sitios era la vía rápida a que dejaran de coincidir.
 *
 * El juego de conjuntos sale de `herraje_conjuntos`, MEDIDO del histórico
 * (≥3 muestras, ≥90% de consistencia). Sin regla medida no se ofrece ni se
 * guarda nada: no se adivina qué herraje lleva una combinación que la empresa
 * nunca ha fabricado.
 *
 * Extraído de `acciones.ts` en T.69.1 SIN cambiar comportamiento. Las consultas,
 * el orden de los resultados y los casos límite son los que había; lo que
 * cambia es que ahora reciben el cliente en vez de abrir el suyo, y que existen
 * pruebas que fijan ese comportamiento.
 */

import { and, eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { OpcionHerrajeElegida } from '../lineas/guardar-linea.ts'

export interface GrupoOpcionesHerraje {
  conjuntoCodigo: string
  opciones: { codigo: string; descripcion: string; porDefecto: boolean }[]
}

type FilaOpcion = typeof schema.opcionesHerraje.$inferSelect

/** Clave de una opción dentro del catálogo. Estable, y usada en los dos usos. */
const clave = (fila: { conjuntoCodigo: string; opcionCodigo: string }) =>
  `${fila.conjuntoCodigo}|${fila.opcionCodigo}`

/**
 * Conjuntos medidos para esa combinación y sus opciones.
 *
 * Devuelve `null` cuando no hay regla: es la señal de «no hay nada medido», y
 * los dos usos la interpretan cada uno a su manera.
 */
async function leerCatalogo(
  cliente: ClienteEscritura,
  serieCodigo: string,
  estructuraCodigo: string,
): Promise<{ codigos: string[]; filas: FilaOpcion[] } | null> {
  const [regla] = await cliente.select({ conjuntos: schema.herrajeConjuntos.conjuntos })
    .from(schema.herrajeConjuntos)
    .where(and(
      eq(schema.herrajeConjuntos.serieCodigo, serieCodigo),
      eq(schema.herrajeConjuntos.estructuraCodigo, estructuraCodigo),
    )).limit(1)
  if (!regla) return null

  const codigos = regla.conjuntos.split('+')
  const filas = await cliente.select()
    .from(schema.opcionesHerraje)
    .where(inArray(schema.opcionesHerraje.conjuntoCodigo, codigos))
  return { codigos, filas }
}

/**
 * Lo que se OFRECE al configurar.
 *
 * Las ocultas se excluyen —el original no las muestra—, los grupos salen en el
 * orden de la regla y las opciones ordenadas por su código como número. Un
 * grupo sin opciones visibles no se ofrece, y si no queda ninguno se devuelve
 * `null` para que la interfaz no pinte una sección vacía.
 */
export async function opcionesHerrajeDe(
  cliente: ClienteEscritura,
  serieCodigo: string,
  estructuraCodigo: string,
): Promise<GrupoOpcionesHerraje[] | null> {
  if (!serieCodigo || !estructuraCodigo) return null
  const catalogo = await leerCatalogo(cliente, serieCodigo, estructuraCodigo)
  if (!catalogo) return null

  const grupos: GrupoOpcionesHerraje[] = []
  for (const conjuntoCodigo of catalogo.codigos) {
    const opciones = catalogo.filas
      .filter((f) => f.conjuntoCodigo === conjuntoCodigo && !f.oculta)
      .sort((a, b) => Number(a.opcionCodigo) - Number(b.opcionCodigo))
      .map((f) => ({ codigo: f.opcionCodigo, descripcion: f.descripcion, porDefecto: f.porDefecto }))
    if (opciones.length) grupos.push({ conjuntoCodigo, opciones })
  }
  return grupos.length ? grupos : null
}

export interface EntradaOpcionesElegidas {
  serieCodigo: string | null
  estructuraCodigo: string
  /** Claves `conjunto|opcion` marcadas en el formulario. */
  elegidas: readonly string[]
}

/**
 * Lo que se PERSISTE al añadir la línea.
 *
 * Se guarda para trazabilidad y para la futura selección de asociados; hoy no
 * afecta a la valoración. Sólo se aceptan opciones del catálogo de los conjuntos
 * medidos para esa (serie, estructura): una clave inventada en el formulario se
 * ignora en vez de escribirse.
 *
 * Las ocultas no se pueden elegir, pero las ocultas por defecto entran solas.
 * El orden del resultado es el de inserción: primero lo elegido, en el orden en
 * que llegó del formulario, y después los defaults ocultos en orden de catálogo.
 *
 * NOTA sobre el estado actual: el formulario todavía no emite `opcionHerraje`,
 * así que `elegidas` llega vacío en producción y lo único que se persiste son
 * los defaults ocultos. La rama de elección existe para el selector que vendrá,
 * y hoy sólo la ejercitan las pruebas.
 */
export async function resolverOpcionesHerraje(
  cliente: ClienteEscritura,
  entrada: EntradaOpcionesElegidas,
): Promise<OpcionHerrajeElegida[]> {
  const catalogo = await leerCatalogo(
    cliente,
    // El `?? ''` viene del código original: sin serie, la consulta no encuentra
    // regla y el resultado es una lista vacía, no un fallo.
    entrada.serieCodigo ?? '',
    entrada.estructuraCodigo,
  )
  if (!catalogo) return []

  const porClave = new Map(catalogo.filas.map((f) => [clave(f), f]))
  const elegidas = new Map<string, FilaOpcion>()
  for (const marcada of entrada.elegidas) {
    const fila = porClave.get(marcada)
    if (fila && !fila.oculta) elegidas.set(clave(fila), fila)
  }
  for (const fila of catalogo.filas) {
    if (fila.oculta && fila.porDefecto) elegidas.set(clave(fila), fila)
  }

  return [...elegidas.values()].map((f) => ({
    categoria: f.conjuntoCodigo,
    opcionCodigo: f.opcionCodigo,
    descripcion: f.descripcion,
  }))
}
