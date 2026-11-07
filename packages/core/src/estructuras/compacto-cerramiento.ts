/**
 * Compacto de persiana y tapajuntas por módulo del cerramiento (E5).
 *
 * Cada módulo de una composición v3 puede incorporar un compacto de persiana
 * (COM001-COM017), con su altura de cajón, acabado, opciones de guía central o
 * motor, y eventual altura total cuando cubre fijos inferiores/superiores, así
 * como un tapajuntas/premarco (GMT001-GMT023, TAP40).
 */
import type { AccesorioLineaCatalogo, CompactoLineaCatalogo } from '../despiece/linea-catalogo/tipos.ts'
import type { ConfiguracionCerramiento, ModuloCerramiento } from './cerramiento.ts'
import { composicionExplicita } from './composicion-cerramiento.ts'

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
  descontarHueco?: boolean
}

export interface TapajuntasModulo {
  estructuraCodigo: string
  acabadoCodigo?: string
  opciones?: readonly string[]
  descontarHueco?: boolean
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
  if (c.descontarHueco !== undefined && typeof c.descontarHueco !== 'boolean') return false
  return true
}

export function tapajuntasModuloValido(valor: unknown): valor is TapajuntasModulo | undefined {
  if (valor === undefined) return true
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return false
  const t = valor as Partial<TapajuntasModulo>
  if (typeof t.estructuraCodigo !== 'string' || !t.estructuraCodigo.trim()) return false
  if (t.acabadoCodigo !== undefined && (typeof t.acabadoCodigo !== 'string' || !t.acabadoCodigo.trim())) return false
  if (t.opciones !== undefined && (!Array.isArray(t.opciones) || t.opciones.some(o => typeof o !== 'string' || !o.trim()))) return false
  if (t.descontarHueco !== undefined && typeof t.descontarHueco !== 'boolean') return false
  return true
}

/**
 * Compacto efectivo que recibe el motor de despiece para el módulo.
 * Hereda el acabado de accesorios o general de la línea cuando no tiene propio.
 * Sin opciones guardadas no se suponen aquí: el despiece toma las predeterminadas
 * del catálogo (`EstructurasOpcOpciones`, 0033) o, sin él, lo declara incompleto.
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

export function accesoriosEfectivosModulo(
  modulo: Pick<ModuloCerramiento, 'tapajuntas'>,
  cerramiento: { acabadoCodigo?: string | null },
): readonly AccesorioLineaCatalogo[] {
  if (!modulo.tapajuntas) return []
  const t = modulo.tapajuntas
  const acabado = t.acabadoCodigo?.trim().toUpperCase() ||
    cerramiento.acabadoCodigo?.trim().toUpperCase() ||
    'UNI'
  return [{
    estructura: t.estructuraCodigo.trim().toUpperCase(),
    acabado,
    opciones: t.opciones ?? ['G1O0', 'G2O0', 'G3O0', 'G4O0'],
  }]
}

export interface CambiosComplementosModulo {
  compacto?: CompactoModulo | null
  tapajuntas?: TapajuntasModulo | null
}

function aplicarComplementos(modulo: ModuloCerramiento, cambios: CambiosComplementosModulo): ModuloCerramiento {
  const { compacto: _c, tapajuntas: _t, ...base } = modulo
  const compacto = Object.hasOwn(cambios, 'compacto') ? cambios.compacto ?? undefined : modulo.compacto
  const tapajuntas = Object.hasOwn(cambios, 'tapajuntas') ? cambios.tapajuntas ?? undefined : modulo.tapajuntas
  return {
    ...base,
    ...(compacto ? { compacto } : {}),
    ...(tapajuntas ? { tapajuntas } : {}),
  }
}

export function asignarComplementosModulos(
  configuracion: ConfiguracionCerramiento,
  ids: readonly string[],
  cambios: CambiosComplementosModulo,
): ConfiguracionCerramiento {
  const destino = new Set(ids)
  if (!configuracion.modulos.some((modulo) => destino.has(modulo.id))) return configuracion
  const base = composicionExplicita(configuracion)
  return { ...base, modulos: base.modulos.map((m) => destino.has(m.id) ? aplicarComplementos(m, cambios) : m) }
}
