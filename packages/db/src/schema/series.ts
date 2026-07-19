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
  /**
   * Tabla de acristalamiento para las hojas (TAcristalamiento). Da el
   * junquillo y las juntas según el grosor del vidrio. Ver anexo M.
   */
  tablaHojas: text('tabla_hojas'),
  /** Ídem para los fijos (aún sin explotar). */
  tablaFijos: text('tabla_fijos'),
}, (t) => ({
  serieIdx: index('conjuntos_serie_idx').on(t.serieCodigo),
}))

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
}, (t) => ({
  pk: primaryKey({ columns: [t.conjuntoCodigo, t.opcionCodigo] }),
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
