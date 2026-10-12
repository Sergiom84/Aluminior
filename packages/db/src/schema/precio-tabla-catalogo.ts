/** PVP por dimensiones; separado de ArticulosPrecioTabla, que contiene costes. */
import { boolean, integer, numeric, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'

export const articulosPrecioTablaPvp = pgTable('articulos_precio_tabla_pvp', {
  articuloCodigo: text('articulo_codigo').notNull(),
  acabadoCodigo: text('acabado_codigo').notNull(),
  tarifa: integer('tarifa').notNull(),
  anchoMm: numeric('ancho_mm', { precision: 10, scale: 3 }).notNull(),
  largoMm: numeric('largo_mm', { precision: 10, scale: 3 }).notNull(),
  precio: numeric('precio', { precision: 12, scale: 4 }).notNull(),
  acabadoDependiente: boolean('acabado_dependiente'),
}, t => ({ pk: primaryKey({ columns: [t.articuloCodigo, t.acabadoCodigo, t.tarifa, t.anchoMm, t.largoMm] }) })).enableRLS()
