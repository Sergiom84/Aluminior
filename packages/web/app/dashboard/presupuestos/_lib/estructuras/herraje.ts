/**
 * Opciones de herraje de una (serie, estructura).
 *
 * Dos usos del mismo catálogo, y por eso viven juntos: lo que se OFRECE al
 * configurar y lo que se PERSISTE al añadir la línea. No son la misma lista —el
 * original oculta opciones que aun así se guardan con su default— y tenerlos
 * separados en dos sitios era la vía rápida a que dejaran de coincidir.
 *
 * El juego de conjuntos sale primero de `herraje_conjuntos`, MEDIDO del histórico
 * (≥3 muestras, ≥90% de consistencia). Si no hay fila, el respaldo es el catálogo
 * de despiece: tipo de hoja de la plantilla y `conjunto_parametros_despiece.herrajes`
 * (`1PCMA` → `ELEGANTPVC+HU536`, `1PMA` → `ELEGANTPVC+HU528`). Sin regla ni
 * plantilla no se ofrece ni se guarda nada.
 *
 * Extraído de `acciones.ts` en T.69.1 SIN cambiar comportamiento. Las consultas,
 * el orden de los resultados y los casos límite son los que había; lo que
 * cambia es que ahora reciben el cliente en vez de abrir el suyo, y que existen
 * pruebas que fijan ese comportamiento.
 */

import { clavesTipoHoja, esTipoHojaMarco } from '@aluminior/core/despiece'
import { evaluarFormulaOpciones, parsearFormulaOpciones } from '@aluminior/core/estructuras'
import { and, eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { OpcionHerrajeElegida } from '../lineas/guardar-linea.ts'

export interface GrupoOpcionesHerraje {
  conjuntoCodigo: string
  /** `categoria`: `CategoriaOH` del catálogo, para la lista `Categoría` de la pestaña. */
  categorias?: { codigo: string; descripcion: string; excluyentes: boolean }[]
  opciones: { codigo: string; descripcion: string; porDefecto: boolean; categoria: string | null; oculta?: boolean; activaSoloSi?: string | null; incompatible?: string | null }[]
}

export class ErrorSeleccionHerraje extends Error {}

type FilaOpcion = typeof schema.opcionesHerraje.$inferSelect

/** Clave de una opción dentro del catálogo. Estable, y usada en los dos usos. */
const clave = (fila: { conjuntoCodigo: string; opcionCodigo: string }) =>
  `${fila.conjuntoCodigo}|${fila.opcionCodigo}`

/**
 * Conjuntos medidos para esa combinación y sus opciones.
 *
 * Devuelve `null` cuando no hay regla medida ni respaldo de catálogo. Los dos
 * usos interpretan esa ausencia cada uno a su manera.
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
  const codigos = regla
    ? regla.conjuntos.split('+')
    : await conjuntosDesdeCatalogo(cliente, serieCodigo, estructuraCodigo)
  if (!codigos?.length) return null

  const filas = await cliente.select()
    .from(schema.opcionesHerraje)
    .where(inArray(schema.opcionesHerraje.conjuntoCodigo, codigos))
  return { codigos, filas }
}

/**
 * Conjuntos de herraje que el motor de despiece ya deriva para esa serie y
 * estructura. Misma lectura que `leer-catalogo.ts`: hoja no marco, clave de
 * `clavesTipoHoja` y código de `parametros.herrajes`.
 */
async function conjuntosDesdeCatalogo(
  cliente: ClienteEscritura,
  serieCodigo: string,
  estructuraCodigo: string,
): Promise<string[] | null> {
  const [parametros] = await cliente.select()
    .from(schema.conjuntoParametrosDespiece)
    .where(eq(schema.conjuntoParametrosDespiece.conjuntoCodigo, serieCodigo))
    .limit(1)
  if (!parametros) return null
  const plantilla = await cliente.select()
    .from(schema.estructuraPlantillaCatalogo)
    .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, estructuraCodigo))
  if (!plantilla.length) return null
  const filas = [...plantilla].sort((a, b) => a.lineaOrigen - b.lineaOrigen)
  const idsHoja = [...new Set(filas.map(f => f.tipoHoja).filter((t): t is string => !esTipoHojaMarco(t)))]
  if (!idsHoja.length) return null
  const tiposFila = await cliente.select()
    .from(schema.tiposHojaCatalogo)
    .where(inArray(schema.tiposHojaCatalogo.id, idsHoja))
  const tiposHoja = new Map(tiposFila.map(t => [t.id, t.tipo]))
  const herrajes = parametros.herrajes as Record<string, string>
  const conjuntosHerraje = [...new Set(idsHoja
    .map(t => clavesTipoHoja(tiposHoja.get(t))?.herraje).filter((k): k is string => !!k)
    .map(k => herrajes[k]).filter((c): c is string => !!c))]
  if (!conjuntosHerraje.length) return null
  return [serieCodigo, ...conjuntosHerraje]
}

/**
 * Lo que se OFRECE al configurar.
 *
 * Las ocultas viajan para evaluar fórmulas, pero core no las muestra. Los grupos salen en el
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

  const categorias = await cliente.select().from(schema.opcionesHerrajeCategorias)
    .where(inArray(schema.opcionesHerrajeCategorias.conjuntoCodigo, catalogo.codigos))
  const grupos: GrupoOpcionesHerraje[] = []
  for (const conjuntoCodigo of catalogo.codigos) {
    const opciones = catalogo.filas
      .filter((f) => f.conjuntoCodigo === conjuntoCodigo)
      .sort((a, b) => Number(a.opcionCodigo) - Number(b.opcionCodigo))
      .map((f) => ({
        codigo: f.opcionCodigo, descripcion: f.descripcion, porDefecto: f.porDefecto, categoria: f.categoria,
        oculta: f.oculta, activaSoloSi: f.activaSoloSi, incompatible: f.incompatible,
      }))
    if (opciones.some(o => !o.oculta)) grupos.push({ conjuntoCodigo, opciones,
      categorias: categorias.filter(c => c.conjuntoCodigo === conjuntoCodigo) })
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
 * El formulario emite las marcas visibles; el servidor valida las fórmulas.
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

  const categorias = await cliente.select().from(schema.opcionesHerrajeCategorias)
    .where(inArray(schema.opcionesHerrajeCategorias.conjuntoCodigo, catalogo.codigos))
  // El formulario no puede forzar dos incompatibles ni una condición falsa.
  for (const fila of elegidas.values()) {
    if (fila.oculta) continue
    const otras = new Set([...elegidas.values()]
      .filter(f => f.conjuntoCodigo === fila.conjuntoCodigo && f.opcionCodigo !== fila.opcionCodigo)
      .map(f => String(Number(f.opcionCodigo))))
    if (fila.categoria && categorias.some(c => c.conjuntoCodigo === fila.conjuntoCodigo && c.codigo === fila.categoria && c.excluyentes)
      && [...elegidas.values()].some(f => f !== fila && f.conjuntoCodigo === fila.conjuntoCodigo && f.categoria === fila.categoria)) {
      throw new ErrorSeleccionHerraje('Categoría de herraje excluyente')
    }
    let activa, incompatible
    try {
      activa = parsearFormulaOpciones(fila.activaSoloSi)
      incompatible = parsearFormulaOpciones(fila.incompatible)
    } catch { throw new ErrorSeleccionHerraje('Fórmula de herraje no válida en el catálogo') }
    if ((activa && !evaluarFormulaOpciones(activa, otras))
      || (incompatible && evaluarFormulaOpciones(incompatible, otras))) {
      throw new ErrorSeleccionHerraje('Selección de herraje incompatible o no activa')
    }
  }

  return [...elegidas.values()].map((f) => ({
    categoria: f.conjuntoCodigo,
    opcionCodigo: f.opcionCodigo,
    descripcion: f.descripcion,
  }))
}
