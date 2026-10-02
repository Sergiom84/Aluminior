import { integer, numeric, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { estructuras } from './catalogo.ts'

/** Metadatos originales de catálogo, nunca cortes de documentos. */
export const estructuraReferenciasCorte = pgTable('estructura_referencias_corte', {
  estructuraCodigo: text('estructura_codigo').notNull().references(() => estructuras.codigo, { onDelete: 'cascade' }),
  lineaOrigen: integer('linea_origen').notNull(),
  idPieza: integer('id_pieza').notNull(),
  idReferencia: integer('id_referencia'),
  formula: text('formula'),
  formulaReferencia: text('formula_referencia'),
  grupo: text('grupo'),
  grupoInicio: text('grupo_inicio'),
  grupoFin: text('grupo_fin'),
  tipoHoja: integer('tipo_hoja'),
  perfilAdicional: integer('perfil_adicional'),
  grupoAdicional: text('grupo_adicional'),
}, t => ({ pk: primaryKey({ columns: [t.estructuraCodigo, t.lineaOrigen] }) })).enableRLS()

/** Milímetros por extremo. El cero explícito es distinto de una fila ausente. */
export const conjuntoDescuentosCorte = pgTable('conjunto_descuentos_corte', {
  conjuntoCodigo: text('conjunto_codigo').notNull(),
  familia: text('familia').notNull(),
  grupoPrincipal: text('grupo_principal').notNull(),
  grupo: text('grupo').notNull(),
  tipoHoja: text('tipo_hoja').notNull(),
  descuentoMm: numeric('descuento_mm', { precision: 16, scale: 8 }).notNull(),
}, t => ({ pk: primaryKey({ columns: [t.conjuntoCodigo, t.familia, t.grupoPrincipal, t.grupo, t.tipoHoja] }) })).enableRLS()
