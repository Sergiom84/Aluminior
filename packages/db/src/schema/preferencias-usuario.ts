import { sql } from 'drizzle-orm'
import { check, jsonb, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/** Preferencias y valores por defecto exclusivos de cada usuario autenticado. */
export const preferenciasUsuario = pgTable('preferencias_usuario', {
  usuarioClave: text('usuario_clave').primaryKey(),
  precioHoraColocacion: numeric('precio_hora_colocacion', { precision: 10, scale: 2 })
    .notNull()
    .default('30.00'),
  ajustes: jsonb('ajustes').$type<Record<string, unknown>>().notNull().default({}),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  precioColocacionPositivo: check(
    'preferencias_usuario_precio_colocacion_check',
    sql`${t.precioHoraColocacion} > 0`,
  ),
})).enableRLS()
