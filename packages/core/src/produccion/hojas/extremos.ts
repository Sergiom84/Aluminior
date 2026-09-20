import { validarParametrosCorte, type ParametrosCorte } from './parametros.ts'

/** Tipo de corte de UN extremo. `desconocido` no se rellena por defecto. */
export type TipoExtremo = 'recto' | 'inglete' | 'desconocido'

export interface ExtremoCorte {
  tipo: TipoExtremo
  /** Grosor de disco aplicable a ese extremo. null si el tipo es desconocido. */
  grosorDiscoMm: number | null
  /**
   * Notación gráfica del documento: `|` recto, `/` inglete a la izquierda,
   * `\` inglete a la derecha (columna `I - D` de la hoja de producción).
   */
  simbolo: string
  /** Por qué el tipo es el que es, o por qué no se pudo determinar. */
  motivo: string
}

export interface ExtremosCorte {
  izquierdo: ExtremoCorte
  derecho: ExtremoCorte
}

/** Lado de la pieza. El símbolo del inglete cambia de sentido según el lado. */
type Lado = 'izquierdo' | 'derecho'

/**
 * Tipos de corte del catálogo (`TIPOS_CORTE` en `db/schema/despiece.ts`).
 * Los símbolos dibujan literalmente el corte, izquierda primero.
 */
const TIPOS_CORTE: Record<string, [TipoExtremo, TipoExtremo]> = {
  '!!': ['recto', 'recto'],
  '/\\': ['inglete', 'inglete'],
  '!\\': ['recto', 'inglete'],
  '\\!': ['inglete', 'recto'],
}

function extremo(
  tipo: TipoExtremo,
  lado: Lado,
  parametros: ParametrosCorte,
  motivo: string,
): ExtremoCorte {
  const simbolo = tipo === 'recto'
    ? '|'
    : tipo === 'inglete'
      ? (lado === 'izquierdo' ? '/' : '\\')
      : '?'
  const grosorDiscoMm = tipo === 'recto'
    ? parametros.discoRectoMm
    : tipo === 'inglete'
      ? parametros.discoIngleteMm
      : null
  return { tipo, grosorDiscoMm, simbolo, motivo }
}

/**
 * Resuelve los dos extremos de una pieza a partir de su tipo de corte.
 *
 * Si no hay tipo de corte se recurre a los ángulos, que según `ENTREGA.md`
 * §4.4 correlacionan con el símbolo (90° recto, 45° inglete). Cualquier otro
 * ángulo NO se interpreta: sale como desconocido con su motivo, igual que
 * `optimizar.ts` hace con los cortes imposibles. Un extremo mal supuesto es
 * material perdido en la sierra.
 */
export function extremosDeCorte(
  pieza: {
    tipoCorte?: string | null
    anguloIzquierdo?: number | null
    anguloDerecho?: number | null
  },
  parametros: ParametrosCorte,
): ExtremosCorte {
  validarParametrosCorte(parametros)

  const clave = (pieza.tipoCorte ?? '').trim()
  const porTipo = TIPOS_CORTE[clave]
  if (porTipo) {
    const motivo = `tipo de corte "${clave}"`
    return {
      izquierdo: extremo(porTipo[0], 'izquierdo', parametros, motivo),
      derecho: extremo(porTipo[1], 'derecho', parametros, motivo),
    }
  }

  const faltaTipo = clave === ''
    ? 'sin tipo de corte'
    : `tipo de corte "${clave}" no reconocido`

  return {
    izquierdo: porAngulo(pieza.anguloIzquierdo ?? null, 'izquierdo', parametros, faltaTipo),
    derecho: porAngulo(pieza.anguloDerecho ?? null, 'derecho', parametros, faltaTipo),
  }
}

function porAngulo(
  angulo: number | null,
  lado: Lado,
  parametros: ParametrosCorte,
  faltaTipo: string,
): ExtremoCorte {
  if (angulo === null || !Number.isFinite(angulo)) {
    return extremo('desconocido', lado, parametros, `${faltaTipo} y sin ángulo`)
  }
  if (angulo === 90) return extremo('recto', lado, parametros, `${faltaTipo}; ángulo 90°`)
  if (angulo === 45) return extremo('inglete', lado, parametros, `${faltaTipo}; ángulo 45°`)
  return extremo('desconocido', lado, parametros, `${faltaTipo}; ángulo ${angulo}° no es 90° ni 45°`)
}
