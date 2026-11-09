/**
 * Precio que el operador pone a una pieza sin PVP en la tarifa.
 *
 * Solo rellena huecos: si la tarifa ya tiene precio para ese artículo y acabado,
 * manda la tarifa. Sin precio manual la pieza sigue bloqueando el total; nunca
 * se valora a cero.
 */
import { importeFila, redondearCentimos, type ArticuloTarifado, type FilaValorable } from './importe-fila.ts'

export const UNIDADES_PRECIO_MANUAL = ['ML', 'M2', 'UD'] as const
export type UnidadPrecioManual = typeof UNIDADES_PRECIO_MANUAL[number]

export interface PrecioManual {
  articulo: string
  acabado: string
  unidad: UnidadPrecioManual
  /** € por unidad (metro, m² o pieza), con hasta 4 decimales. */
  precio: number
}

export const MAXIMO_PRECIOS_MANUALES = 200
const MAXIMO_PRECIO = 1_000_000

export function clavePrecio(articulo: string, acabado: string): string {
  return `${articulo.trim().toUpperCase()}|${acabado.trim().toUpperCase()}`
}

export function esUnidadPrecioManual(v: unknown): v is UnidadPrecioManual {
  return typeof v === 'string' && (UNIDADES_PRECIO_MANUAL as readonly string[]).includes(v)
}

export function precioManualValido(v: unknown): v is PrecioManual {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const p = v as Partial<PrecioManual>
  return typeof p.articulo === 'string' && p.articulo.trim().length > 0 &&
    typeof p.acabado === 'string' && p.acabado.trim().length > 0 &&
    esUnidadPrecioManual(p.unidad) &&
    typeof p.precio === 'number' && Number.isFinite(p.precio) && p.precio > 0 && p.precio < MAXIMO_PRECIO
}

/** Ausente es válido. Una lista no admite dos precios para el mismo artículo y acabado. */
export function preciosManualesValidos(v: unknown): v is readonly PrecioManual[] | undefined {
  if (v === undefined) return true
  if (!Array.isArray(v) || v.length > MAXIMO_PRECIOS_MANUALES || !v.every(precioManualValido)) return false
  return new Set(v.map(p => clavePrecio(p.articulo, p.acabado))).size === v.length
}

/** Sustituye o añade precios por artículo y acabado, conservando los demás. */
export function fusionarPreciosManuales(
  actuales: readonly PrecioManual[] | undefined, nuevos: readonly PrecioManual[],
): PrecioManual[] {
  const porClave = new Map((actuales ?? []).map(p => [clavePrecio(p.articulo, p.acabado), p]))
  for (const p of nuevos) porClave.set(clavePrecio(p.articulo, p.acabado), {
    ...p, articulo: p.articulo.trim().toUpperCase(), acabado: p.acabado.trim().toUpperCase(),
  })
  return [...porClave.values()]
}

/**
 * Tarifa efectiva de una fila: la del catálogo si tiene PVP; si no, el precio
 * manual en su unidad. Devuelve `manual` para dejarlo visible en el despiece.
 */
export function tarifaConPrecioManual(
  tarifa: ArticuloTarifado | null,
  manual: PrecioManual | undefined,
): { tarifa: ArticuloTarifado | null; manual: boolean } {
  if (!tarifa || tarifa.pvp !== null || !manual) return { tarifa, manual: false }
  return {
    tarifa: { tipoMetraje: manual.unidad, pvp: manual.precio, minimo: 0, multiploLargoCm: 0, multiploAnchoCm: 0, incrementos: [] },
    manual: true,
  }
}

export function buscarPrecioManual(
  lista: readonly PrecioManual[] | undefined, articulo: string, acabado: string,
): PrecioManual | undefined {
  if (!lista?.length) return undefined
  const clave = clavePrecio(articulo, acabado)
  return lista.find(p => clavePrecio(p.articulo, p.acabado) === clave)
}

/** Medidas de una pieza sin precio, tal como sale del despiece. */
export interface PiezaSinPrecio extends FilaValorable {
  articulo: string
  acabado: string
  /** Unidad del artículo en el catálogo. */
  tipoMetraje: string
}

/** Unidades en que se puede medir una pieza: por metro hace falta largo; por m², largo y ancho. */
export function unidadesPosibles(filas: readonly FilaValorable[]): UnidadPrecioManual[] {
  const conLargo = filas.every(f => f.largoMm !== null && f.largoMm > 0)
  const conAncho = filas.every(f => f.anchoMm !== null && f.anchoMm > 0)
  return [...(conLargo ? ['ML' as const] : []), ...(conLargo && conAncho ? ['M2' as const] : []), 'UD']
}

/** Cantidad total en la unidad elegida (metros, m² o piezas) e importe con un precio. */
export function metrajeEnUnidad(filas: readonly FilaValorable[], unidad: UnidadPrecioManual, precio = 1):
  { metraje: number; importe: number } | null {
  const tarifa: ArticuloTarifado = { tipoMetraje: unidad, pvp: precio, minimo: 0, multiploLargoCm: 0, multiploAnchoCm: 0, incrementos: [] }
  let metraje = 0, importe = 0
  for (const f of filas) {
    const r = importeFila(f, tarifa)
    if (r.metraje === null || r.importe === null) return null
    metraje += r.metraje
    importe += r.importe
  }
  return { metraje: redondearCentimos(metraje), importe: redondearCentimos(importe) }
}
