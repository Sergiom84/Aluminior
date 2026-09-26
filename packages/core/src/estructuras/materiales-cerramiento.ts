/**
 * Materiales por elemento del cerramiento (fase 4).
 *
 * Evidencia (docs/paridad/fase-4/00-resumen.md): en 175
 * cerramientos reales de presupuesto con varios elementos, 64 mezclan series de
 * perfiles y 55 vidrios distintos; el acabado no varía nunca. El elemento
 * guarda solo sus excepciones: sin excepción hereda el valor general de la
 * línea, de modo que cambiar el general no pisa lo elegido para un elemento.
 */
import type { ConfiguracionCerramiento, ModuloCerramiento } from './cerramiento.ts'
import { composicionExplicita } from './composicion-cerramiento.ts'

export interface MaterialesModulo {
  serieCodigo?: string
  vidrioCodigo?: string
}

export type CampoMaterial = keyof MaterialesModulo
export const CAMPOS_MATERIAL: readonly CampoMaterial[] = ['serieCodigo', 'vidrioCodigo']

export interface MaterialesGenerales {
  serieCodigo: string | null
  vidrioCodigo: string | null
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
  return { serieCodigo: resolver('serieCodigo'), vidrioCodigo: resolver('vidrioCodigo') }
}

/**
 * Cambios de material para uno o varios elementos. Un texto fija la excepción;
 * `null` la quita y el elemento vuelve a heredar el general. Los campos ausentes
 * no se tocan.
 */
export type CambiosMaterial = Partial<Record<CampoMaterial, string | null>>

function aplicar(modulo: ModuloCerramiento, cambios: CambiosMaterial): ModuloCerramiento {
  const materiales: MaterialesModulo = { ...modulo.materiales }
  for (const campo of CAMPOS_MATERIAL) {
    if (!Object.hasOwn(cambios, campo)) continue
    const valor = cambios[campo]?.trim().toUpperCase()
    if (valor) materiales[campo] = valor
    else delete materiales[campo]
  }
  const { materiales: _anterior, ...base } = modulo
  return Object.keys(materiales).length ? { ...base, materiales } : base
}

export function asignarMaterialesModulos(
  configuracion: ConfiguracionCerramiento,
  ids: readonly string[],
  cambios: CambiosMaterial,
): ConfiguracionCerramiento {
  const destino = new Set(ids)
  if (!configuracion.modulos.some((modulo) => destino.has(modulo.id))) return configuracion
  const base = composicionExplicita(configuracion)
  return { ...base, modulos: base.modulos.map((modulo) => destino.has(modulo.id) ? aplicar(modulo, cambios) : modulo) }
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

export function materialesModuloValidos(valor: unknown): boolean {
  if (valor === undefined) return true
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return false
  const entradas = Object.entries(valor)
  return entradas.length > 0 && entradas.every(([campo, texto]) =>
    (CAMPOS_MATERIAL as readonly string[]).includes(campo) &&
    typeof texto === 'string' && texto.trim() !== '' && texto === texto.trim().toUpperCase())
}
