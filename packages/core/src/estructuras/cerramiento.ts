/**
 * Modelo del cerramiento configurado: la composición de módulos y uniones que
 * el diseñador produce y que el presupuesto recibe como una sola línea `GRUPO`.
 *
 * Se separa de `diseno.ts` —vocabulario visual y reparto geométrico— porque es
 * otra responsabilidad: aquí vive lo que se persiste, se valida al volver del
 * navegador y se describe en el documento. La disposición bidimensional está
 * en `composicion-cerramiento.ts`.
 */
import {
  plantillaDiseno, PLANTILLAS_DISENO, UNIONES_VISUALES,
  type PlantillaDiseno, type UnionVisual,
} from './diseno.ts'
import {
  anclajesCerramiento, eliminarModuloConDependientes, posicionesCerramiento,
  type AnclajeModulo,
} from './composicion-cerramiento.ts'
import {
  VERSION_COMPOSICION_CERRAMIENTO, VERSION_CONFIGURACION_CERRAMIENTO,
} from './versiones-cerramiento.ts'

export { VERSION_CONFIGURACION_CERRAMIENTO }
export const FI_1OFI_NUEVA_ALTA_MM = 300 as const

export interface ModuloCerramiento {
  id: string
  estructuraCodigo: string
  anchoMm: number
  altoMm: number
  fiMm?: number
  /** Solo en v3: elemento del que cuelga, lado y unión que los separa. */
  anclaje?: AnclajeModulo
}

export interface UnionCerramiento {
  id: string
  /** Vacío mientras la unión está sin configurar, como la crea Productor. */
  codigo: string
  longitudMm: number
  grosorMm: number
}

interface ConfiguracionCerramientoBase {
  modulos: readonly ModuloCerramiento[]
  uniones: readonly UnionCerramiento[]
}

export interface ConfiguracionCerramientoV1 extends ConfiguracionCerramientoBase {
  version: 1
}

export interface ConfiguracionCerramientoV2 extends ConfiguracionCerramientoBase {
  version: typeof VERSION_CONFIGURACION_CERRAMIENTO
}

/** Composición bidimensional con anclajes explícitos; admite FI como v2. */
export interface ConfiguracionCerramientoV3 extends ConfiguracionCerramientoBase {
  version: typeof VERSION_COMPOSICION_CERRAMIENTO
}

export type ConfiguracionCerramiento =
  | ConfiguracionCerramientoV1 | ConfiguracionCerramientoV2 | ConfiguracionCerramientoV3

/** v3 nunca retrocede; en cadena, v2 solo mientras haya FI explícito. */
function versionSegun(
  configuracion: ConfiguracionCerramiento,
  modulos: readonly ModuloCerramiento[],
): ConfiguracionCerramiento['version'] {
  if (configuracion.version === VERSION_COMPOSICION_CERRAMIENTO) return VERSION_COMPOSICION_CERRAMIENTO
  return modulos.some((modulo) => Object.hasOwn(modulo, 'fiMm')) ? VERSION_CONFIGURACION_CERRAMIENTO : 1
}

/** Módulo con la medida propia de la plantilla, sin identidad ni posición. */
export function moduloDesdePlantilla(plantilla: PlantillaDiseno, altoMm = plantilla.altoMm) {
  return {
    estructuraCodigo: plantilla.codigo,
    anchoMm: plantilla.anchoMm, altoMm,
    ...(plantilla.codigo === '1OFI' ? { fiMm: FI_1OFI_NUEVA_ALTA_MM } : {}),
  }
}

export function crearConfiguracionCerramiento(
  plantilla: PlantillaDiseno = PLANTILLAS_DISENO[0],
): ConfiguracionCerramiento {
  return {
    version: plantilla.codigo === '1OFI' ? VERSION_CONFIGURACION_CERRAMIENTO : 1,
    modulos: [{ id: 'modulo-1', ...moduloDesdePlantilla(plantilla) }],
    uniones: [],
  }
}

/** Añadido histórico al extremo derecho de una cadena, con la altura vecina. */
export function anadirModuloCerramiento(
  configuracion: ConfiguracionCerramiento,
  plantilla: PlantillaDiseno,
  union: UnionVisual = UNIONES_VISUALES[0],
): ConfiguracionCerramiento {
  const numero = Math.max(0, ...configuracion.modulos.map((modulo) =>
    Number(modulo.id.match(/(\d+)$/)?.[1] ?? 0))) + 1
  const numeroUnion = Math.max(0, ...configuracion.uniones.map((enlace) =>
    Number(enlace.id.match(/(\d+)$/)?.[1] ?? 0))) + 1
  const altoReferencia = configuracion.modulos.at(-1)?.altoMm ?? plantilla.altoMm
  return {
    ...configuracion,
    version: plantilla.codigo === '1OFI' && configuracion.version === 1
      ? VERSION_CONFIGURACION_CERRAMIENTO : configuracion.version,
    modulos: [...configuracion.modulos, {
      id: `modulo-${numero}`, ...moduloDesdePlantilla(plantilla, altoReferencia),
    }],
    uniones: [...configuracion.uniones, {
      id: `union-${numeroUnion}`,
      codigo: union.codigo,
      longitudMm: altoReferencia,
      grosorMm: union.grosorMm,
    }],
  }
}

/**
 * Actualiza un módulo y mantiene coherentes únicamente las uniones cuya
 * longitud queda determinada sin ambigüedad: el lado compartido mide lo mismo
 * en los dos elementos. Si difiere, la longitud puede ser una decisión manual
 * del operador y se conserva.
 */
export function actualizarModuloCerramiento(
  configuracion: ConfiguracionCerramiento,
  id: string,
  cambios: Partial<Pick<ModuloCerramiento, 'anchoMm' | 'altoMm'>>,
): ConfiguracionCerramiento {
  const indice = configuracion.modulos.findIndex((modulo) => modulo.id === id)
  if (indice < 0) return configuracion

  const modulos = configuracion.modulos.map((modulo, actual) => actual === indice
    ? { ...modulo, ...cambios }
    : modulo)
  const porId = new Map(modulos.map((modulo) => [modulo.id, modulo]))
  const longitudes = new Map<string, number>()
  for (const [hijoId, anclaje] of anclajesCerramiento(configuracion)) {
    const padre = porId.get(anclaje.moduloId)!
    const hijo = porId.get(hijoId)!
    const [compartido, cambiado] = anclaje.lado === 'derecha'
      ? [padre.altoMm === hijo.altoMm ? padre.altoMm : null, cambios.altoMm !== undefined]
      : [padre.anchoMm === hijo.anchoMm ? padre.anchoMm : null, cambios.anchoMm !== undefined]
    if (compartido !== null && cambiado) longitudes.set(anclaje.unionId, compartido)
  }
  const uniones = configuracion.uniones.map((union) => longitudes.has(union.id)
    ? { ...union, longitudMm: longitudes.get(union.id)! }
    : union)

  return { ...configuracion, modulos, uniones }
}

/** Editar FI es la única conversión implícita de v1 a la versión vigente. */
export function actualizarFiModuloCerramiento(
  configuracion: ConfiguracionCerramiento,
  id: string,
  fiMm: number,
): ConfiguracionCerramiento {
  const modulo = configuracion.modulos.find((actual) => actual.id === id)
  if (!modulo || plantillaDiseno(modulo.estructuraCodigo)?.codigo !== '1OFI') return configuracion
  return {
    ...configuracion,
    version: configuracion.version === VERSION_COMPOSICION_CERRAMIENTO
      ? VERSION_COMPOSICION_CERRAMIENTO : VERSION_CONFIGURACION_CERRAMIENTO,
    modulos: configuracion.modulos.map((actual) => actual.id === id
      ? { ...actual, fiMm }
      : actual),
  }
}

export function cambiarEstructuraModuloCerramiento(
  configuracion: ConfiguracionCerramiento,
  id: string,
  plantilla: PlantillaDiseno,
): ConfiguracionCerramiento {
  const existe = configuracion.modulos.some((modulo) => modulo.id === id)
  if (!existe) return configuracion
  const modulos = configuracion.modulos.map((modulo) => {
    if (modulo.id !== id) return modulo
    const { fiMm: _fiAnterior, ...base } = modulo
    return {
      ...base,
      estructuraCodigo: plantilla.codigo,
      ...(plantilla.codigo === '1OFI' ? { fiMm: FI_1OFI_NUEVA_ALTA_MM } : {}),
    }
  })
  return { ...configuracion, version: versionSegun(configuracion, modulos), modulos }
}

export function configuracionTieneFiExplicito(configuracion: ConfiguracionCerramiento): boolean {
  return configuracion.modulos.some((modulo) => modulo.estructuraCodigo.trim().toUpperCase() === '1OFI' &&
    Object.hasOwn(modulo, 'fiMm'))
}

/**
 * En cadena (v1/v2) conserva el comportamiento histórico: quita el módulo y la
 * unión adyacente. En v3 elimina también los elementos que dependen de él.
 */
export function eliminarModuloCerramiento(
  configuracion: ConfiguracionCerramiento,
  id: string,
): ConfiguracionCerramiento {
  if (configuracion.version === VERSION_COMPOSICION_CERRAMIENTO) {
    return eliminarModuloConDependientes(configuracion, id)
  }
  const indice = configuracion.modulos.findIndex((modulo) => modulo.id === id)
  if (indice < 0 || configuracion.modulos.length === 1) return configuracion
  const modulos = configuracion.modulos.filter((modulo) => modulo.id !== id)
  const indiceUnion = indice === configuracion.modulos.length - 1 ? indice - 1 : indice
  const uniones = configuracion.uniones.filter((_, actual) => actual !== indiceUnion)
  return { ...configuracion, version: versionSegun(configuracion, modulos), modulos, uniones }
}

/** Caja envolvente de los elementos; en cadena equivale a sumar anchos y uniones. */
export function medidasCerramiento(configuracion: ConfiguracionCerramiento) {
  const rects = [...posicionesCerramiento(configuracion).modulos.values()]
  return {
    anchoMm: Math.max(0, ...rects.map((rect) => rect.x + rect.ancho)),
    altoMm: Math.max(0, ...rects.map((rect) => rect.y + rect.alto)),
  }
}

/**
 * Descripción de la línea agregada, tal y como el operador la ve en el
 * documento. Se deriva siempre de la configuración persistida para que reabrir
 * un presupuesto antiguo produzca el mismo texto.
 */
export function descripcionCerramiento(configuracion: ConfiguracionCerramiento): string {
  const codigos = configuracion.modulos
    .map((modulo) => plantillaDiseno(modulo.estructuraCodigo)?.codigo)
    .filter((codigo): codigo is string => Boolean(codigo))
  return `CERRAMIENTO SEGÚN DIBUJO · ${codigos.join(' + ')}`
}

export { esConfiguracionCerramiento } from './validar-configuracion-cerramiento.ts'
