/**
 * Agenda del taller: trabajos del día y notas.
 *
 * `origen`, `externo_id` y `externo_calendario_id` no se usan todavía. Están
 * para poder importar el mismo evento de Google Calendar —el que muestra
 * Gmail— sin duplicarlo. No hay conexión ni credenciales aquí.
 */

import { sql } from 'drizzle-orm'
import {
  boolean, check, date, index, pgTable, smallint, text, timestamp, uniqueIndex, uuid,
} from 'drizzle-orm/pg-core'

export const ORIGENES_AGENDA = ['local', 'google'] as const
export type OrigenAgenda = (typeof ORIGENES_AGENDA)[number]

export const agendaEventos = pgTable('agenda_eventos', {
  id: uuid('id').primaryKey().defaultRandom(),
  titulo: text('titulo').notNull(),
  dia: date('dia').notNull(),
  horaInicio: text('hora_inicio').notNull(),
  horaFin: text('hora_fin').notNull(),
  observaciones: text('observaciones'),
  origen: text('origen').notNull().default('local'),
  externoId: text('externo_id'),
  externoCalendarioId: text('externo_calendario_id'),
  sincronizadoEn: timestamp('sincronizado_en', { withTimezone: true }),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  creadoPor: text('creado_por'),
}, (t) => ({
  diaIdx: index('agenda_eventos_dia_idx').on(t.dia),
  externoUq: uniqueIndex('agenda_eventos_externo_uq').on(t.origen, t.externoId)
    .where(sql`${t.externoId} is not null`),
  origenCheck: check('agenda_eventos_origen_check', sql`${t.origen} in ('local', 'google')`),
  tituloCheck: check('agenda_eventos_titulo_check', sql`char_length(btrim(${t.titulo})) between 1 and 200`),
  horasCheck: check(
    'agenda_eventos_horas_check',
    sql`${t.horaInicio} ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' and ${t.horaFin} ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' and ${t.horaFin} > ${t.horaInicio}`,
  ),
  observacionesCheck: check(
    'agenda_eventos_observaciones_check',
    sql`${t.observaciones} is null or char_length(${t.observaciones}) <= 4000`,
  ),
}))

export const agendaNotas = pgTable('agenda_notas', {
  id: uuid('id').primaryKey().defaultRandom(),
  texto: text('texto').notNull(),
  observaciones: text('observaciones'),
  /** 5 es lo más urgente; 1, lo menos. */
  urgencia: smallint('urgencia').notNull().default(3),
  hecha: boolean('hecha').notNull().default(false),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
  creadoPor: text('creado_por'),
}, (t) => ({
  ordenIdx: index('agenda_notas_orden_idx').on(t.hecha, t.urgencia),
  urgenciaCheck: check('agenda_notas_urgencia_check', sql`${t.urgencia} between 1 and 5`),
  textoCheck: check('agenda_notas_texto_check', sql`char_length(btrim(${t.texto})) between 1 and 4000`),
  observacionesCheck: check(
    'agenda_notas_observaciones_check',
    sql`${t.observaciones} is null or char_length(${t.observaciones}) <= 4000`,
  ),
}))
