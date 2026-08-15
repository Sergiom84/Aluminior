/**
 * Modelo del cerramiento configurado: la cadena de módulos y uniones que el
 * diseñador produce y que el presupuesto recibe como una sola línea `GRUPO`.
 *
 * Se separa de `diseno.ts` —vocabulario visual y reparto geométrico— porque es
 * otra responsabilidad: aquí vive lo que se persiste, se valida al volver del
 * navegador y se describe en el documento.
 */
import {
  plantillaDiseno, PLANTILLAS_DISENO, UNIONES_VISUALES,
  type PlantillaDiseno, type UnionVisual,
} from './diseno.ts'

export const VERSION_CONFIGURACION_CERRAMIENTO = 1 as const

export interface ModuloCerramiento {
  id: string
  estructuraCodigo: string
  anchoMm: number
  altoMm: number
}

export interface UnionCerramiento {
  id: string
  codigo: string
  longitudMm: number
  grosorMm: number
}

export interface ConfiguracionCerramiento {
  version: typeof VERSION_CONFIGURACION_CERRAMIENTO
  modulos: readonly ModuloCerramiento[]
  uniones: readonly UnionCerramiento[]
}

export function crearConfiguracionCerramiento(
  plantilla: PlantillaDiseno = PLANTILLAS_DISENO[0],
): ConfiguracionCerramiento {
  return {
    version: VERSION_CONFIGURACION_CERRAMIENTO,
    modulos: [{
      id: 'modulo-1', estructuraCodigo: plantilla.codigo,
      anchoMm: plantilla.anchoMm, altoMm: plantilla.altoMm,
    }],
    uniones: [],
  }
}

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
    modulos: [...configuracion.modulos, {
      id: `modulo-${numero}`,
      estructuraCodigo: plantilla.codigo,
      anchoMm: plantilla.anchoMm,
      altoMm: altoReferencia,
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
 * Actualiza un módulo y mantiene coherentes únicamente las uniones cuya altura
 * queda determinada sin ambigüedad por dos módulos adyacentes iguales.
 * Cuando las alturas difieren, la longitud de unión puede ser una decisión
 * manual del operador y se conserva.
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
  if (cambios.altoMm === undefined) return { ...configuracion, modulos }

  const uniones = configuracion.uniones.map((union, actual) => {
    const izquierdo = modulos[actual]
    const derecho = modulos[actual + 1]
    return izquierdo.altoMm === derecho.altoMm
      ? { ...union, longitudMm: izquierdo.altoMm }
      : union
  })

  return { ...configuracion, modulos, uniones }
}

export function eliminarModuloCerramiento(
  configuracion: ConfiguracionCerramiento,
  id: string,
): ConfiguracionCerramiento {
  const indice = configuracion.modulos.findIndex((modulo) => modulo.id === id)
  if (indice < 0 || configuracion.modulos.length === 1) return configuracion
  const modulos = configuracion.modulos.filter((modulo) => modulo.id !== id)
  const indiceUnion = indice === configuracion.modulos.length - 1 ? indice - 1 : indice
  const uniones = configuracion.uniones.filter((_, actual) => actual !== indiceUnion)
  return { ...configuracion, modulos, uniones }
}

export function medidasCerramiento(configuracion: ConfiguracionCerramiento) {
  return {
    anchoMm: configuracion.modulos.reduce((total, modulo) => total + modulo.anchoMm, 0) +
      configuracion.uniones.reduce((total, union) => total + union.grosorMm, 0),
    altoMm: Math.max(0, ...configuracion.modulos.map((modulo) => modulo.altoMm)),
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

export function esConfiguracionCerramiento(valor: unknown): valor is ConfiguracionCerramiento {
  if (!valor || typeof valor !== 'object') return false
  const candidato = valor as Partial<ConfiguracionCerramiento>
  if (candidato.version !== VERSION_CONFIGURACION_CERRAMIENTO ||
      !Array.isArray(candidato.modulos) || !Array.isArray(candidato.uniones) ||
      candidato.modulos.length === 0 ||
      candidato.uniones.length !== candidato.modulos.length - 1) return false
  const modulosValidos = candidato.modulos.every((modulo) =>
    modulo && typeof modulo.id === 'string' && typeof modulo.estructuraCodigo === 'string' &&
    Number.isInteger(modulo.anchoMm) && modulo.anchoMm > 0 &&
    Number.isInteger(modulo.altoMm) && modulo.altoMm > 0 &&
    plantillaDiseno(modulo.estructuraCodigo) !== null)
  const unionesValidas = candidato.uniones.every((union) =>
    union && typeof union.id === 'string' &&
    UNIONES_VISUALES.some((catalogo) => catalogo.codigo === union.codigo) &&
    Number.isFinite(union.longitudMm) && union.longitudMm > 0 &&
    Number.isFinite(union.grosorMm) && union.grosorMm > 0)
  const ids = [...candidato.modulos.map((modulo) => modulo.id),
    ...candidato.uniones.map((union) => union.id)]
  return modulosValidos && unionesValidas && new Set(ids).size === ids.length
}
