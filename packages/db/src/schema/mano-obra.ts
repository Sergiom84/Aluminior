/**
 * Mano de obra de una línea de presupuesto.
 *
 * Una fila = un concepto de mano de obra de una línea, con su snapshot
 * económico congelado. NO es una línea de artículo: Productor las materializa
 * como líneas `MO`/`MOCOL` porque su motor trabaja así, pero en Aluminior el
 * cerramiento ya vuelve como una sola línea `GRUPO` agregada.
 *
 * El contrato completo —por qué se congela el coste, por qué los motivos son
 * códigos y no frases, y por qué el precio defectuoso se conserva— está en
 * `SPEC-MANO-DE-OBRA.md`. La medición que lo respalda, en `PLAN.md` T.67.1.
 */

import {
  pgTable, text, smallint, numeric, boolean, uuid, timestamp, index, unique, check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { lineas } from './lineas.ts'

/** Conceptos vivos. `FABRICACION_BASE` entra cuando el recuento (T.31) cierre. */
export const CONCEPTOS_MANO_OBRA = ['FABRICACION_ADICIONAL', 'COLOCACION'] as const
export type ConceptoManoObra = (typeof CONCEPTOS_MANO_OBRA)[number]

export const ORIGENES_MANO_OBRA = ['MANUAL'] as const

/** Por qué no hay importe de venta. */
export const MOTIVOS_VENTA_MANO_OBRA = [
  'SIN_PVP', 'PVP_CERO', 'PVP_NEGATIVO', 'IMPORTE_FUERA_RANGO',
] as const

/** Por qué no hay coste. Independiente de la venta. */
export const MOTIVOS_COSTE_MANO_OBRA = [
  'SIN_COSTE', 'COSTE_AMBIGUO', 'COSTE_NEGATIVO', 'COSTE_FUERA_RANGO',
] as const

export const lineasManoObra = pgTable('lineas_mano_obra', {
  id: uuid('id').primaryKey().defaultRandom(),
  lineaId: uuid('linea_id').notNull().references(() => lineas.id, { onDelete: 'cascade' }),

  concepto: text('concepto').notNull(),
  origen: text('origen').notNull(),

  /** Lo que teclea el operador. `null` en lo calculado por el sistema. */
  horas: numeric('horas', { precision: 6, scale: 2 }),
  /** Lo que se valora. `horas × 60`, sin redondear a entero (T.67.1). */
  minutos: numeric('minutos', { precision: 10, scale: 2 }).notNull(),

  // --- Snapshot: qué se aplicó, y cuánto valía entonces ---
  articuloCodigo: text('articulo_codigo').notNull(),
  /** Congelada: el catálogo puede cambiar o perder el artículo. */
  articuloDescripcion: text('articulo_descripcion').notNull(),
  unidad: text('unidad').notNull().default('MINUTO'),
  acabadoCodigo: text('acabado_codigo'),
  tarifa: smallint('tarifa').notNull(),

  precioMinuto: numeric('precio_minuto', { precision: 12, scale: 4 }),
  importe: numeric('importe', { precision: 14, scale: 2 }),
  costeMinuto: numeric('coste_minuto', { precision: 12, scale: 4 }),
  costeTotal: numeric('coste_total', { precision: 14, scale: 2 }),

  valoracionCompleta: boolean('valoracion_completa').notNull(),
  motivoCodigo: text('motivo_codigo'),
  motivoCosteCodigo: text('motivo_coste_codigo'),

  /** Cuándo se intentó valorar. Se escribe también cuando no se pudo. */
  evaluadoEn: timestamp('evaluado_en', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  lineaIdx: index('mano_obra_linea_idx').on(t.lineaId),
  // Invariante de hoy: un concepto por línea. Relajarlo es borrar este índice,
  // sin conversión de datos ni pérdida.
  unicoPorLinea: unique('mano_obra_linea_concepto_uq').on(t.lineaId, t.concepto),

  // --- Valores admitidos. Cerrados a propósito: un concepto desconocido debe
  // ser un fallo de escritura, no una fila que nadie valora. ---
  conceptoValido: check('mano_obra_concepto_check',
    sql`${t.concepto} IN ('FABRICACION_ADICIONAL', 'COLOCACION')`),
  origenValido: check('mano_obra_origen_check', sql`${t.origen} IN ('MANUAL')`),
  motivoValido: check('mano_obra_motivo_check',
    sql`${t.motivoCodigo} IS NULL OR ${t.motivoCodigo} IN ('SIN_PVP', 'PVP_CERO', 'PVP_NEGATIVO', 'IMPORTE_FUERA_RANGO')`),
  motivoCosteValido: check('mano_obra_motivo_coste_check',
    sql`${t.motivoCosteCodigo} IS NULL OR ${t.motivoCosteCodigo} IN ('SIN_COSTE', 'COSTE_AMBIGUO', 'COSTE_NEGATIVO', 'COSTE_FUERA_RANGO')`),

  // --- Coherencia de la duración. Un concepto sin horas no genera fila. ---
  manualConHoras: check('mano_obra_manual_horas_check',
    sql`${t.origen} <> 'MANUAL' OR ${t.horas} IS NOT NULL`),
  horasPositivas: check('mano_obra_horas_check', sql`${t.horas} IS NULL OR ${t.horas} > 0`),
  minutosPositivos: check('mano_obra_minutos_check', sql`${t.minutos} > 0`),
  conversionCoherente: check('mano_obra_conversion_check',
    sql`${t.horas} IS NULL OR ${t.minutos} = ROUND(${t.horas} * 60, 2)`),

  // --- Rangos. Un valor negativo del catálogo es corrupción, y se CONSERVA
  // como evidencia: la única forma de guardarlo es con su código, que lo
  // declara. Sin esa puerta, la aplicación tendría que elegir entre perder el
  // dato o estrellarse contra PostgreSQL al escribir. Los importes calculados
  // sí son estrictamente no negativos: cuando el factor es negativo, no hay
  // importe, hay motivo.
  //
  // `mano_obra_precio_check` es hoy LÓGICAMENTE REDUNDANTE: un precio negativo
  // obliga a valoración incompleta, la incompleta obliga a motivo, y cada motivo
  // ya fija el signo del precio. No añade ningún estado observable y ninguna
  // prueba puede señalarlo en solitario —eliminarlo no rompe la suite—.
  //
  // Decisión: SE CONSERVA, como defensa en profundidad y por simetría con el de
  // coste, que sí es necesario: sin motivo de coste, ningún CHECK por código
  // opina sobre el signo, y ese hueco existió de verdad. Dejar uno y quitar el
  // otro invitaría al siguiente lector a creer que el precio está protegido por
  // el mismo mecanismo, cuando lo protege el estado de venta. ---
  //
  // `IS NOT DISTINCT FROM` y no `=`: con el motivo a `NULL`, `= 'X'` da `NULL`,
  // y un CHECK que evalúa a `NULL` SE CUMPLE. Escrito con `=`, esta restricción
  // dejaría pasar justo la fila que debe impedir: coste por minuto negativo sin
  // ningún código que lo declare.
  precioNoNegativo: check('mano_obra_precio_check',
    sql`${t.precioMinuto} IS NULL OR ${t.precioMinuto} >= 0
        OR ${t.motivoCodigo} IS NOT DISTINCT FROM 'PVP_NEGATIVO'`),
  importeNoNegativo: check('mano_obra_importe_check',
    sql`${t.importe} IS NULL OR ${t.importe} >= 0`),
  costeMinutoNoNegativo: check('mano_obra_coste_minuto_check',
    sql`${t.costeMinuto} IS NULL OR ${t.costeMinuto} >= 0
        OR ${t.motivoCosteCodigo} IS NOT DISTINCT FROM 'COSTE_NEGATIVO'`),
  costeTotalNoNegativo: check('mano_obra_coste_total_check',
    sql`${t.costeTotal} IS NULL OR ${t.costeTotal} >= 0`),

  // --- Estado de VENTA, bidireccional. El precio queda libre en la rama
  // incompleta: puede ser null, cero o positivo, y el código dice cuál. ---
  estadoVenta: check('mano_obra_venta_check', sql`
    (${t.valoracionCompleta} AND ${t.precioMinuto} IS NOT NULL AND ${t.precioMinuto} > 0
       AND ${t.importe} IS NOT NULL AND ${t.motivoCodigo} IS NULL)
    OR
    (NOT ${t.valoracionCompleta} AND ${t.importe} IS NULL AND ${t.motivoCodigo} IS NOT NULL)`),

  // --- Cada código exige el precio que le corresponde. Impide falsear la
  // evidencia del catálogo defectuoso desde la aplicación. ---
  sinPvpSinPrecio: check('mano_obra_sin_pvp_check',
    sql`${t.motivoCodigo} <> 'SIN_PVP' OR ${t.precioMinuto} IS NULL`),
  pvpCeroConCero: check('mano_obra_pvp_cero_check',
    sql`${t.motivoCodigo} <> 'PVP_CERO' OR ${t.precioMinuto} = 0`),
  fueraRangoConPrecio: check('mano_obra_fuera_rango_check',
    sql`${t.motivoCodigo} <> 'IMPORTE_FUERA_RANGO'
        OR (${t.precioMinuto} IS NOT NULL AND ${t.precioMinuto} > 0)`),
  pvpNegativoConNegativo: check('mano_obra_pvp_negativo_check',
    sql`${t.motivoCodigo} <> 'PVP_NEGATIVO'
        OR (${t.precioMinuto} IS NOT NULL AND ${t.precioMinuto} < 0)`),

  // --- Estado de COSTE, independiente de la venta ---
  estadoCoste: check('mano_obra_coste_check', sql`
    (${t.costeTotal} IS NOT NULL AND ${t.costeMinuto} IS NOT NULL AND ${t.motivoCosteCodigo} IS NULL)
    OR
    (${t.costeTotal} IS NULL AND ${t.motivoCosteCodigo} IS NOT NULL)`),

  // --- Cada código de coste exige el coste que le corresponde, igual que en la
  // venta. Sin esto, `SIN_COSTE` podría guardar un coste por minuto y
  // `COSTE_AMBIGUO` el coste que se dijo no haber elegido: evidencia que se
  // contradice a sí misma, y que ninguna consulta posterior podría creer. ---
  sinCosteSinCoste: check('mano_obra_sin_coste_check',
    sql`${t.motivoCosteCodigo} <> 'SIN_COSTE' OR ${t.costeMinuto} IS NULL`),
  ambiguoSinCoste: check('mano_obra_coste_ambiguo_check',
    sql`${t.motivoCosteCodigo} <> 'COSTE_AMBIGUO' OR ${t.costeMinuto} IS NULL`),
  costeFueraRangoConCoste: check('mano_obra_coste_fuera_rango_check',
    sql`${t.motivoCosteCodigo} <> 'COSTE_FUERA_RANGO'
        OR (${t.costeMinuto} IS NOT NULL AND ${t.costeMinuto} > 0)`),
  costeNegativoConNegativo: check('mano_obra_coste_negativo_check',
    sql`${t.motivoCosteCodigo} <> 'COSTE_NEGATIVO'
        OR (${t.costeMinuto} IS NOT NULL AND ${t.costeMinuto} < 0)`),
}))
