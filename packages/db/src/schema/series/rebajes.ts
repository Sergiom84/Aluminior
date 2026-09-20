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
  integer, numeric,
  pgTable,
  primaryKey,
  text
} from 'drizzle-orm/pg-core'

/**
 * Rebaje de la pieza de perfil de HOJA respecto a la medida del hueco.
 *
 * La hoja encaja DENTRO del marco, así que su corte es menor que lo que da
 * la fórmula de la plantilla. Sin esto, el motor emitía la medida del hueco:
 * el anexo T midió que reproducía 0 de las 1.003 líneas con hoja del
 * histórico.
 *
 * La clave es (perfil real, eje, fórmula, serie) — medido en T.9/T.10. Ni la
 * serie sola ni el perfil solo bastan (15% de cobertura); con la fórmula sube
 * al 79,6% y con las cuatro al 93,0%, frente a un techo demostrado del 94,4%
 * (lo que falta no está en los datos que exporta el ERP).
 *
 * `muestras`/`totalMuestras` son obligatorias de mostrar, no informativas:
 * una regla con muestras < totalMuestras acierta *casi* siempre, y el anexo
 * T.13 midió que sus fallos no son milimétricos (el 79,3% se desvía más de
 * 10 mm). La valoración las usa para avisar. La futura hoja de corte de
 * Producción deberá exigir muestras = totalMuestras o confirmación manual.
 */
export const hojaRebajes = pgTable('hoja_rebajes', {
  /** Perfil REAL de la hoja, ya resuelto desde el genérico. */
  perfilCodigo: text('perfil_codigo').notNull(),
  /** Eje de la pieza: HV o HH. */
  eje: text('eje').notNull(),
  /** Fórmula de corte de la plantilla; distingue el papel de la pieza. */
  formula: text('formula').notNull(),
  serieCodigo: text('serie_codigo').notNull(),
  rebajeMm: numeric('rebaje_mm', { precision: 8, scale: 2 }).notNull(),
  muestras: integer('muestras').notNull(),
  totalMuestras: integer('total_muestras').notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.perfilCodigo, t.eje, t.formula, t.serieCodigo] }),
}))
