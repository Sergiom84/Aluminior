/**
 * Materiales por elemento del cerramiento (fase 4).
 *
 * Evidencia (docs/paridad/fase-4/00-resumen.md): en 175
 * cerramientos reales de presupuesto con varios elementos, 64 mezclan series de
 * perfiles y 55 vidrios distintos. El acabado también puede variar, aunque es
 * raro: Productor guarda `Acabado` y `Acabado2` (accesorios) en cada fila hija
 * del GRUPO, y en la copia de EMP0016 2 de 231 GRUPO los mezclan (260289,
 * GRUPO 406272: una unión PSU006 en L dentro de un mirador en VS). El elemento
 * guarda solo sus excepciones: sin excepción hereda el valor general de la
 * línea, de modo que cambiar el general no pisa lo elegido para un elemento.
 */
import type { ConfiguracionCerramiento, ModuloCerramiento, UnionCerramiento } from './cerramiento.ts'
import { anclajesCerramiento, composicionExplicita } from './composicion-cerramiento.ts'

export interface MaterialesModulo {
  serieCodigo?: string
  vidrioCodigo?: string
  acabadoCodigo?: string
  /** `Acabado2` de Productor: acabado de los accesorios del elemento. */
  acabadoAccesoriosCodigo?: string
}

/**
 * La unión guarda su propia serie cuando difiere de la general: en EMP0016,
 * 39 GRUPO de presupuesto unen módulos con una unión cuya serie no es la del
 * primer módulo. La unión no tiene vidrio propio: admite serie y acabados.
 */
export interface MaterialesUnion {
  serieCodigo?: string
  acabadoCodigo?: string
  acabadoAccesoriosCodigo?: string
}

export type CampoMaterial = keyof MaterialesModulo
export const CAMPOS_MATERIAL: readonly CampoMaterial[] = ['serieCodigo', 'vidrioCodigo', 'acabadoCodigo', 'acabadoAccesoriosCodigo']
export type CampoMaterialUnion = keyof MaterialesUnion
export const CAMPOS_MATERIAL_UNION: readonly CampoMaterialUnion[] = ['serieCodigo', 'acabadoCodigo', 'acabadoAccesoriosCodigo']

/** Valores de la línea. Los acabados son opcionales: ausentes, el elemento no tiene de dónde heredar. */
export interface MaterialesGenerales {
  serieCodigo: string | null
  vidrioCodigo: string | null
  acabadoCodigo?: string | null
  acabadoAccesoriosCodigo?: string | null
}

export interface MaterialEfectivo {
  valor: string | null
  origen: 'elemento' | 'general'
}

export function materialesEfectivos(
  modulo: Pick<ModuloCerramiento, 'materiales'>,
  generales: MaterialesGenerales,
): Record<CampoMaterial, MaterialEfectivo> {
  const resolver = (campo: CampoMaterial): MaterialEfectivo => {
    const propio = modulo.materiales?.[campo]
    return propio ? { valor: propio, origen: 'elemento' } : { valor: generales[campo] || null, origen: 'general' }
  }
  return {
    serieCodigo: resolver('serieCodigo'), vidrioCodigo: resolver('vidrioCodigo'),
    acabadoCodigo: resolver('acabadoCodigo'), acabadoAccesoriosCodigo: resolver('acabadoAccesoriosCodigo'),
  }
}

export function serieEfectivaUnion(
  configuracion: ConfiguracionCerramiento,
  union: Pick<UnionCerramiento, 'id' | 'materiales'>,
  generales: Pick<MaterialesGenerales, 'serieCodigo'>,
): string | null {
  const propia = union.materiales?.serieCodigo?.trim()
  if (propia) return propia
  const general = generales.serieCodigo?.trim()
  if (general) return general
  const porId = new Map(configuracion.modulos.map((m) => [m.id, m]))
  for (const [hijoId, anclaje] of anclajesCerramiento(configuracion)) {
    if (anclaje.unionId !== union.id) continue
    const seriePadre = porId.get(anclaje.moduloId)?.materiales?.serieCodigo?.trim()
    if (seriePadre) return seriePadre
    const serieHijo = porId.get(hijoId)?.materiales?.serieCodigo?.trim()
    if (serieHijo) return serieHijo
  }
  for (const modulo of configuracion.modulos) {
    const serie = modulo.materiales?.serieCodigo?.trim()
    if (serie) return serie
  }
  return null
}

/**
 * Cambios de material para uno o varios elementos. Un texto fija la excepción;
 * `null` la quita y el elemento vuelve a heredar el general. Los campos ausentes
 * no se tocan.
 */
export type CambiosMaterial = Partial<Record<CampoMaterial, string | null>>
export type CambiosMaterialUnion = Partial<Record<CampoMaterialUnion, string | null>>

function aplicar<T extends { materiales?: Partial<Record<C, string>> }, C extends string>(
  elemento: T, cambios: Partial<Record<C, string | null>>, campos: readonly C[],
): T {
  const materiales: Partial<Record<C, string>> = { ...elemento.materiales }
  for (const campo of campos) {
    if (!Object.hasOwn(cambios, campo)) continue
    const valor = cambios[campo]?.trim().toUpperCase()
    if (valor) materiales[campo] = valor
    else delete materiales[campo]
  }
  const { materiales: _anterior, ...base } = elemento
  return (Object.keys(materiales).length ? { ...base, materiales } : base) as T
}

/** Igual que en los módulos: un texto fija la excepción de la unión y `null` la quita. */
export function asignarMaterialesUnion(
  configuracion: ConfiguracionCerramiento,
  id: string,
  cambios: CambiosMaterialUnion,
): ConfiguracionCerramiento {
  if (!configuracion.uniones.some((union) => union.id === id)) return configuracion
  const base = composicionExplicita(configuracion)
  return { ...base, uniones: base.uniones.map((union) => union.id === id ? aplicar(union, cambios, CAMPOS_MATERIAL_UNION) : union) }
}

export function asignarMaterialesModulos(
  configuracion: ConfiguracionCerramiento,
  ids: readonly string[],
  cambios: CambiosMaterial,
): ConfiguracionCerramiento {
  const destino = new Set(ids)
  if (!configuracion.modulos.some((modulo) => destino.has(modulo.id))) return configuracion
  const base = composicionExplicita(configuracion)
  return { ...base, modulos: base.modulos.map((modulo) => destino.has(modulo.id) ? aplicar(modulo, cambios, CAMPOS_MATERIAL) : modulo) }
}

/**
 * Modelos iguales: misma estructura de catálogo. La identidad se toma del
 * código verificado, no del aspecto ni de las medidas actuales.
 */
export function modelosIguales(configuracion: ConfiguracionCerramiento, id: string): string[] {
  const modelo = configuracion.modulos.find((modulo) => modulo.id === id)
  if (!modelo) return []
  const codigo = modelo.estructuraCodigo.trim().toUpperCase()
  return configuracion.modulos
    .filter((modulo) => modulo.estructuraCodigo.trim().toUpperCase() === codigo)
    .map((modulo) => modulo.id)
}

function materialesValidos(valor: unknown, campos: readonly string[]): boolean {
  if (valor === undefined) return true
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return false
  const entradas = Object.entries(valor)
  return entradas.length > 0 && entradas.every(([campo, texto]) =>
    campos.includes(campo) &&
    typeof texto === 'string' && texto.trim() !== '' && texto === texto.trim().toUpperCase())
}

export function materialesModuloValidos(valor: unknown): boolean {
  return materialesValidos(valor, CAMPOS_MATERIAL)
}

export function materialesUnionValidos(valor: unknown): boolean {
  return materialesValidos(valor, CAMPOS_MATERIAL_UNION)
}
