/**
 * Series de perfiles y su sistema de resolución de genéricos.
 *
 * La plantilla de despiece de una estructura referencia RANURAS genéricas
 * (`DisComponente`): marco vertical, hoja, travesaño… La serie es la que
 * traduce cada ranura a un perfil real con precio. Mecanismo descubierto y
 * validado contra 1.657 líneas de documentos reales (96,5% de coincidencia
 * exacta con lo que eligió el sistema original). Ver PLAN.md anexo J.
 *
 * Cadena de resolución:
 *   serie -> cadena de conjuntos (la serie misma + delegados transitivos)
 *         -> conjunto_resoluciones[componente] -> artículo real
 *
 * Variantes de acristalamiento: componentes con sufijo ".1" (cristal
 * sencillo) / ".2" (doble cristal). El histórico de la empresa usa doble
 * cristal en el 100% de los casos.
 */

import {
  boolean, integer,
  pgTable,
  primaryKey,
  text
} from 'drizzle-orm/pg-core'

/**
 * Catálogo de opciones de herraje por conjunto.
 * Origen: ConjuntosOpcionesHerraje (11.854 filas).
 *
 * Una opción marcada activa las filas de ConjuntosAsoc con su nOpcion
 * (filtro validado contra el oráculo: anexo R — pierde solo un 0,2% de
 * cobertura). La valoración de asociados sigue cerrada; esto persiste la
 * ELECCIÓN para cuando la selección esté resuelta al completo.
 */
export const opcionesHerraje = pgTable('opciones_herraje', {
  conjuntoCodigo: text('conjunto_codigo').notNull(),
  opcionCodigo: text('opcion_codigo').notNull(),
  descripcion: text('descripcion').notNull().default(''),
  /** SelecDefSN: marcada por defecto al configurar. */
  porDefecto: boolean('por_defecto').notNull().default(false),
  /** OcultaSN: el original no la muestra al usuario. */
  oculta: boolean('oculta').notNull().default(false),
  categoria: text('categoria'),
  /** fOpcSoloActiva: fórmula `oN+oM` que debe cumplirse para poder marcarla. */
  activaSoloSi: text('activa_solo_si'),
  /** fOpcIncompatible: fórmula de opciones que la bloquean (simétrica en pantalla). */
  incompatible: text('incompatible'),
  /** DescrAutoSN: la opción entra en la descripción automática de la línea. */
  descripcionAuto: boolean('descripcion_auto').notNull().default(false),
}, (t) => ({
  pk: primaryKey({ columns: [t.conjuntoCodigo, t.opcionCodigo] }),
}))

/** Categorías de opciones por conjunto (ConjuntosCatOH). */
export const opcionesHerrajeCategorias = pgTable('opciones_herraje_categorias', {
  conjuntoCodigo: text('conjunto_codigo').notNull(),
  codigo: text('codigo').notNull(),
  descripcion: text('descripcion').notNull().default(''),
  excluyentes: boolean('excluyentes').notNull().default(false),
}, (t) => ({
  pk: primaryKey({ name: 'opciones_herraje_categorias_pk', columns: [t.conjuntoCodigo, t.codigo] }),
}))

/**
 * Juego de conjuntos de herraje que usa cada (serie, estructura), MEDIDO del
 * histórico (VOpcionesHerraje sobre presupuestos reales): cada línea usa
 * varios conjuntos a la vez (la serie + una tabla de herraje según la
 * apertura). La firma dominante es determinista en 70 de 80 combinaciones;
 * las excepciones son variantes de apertura elegidas por el usuario.
 * Solo se emiten reglas con ≥3 muestras y ≥90% de consistencia.
 */
export const herrajeConjuntos = pgTable('herraje_conjuntos', {
  serieCodigo: text('serie_codigo').notNull(),
  estructuraCodigo: text('estructura_codigo').notNull(),
  /** Códigos de conjunto de la firma dominante, orden alfabético, unidos por '+'. */
  conjuntos: text('conjuntos').notNull(),
  muestras: integer('muestras').notNull(),
  totalMuestras: integer('total_muestras').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.serieCodigo, t.estructuraCodigo] }),
}))
