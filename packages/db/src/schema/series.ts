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
  pgTable, text, boolean, integer, numeric, index, primaryKey,
} from 'drizzle-orm/pg-core'

/**
 * Series configuradas en la empresa (57 en EMP0016).
 * Origen: ConfigSeries (columna Serie; la fila '*' es la configuración
 * por defecto y se excluye).
 */
export const series = pgTable('series', {
  codigo: text('codigo').primaryKey(),
  /** true si es una serie de PVC; false = aluminio. */
  esPvc: boolean('es_pvc').notNull().default(false),
})

/**
 * Conjuntos: agrupaciones de resolución. Cada serie ES un conjunto
 * (coincidencia 57/57), y además existen conjuntos auxiliares (herrajes por
 * tipo de apertura, subseries…) a los que la serie delega.
 * Origen: Conjuntos (columnas Codigo y CodSerie).
 */
export const conjuntos = pgTable('conjuntos', {
  codigo: text('codigo').primaryKey(),
  /** Serie a la que pertenece el conjunto, si consta. */
  serieCodigo: text('serie_codigo'),
}, (t) => ({
  serieIdx: index('conjuntos_serie_idx').on(t.serieCodigo),
}))

/**
 * Delegaciones entre conjuntos: el registro de un conjunto en el original
 * apunta a otros conjuntos mediante ~74 columnas (SubSerieDe, herr1HA,
 * herr2HA, TablaHojas…). La cadena de resolución de una serie es el cierre
 * transitivo de estas delegaciones.
 *
 * Se guarda el campo de origen para trazabilidad: los herr* dependen del
 * tipo de apertura, y los TablaHojas/TablaFijos apuntan a tablas de
 * acristalamiento (sin filas de resolución de perfiles; inofensivos en la
 * expansión).
 */
export const conjuntoDelegaciones = pgTable('conjunto_delegaciones', {
  conjuntoCodigo: text('conjunto_codigo').notNull(),
  delegadoCodigo: text('delegado_codigo').notNull(),
  /** Columna del original de la que sale la delegación: SubSerieDe, herr1HA… */
  campo: text('campo').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.conjuntoCodigo, t.delegadoCodigo, t.campo] }),
  conjuntoIdx: index('delegaciones_conjunto_idx').on(t.conjuntoCodigo),
}))

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

export const conjuntoResoluciones = pgTable('conjunto_resoluciones', {
  conjuntoCodigo: text('conjunto_codigo').notNull(),
  componente: text('componente').notNull(),
  /** Familia del componente en el original (001 perfiles, 050 vidrios…). */
  familia: text('familia').notNull().default(''),
  articuloCodigo: text('articulo_codigo').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.conjuntoCodigo, t.componente, t.familia] }),
  conjuntoIdx: index('resoluciones_conjunto_idx').on(t.conjuntoCodigo),
  articuloIdx: index('resoluciones_articulo_idx').on(t.articuloCodigo),
}))
