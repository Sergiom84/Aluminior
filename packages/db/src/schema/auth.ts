/**
 * Perfiles de empleados (módulo #1 de auth, PLAN.md anexo T.61).
 *
 * DÓNDE VIVE EL ROL. La identidad (email, contraseña, sesión) la gestiona
 * Supabase Auth en su esquema `auth`. Aquí, en `public`, guardamos SOLO el
 * dato de negocio que Supabase no conoce: el `rol`. Se enlaza 1:1 con
 * `auth.users(id)`.
 *
 * Por qué una tabla y no `user_metadata`: `user_metadata` es EDITABLE por el
 * propio usuario y no sirve para autorización (regla de seguridad de Supabase).
 * Hoy el rol NO se usa para permisos —login único, todos entran con acceso
 * total (decisión del titular)— pero se persiste aquí para poder usarlo el día
 * que haga falta sin depender de un claim manipulable ni de la frescura del JWT.
 *
 * La FK a `auth.users(id)` con ON DELETE CASCADE NO la emite drizzle-kit (no
 * gestionamos el esquema `auth`): se añade a mano en el SQL de la migración.
 */

import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const ROLES = ['admin', 'empleado'] as const
export type Rol = (typeof ROLES)[number]

export const perfiles = pgTable('perfiles', {
  /** Mismo id que `auth.users.id` (FK añadida en la migración). */
  id: uuid('id').primaryKey(),
  email: text('email'),
  /** Rol de negocio. Por defecto 'empleado'; NO se usa para gating todavía. */
  rol: text('rol').notNull().default('empleado'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
})
