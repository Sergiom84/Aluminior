import { z } from 'zod'

/**
 * Validación de entrada del alta de línea.
 *
 * Rango Y escala de cada número se validan contra la columna que lo va a
 * guardar. PostgreSQL redondea en silencio lo que sobra de escala: `0,001` en
 * `numeric(10,2)` se convierte en `0,00`, y una cantidad tecleada acabaría
 * siendo cero. Aquí eso es un error de campo, no un redondeo invisible.
 *
 * Los topes son TÉCNICOS, no comerciales. Investigación pendiente sobre el
 * rango real de negocio y la unidad de los ajustes: PLAN.md, anexo T.67.
 */

/** `numeric(12,2)` de los ajustes manuales del cerramiento. */
export const MAXIMO_NUMERIC_12_2 = 9_999_999_999.99
/** `numeric(10,2)` de `lineas.cantidad`. */
export const MAXIMO_NUMERIC_10_2 = 99_999_999.99
/** `integer` de `lineas.ancho_mm` y `alto_mm`. */
export const MAXIMO_INT4 = 2_147_483_647
/** Escala de las tres columnas numéricas que teclea el operador. */
export const DECIMALES = 2

/** Dígitos con punto decimal. Sin signo, sin exponente, sin separador de miles. */
const FORMA_DECIMAL = /^\d+(\.\d+)?$/

interface OpcionesDecimal {
  maximo: number
  /** Valor cuando el campo llega vacío. */
  porDefecto: number
  /** true = debe ser mayor que cero; false = admite cero. */
  mayorQueCero?: boolean
}

/**
 * Número tecleado por el operador, validado como TEXTO antes de convertirlo.
 *
 * Contar decimales sobre el texto evita el falso negativo de comprobar
 * múltiplos de 0,01 en coma flotante: `1.15 % 0.01` no es 0 en IEEE-754.
 *
 * La coma decimal se rechaza en vez de traducirse: `1,500` es 1,5 para quien
 * usa coma decimal y 1500 para quien usa coma de millar, y adivinar cuál de
 * los dos es cambiaría el importe del presupuesto. Los campos son
 * `input type="number"`, que siempre envía punto.
 */
function decimalTecleado(etiqueta: string, opciones: OpcionesDecimal) {
  return z.preprocess(
    (valor) => {
      const texto = valor === undefined || valor === null ? '' : String(valor).trim()
      return texto === '' ? String(opciones.porDefecto) : texto
    },
    z.string()
      .superRefine((texto, ctx) => {
        const error = (message: string) =>
          ctx.addIssue({ code: 'custom', message: `${etiqueta}: ${message}` })
        if (texto.startsWith('-')) return error('no admite negativos')
        if (texto.includes(',')) return error('usa punto decimal')
        if (!FORMA_DECIMAL.test(texto)) return error('indica un número')
        const decimales = texto.split('.')[1]?.length ?? 0
        if (decimales > DECIMALES) return error(`máximo ${DECIMALES} decimales`)
        const numero = Number(texto)
        if (opciones.mayorQueCero && numero <= 0) return error('debe ser mayor que cero')
        if (numero > opciones.maximo) return error('fuera de rango')
      })
      .transform(Number),
  )
}

/**
 * Los ajustes no admiten negativos.
 *
 * Respaldo: el CHECK `lineas_cerramiento_ajustes_check` de la migración 0017 lo
 * exige, y en Productor el campo equivalente son horas ADICIONALES de
 * fabricación y colocación (ENTREGA.md, pestaña Estructura), que se suman. Un
 * ajuste a la baja no va por aquí: los descuentos tienen sus propias columnas
 * (`lineas.descuento`, `descuento_2`).
 */
const ajusteManual = (etiqueta: string) =>
  decimalTecleado(etiqueta, { maximo: MAXIMO_NUMERIC_12_2, porDefecto: 0 })

export const esquemaLinea = z.object({
  presupuestoId: z.string().uuid(),
  tipo: z.enum(['ARTICULO', 'ESTRUCTURA', 'CERRAMIENTO']),
  codigo: z.string().trim().min(1, 'Elige un artículo o una estructura'),
  referencia: z.string().trim().max(60).optional().transform((v) => v || null),
  /** Serie de perfiles. Prerrequisito del tipo ESTRUCTURA: sin ella no hay
   * artículos reales, y sin artículos reales no hay precio. */
  serieCodigo: z.string().trim().optional().transform((v) => v || null),
  /** Vidrio del acristalamiento (familia 050, facturable por m²). Opcional:
   * sin él, el cristal queda "sin valorar". */
  vidrioCodigo: z.string().trim().optional().transform((v) => v || null),
  varianteAcristalamiento: z.enum(['1', '2']).default('2'),
  /** Unidades del documento. Es el `Cdad` del original, distinto del `Metraje`
   * (la cantidad facturable en ML o m², que calcula el sistema). Se acepta la
   * escala de la columna; si el flujo debe admitir o no fracciones de unidad,
   * ver anexo T.67. */
  cantidad: decimalTecleado('Cantidad', {
    maximo: MAXIMO_NUMERIC_10_2, porDefecto: 1, mayorQueCero: true,
  }),
  anchoMm: z.coerce.number().int().min(0).max(MAXIMO_INT4).optional(),
  altoMm: z.coerce.number().int().min(0).max(MAXIMO_INT4).optional(),
  acabadoCodigo: z.string().trim().optional().transform((v) => v || null),
  configuracionCerramiento: z.string().trim().optional().transform((v) => v || null),
  ajusteFabricacion: ajusteManual('Fabricación'),
  ajusteColocacion: ajusteManual('Colocación'),
})

export type EntradaLinea = z.infer<typeof esquemaLinea>
