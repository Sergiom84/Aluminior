/**
 * Compras: pedidos a proveedor (módulo #3, T.63).
 *
 * Cabecera + líneas, mismo patrón que `presupuestos`/`lineas` en comercial.ts.
 *
 * Decisión de modelado clave (regla 1 y 3): el COSTE de una línea es SIEMPRE
 * entrada del usuario. Existe una fuente medida de coste —`articulos_coste`
 * (27.817 filas, clave artículo|proveedor|acabado)— que se usa SOLO para
 * AUTOCOMPLETAR la sugerencia cuando es inequívoca; nunca se copia el PVP
 * (`articulos_pvp` es PRECIO DE VENTA, no coste). Si una línea no tiene coste,
 * su `coste_unitario` e `importe` quedan NULL ("sin coste"), nunca 0, y el
 * pedido se marca incompleto — misma guarda del dinero que presupuestos (T.59).
 */

import {
  pgTable, text, integer, numeric, boolean, timestamp, date, uuid, index,
} from 'drizzle-orm/pg-core'
import { proveedores } from './comercial.ts'
import { articulos } from './catalogo.ts'

export const ESTADOS_PEDIDO_COMPRA = [
  'BORRADOR', 'ENVIADO', 'RECIBIDO', 'ANULADO',
] as const
export type EstadoPedidoCompra = (typeof ESTADOS_PEDIDO_COMPRA)[number]

/**
 * Cabecera del pedido de compra.
 *
 * `numero` sigue el patrón AASSSS del original (año + secuencia), igual que
 * presupuestos: 260007 = nº 7 de 2026. El proveedor es OBLIGATORIO: un pedido
 * de compra sin proveedor no existe en el dominio.
 */
export const pedidosCompra = pgTable('pedidos_compra', {
  id: uuid('id').primaryKey().defaultRandom(),

  numero: integer('numero').notNull(),
  fecha: date('fecha').notNull(),

  proveedorCodigo: text('proveedor_codigo').notNull().references(() => proveedores.codigo),

  /** Referencia del proveedor o interna (nº de oferta, albarán esperado…). */
  referencia: text('referencia'),

  estado: text('estado').notNull().default('BORRADOR'),

  // --- Total. Se recalcula desde las líneas (recalcularTotales), en SQL. ---
  /** Suma de los importes de las líneas QUE TIENEN coste. Las líneas sin coste
   *  NO suman 0: quedan fuera y marcan el pedido como incompleto. */
  total: numeric('total', { precision: 14, scale: 2 }).notNull().default('0'),
  /** false si alguna línea no tiene coste: el `total` es parcial, no el real. */
  costeCompleto: boolean('coste_completo').notNull().default(true),

  observaciones: text('observaciones'),

  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  creadoPor: text('creado_por'),
}, (t) => ({
  numeroIdx: index('pedidos_compra_numero_idx').on(t.numero),
  proveedorIdx: index('pedidos_compra_proveedor_idx').on(t.proveedorCodigo),
  fechaIdx: index('pedidos_compra_fecha_idx').on(t.fecha),
}))

/**
 * Línea de pedido de compra.
 *
 * `articulo_codigo` es opcional: se admite una línea de texto libre (portes,
 * concepto sin ficha), como en el original. `coste_unitario` NULL significa
 * "sin coste" (no valorada); entonces `importe` también es NULL.
 */
export const lineasPedidoCompra = pgTable('lineas_pedido_compra', {
  id: uuid('id').primaryKey().defaultRandom(),
  pedidoId: uuid('pedido_id').notNull().references(() => pedidosCompra.id, { onDelete: 'cascade' }),
  orden: integer('orden').notNull(),

  /** Artículo del catálogo. Null en líneas de concepto libre. */
  articuloCodigo: text('articulo_codigo').references(() => articulos.codigo),
  descripcion: text('descripcion').notNull(),
  /** Acabado, si aplica: condiciona qué coste de `articulos_coste` corresponde. */
  acabadoCodigo: text('acabado_codigo'),

  cantidad: numeric('cantidad', { precision: 10, scale: 2 }).notNull().default('1'),

  /** Coste unitario. Entrada del usuario. NULL = "sin coste" (no valorada). */
  costeUnitario: numeric('coste_unitario', { precision: 12, scale: 4 }),
  /** cantidad × coste_unitario, calculado en servidor. NULL si falta el coste. */
  importe: numeric('importe', { precision: 14, scale: 2 }),
}, (t) => ({
  pedidoIdx: index('lineas_pedido_compra_pedido_idx').on(t.pedidoId, t.orden),
}))
