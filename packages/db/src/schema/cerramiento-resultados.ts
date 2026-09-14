import { sql } from 'drizzle-orm'
import { check, integer, jsonb, pgTable, uuid } from 'drizzle-orm/pg-core'
import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import { lineasCerramiento } from './lineas.ts'

/** Ausencia de fila = cerramiento anterior sin snapshot; nunca significa importe cero. */
export const lineasCerramientoResultados = pgTable('lineas_cerramiento_resultados', {
  lineaId: uuid('linea_id').primaryKey()
    .references(() => lineasCerramiento.lineaId, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  resultado: jsonb('resultado').$type<ResultadoCerramientoV1>().notNull(),
}, t => ({
  versionValida: check('cerramiento_resultado_version_check', sql`${t.version} = 1`),
  objetoValido: check('cerramiento_resultado_json_check', sql`
    jsonb_typeof(${t.resultado}) = 'object'
    AND ${t.resultado} ? 'version'
    AND jsonb_typeof(${t.resultado}->'version') = 'number'
    AND (${t.resultado}->>'version') IS NOT DISTINCT FROM ${t.version}::text`),
}))
