/**
 * Compacto de persiana por módulo del cerramiento (E5).
 *
 * Cada módulo de una composición v3 puede incorporar un compacto de persiana
 * (COM001-COM017), con su altura de cajón, acabado, opciones de guía central o
 * motor, y eventual altura total cuando cubre fijos inferiores/superiores.
 */
import type { CompactoLineaCatalogo } from '../despiece/linea-catalogo/tipos.ts'
import type { ModuloCerramiento } from './cerramiento.ts'

export interface CompactoModulo {
  estructuraCodigo: string
  altoCajonMm: number
  acabadoCodigo?: string
  opciones?: readonly string[]
  alturaTotalMm?: number
  vueloIzquierdoMm?: number
  vueloDerechoMm?: number
  posicionGuiaCentralMm?: number
  descuentoVerticalMm?: number
}

export function compactoModuloValido(valor: unknown): valor is CompactoModulo | undefined {
  if (valor === undefined) return true
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return false
  const c = valor as Partial<CompactoModulo>
  if (typeof c.estructuraCodigo !== 'string' || !c.estructuraCodigo.trim()) return false
  if (typeof c.altoCajonMm !== 'number' || !Number.isFinite(c.altoCajonMm) || c.altoCajonMm <= 0) return false
  if (c.acabadoCodigo !== undefined && (typeof c.acabadoCodigo !== 'string' || !c.acabadoCodigo.trim())) return false
  if (c.opciones !== undefined && (!Array.isArray(c.opciones) || c.opciones.some(o => typeof o !== 'string' || !o.trim()))) return false
  if (c.alturaTotalMm !== undefined && (typeof c.alturaTotalMm !== 'number' || !Number.isFinite(c.alturaTotalMm) || c.alturaTotalMm <= 0)) return false
  if (c.vueloIzquierdoMm !== undefined && (typeof c.vueloIzquierdoMm !== 'number' || !Number.isFinite(c.vueloIzquierdoMm) || c.vueloIzquierdoMm < 0)) return false
  if (c.vueloDerechoMm !== undefined && (typeof c.vueloDerechoMm !== 'number' || !Number.isFinite(c.vueloDerechoMm) || c.vueloDerechoMm < 0)) return false
  if (c.posicionGuiaCentralMm !== undefined && (typeof c.posicionGuiaCentralMm !== 'number' || !Number.isFinite(c.posicionGuiaCentralMm) || c.posicionGuiaCentralMm < 0)) return false
  if (c.descuentoVerticalMm !== undefined && (typeof c.descuentoVerticalMm !== 'number' || !Number.isFinite(c.descuentoVerticalMm) || c.descuentoVerticalMm < 0)) return false
  return true
}

/**
 * Compacto efectivo que recibe el motor de despiece para el módulo.
 * Hereda el acabado de accesorios o general de la línea cuando no tiene propio.
 * Sin opciones guardadas no se suponen: los valores por defecto de Productor
 * (`EstructurasOpcGrupos/Opciones`) no están cargados y el despiece lo declara incompleto.
 */
export function compactoEfectivoModulo(
  modulo: Pick<ModuloCerramiento, 'compacto'>,
  cerramiento: { acabadoCodigo?: string | null; acabadoAccesoriosCodigo?: string | null },
): CompactoLineaCatalogo | null {
  if (!modulo.compacto) return null
  const c = modulo.compacto
  const acabado = c.acabadoCodigo?.trim().toUpperCase() ||
    cerramiento.acabadoAccesoriosCodigo?.trim().toUpperCase() ||
    cerramiento.acabadoCodigo?.trim().toUpperCase() ||
    'UNI'
  return {
    estructura: c.estructuraCodigo.trim().toUpperCase(),
    acabado,
    opciones: c.opciones ?? [],
    altoCajonMm: c.altoCajonMm,
    vueloIzquierdoMm: c.vueloIzquierdoMm ?? 0,
    vueloDerechoMm: c.vueloDerechoMm ?? 0,
    posicionGuiaCentralMm: c.posicionGuiaCentralMm ?? 0,
    descuentoVerticalMm: c.descuentoVerticalMm ?? 0,
    ...(c.alturaTotalMm !== undefined ? { alturaTotalMm: c.alturaTotalMm } : {}),
  }
}
