/**
 * Catálogo: artículos, familias, acabados, tonalidades y tarifas.
 *
 * Origen: EMP0016 (ALUMINIOS LARA). El esquema Access tenía 237 columnas en
 * `Articulos`; el perfilado de las 17.547 filas reales dejó 64 con datos, y de
 * esas se descartan las que sólo tienen un valor distinto (constantes).
 * Ver esquema/perfil/Articulos.csv para el detalle.
 */

import {
  pgTable, text, integer, numeric, boolean, timestamp, index, primaryKey,
} from 'drizzle-orm/pg-core'

/** Familias de artículo. Origen: Familias (32 filas). */
export const familias = pgTable('familias', {
  codigo: text('codigo').primaryKey(),
  descripcion: text('descripcion').notNull(),
  /** Agrupación superior usada por el configurador (003 ventanas, 004 puertas…). */
  grupo: text('grupo'),
})

/** Subfamilias. Origen: ArticulosSubFam (relación N:M artículo–familia–subfamilia). */
export const subfamilias = pgTable('subfamilias', {
  codigo: text('codigo').primaryKey(),
  familiaCodigo: text('familia_codigo').references(() => familias.codigo),
  descripcion: text('descripcion').notNull(),
})

/**
 * Unidad de medida del artículo.
 * ML = metro lineal (perfiles), UD = unidad (herrajes), M2 = metro cuadrado (vidrio).
 * Determina cómo se calcula la cantidad en el despiece.
 */
export const TIPOS_METRAJE = ['ML', 'UD', 'M2'] as const
export type TipoMetraje = (typeof TIPOS_METRAJE)[number]

/** Artículos. Origen: Articulos (17.547 filas). */
export const articulos = pgTable('articulos', {
  codigo: text('codigo').primaryKey(),
  descripcion: text('descripcion').notNull(),

  familiaCodigo: text('familia_codigo').references(() => familias.codigo),
  subfamiliaCodigo: text('subfamilia_codigo'),

  /** ML | UD | M2 — validado en la capa de dominio, no por enum de Postgres. */
  tipoMetraje: text('tipo_metraje').notNull().default('UD'),

  // --- Medidas y consumo (usados por el motor de despiece) ---
  /** Metraje mínimo facturable aunque el corte sea menor. */
  metrajeMinimo: numeric('metraje_minimo', { precision: 10, scale: 3 }),
  /** El consumo se redondea a múltiplos de estos valores. */
  metrajeMultiploLargo: numeric('metraje_multiplo_largo', { precision: 10, scale: 3 }),
  metrajeMultiploAncho: numeric('metraje_multiplo_ancho', { precision: 10, scale: 3 }),
  /** Peso por metro lineal — para albaranes y transporte. */
  pesoMl: numeric('peso_ml', { precision: 10, scale: 3 }),

  // --- Acristalamiento ---
  grosorPesoVidrio: numeric('grosor_peso_vidrio', { precision: 10, scale: 2 }),
  /** Tamaño de junquillo/goma: condiciona qué vidrios admite el perfil. */
  tamJunquilloGoma: text('tam_junquillo_goma'),

  // --- Doble acristalamiento (DA*) ---
  daGrosor: numeric('da_grosor', { precision: 10, scale: 2 }),
  daVidrio1: text('da_vidrio_1'),
  daVidrio2: text('da_vidrio_2'),
  daCamara1: text('da_camara_1'),
  daArticuloBase: text('da_articulo_base'),

  // --- Comportamiento ---
  apareceEnHojaDespiece: boolean('aparece_en_hoja_despiece').notNull().default(true),
  apareceEnHojaCorte: boolean('aparece_en_hoja_corte').notNull().default(true),
  controlaStock: boolean('controla_stock').notNull().default(false),

  proveedorHabitual: text('proveedor_habitual'),

  activo: boolean('activo').notNull().default(true),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  familiaIdx: index('articulos_familia_idx').on(t.familiaCodigo),
  descripcionIdx: index('articulos_descripcion_idx').on(t.descripcion),
}))

/** Acabados (lacado, anodizado, imitación madera…). Origen: Acabados (18 filas). */
export const acabados = pgTable('acabados', {
  codigo: text('codigo').primaryKey(),
  descripcion: text('descripcion').notNull(),
  /** Un acabado admite varias tonalidades (ej. RAL). */
  admiteTonalidad: boolean('admite_tonalidad').notNull().default(false),
})

/** Tonalidades por acabado. Origen: AcaTonalidades. */
export const tonalidades = pgTable('tonalidades', {
  acabadoCodigo: text('acabado_codigo').notNull().references(() => acabados.codigo),
  codigo: text('codigo').notNull(),
  descripcion: text('descripcion').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.acabadoCodigo, t.codigo] }),
}))

/**
 * Precio de venta por artículo, acabado y tarifa.
 * Origen: ArticulosPVP (83.367 filas) — clave compuesta Articulo|Acabado|Tarifa.
 */
export const articulosPvp = pgTable('articulos_pvp', {
  articuloCodigo: text('articulo_codigo').notNull().references(() => articulos.codigo),
  acabadoCodigo: text('acabado_codigo').notNull(),
  tarifa: integer('tarifa').notNull(),
  precio: numeric('precio', { precision: 12, scale: 4 }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.articuloCodigo, t.acabadoCodigo, t.tarifa] }),
}))

/**
 * Registro de tarifas (T.57). Una fila por `tarifa` de `articulos_pvp`:
 * procedencia y vigencia del precio. Persiste la `fecha_vigencia` que el cargador
 * (T.56) validaba y tiraba. Las históricas 1/2/3 no requieren fila; el cargador
 * inserta la fila de la tarifa nueva en el mismo --apply que carga los precios.
 */
export const tarifas = pgTable('tarifas', {
  /** = el `tarifa` (int) de articulos_pvp. */
  id: integer('id').primaryKey(),
  descripcion: text('descripcion').notNull(),
  proveedor: text('proveedor'),
  fechaVigencia: timestamp('fecha_vigencia', { withTimezone: true, mode: 'string' }),
  fechaCarga: timestamp('fecha_carga', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  activa: boolean('activa').notNull().default(true),
})

/**
 * Catálogo de estructuras (tipos de hueco configurables).
 * Origen: Estructuras (541 filas).
 *
 * `codigo` es un identificador OPACO: no se parsea para deducir composición.
 * Ver PLAN.md anexo E — se intentó y produce errores graves.
 * La geometría real vive en `EstructurasDiseño` (pendiente de modelar).
 */
export const estructuras = pgTable('estructuras', {
  codigo: text('codigo').primaryKey(),
  descripcion: text('descripcion').notNull(),
  /** 001 correderas · 003 ventanas · 004 puertas · 010 arcos · 113 mamparas. */
  familia: text('familia'),
  observaciones: text('observaciones'),
  /** true si es un accesorio de unión, no un hueco completo. */
  esAccesorio: boolean('es_accesorio').notNull().default(false),
  fabricaStock: boolean('fabrica_stock').notNull().default(false),
}, (t) => ({
  familiaIdx: index('estructuras_familia_idx').on(t.familia),
  descripcionIdx: index('estructuras_descripcion_idx').on(t.descripcion),
}))

/**
 * Precio de coste por artículo, proveedor y acabado.
 * Origen: ArticulosCoste (24.716 filas en EMP0009).
 */
export const articulosCoste = pgTable('articulos_coste', {
  articuloCodigo: text('articulo_codigo').notNull().references(() => articulos.codigo),
  proveedorCodigo: text('proveedor_codigo').notNull(),
  acabadoCodigo: text('acabado_codigo').notNull(),
  coste: numeric('coste', { precision: 12, scale: 4 }).notNull(),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }),
}, (t) => ({
  pk: primaryKey({ columns: [t.articuloCodigo, t.proveedorCodigo, t.acabadoCodigo] }),
}))
