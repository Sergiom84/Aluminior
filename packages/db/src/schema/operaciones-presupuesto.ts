import { pgTable, text, uuid, jsonb, timestamp, primaryKey } from 'drizzle-orm/pg-core'

// Recibos de operaciones confirmadas. Sin FK: borrar un documento no autoriza repetir su alta.
export const operacionesPresupuesto = pgTable('operaciones_presupuesto', {
  actor: text('actor').notNull(),
  clave: uuid('clave').notNull(),
  huella: text('huella').notNull(),
  resultado: jsonb('resultado').notNull(),
  creadaEn: timestamp('creada_en', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.actor, t.clave] })]).enableRLS()
