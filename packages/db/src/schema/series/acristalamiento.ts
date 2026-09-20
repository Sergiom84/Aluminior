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

import { sql } from 'drizzle-orm'
import {
  check,
  integer, numeric,
  pgTable,
  primaryKey, smallint,
  text
} from 'drizzle-orm/pg-core'

/**
 * Filas de las tablas de acristalamiento (TAcristalamientoLin):
 * para una tabla y un grosor de galce, qué junquillo y qué juntas van.
 *
 * Regla de selección validada contra el oráculo (anexo M): la fila con el
 * MENOR grosor >= TamJunqGoma del vidrio elegido. Artículos '0' o fuera del
 * catálogo (p. ej. el marcador V1000 de "sin junquillos") no generan pieza.
 */
export const tacrisFilas = pgTable('tacris_filas', {
  tabla: text('tabla').notNull(),
  posicion: text('posicion').notNull().default('*'),
  grosor: numeric('grosor', { precision: 8, scale: 2 }).notNull(),
  junquillo: text('junquillo'),
  juntaExterior: text('junta_exterior'),
  juntaInterior: text('junta_interior'),
}, (t) => ({
  pk: primaryKey({ columns: [t.tabla, t.posicion, t.grosor] }),
}))

/**
 * Ajuste de longitud del junquillo respecto a la medida del vidrio, por
 * serie. MEDIDO del histórico igual que el galce (anexo M):
 *
 *   junquillo vertical   = largo del vidrio + ajuste_largo   (típico −28)
 *   junquillo horizontal = ancho del vidrio + ajuste_ancho   (típico +12/+16)
 *
 * Sólo se emite con ≥3 muestras y ≥90% de consistencia en ambas dimensiones.
 */
export const junquilloAjustes = pgTable('junquillo_ajustes', {
  serieCodigo: text('serie_codigo').primaryKey(),
  ajusteLargoMm: numeric('ajuste_largo_mm', { precision: 8, scale: 2 }).notNull(),
  ajusteAnchoMm: numeric('ajuste_ancho_mm', { precision: 8, scale: 2 }).notNull(),
  muestras: integer('muestras').notNull(),
})

/**
 * Galce de vidrio para FIJOS: el vidrio de un fijo se descuenta del corte
 * del CERCO (no de una hoja). Medido del histórico igual que vidrio_galce
 * (anexo N): constante al 100% por (serie, perfil de cerco); mismo delta en
 * ambas dimensiones.
 */
export const vidrioGalceFijo = pgTable('vidrio_galce_fijo', {
  serieCodigo: text('serie_codigo').notNull(),
  /** Perfil de cerco del fijo (artículo real). */
  perfilCodigo: text('perfil_codigo').notNull(),
  deltaMm: numeric('delta_mm', { precision: 8, scale: 2 }).notNull(),
  muestras: integer('muestras').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.serieCodigo, t.perfilCodigo] }),
}))

/**
 * Descuento desde el mÃ³dulo geomÃ©trico hasta el vidrio para una pareja de
 * lÃ­mites fÃ­sicos. Los lÃ­mites son perfiles reales o marcadores de divisiÃ³n
 * invisible; perfilHoja es null en fijos y el perfil HV/HH en hojas.
 * SÃ³lo contiene reglas medidas con >=3 muestras y >=90% de consistencia.
 */
export const vidrioDescuentosAlojamiento = pgTable('vidrio_descuentos_alojamiento', {
  eje: text('eje').notNull(),
  limite1: text('limite_1').notNull(),
  limite2: text('limite_2').notNull(),
  perfilHoja: text('perfil_hoja').notNull().default(''),
  deltaMm: numeric('delta_mm', { precision: 8, scale: 2 }).notNull(),
  muestras: integer('muestras').notNull(),
  totalMuestras: integer('total_muestras').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.eje, t.limite1, t.limite2, t.perfilHoja] }),
}))

/**
 * Ajustes del junquillo de FIJOS, por serie. Distintos de los de hoja
 * (ELEGANTPVC: hoja −28/+16, fijo −50/0). El junquillo sale de TablaFijos.
 */
export const junquilloAjustesFijo = pgTable('junquillo_ajustes_fijo', {
  serieCodigo: text('serie_codigo').primaryKey(),
  ajusteLargoMm: numeric('ajuste_largo_mm', { precision: 8, scale: 2 }).notNull(),
  ajusteAnchoMm: numeric('ajuste_ancho_mm', { precision: 8, scale: 2 }).notNull(),
  muestras: integer('muestras').notNull(),
})

/**
 * Resolución componente -> artículo real, por conjunto.
 * Origen: ConjuntosLin (21.714 filas, 18.858 con artículo).
 *
 * `componente` es el `DisComponente` de la plantilla de despiece — NO el
 * código del artículo genérico (el anexo I los confundió; corregido en el
 * anexo J). Sufijos ".1"/".2" = variante de acristalamiento.
 */
/**
 * Descuento de galce del vidrio, por serie y perfil de hoja.
 *
 *   medida del vidrio = medida de corte de la hoja − delta
 *
 * MEDIDO del histórico real, no inventado: para cada (serie, perfil de hoja)
 * con emparejamiento inequívoco hoja-vidrio en los documentos, el delta es
 * constante al 100% (PLAN.md anexo L). Solo se emiten filas con ≥3 muestras
 * y ≥90% de consistencia; sin fila, el vidrio queda "sin calcular".
 *
 * Lo genera el ETL a partir de VPresupuestosLin + VDatosLinEstr.
 */
export const vidrioGalce = pgTable('vidrio_galce', {
  serieCodigo: text('serie_codigo').notNull(),
  /** Perfil de hoja (artículo real, ya resuelto por la serie). */
  perfilCodigo: text('perfil_codigo').notNull(),
  /** Descuento en mm que se resta a cada medida de corte de la hoja. */
  deltaMm: numeric('delta_mm', { precision: 8, scale: 2 }).notNull(),
  /** Nº de líneas reales de las que se midió. */
  muestras: integer('muestras').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.serieCodigo, t.perfilCodigo] }),
}))

/** Las 5 opciones de acristalamiento de un conjunto (Conjuntos.TablaHojas..5 / TablaFijos..5). */
export const conjuntoAcristalamientos = pgTable('conjunto_acristalamientos', {
  conjuntoCodigo: text('conjunto_codigo').notNull(),
  opcion: smallint('opcion').notNull(),
  tablaHojas: text('tabla_hojas'),
  tablaFijos: text('tabla_fijos'),
}, (t) => ({
  pk: primaryKey({ name: 'conjunto_acristalamientos_pk', columns: [t.conjuntoCodigo, t.opcion] }),
  opcionValida: check('conjunto_acristalamientos_opcion_check', sql`${t.opcion} BETWEEN 1 AND 5`),
}))

/** Descripción de cada tabla de junquillos (TAcristalamiento). */
export const tablasAcristalamiento = pgTable('tablas_acristalamiento', {
  codigo: text('codigo').primaryKey(),
  descripcion: text('descripcion').notNull().default(''),
})
