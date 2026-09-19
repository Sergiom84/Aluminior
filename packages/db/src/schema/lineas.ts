/**
 * Líneas de presupuesto — el núcleo del dominio.
 *
 * Origen: VPresupuestosLin (468.838 filas, 147 columnas) y sus tablas satélite.
 *
 * Una línea es de uno de TRES tipos (confirmado en la pantalla "Edición de Línea",
 * ver PLAN.md anexo C.2):
 *   ESTRUCTURA  - elemento configurado a partir de una estructura de serie
 *   ARTICULO    - producto simple de catálogo
 *   CERRAMIENTO - conjunto acristalado completo
 *
 * En el original todo esto vivía en una única tabla de 147 columnas, donde la
 * mayoría sólo aplican a un tipo. Aquí se separa: la línea guarda lo común, y
 * la configuración de estructura va en su propia tabla.
 */

import {
  pgTable, text, integer, smallint, numeric, boolean, uuid, index, primaryKey, jsonb, check, unique,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { presupuestos } from './comercial.ts'
import { articulos } from './catalogo.ts'

export const TIPOS_LINEA = ['ESTRUCTURA', 'ARTICULO', 'CERRAMIENTO'] as const
export type TipoLinea = (typeof TIPOS_LINEA)[number]

export const lineas = pgTable('lineas', {
  id: uuid('id').primaryKey().defaultRandom(),
  presupuestoId: uuid('presupuesto_id').notNull().references(() => presupuestos.id, { onDelete: 'cascade' }),
  orden: integer('orden').notNull(),

  tipo: text('tipo').notNull(),

  /** Sólo en tipo ARTICULO. */
  articuloCodigo: text('articulo_codigo').references(() => articulos.codigo),

  /** Descripción mostrada. Se autogenera salvo que se marque manual. */
  descripcion: text('descripcion').notNull(),
  descripcionManual: boolean('descripcion_manual').notNull().default(false),

  /** Ubicación en la obra: SALON, BAÑO, COCINA… (campo "Referencia (Tipo)"). */
  referencia: text('referencia'),

  cantidad: numeric('cantidad', { precision: 10, scale: 2 }).notNull().default('1'),

  // --- Dimensiones en milímetros ---
  anchoMm: integer('ancho_mm'),
  altoMm: integer('alto_mm'),
  /**
   * true  = las medidas son del HUECO de obra (la carpintería se calcula descontando)
   * false = las medidas son de la carpintería acabada
   * Distinción crítica: cambia el despiece resultante.
   */
  medidaEsHueco: boolean('medida_es_hueco').notNull().default(false),

  // --- Precio ---
  /** null significa que la línea no está valorada por completo. */
  precioUnitario: numeric('precio_unitario', { precision: 12, scale: 4 }),
  descuento: numeric('descuento', { precision: 5, scale: 2 }).notNull().default('0'),
  descuento2: numeric('descuento_2', { precision: 5, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 14, scale: 2 }),
  /** False cuando falta cualquier parte del cálculo (perfil, vidrio, tarifa…). */
  valoracionCompleta: boolean('valoracion_completa').notNull().default(true),
  /** Explicación persistida para que el aviso sobreviva a una recarga. */
  avisoValoracion: text('aviso_valoracion'),

  /** Anulaciones manuales: el usuario fuerza el valor calculado. */
  pvpManual: boolean('pvp_manual').notNull().default(false),
  costeManual: numeric('coste_manual', { precision: 12, scale: 4 }),
}, (t) => ({
  presupuestoIdx: index('lineas_presupuesto_idx').on(t.presupuestoId, t.orden),
  tipoIdx: index('lineas_tipo_idx').on(t.tipo),
}))

/**
 * Configuración de una línea de tipo ESTRUCTURA.
 *
 * Cadena de dependencias (PLAN.md anexo C.5): la serie de perfiles es
 * prerrequisito de todo lo demás — la aplicación original avisa
 * "Indique Serie primero" si falta.
 */
export const lineasEstructura = pgTable('lineas_estructura', {
  lineaId: uuid('linea_id').primaryKey().references(() => lineas.id, { onDelete: 'cascade' }),

  /** Serie de perfiles. Prerrequisito de todo el cálculo. */
  serieCodigo: text('serie_codigo').notNull(),
  /** Código compositivo: 1+1, 1O+2F+1O, F2PF… Ver PLAN.md anexo C.3. */
  estructuraCodigo: text('estructura_codigo').notNull(),

  acabadoCodigo: text('acabado_codigo'),
  tonalidadCodigo: text('tonalidad_codigo'),
  accesoriosAcabado: text('accesorios_acabado'),
  accesoriosTonalidad: text('accesorios_tonalidad'),
  maderaCodigo: text('madera_codigo'),

  // --- Complementos (persiana y remates) ---
  compacto: text('compacto'),
  guiaIzquierda: text('guia_izquierda'),
  guiaDerecha: text('guia_derecha'),
  tapajuntas: text('tapajuntas'),
  registro: text('registro'),
  premarco: text('premarco'),
  condensacion: text('condensacion'),
  alturaMm: integer('altura_mm'),

  // --- Mano de obra adicional, en horas ---
  horasFabricacion: numeric('horas_fabricacion', { precision: 8, scale: 2 }).notNull().default('0'),
  horasColocacion: numeric('horas_colocacion', { precision: 8, scale: 2 }).notNull().default('0'),

  /** Radio 1..5 de la pestaña Acristalamiento (tabla de junquillos del conjunto). */
  opcionAcristalamiento: smallint('opcion_acristalamiento').notNull().default(1),
}, (t) => ({
  opcionAcristalamientoValida: check('lineas_estructura_opcion_acris_check',
    sql`${t.opcionAcristalamiento} BETWEEN 1 AND 5`),
}))

/**
 * Cargos adicionales de una línea (pestaña `Cargos Adic.`, origen VCargosAd).
 * Importes nulos significan sin valorar; nunca se sustituyen por cero.
 */
export const lineasCargos = pgTable('lineas_cargos', {
  id: uuid('id').primaryKey().defaultRandom(),
  lineaId: uuid('linea_id').notNull().references(() => lineas.id, { onDelete: 'cascade' }),
  orden: integer('orden').notNull(),
  articuloCodigo: text('articulo_codigo').notNull().references(() => articulos.codigo),
  descripcion: text('descripcion'),
  acabadoCodigo: text('acabado_codigo'),
  tonalidadCodigo: text('tonalidad_codigo'),
  cantidad: numeric('cantidad', { precision: 10, scale: 3 }).notNull().default('0'),
  anchoMm: numeric('ancho_mm', { precision: 10, scale: 2 }),
  largoMm: numeric('largo_mm', { precision: 10, scale: 2 }),
  tipoMetraje: text('tipo_metraje').notNull(),
  metraje: numeric('metraje', { precision: 12, scale: 3 }),
  precio: numeric('precio', { precision: 12, scale: 4 }),
  total: numeric('total', { precision: 14, scale: 2 }),
  respetarPrecio: boolean('respetar_precio').notNull().default(false),
  costeManual: numeric('coste_manual', { precision: 12, scale: 4 }),
  observaciones: text('observaciones'),
}, (t) => ({
  ordenUnico: unique('lineas_cargos_orden_uq').on(t.lineaId, t.orden),
  cantidadValida: check('lineas_cargos_cantidad_check', sql`${t.cantidad} >= 0`),
  lineaIdx: index('lineas_cargos_linea_idx').on(t.lineaId),
}))

/**
 * Entrada editable de una línea GRUPO/CERRAMIENTO.
 *
 * La configuración es un snapshot versionado, validado en servidor antes de
 * guardarse. El despiece sigue siendo una salida separada en lineas_despiece.
 */
export const lineasCerramiento = pgTable('lineas_cerramiento', {
  lineaId: uuid('linea_id').primaryKey()
    .references(() => lineas.id, { onDelete: 'cascade' }),
  version: integer('version').notNull().default(1),
  configuracion: jsonb('configuracion').$type<Record<string, unknown>>().notNull(),
  serieCodigo: text('serie_codigo'),
  vidrioCodigo: text('vidrio_codigo'),
  acabadoCodigo: text('acabado_codigo'),
  varianteAcristalamiento: text('variante_acristalamiento').notNull().default('2'),
  ajusteFabricacion: numeric('ajuste_fabricacion', { precision: 12, scale: 2 })
    .notNull().default('0'),
  ajusteColocacion: numeric('ajuste_colocacion', { precision: 12, scale: 2 })
    .notNull().default('0'),
})

/**
 * Opciones de herraje seleccionadas.
 * Origen: VOpcionesHerraje (25.335 filas) + ConfigSeriesHerraje.
 */
export const lineasOpcionesHerraje = pgTable('lineas_opciones_herraje', {
  lineaId: uuid('linea_id').notNull().references(() => lineas.id, { onDelete: 'cascade' }),
  categoria: text('categoria').notNull(),
  opcionCodigo: text('opcion_codigo').notNull(),
  descripcion: text('descripcion'),
}, (t) => ({
  pk: primaryKey({ columns: [t.lineaId, t.categoria, t.opcionCodigo] }),
}))

/**
 * Acristalamiento. Hasta 5 slots por línea, cada uno con vidrio distinto
 * para hojas y para fijos (ver PLAN.md anexo C.4).
 */
export const lineasAcristalamiento = pgTable('lineas_acristalamiento', {
  lineaId: uuid('linea_id').notNull().references(() => lineas.id, { onDelete: 'cascade' }),
  slot: integer('slot').notNull(),
  vidrioHojas: text('vidrio_hojas'),
  vidrioFijos: text('vidrio_fijos'),
  /** Variante de perfiles dependientes del vidrio: 1=sencillo, 2=doble. */
  variante: text('variante').notNull().default('2'),
}, (t) => ({
  pk: primaryKey({ columns: [t.lineaId, t.slot] }),
}))

/**
 * Resultado del despiece: qué artículos y con qué cortes salen de esta línea.
 * Es la SALIDA del motor, no una entrada del usuario.
 * Se persiste para trazabilidad y para poder contrastar contra el histórico.
 */
export const lineasDespiece = pgTable('lineas_despiece', {
  id: uuid('id').primaryKey().defaultRandom(),
  lineaId: uuid('linea_id').notNull().references(() => lineas.id, { onDelete: 'cascade' }),

  /** Null conjunto en filas anteriores: no se inventa su módulo de origen. */
  origenTipo: text('origen_tipo'),
  origenId: text('origen_id'),
  origenOrdinal: integer('origen_ordinal'),

  articuloCodigo: text('articulo_codigo').notNull(),
  acabadoCodigo: text('acabado_codigo'),

  cantidad: numeric('cantidad', { precision: 10, scale: 3 }).notNull(),
  /** Longitud de corte en mm (perfiles) o superficie (vidrio). */
  largoCorteMm: numeric('largo_corte_mm', { precision: 10, scale: 2 }),
  anchoCorteMm: numeric('ancho_corte_mm', { precision: 10, scale: 2 }),

  /** Ángulos de corte en grados. 23.197 líneas del histórico los tienen. */
  anguloIzquierdo: numeric('angulo_izquierdo', { precision: 6, scale: 2 }),
  anguloDerecho: numeric('angulo_derecho', { precision: 6, scale: 2 }),

  /** Función de la pieza en el conjunto (marco, hoja, travesaño, junquillo…). */
  funcion: text('funcion'),
  posicionTrabajo: text('posicion_trabajo'),

  costeUnitario: numeric('coste_unitario', { precision: 12, scale: 4 }),
  costeTotal: numeric('coste_total', { precision: 12, scale: 4 }),
}, (t) => ({
  lineaIdx: index('despiece_linea_idx').on(t.lineaId),
  articuloIdx: index('despiece_articulo_idx').on(t.articuloCodigo),
  origenUnico: unique('despiece_origen_uq')
    .on(t.lineaId, t.origenTipo, t.origenId, t.origenOrdinal),
  origenValido: check('despiece_origen_check', sql`
    (${t.origenTipo} IS NULL AND ${t.origenId} IS NULL AND ${t.origenOrdinal} IS NULL)
    OR (${t.origenTipo} IS NOT NULL AND ${t.origenId} IS NOT NULL AND ${t.origenOrdinal} IS NOT NULL
      AND ${t.origenTipo} IN ('MODULO', 'UNION') AND length(trim(${t.origenId})) > 0
      AND ${t.origenOrdinal} >= 0)`),
}))
