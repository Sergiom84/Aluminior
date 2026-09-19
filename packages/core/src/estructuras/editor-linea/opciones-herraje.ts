/**
 * Pestaña `Opc.Herraje` de la edición de línea.
 *
 * Evidencia: CHM 5.3.1.3.2.1 y 5.1.2.12.7.7.2 (capturas de la rejilla `Selec /
 * Opción / Descripción` con las opciones no operables resaltadas), observación
 * del 18/09 (`RECON-DETALLE-PRESUPUESTO.md`: desplegable `Herraje`, lista
 * `Categoría` con `*** TODAS`) y `ConjuntosOpcionesHerraje` (11.854 filas).
 *
 * Reglas del manual que se modelan:
 * - las opciones ocultas no se muestran;
 * - `Selec.` marca la opción por defecto;
 * - `F. Opc. Activa sólo Si`: sólo se puede marcar o desmarcar si su fórmula se
 *   cumple con las marcadas;
 * - `F. Opc. Incompatible`: no se puede marcar mientras su fórmula se cumpla;
 * - categoría con `Opciones Excluyentes`: sólo una opción marcada a la vez.
 *
 * No se modela aquí la regla de que el original sólo muestra opciones con
 * asociaciones manuales aplicables a la apertura: depende de `ConjuntosAsoc` y
 * del diseño, y la decide quien lee el catálogo.
 */

import { evaluarFormulaOpciones, parsearFormulaOpciones, type FormulaOpciones } from './formula-opciones.ts'

export interface OpcionHerrajeCatalogo {
  readonly codigo: string
  readonly descripcion: string
  readonly porDefecto: boolean
  readonly oculta: boolean
  readonly categoria: string | null
  /** `fOpcSoloActiva`, tal cual del catálogo. */
  readonly activaSoloSi?: string | null
  /** `fOpcIncompatible`, tal cual del catálogo. */
  readonly incompatible?: string | null
}

export type MotivoBloqueoHerraje = 'condicion-no-cumplida' | 'incompatible' | 'categoria-excluyente' | 'formula-invalida'

export interface EstadoOpcionHerraje {
  readonly codigo: string
  readonly descripcion: string
  readonly categoria: string | null
  readonly seleccionada: boolean
  /** Se puede cambiar su marca ahora mismo. */
  readonly operable: boolean
  readonly motivo: MotivoBloqueoHerraje | null
}

/**
 * Descripciones de categoría por defecto: observadas en Productor (0016 y 0017)
 * y en `ConjuntosCatOH` de la 0017. La descripción real es por conjunto (hay
 * conjuntos donde `CER` es `CIERRES`); cuando se lea de la base, se pasa en
 * `descripciones` y prevalece sobre ésta.
 */
export const CATEGORIAS_HERRAJE_OBSERVADAS: Readonly<Record<string, string>> = {
  ACC: 'ACCESORIOS',
  BIS: 'BISAGRAS',
  CER: 'CERRADURAS',
  PAS: 'HOJA PASIVA',
  MAN: 'MANILLAS',
  OPC: 'OPCION HERRAJE',
  REF: 'REFUERZOS',
  TIR: 'TIRADORES',
}

export const CATEGORIA_HERRAJE_TODAS = '*** TODAS'

const normalizar = (codigo: string) => {
  const n = Number(codigo)
  return Number.isInteger(n) ? String(n) : codigo.trim()
}

function leerFormula(texto: string | null | undefined): FormulaOpciones | null | 'invalida' {
  try {
    return parsearFormulaOpciones(texto)
  } catch {
    return 'invalida'
  }
}

/** Opciones visibles, en orden numérico de código como en la rejilla. */
export function opcionesHerrajeVisibles(
  catalogo: readonly OpcionHerrajeCatalogo[],
): OpcionHerrajeCatalogo[] {
  return catalogo
    .filter((opcion) => !opcion.oculta)
    .sort((a, b) => Number(a.codigo) - Number(b.codigo))
}

/** Marca inicial: las opciones con `Selec.` activado, incluidas las ocultas. */
export function seleccionInicialHerraje(catalogo: readonly OpcionHerrajeCatalogo[]): Set<string> {
  return new Set(catalogo.filter((opcion) => opcion.porDefecto).map((opcion) => normalizar(opcion.codigo)))
}

/**
 * Estado de cada opción visible dada la marca actual.
 *
 * Una opción ya marcada cuya condición deja de cumplirse se sigue informando
 * como seleccionada y no operable: el manual no dice si el original la
 * desmarca sola (HIPÓTESIS pendiente del recon en vivo).
 */
export function estadoOpcionesHerraje(
  catalogo: readonly OpcionHerrajeCatalogo[],
  marcadas: ReadonlySet<string>,
  categoriasExcluyentes: ReadonlySet<string> = new Set(),
): EstadoOpcionHerraje[] {
  const marca = new Set([...marcadas].map(normalizar))
  return opcionesHerrajeVisibles(catalogo).map((opcion) => {
    const codigo = normalizar(opcion.codigo)
    const seleccionada = marca.has(codigo)
    const otras = new Set([...marca].filter((c) => c !== codigo))
    const motivo = motivoBloqueo(opcion, codigo, seleccionada, otras, catalogo, categoriasExcluyentes)
    return {
      codigo: opcion.codigo,
      descripcion: opcion.descripcion,
      categoria: opcion.categoria,
      seleccionada,
      operable: motivo === null,
      motivo,
    }
  })
}

function motivoBloqueo(
  opcion: OpcionHerrajeCatalogo,
  codigo: string,
  seleccionada: boolean,
  otras: ReadonlySet<string>,
  catalogo: readonly OpcionHerrajeCatalogo[],
  categoriasExcluyentes: ReadonlySet<string>,
): MotivoBloqueoHerraje | null {
  const activa = leerFormula(opcion.activaSoloSi)
  const incompatible = leerFormula(opcion.incompatible)
  if (activa === 'invalida' || incompatible === 'invalida') return 'formula-invalida'
  if (activa && !evaluarFormulaOpciones(activa, otras)) return 'condicion-no-cumplida'
  if (seleccionada) return null
  if (incompatible && evaluarFormulaOpciones(incompatible, otras)) return 'incompatible'
  if (opcion.categoria && categoriasExcluyentes.has(opcion.categoria)) {
    const ocupada = catalogo.some((otra) => otra.categoria === opcion.categoria
      && normalizar(otra.codigo) !== codigo && otras.has(normalizar(otra.codigo)))
    if (ocupada) return 'categoria-excluyente'
  }
  return null
}

/**
 * Cambia la marca de una opción si es operable. Una opción no operable, oculta
 * o ajena al catálogo deja la marca como estaba: la interfaz no puede forzarla.
 */
export function alternarOpcionHerraje(
  catalogo: readonly OpcionHerrajeCatalogo[],
  marcadas: ReadonlySet<string>,
  codigo: string,
  categoriasExcluyentes: ReadonlySet<string> = new Set(),
): Set<string> {
  const objetivo = normalizar(codigo)
  const siguiente = new Set([...marcadas].map(normalizar))
  const estado = estadoOpcionesHerraje(catalogo, siguiente, categoriasExcluyentes)
    .find((item) => normalizar(item.codigo) === objetivo)
  if (!estado || !estado.operable) return siguiente
  if (estado.seleccionada) siguiente.delete(objetivo)
  else siguiente.add(objetivo)
  return siguiente
}

/** Categorías del desplegable: `*** TODAS` y las presentes en las visibles. */
export function categoriasOpcionesHerraje(
  catalogo: readonly OpcionHerrajeCatalogo[],
  descripciones: Readonly<Record<string, string>> = {},
): { codigo: string; etiqueta: string }[] {
  const codigos = [...new Set(opcionesHerrajeVisibles(catalogo)
    .map((opcion) => opcion.categoria)
    .filter((categoria): categoria is string => Boolean(categoria)))].sort()
  return [
    { codigo: CATEGORIA_HERRAJE_TODAS, etiqueta: CATEGORIA_HERRAJE_TODAS },
    ...codigos.map((codigo) => {
      const descripcion = descripciones[codigo] ?? CATEGORIAS_HERRAJE_OBSERVADAS[codigo]
      return { codigo, etiqueta: descripcion ? `${codigo} ${descripcion}` : codigo }
    }),
  ]
}

/** Filtro de la rejilla por categoría; `*** TODAS` no filtra. */
export function filtrarPorCategoriaHerraje<T extends { categoria: string | null }>(
  estados: readonly T[],
  categoria: string,
): T[] {
  return categoria === CATEGORIA_HERRAJE_TODAS
    ? [...estados]
    : estados.filter((estado) => estado.categoria === categoria)
}
