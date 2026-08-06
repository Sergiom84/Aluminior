/**
 * Vocabulario común de los DOS documentos de producción (G2).
 *
 * La hoja de corte y la hoja de producción son documentos distintos, no dos
 * vistas del mismo (evidencia del vídeo de Gaia, 24:10–27:45). Lo único que
 * comparten es lo que hay aquí: la identificación del documento, los
 * parámetros físicos de la sierra y el vocabulario de corte y orientación.
 * Cada hoja vive en su propio módulo y ninguna es superconjunto de la otra.
 *
 * Aquí no hay E/S ni maquetación: funciones puras sobre datos ya calculados.
 */

/** Cabecera mínima común: `Presupuesto: 000011-1` más cliente y obra. */
export interface ReferenciaDocumento {
  /** Número del presupuesto tal como se imprime (`000011`). */
  numero: string
  /** Revisión del documento. Productor la imprime pegada al número. */
  revision: number
  clienteCodigo?: string | null
  clienteNombre?: string | null
  obra?: string | null
}

/** `000011-1`, la forma en que ambos documentos citan el presupuesto. */
export function etiquetaDocumento(doc: ReferenciaDocumento): string {
  return `${doc.numero}-${doc.revision}`
}

/**
 * Parámetros físicos del corte. Son ENTRADA EXPLÍCITA del ensamblado, nunca
 * constantes enterradas en el cálculo: dependen de la sierra y de la práctica
 * de cada taller, y el operador los cambia en pantalla.
 */
export interface ParametrosCorte {
  /** mm que se sanean de la punta inicial de la barra antes del primer corte. */
  saneamientoInicialMm: number
  /** mm que se sanean de la punta final. */
  saneamientoFinalMm: number
  /** Grosor del disco cuando el extremo va a inglete. */
  discoIngleteMm: number
  /** Grosor del disco cuando el extremo va a corte recto. */
  discoRectoMm: number
}

/**
 * Valores observados en el ejemplo del vídeo (24:50): saneamiento de punta
 * inicial 30 mm, final 30 mm, disco 7 mm en inglete y 5 mm en corte recto.
 *
 * ⚠️ Son los del taller de ESE vídeo, no una verdad universal ni un dato del
 * catálogo. Se exponen como punto de partida visible y editable, igual que
 * `LONGITUD_BARRA_POR_DEFECTO_MM` en `optimizar.ts`. Ningún cálculo los usa
 * por su cuenta: hay que pasarlos.
 */
export const PARAMETROS_CORTE_VIDEO: ParametrosCorte = {
  saneamientoInicialMm: 30,
  saneamientoFinalMm: 30,
  discoIngleteMm: 7,
  discoRectoMm: 5,
}

export function validarParametrosCorte(p: ParametrosCorte): void {
  const campos: [keyof ParametrosCorte, number][] = [
    ['saneamientoInicialMm', p.saneamientoInicialMm],
    ['saneamientoFinalMm', p.saneamientoFinalMm],
    ['discoIngleteMm', p.discoIngleteMm],
    ['discoRectoMm', p.discoRectoMm],
  ]
  for (const [nombre, valor] of campos) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error(`${nombre} debe ser un número ≥ 0, recibido: ${valor}`)
    }
  }
}

/**
 * Longitud realmente utilizable de una barra tras sanear las dos puntas.
 *
 * No es una regla inventada: es la definición del saneamiento de punta. Se
 * ofrece como helper para que quien llame al optimizador decida si optimiza
 * sobre la barra bruta o sobre la aprovechable; el ensamblado de la hoja no lo
 * decide por él.
 */
export function longitudAprovechableMm(
  longitudBarraMm: number,
  parametros: ParametrosCorte,
): number {
  validarParametrosCorte(parametros)
  if (!Number.isFinite(longitudBarraMm) || longitudBarraMm <= 0) {
    throw new Error(`longitudBarraMm debe ser un número positivo, recibido: ${longitudBarraMm}`)
  }
  return redondearMm(
    longitudBarraMm - parametros.saneamientoInicialMm - parametros.saneamientoFinalMm,
  )
}

/** Redondeo a la milésima de mm, como en `optimizar.ts`, contra el ruido binario. */
export function redondearMm(mm: number): number {
  return Math.round(mm * 1000) / 1000
}

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

/**
 * Orientación del palo. Es DATO, no color: Productor pinta en granate los
 * horizontales y en negro los verticales, pero el color es decisión de la
 * vista y aquí no aparece.
 */
export type Orientacion = 'horizontal' | 'vertical' | 'desconocida'

export interface OrientacionResuelta {
  orientacion: Orientacion
  motivo: string
}

/**
 * Vocabulario de función medido en los datos (`db/schema/despiece.ts`):
 * MV/MH marco vertical/horizontal, HV/HH hoja vertical/horizontal.
 *
 * Es una allowlist a propósito. Hay 110 valores distintos de `funcion` y
 * deducir la orientación de la última letra clasificaría mal cosas como
 * `infHAesc`. Un travesaño (`TM`) puede ir en cualquier sentido: sin más dato,
 * es desconocido. Quien conozca la geometría puede pasar la orientación
 * explícita y entonces manda esa.
 */
const ORIENTACION_POR_FUNCION: Record<string, Orientacion> = {
  MH: 'horizontal',
  HH: 'horizontal',
  MV: 'vertical',
  HV: 'vertical',
}

export function orientacionDePalo(pieza: {
  funcion?: string | null
  orientacion?: Orientacion | null
}): OrientacionResuelta {
  if (pieza.orientacion === 'horizontal' || pieza.orientacion === 'vertical') {
    return { orientacion: pieza.orientacion, motivo: 'orientación aportada por el origen' }
  }
  const funcion = (pieza.funcion ?? '').trim()
  const conocida = ORIENTACION_POR_FUNCION[funcion]
  if (conocida) return { orientacion: conocida, motivo: `función "${funcion}"` }
  return {
    orientacion: 'desconocida',
    motivo: funcion === ''
      ? 'sin función ni orientación explícita'
      : `la función "${funcion}" no determina la orientación`,
  }
}

/**
 * Identificación mostrable de una estructura.
 *
 * Una estructura sin `Referencia (Tipo)` NO se omite: se identifica por su
 * índice dentro del documento. El vídeo señala que en Productor esas
 * estructuras salen sin identificar; aquí eso se corrige, porque un palo que
 * no se sabe de dónde sale es un palo que se corta dos veces.
 */
export function identificarEstructura(referencia: string | null | undefined, indice: number): string {
  const ref = (referencia ?? '').trim()
  return ref !== '' ? ref : `estructura ${indice}`
}
