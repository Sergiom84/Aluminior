/**
 * Comparación pura entre el despiece del motor y el guardado por Productor en
 * una línea de factura. El despiece guardado es el oráculo: nunca entra en el
 * cálculo. Se separa lo que no es catálogo (colocación manual, compactos,
 * barrotillo de diseño, avisos) para no mezclar causas.
 */
import type { FilaDespieceCatalogo } from '../../packages/core/src/despiece/linea-catalogo/tipos.ts'

export interface HijaFactura {
  articulo: string
  funcion: string
  cantidad: number
  largoMm: number
  anchoMm: number
  importe: number
  precio: number
}

/** Avisos que Productor inserta como artículos sin precio. */
export const AVISOS_PRODUCTOR = new Set(['133', '134', '135', '155'])
/**
 * Entradas de la línea que no son despiece de catálogo de la estructura:
 * colocación y compactos manuales, barrotillo de diseño, mosquiteras (PSM*) y
 * tapajuntas (funciones TAP*, ESC y MOTAP) añadidos en la edición de línea.
 */
const EXTRA_ARTICULOS = new Set(['MOCOL', 'MOCOMP', 'MOTAP', 'BI'])
const EXTRA_FUNCIONES = new Set(['COMPVAL', 'ACC_REC', 'MOCOL', 'ESC'])

export type ClaseHija = 'material' | 'sin-material' | 'aviso' | 'extra'

export function clasificarHija(h: HijaFactura, tipoMetraje: string | null): ClaseHija {
  if (AVISOS_PRODUCTOR.has(h.articulo)) return 'aviso'
  if (EXTRA_ARTICULOS.has(h.articulo) || EXTRA_FUNCIONES.has(h.funcion) || /^TAP/.test(h.funcion) || /^PSM/.test(h.articulo)) return 'extra'
  // Productor guarda filas de cantidad 0 (cerradero acumulativo, mano de obra 0): sin importe.
  if (h.cantidad === 0 || h.importe === 0 && h.precio === 0) return 'sin-material'
  if (!h.articulo || h.articulo === '0' || h.importe === 0 && h.precio === 0 && /^inf|^Acc|^EK/.test(h.funcion)) return 'sin-material'
  if (tipoMetraje === null) return 'sin-material'
  return 'material'
}

// Compensa únicamente el error de representación Double en un límite de
// redondeo. No absorbe residuos Single del CSV ni amplía la décima del contrato.
const medida = (mm: number | null) => {
  if (mm === null) return '-'
  const decimas = mm * 10
  return Math.round(decimas + Number.EPSILON * Math.abs(decimas)) / 10
}
const clave = (articulo: string, cantidad: number, largo: number | null, ancho: number | null) =>
  `${articulo}|${cantidad}|${medida(largo)}${ancho === null ? '' : `|${medida(ancho)}`}`

function clavePieza(
  pieza: { articulo: string; cantidad: number; largoMm: number | null; anchoMm: number | null },
  porMetro: (articulo: string) => boolean,
): string {
  const ancho = pieza.anchoMm !== null && pieza.anchoMm > 0 ? pieza.anchoMm : null
  return clave(pieza.articulo, pieza.cantidad, porMetro(pieza.articulo) || ancho !== null ? pieza.largoMm : null, ancho)
}

function multiconjunto(claves: string[]) {
  const m = new Map<string, number>()
  for (const k of claves) m.set(k, (m.get(k) ?? 0) + 1)
  return m
}

/** Diferencias de piezas: `+n clave` sobra en el motor, `-n clave` falta. */
export function diferenciasPiezas(
  motor: readonly FilaDespieceCatalogo[],
  factura: readonly HijaFactura[],
  porMetro: (articulo: string) => boolean,
): string[] {
  const a = multiconjunto(motor.filter(f => f.importe !== 0 || f.origen !== 'plantilla')
    .map(f => clavePieza(f, porMetro)))
  const b = multiconjunto(factura.map(h => clavePieza(h, porMetro)))
  const dif: string[] = []
  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const d = (a.get(k) ?? 0) - (b.get(k) ?? 0)
    if (d) dif.push(`${d > 0 ? '+' : ''}${d} ${k}`)
  }
  return dif.sort()
}

/** Importe del motor valorando cada fila al precio unitario de la factura cuando existe. */
export function importeConPreciosFactura(
  motor: readonly FilaDespieceCatalogo[], factura: readonly HijaFactura[], porMetro: (articulo: string) => boolean,
): number | null {
  const precios = new Map<string, { precio: number; disponibles: number }>()
  for (const h of factura) {
    if (!Number.isFinite(h.precio)) return null
    const k = clavePieza(h, porMetro)
    const anterior = precios.get(k)
    // Sin identidad adicional no se puede asignar precios distintos a piezas idénticas.
    if (anterior && anterior.precio !== h.precio) return null
    precios.set(k, { precio: h.precio, disponibles: (anterior?.disponibles ?? 0) + 1 })
  }
  let total = 0
  for (const f of motor) {
    if (f.metraje === null || !Number.isFinite(f.metraje)) return null
    const p = precios.get(clavePieza(f, porMetro))
    if (!p?.disponibles) return null
    p.disponibles--
    total += Math.round(p.precio * f.metraje * 100 + 1e-9) / 100
  }
  if ([...precios.values()].some(p => p.disponibles !== 0)) return null
  return Math.round(total * 100) / 100
}
