/**
 * Reglas PURAS del cargador de tarifa (T.56/T.57, extraídas y testeadas en T.59).
 *
 * El cargador `packages/etl/src/cargar-tarifa.ts` las usa como única fuente de
 * verdad; aquí viven sin dependencia de la BD para poder unit-testarlas. La
 * pertenencia al catálogo (¿existe el artículo?) NO está aquí: requiere la BD y
 * la resuelve el cargador.
 */

/** Tarifas HISTÓRICAS: nunca escribibles. El cargador se niega a apuntarlas. */
export const TARIFAS_PROTEGIDAS: ReadonlySet<number> = new Set([1, 2, 3])
export const PRECIO_MIN = 0        // exclusivo: precio > 0
export const PRECIO_MAX = 100000   // €/unidad; por encima se marca fuera de rango

export const tarifaProtegida = (id: number): boolean => TARIFAS_PROTEGIDAS.has(id)
export const tarifaDestinoValida = (id: number): boolean =>
  Number.isInteger(id) && id > 0 && !TARIFAS_PROTEGIDAS.has(id)
export const precioEnRango = (p: number): boolean => p > PRECIO_MIN && p < PRECIO_MAX

/** Acabado genérico: vacío o '*' -> 'UNI' (precio no dependiente del acabado). */
export const normalizarAcabado = (a: string | undefined): string => {
  const t = (a ?? '').trim()
  return t === '' || t === '*' ? 'UNI' : t
}
/** Precio con coma o punto decimal; null si no es numérico. */
export const parsePrecio = (s: string | undefined): number | null => {
  const n = Number((s ?? '').trim().replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
export const esFechaVigencia = (s: string): boolean =>
  s === '' || /^\d{4}-\d{2}-\d{2}$/.test(s) || /^\d{2}[/-]\d{2}[/-]\d{4}$/.test(s)

export interface FilaTarifa { articulo: string; acabado: string; precio: number; fecha: string }
export type ResultadoFila =
  | { ok: true; fila: FilaTarifa }
  | { ok: false; motivo: 'clave' | 'fecha' | 'rango'; detalle: string }

/**
 * Valida y normaliza una fila del fichero de tarifa (formato/rango; NO catálogo).
 * Nunca inventa: si algo falta o está fuera de rango, devuelve `ok:false` con motivo.
 */
export function validarFilaTarifa(raw: {
  articulo?: string; acabado?: string; precio?: string; fecha_vigencia?: string
}): ResultadoFila {
  const articulo = (raw.articulo ?? '').trim()
  const acabado = normalizarAcabado(raw.acabado)
  const precio = parsePrecio(raw.precio)
  const fecha = (raw.fecha_vigencia ?? '').trim()
  if (!articulo || precio === null) return { ok: false, motivo: 'clave', detalle: 'clave/precio ausente' }
  if (!esFechaVigencia(fecha)) return { ok: false, motivo: 'fecha', detalle: `fecha inválida '${fecha}'` }
  if (!precioEnRango(precio)) return { ok: false, motivo: 'rango', detalle: `${articulo}/${acabado}=${precio}` }
  return { ok: true, fila: { articulo, acabado, precio, fecha } }
}

/**
 * DIFF de las filas válidas contra lo ya cargado en la tarifa destino.
 * Idempotente por construcción: re-cargar el mismo fichero da todo en `iguales`.
 */
export function diffTarifa(
  validas: Map<string, FilaTarifa>,
  existentes: Map<string, number>,
): { altas: string[]; cambios: string[]; iguales: string[] } {
  const altas: string[] = [], cambios: string[] = [], iguales: string[] = []
  for (const [clave, v] of validas) {
    if (!existentes.has(clave)) altas.push(clave)
    else if (Math.abs(existentes.get(clave)! - v.precio) > 1e-4) cambios.push(`${clave}: ${existentes.get(clave)} → ${v.precio}`)
    else iguales.push(clave)
  }
  return { altas, cambios, iguales }
}
