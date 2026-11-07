/**
 * Qué series sirven para un cerramiento.
 *
 * Una serie sirve cuando resuelve todas las ranuras de perfil de las
 * estructuras elegidas, con la variante de acristalamiento que el vidrio
 * impone (`varianteSegunGrosor`). Es la misma condición con la que
 * `despiezarDiseno` marca "la serie no resuelve el componente N": aquí se
 * evalúa antes de añadir la línea, para no ofrecer una serie que la dejaría
 * sin valorar.
 *
 * Puro y sin acceso a datos: la lectura vive en `leer-series-validas.ts`.
 */

import { varianteSegunGrosor } from '@aluminior/core/despiece'

/** `ranura` sin sufijo; la serie la resuelve exacta o con `.1` / `.2`. */
export interface SerieEvaluable {
  codigo: string
  /** Claves de `conjunto_resoluciones` (y ranuras vacías) de su cadena. */
  resueltas: ReadonlySet<string>
  grosorMaximoSimple: number
}

export interface VidrioEvaluable {
  grosorAcristalar: number
  dobleAcristalamiento: boolean
}

/** Filas de plantilla que dependen de la serie (ver `ranurasDeSerie`). */
export interface FilaPlantillaSerie {
  componente: string | null
  funcion: string | null
  /** El artículo propio de la fila vale tal cual (existe y no es genérico). */
  articuloPropioValido: boolean
}

const COMPONENTE_VIDRIO = '1'
/** Informativos y accesorios de diseño: describen, nunca son material propio. */
const sinMaterial = (funcion: string | null) => /^(inf|Acc)/.test(funcion ?? '')

/**
 * Ranuras que la serie tiene que resolver: las filas con componente que no son
 * el cristal ni informativas y cuyo artículo propio no sirve como sustituto.
 */
export function ranurasDeSerie(filas: readonly FilaPlantillaSerie[]): string[] {
  const ranuras = new Set<string>()
  for (const fila of filas) {
    if (!fila.componente || fila.componente === COMPONENTE_VIDRIO) continue
    if (sinMaterial(fila.funcion) || fila.articuloPropioValido) continue
    ranuras.add(fila.componente)
  }
  return [...ranuras]
}

export function serieResuelve(
  serie: SerieEvaluable,
  ranuras: readonly string[],
  vidrio: VidrioEvaluable | null,
): boolean {
  const variante = varianteSegunGrosor({ grosorMaximoSimple: serie.grosorMaximoSimple }, vidrio)
  return ranuras.every((ranura) =>
    serie.resueltas.has(ranura) || serie.resueltas.has(`${ranura}.${variante}`))
}

/** Códigos de las series que resuelven todas las ranuras, en el orden recibido. */
export function seriesValidas(
  series: readonly SerieEvaluable[],
  ranuras: readonly string[],
  vidrio: VidrioEvaluable | null,
): string[] {
  return series.filter((serie) => serieResuelve(serie, ranuras, vidrio)).map((serie) => serie.codigo)
}

/**
 * Lista para el selector general del grupo: las series que sirven a todas sus
 * estructuras. Si ninguna sirve a todas (modelos de tipos distintos), cada
 * elemento tiene que llevar la suya y el general ofrece las que sirven a alguna.
 * Sin datos de una estructura no se restringe nada.
 */
export function seriesParaGrupo(
  todas: readonly string[],
  porEstructura: Readonly<Record<string, readonly string[]>>,
  estructuras: readonly string[],
): string[] {
  const conDatos = [...new Set(estructuras)].filter((codigo) => porEstructura[codigo])
  if (!conDatos.length) return [...todas]
  const comunes = todas.filter((serie) => conDatos.every((codigo) => porEstructura[codigo].includes(serie)))
  if (comunes.length) return comunes
  return todas.filter((serie) => conDatos.some((codigo) => porEstructura[codigo].includes(serie)))
}
