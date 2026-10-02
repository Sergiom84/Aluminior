/**
 * Catálogo de despiece completo de Productor (fase-7/06).
 *
 * Metadatos de catálogo, nunca documentos: plantilla con grupos de extremo,
 * asociaciones de conjuntos, grupos de asociación, tipos de hoja, conceptos de
 * mano de obra, incrementos de precio y parámetros de serie. Los descuentos
 * (`conjunto_descuentos_corte`) y las tablas de acristalamiento (`tacris_filas`)
 * ya existen y se reutilizan.
 */

import { boolean, index, integer, jsonb, numeric, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { estructuras } from './catalogo.ts'

/** Filas de `EstructurasArticulos` con `TipoDoc` vacío, con todos sus enlaces de diseño. */
export const estructuraPlantillaCatalogo = pgTable('estructura_plantilla_catalogo', {
  estructuraCodigo: text('estructura_codigo').notNull().references(() => estructuras.codigo, { onDelete: 'cascade' }),
  lineaOrigen: integer('linea_origen').notNull(),
  /** `id` de diseño; 0 en estructuras estándar y accesorios de diseño. */
  idPieza: integer('id_pieza').notNull(),
  articulo: text('articulo').notNull(),
  componente: text('componente'),
  funcion: text('funcion'),
  cantidad: numeric('cantidad', { precision: 12, scale: 4 }).notNull(),
  posicionTrabajo: text('posicion_trabajo'),
  tipoHoja: text('tipo_hoja'),
  mano: text('mano'),
  hoja: integer('hoja').notNull().default(0),
  /** `DisVidrio`: módulo de mano de obra en las filas `infMOmof`. */
  disVidrio: text('dis_vidrio'),
  referenciaLargo: integer('referencia_largo'),
  referenciaAncho: integer('referencia_ancho'),
  formulaLargo: text('formula_largo'),
  formulaAncho: text('formula_ancho'),
  formulaReferenciaLargo: text('formula_referencia_largo'),
  formulaReferenciaAncho: text('formula_referencia_ancho'),
  grupo: text('grupo'),
  grupoIzquierdo: text('grupo_izquierdo'),
  grupoDerecho: text('grupo_derecho'),
  grupoSuperior: text('grupo_superior'),
  grupoInferior: text('grupo_inferior'),
  /** `DisGrupoAdicional`, `DisGrupoAd2`, `DisGrupoAd3`, `DisGrupoAdIndep`. */
  gruposAdicionales: text('grupos_adicionales').array().notNull(),
  perfilAdicional: integer('perfil_adicional'),
}, t => ({ pk: primaryKey({ columns: [t.estructuraCodigo, t.lineaOrigen] }) }))

/** `ConjuntosAsoc`: asociaciones generadas por serie y por código de herraje. */
export const conjuntoAsociaciones = pgTable('conjunto_asociaciones', {
  id: text('id').primaryKey(),
  conjuntoCodigo: text('conjunto_codigo').notNull(),
  articulo: text('articulo').notNull(),
  cantidad: numeric('cantidad', { precision: 12, scale: 4 }).notNull(),
  acabado: text('acabado').notNull(),
  intervalo: numeric('intervalo', { precision: 12, scale: 4 }).notNull(),
  medidaMin: numeric('medida_min', { precision: 12, scale: 4 }).notNull(),
  medidaMax: numeric('medida_max', { precision: 12, scale: 4 }).notNull(),
  unidadesMin: numeric('unidades_min', { precision: 12, scale: 4 }).notNull(),
  unidadesMax: numeric('unidades_max', { precision: 12, scale: 4 }).notNull(),
  tipoMedida: text('tipo_medida').notNull(),
  descuento: numeric('descuento', { precision: 12, scale: 4 }).notNull(),
  formulaLargo: text('formula_largo'),
  formulaAncho: text('formula_ancho'),
  soloUna: boolean('solo_una').notNull(),
  componente: text('componente').notNull(),
  grupo: text('grupo').notNull(),
  grupoAsociacion: text('grupo_asociacion'),
  modulos: text('modulos'),
  articuloPrincipal: text('articulo_principal'),
  opcion: text('opcion'),
  formulaOpcion: text('formula_opcion'),
  apertura: integer('apertura').notNull(),
  mano: text('mano'),
  posicionTrabajo: text('posicion_trabajo'),
  asociadoA: text('asociado_a').notNull(),
  /** Rasgos sin contrastar presentes en la fila: bloquean si la regla aplica. */
  noContrastado: text('no_contrastado').array().notNull(),
}, t => ({ conjuntoIdx: index('conjunto_asociaciones_conjunto_idx').on(t.conjuntoCodigo) }))

/** `FamiliasGruposAsoc`: componentes de cada grupo de asociación. */
export const gruposAsociacion = pgTable('grupos_asociacion', {
  familia: text('familia').notNull(),
  codigo: text('codigo').notNull(),
  componentes: text('componentes').array().notNull(),
  descripcion: text('descripcion').notNull().default(''),
}, t => ({ pk: primaryKey({ columns: [t.familia, t.codigo] }) }))

/** `SeriesAsocV2TiposHoja`: id de `DisTipoHoja` y su nombre (t2HC…). */
export const tiposHojaCatalogo = pgTable('tipos_hoja_catalogo', {
  id: text('id').primaryKey(),
  tipo: text('tipo').notNull(),
  descripcion: text('descripcion').notNull().default(''),
})

/** `MOConceptos`: tiempos de fabricación por módulo, artículo o apertura. */
export const manoObraConceptos = pgTable('mano_obra_conceptos', {
  codigo: text('codigo').primaryKey(),
  descripcion: text('descripcion').notNull().default(''),
  minutos: numeric('minutos', { precision: 12, scale: 4 }).notNull(),
  articulo: text('articulo').notNull(),
  modulo: text('modulo'),
  articuloAsociado: text('articulo_asociado'),
  componenteAsociado: text('componente_asociado'),
  grupoAsociado: text('grupo_asociado'),
  conIncrementos: boolean('con_incrementos').notNull(),
})

/** `ArticulosIncrPrecio`: porcentaje por metraje (MET) o lado mayor (MED). */
export const articulosIncrementosPrecio = pgTable('articulos_incrementos_precio', {
  id: integer('id').primaryKey(),
  articuloCodigo: text('articulo_codigo').notNull(),
  tipo: text('tipo').notNull(),
  desde: numeric('desde', { precision: 14, scale: 4 }).notNull(),
  hasta: numeric('hasta', { precision: 14, scale: 4 }).notNull(),
  porcentaje: numeric('porcentaje', { precision: 10, scale: 4 }).notNull(),
}, t => ({ articuloIdx: index('articulos_incrementos_precio_articulo_idx').on(t.articuloCodigo) }))

/** Datos de artículo que usa el despiece y que `articulos` no conserva. */
export const articulosDespiece = pgTable('articulos_despiece', {
  articuloCodigo: text('articulo_codigo').primaryKey(),
  componente: text('componente'),
  generico: boolean('generico').notNull(),
  dobleAcristalamiento: boolean('doble_acristalamiento').notNull(),
  grosorAcristalar: numeric('grosor_acristalar', { precision: 10, scale: 3 }).notNull(),
  incrementosPrecio: boolean('incrementos_precio').notNull(),
})

/** Parámetros de serie de `Conjuntos`: códigos de herraje y de mano de obra y rangos de grosor. */
export const conjuntoParametrosDespiece = pgTable('conjunto_parametros_despiece', {
  conjuntoCodigo: text('conjunto_codigo').primaryKey(),
  herrajes: jsonb('herrajes').$type<Record<string, string>>().notNull(),
  manoObra: jsonb('mano_obra').$type<Record<string, string>>().notNull(),
  grosorMaximoSimple: numeric('grosor_maximo_simple', { precision: 10, scale: 3 }).notNull(),
  grosorMaximoDoble: numeric('grosor_maximo_doble', { precision: 10, scale: 3 }).notNull(),
})

/**
 * Filas de `ConjuntosLin` con artículo `0`: la serie declara la ranura vacía.
 * No es lo mismo que una ranura sin fila (sin resolver); `conjunto_resoluciones`
 * las excluye por diseño y el motor de catálogo las necesita.
 */
export const conjuntoRanurasVacias = pgTable('conjunto_ranuras_vacias', {
  conjuntoCodigo: text('conjunto_codigo').notNull(),
  componente: text('componente').notNull(),
}, t => ({ pk: primaryKey({ columns: [t.conjuntoCodigo, t.componente] }) }))
