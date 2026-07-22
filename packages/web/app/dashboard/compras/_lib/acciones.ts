'use server'

/**
 * Server Actions de compras (pedidos a proveedor).
 *
 * Todo el cálculo ocurre en SERVIDOR. El importe de una línea es
 * cantidad × coste_unitario, y el total del pedido se recalcula en SQL desde
 * las líneas. El coste NUNCA se inventa: es entrada del usuario, y sólo se
 * SUGIERE desde `articulos_coste` cuando esa fuente es inequívoca (regla 3).
 */

import { z } from 'zod'
import { eq, sql, and, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { crearDb, schema } from '@aluminior/db'
import { crearClienteServidor } from '../../../../lib/supabase/servidor.ts'

/**
 * Email del usuario de la sesión, para `creado_por` (T.61). Nunca rompe la
 * creación: ante cualquier fallo devuelve null y el pedido se crea igual.
 */
async function usuarioActual(): Promise<string | null> {
  try {
    const supabase = await crearClienteServidor()
    const { data, error } = await supabase.auth.getClaims()
    if (error || !data?.claims) return null
    const claims = data.claims as { email?: string; sub?: string }
    return claims.email ?? claims.sub ?? null
  } catch {
    return null
  }
}

export type Estado =
  | { ok: true; id: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }
  | null

/** Siguiente número, patrón AASSSS del original: 260007 = nº 7 de 2026. */
async function siguienteNumero(db: ReturnType<typeof crearDb>): Promise<number> {
  const anyo = new Date().getFullYear() % 100
  const [f] = (await db.execute<{ max: number | null }>(sql`
    SELECT MAX(numero) AS max FROM pedidos_compra
    WHERE numero >= ${anyo * 10000} AND numero < ${(anyo + 1) * 10000}
  `)) as unknown as { max: number | null }[]
  return f?.max ? Number(f.max) + 1 : anyo * 10000 + 1
}

const esquemaCabecera = z.object({
  proveedorCodigo: z.string().trim().min(1, 'Elige un proveedor'),
  referencia: z.string().trim().max(120).optional().transform((v) => v || null),
  observaciones: z.string().trim().max(500).optional().transform((v) => v || null),
})

export async function crearPedido(_previo: Estado, datos: FormData): Promise<Estado> {
  const p = esquemaCabecera.safeParse(Object.fromEntries(datos))
  if (!p.success) return { ok: false, errores: p.error.flatten().fieldErrors }

  const d = p.data
  const db = crearDb()
  try {
    // El proveedor debe existir: FK garantiza integridad, pero damos un
    // mensaje claro en vez de un error de constraint crudo.
    const [prov] = await db.select({ codigo: schema.proveedores.codigo })
      .from(schema.proveedores).where(eq(schema.proveedores.codigo, d.proveedorCodigo)).limit(1)
    if (!prov) return { ok: false, errores: { proveedorCodigo: ['Proveedor no encontrado'] } }

    const numero = await siguienteNumero(db)
    const creadoPor = await usuarioActual()
    const [fila] = await db.insert(schema.pedidosCompra).values({
      numero,
      fecha: new Date().toISOString().slice(0, 10),
      proveedorCodigo: d.proveedorCodigo,
      referencia: d.referencia,
      observaciones: d.observaciones,
      estado: 'BORRADOR',
      creadoPor,
    }).returning({ id: schema.pedidosCompra.id })

    revalidatePath('/dashboard/compras')
    return { ok: true, id: fila.id }
  } catch (e) {
    return { ok: false, errores: {}, mensaje: (e as Error).message }
  }
}

/**
 * Coste sugerido para (artículo, proveedor, acabado), MEDIDO de `articulos_coste`.
 *
 * Sólo devuelve un número cuando es INEQUÍVOCO (regla 3):
 *  - si se da acabado y hay coste para ese acabado → ese coste;
 *  - si no se da acabado (o no hay para ese), y todos los acabados del artículo
 *    con ese proveedor tienen el MISMO coste → ese coste;
 *  - en cualquier otro caso (varios costes distintos, o ninguno) → null.
 * El usuario siempre puede sobrescribirlo; esto sólo rellena el campo.
 */
export async function costeSugerido(
  articuloCodigo: string, proveedorCodigo: string, acabadoCodigo?: string,
): Promise<number | null> {
  if (!articuloCodigo || !proveedorCodigo) return null
  const db = crearDb()
  const filas = await db.select({
    acabadoCodigo: schema.articulosCoste.acabadoCodigo,
    coste: schema.articulosCoste.coste,
  }).from(schema.articulosCoste)
    .where(and(
      eq(schema.articulosCoste.articuloCodigo, articuloCodigo),
      eq(schema.articulosCoste.proveedorCodigo, proveedorCodigo),
    ))
  if (!filas.length) return null

  const acabado = (acabadoCodigo ?? '').trim()
  if (acabado) {
    const exacto = filas.find((f) => f.acabadoCodigo === acabado)
    if (exacto) return Number(exacto.coste)
  }
  const distintos = new Set(filas.map((f) => Number(f.coste)))
  return distintos.size === 1 ? [...distintos][0] : null
}

const esquemaLinea = z.object({
  pedidoId: z.string().uuid(),
  articuloCodigo: z.string().trim().optional().transform((v) => v || null),
  descripcion: z.string().trim().max(200).optional().transform((v) => v || null),
  acabadoCodigo: z.string().trim().max(40).optional().transform((v) => v || null),
  cantidad: z.coerce.number().positive().default(1),
  // Coste OPCIONAL: vacío = "sin coste" (línea no valorada). Nunca se rellena
  // con un número inventado; si el usuario no lo pone, queda NULL.
  costeUnitario: z
    .union([z.coerce.number().min(0), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : Number(v))),
})

export async function anyadirLinea(_previo: Estado, datos: FormData): Promise<Estado> {
  const p = esquemaLinea.safeParse(Object.fromEntries(datos))
  if (!p.success) return { ok: false, errores: p.error.flatten().fieldErrors }

  const d = p.data
  const db = crearDb()
  try {
    const [pedido] = await db.select({ id: schema.pedidosCompra.id })
      .from(schema.pedidosCompra).where(eq(schema.pedidosCompra.id, d.pedidoId)).limit(1)
    if (!pedido) return { ok: false, errores: {}, mensaje: 'Pedido no encontrado' }

    // Descripción: la del artículo si se eligió uno y no se escribió una manual.
    let descripcion = d.descripcion
    if (d.articuloCodigo) {
      const [art] = await db.select({ descripcion: schema.articulos.descripcion })
        .from(schema.articulos).where(eq(schema.articulos.codigo, d.articuloCodigo)).limit(1)
      if (!art) return { ok: false, errores: { articuloCodigo: ['Artículo no encontrado'] } }
      descripcion ??= art.descripcion
    }
    if (!descripcion) {
      return { ok: false, errores: { descripcion: ['Indica un artículo o una descripción'] } }
    }

    const [{ orden }] = (await db.execute<{ orden: number }>(sql`
      SELECT COALESCE(MAX(orden), 0) + 1 AS orden FROM lineas_pedido_compra
      WHERE pedido_id = ${d.pedidoId}
    `)) as unknown as { orden: number }[]

    // Cálculo en SERVIDOR. Sin coste -> importe NULL (no 0): la línea queda
    // "sin coste" y el pedido se marcará incompleto en recalcularTotales.
    const importe = d.costeUnitario === null
      ? null
      : Math.round(d.costeUnitario * d.cantidad * 100) / 100

    await db.insert(schema.lineasPedidoCompra).values({
      pedidoId: d.pedidoId,
      orden,
      articuloCodigo: d.articuloCodigo,
      descripcion,
      acabadoCodigo: d.acabadoCodigo,
      cantidad: String(d.cantidad),
      costeUnitario: d.costeUnitario === null ? null : String(d.costeUnitario),
      importe: importe === null ? null : String(importe),
    })

    await recalcularTotales(d.pedidoId)
    revalidatePath(`/dashboard/compras/${d.pedidoId}`)
    return { ok: true, id: d.pedidoId }
  } catch (e) {
    return { ok: false, errores: {}, mensaje: (e as Error).message }
  }
}

export async function borrarLinea(lineaId: string, pedidoId: string) {
  const db = crearDb()
  await db.delete(schema.lineasPedidoCompra).where(eq(schema.lineasPedidoCompra.id, lineaId))
  await recalcularTotales(pedidoId)
  revalidatePath(`/dashboard/compras/${pedidoId}`)
}

const ESTADOS = new Set(schema.ESTADOS_PEDIDO_COMPRA as readonly string[])

export async function cambiarEstado(pedidoId: string, estado: string) {
  if (!ESTADOS.has(estado)) return
  const db = crearDb()
  await db.update(schema.pedidosCompra)
    .set({ estado })
    .where(eq(schema.pedidosCompra.id, pedidoId))
  revalidatePath(`/dashboard/compras/${pedidoId}`)
}

/**
 * Recalcula el total del pedido desde las líneas, en una sola sentencia SQL.
 *
 * Guarda del dinero (T.59): el total sólo suma líneas CON coste. Si alguna
 * línea no tiene coste, `coste_completo` pasa a false y el total mostrado es
 * parcial — la UI lo señala como incompleto en vez de fingir un total real.
 * `BOOL_AND` sobre cero filas es NULL: COALESCE a true (pedido vacío = completo).
 */
export async function recalcularTotales(pedidoId: string) {
  const db = crearDb()
  await db.execute(sql`
    UPDATE pedidos_compra p SET
      total          = t.suma,
      coste_completo = t.completo
    FROM (
      SELECT
        COALESCE(SUM(importe), 0) AS suma,
        COALESCE(BOOL_AND(coste_unitario IS NOT NULL), true) AS completo
      FROM lineas_pedido_compra WHERE pedido_id = ${pedidoId}
    ) t
    WHERE p.id = ${pedidoId}
  `)
}
