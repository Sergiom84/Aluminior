/**
 * Plantillas de despiece: cómo se descompone cada estructura en materiales.
 *
 * Origen: `EstructurasArticulos` (27.952 filas, 132 columnas). Esa tabla
 * mezcla DOS cosas que aquí se separan:
 *
 *   15.263 filas SIN documento -> plantillas de catálogo (esto)
 *   12.689 filas CON documento -> despieces ya calculados de presupuestos,
 *                                 albaranes y facturas. Son el oráculo contra
 *                                 el que validar el motor; se modelarán aparte.
 *
 * Cubre 519 estructuras. El 96% de las plantillas llevan fórmula de largo.
 */

import {
  pgTable, text, integer, numeric, uuid, index, boolean, primaryKey,
} from 'drizzle-orm/pg-core'
import { estructuras } from './catalogo.ts'

/**
 * Cotas simbólicas de la estructura: el origen de las variables del despiece.
 *
 * Origen: `EstructurasDiseño`, columnas `Simbolo` y `Cota`.
 *
 * Cada estructura define cotas con nombre (FI, FS, FD, FZ, TR, ZO…) y un valor
 * por defecto. Las fórmulas de despiece las referencian por ese símbolo.
 * Ejemplo real: estructura `1+2`, símbolo `TR`, cota 600, "travesaño".
 *
 * Aportando estas cotas, la cobertura del despiece pasa del 84% al 99,6%
 * (14.658 de 14.724 componentes). Ver PLAN.md anexo G.
 *
 * El valor es el POR DEFECTO: al configurar una línea el usuario puede
 * cambiarlo, y ahí es donde el hueco toma su forma concreta.
 */
export const estructuraCotas = pgTable('estructura_cotas', {
  id: uuid('id').primaryKey().defaultRandom(),

  estructuraCodigo: text('estructura_codigo')
    .notNull()
    .references(() => estructuras.codigo, { onDelete: 'cascade' }),

  /** Identificador usado en las fórmulas: FI, FS, FD, TR… */
  simbolo: text('simbolo').notNull(),
  /** Valor por defecto en milímetros. */
  valorPorDefecto: numeric('valor_por_defecto', { precision: 10, scale: 2 }),

  /** Descripción legible del original: "travesaño", "fijo inferior"… */
  nombre: text('nombre'),
  /** V = vertical, H = horizontal. Orientación de la cota. */
  orientacion: text('orientacion'),
  ordenTravesano: integer('orden_travesano'),
}, (t) => ({
  estructuraIdx: index('cotas_estructura_idx').on(t.estructuraCodigo),
  simboloIdx: index('cotas_simbolo_idx').on(t.simbolo),
}))

/**
 * Tipo de corte, en la notación ASCII del sistema original:
 *   !!  ambos extremos rectos (90°)
 *   /\  ambos a inglete (45°)
 *   !\  uno recto y otro a inglete
 * Los símbolos dibujan literalmente el corte. Correlacionan con los ángulos.
 */
export const TIPOS_CORTE = ['!!', '/\\', '!\\', '\\!'] as const

/**
 * Ãrbol geomÃ©trico de cada estructura (EstructurasDiseÃ±o): marco, huecos,
 * hojas, vidrios y travesaÃ±os. Permite reconstruir quÃ© perfiles delimitan
 * cada ranura de vidrio sin inferirlo del cÃ³digo de estructura.
 */
export const estructuraDisenoNodos = pgTable('estructura_diseno_nodos', {
  estructuraCodigo: text('estructura_codigo').notNull()
    .references(() => estructuras.codigo, { onDelete: 'cascade' }),
  idItem: integer('id_item').notNull(),
  tipo: integer('tipo').notNull(),
  contenidoEn: integer('contenido_en'),
  idTravesano: integer('id_travesano'),
  posicionHueco: integer('posicion_hueco'),
  tipoTravesano: text('tipo_travesano'),
  invisible: boolean('invisible').notNull().default(false),
}, (t) => ({
  pk: primaryKey({ columns: [t.estructuraCodigo, t.idItem] }),
  estructuraIdx: index('nodos_diseno_estructura_idx').on(t.estructuraCodigo),
}))

/**
 * Función de la pieza dentro del conjunto. Vocabulario observado en los datos:
 *   MV / MH        marco vertical / horizontal
 *   HV / HH        hoja vertical / horizontal
 *   TM             travesaño
 *   infHAesc, infMOmof, infHH…  piezas inferiores y auxiliares
 * No es un catálogo cerrado: hay 110 valores distintos.
 */
export const estructuraComponentes = pgTable('estructura_componentes', {
  id: uuid('id').primaryKey().defaultRandom(),

  estructuraCodigo: text('estructura_codigo')
    .notNull()
    .references(() => estructuras.codigo, { onDelete: 'cascade' }),

  /** Identificador de línea en el sistema original, para trazabilidad. */
  lineaOrigen: integer('linea_origen'),

  /** Artículo consumido: perfil, herraje, accesorio… */
  articuloCodigo: text('articulo_codigo').notNull(),

  cantidad: numeric('cantidad', { precision: 10, scale: 3 }),
  cantidadCorte: numeric('cantidad_corte', { precision: 10, scale: 3 }),

  /**
   * Fórmulas evaluadas por el motor de despiece con las medidas del hueco.
   * Ejemplos reales: "L", "A", "(A)/2", "L-FS-FI", "L+CAJ+2*30,00".
   * Se guardan como texto: son expresiones, no valores.
   * Evaluador en packages/core/src/despiece/formula.ts
   */
  formulaLargo: text('formula_largo'),
  formulaLargoCorte: text('formula_largo_corte'),
  formulaRefLargo: text('formula_ref_largo'),
  /** Fórmulas de la segunda dimensión (piezas de superficie: cristal, panel). */
  formulaAncho: text('formula_ancho'),
  formulaAnchoCorte: text('formula_ancho_corte'),

  tipoCorte: text('tipo_corte'),
  anguloIzquierdo: numeric('angulo_izquierdo', { precision: 8, scale: 4 }),
  anguloDerecho: numeric('angulo_derecho', { precision: 8, scale: 4 }),

  /** L = largo, A = alto, H = ambos. Orientación de trabajo de la pieza. */
  posicionTrabajo: text('posicion_trabajo'),
  funcion: text('funcion'),

  /** Rango de medidas en que aplica este componente (condicionalidad). */
  medidaMinima: numeric('medida_minima', { precision: 10, scale: 2 }),
  medidaMaxima: numeric('medida_maxima', { precision: 10, scale: 2 }),

  /** Agrupación de diseño heredada, útil para ordenar la presentación. */
  grupoDisenyo: text('grupo_disenyo'),
  componenteDisenyo: text('componente_disenyo'),
  /** Nodo de EstructurasDiseÃ±o al que pertenece la pieza (DisIdIt). */
  idItemDisenyo: integer('id_item_disenyo'),
  tipoHojaDisenyo: integer('tipo_hoja_disenyo'),
  idHojaDisenyo: integer('id_hoja_disenyo'),
}, (t) => ({
  estructuraIdx: index('componentes_estructura_idx').on(t.estructuraCodigo),
  articuloIdx: index('componentes_articulo_idx').on(t.articuloCodigo),
}))
