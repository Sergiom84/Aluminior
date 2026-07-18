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
  pgTable, text, integer, numeric, boolean, uuid, index, primaryKey,
} from 'drizzle-orm/pg-core'
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
  precioUnitario: numeric('precio_unitario', { precision: 12, scale: 4 }).notNull().default('0'),
  descuento: numeric('descuento', { precision: 5, scale: 2 }).notNull().default('0'),
  descuento2: numeric('descuento_2', { precision: 5, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 14, scale: 2 }).notNull().default('0'),

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
}))
