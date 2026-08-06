/**
 * Mapa de sustitución origen -> destino de la copia de presupuesto.
 *
 * Evidencia (EVIDENCIA-VIDEO-PRESUPUESTO.md §8, 19:36–22:22): la pestaña
 * «Modificaciones Diseño» del diálogo de copia de Productor tiene tres pares
 * `Cambiar Serie -> por Serie`, tres pares `Cambiar Vidrio -> por Vidrio`,
 * `Acab. Acces. -> por Acab.` y `Acab. Madera -> por Acab.`. La columna
 * izquierda es lo que hay en el origen y la derecha lo que se quiere.
 *
 * La regla que manda es literal del vídeo: **lo que se deja vacío se
 * conserva**. Un destino en blanco NUNCA borra el código de la línea. Por eso
 * este módulo no admite «destino nulo»: un par sin destino simplemente no es
 * una sustitución y se descarta diciendo por qué.
 */

/** Los cuatro ámbitos sustituibles del diálogo observado. */
export const AMBITOS_SUSTITUCION = [
  'SERIE', 'VIDRIO', 'ACABADO_ACCESORIOS', 'ACABADO_MADERA',
] as const

export type AmbitoSustitucion = (typeof AMBITOS_SUSTITUCION)[number]

/**
 * Cuántos pares admite cada ámbito.
 *
 * Es un dato, no una constante mágica repartida por el código: el diálogo de
 * Productor ofrece tres series y tres vidrios, y un solo acabado de accesorios
 * y de madera. Si mañana la interfaz ofrece otro número, se pasa otro límite;
 * el motor no cambia.
 */
export type LimitesSustitucion = Readonly<Record<AmbitoSustitucion, number>>

/** Los límites observados en el vídeo. */
export const LIMITES_PRODUCTOR: LimitesSustitucion = {
  SERIE: 3,
  VIDRIO: 3,
  ACABADO_ACCESORIOS: 1,
  ACABADO_MADERA: 1,
}

/** Una fila del formulario, tal como llega: dos cajas de texto por ámbito. */
export interface ParEntrada {
  ambito: AmbitoSustitucion
  origen: string | null | undefined
  destino: string | null | undefined
}

/** Un par ya validado: los dos lados existen y son distintos. */
export interface ParSustitucion {
  readonly ambito: AmbitoSustitucion
  readonly origen: string
  readonly destino: string
}

/** Por qué una fila del formulario no llegó a ser una sustitución. */
export interface DescartePar {
  readonly ambito: AmbitoSustitucion
  readonly origen: string
  readonly destino: string
  readonly motivo: 'FILA_VACIA' | 'SIN_DESTINO_SE_CONSERVA' | 'ORIGEN_IGUAL_A_DESTINO' | 'PAR_REPETIDO'
}

/**
 * Mapa normalizado. Sólo se obtiene por `normalizarMapa`, para que nadie pueda
 * construir uno a mano saltándose los límites o los conflictos.
 */
export interface MapaSustitucion {
  readonly pares: readonly ParSustitucion[]
}

/** Mapa sin ninguna sustitución: la copia sale idéntica al origen. */
export const MAPA_VACIO: MapaSustitucion = { pares: [] }

export type ResultadoMapa =
  | { ok: true; mapa: MapaSustitucion; descartes: readonly DescartePar[] }
  | { ok: false; errores: readonly string[] }

const texto = (valor: string | null | undefined) => (valor ?? '').trim()

/**
 * Convierte las filas del formulario en un mapa aplicable.
 *
 * Rechaza en vez de adivinar:
 * - destino sin origen: no se sabe qué hay que cambiar;
 * - mismo origen con dos destinos distintos: el vídeo no muestra prioridad
 *   entre pares y elegir uno en silencio cambiaría el documento sin decirlo;
 * - más pares activos de los que el ámbito admite.
 */
export function normalizarMapa(
  entradas: readonly ParEntrada[],
  limites: LimitesSustitucion = LIMITES_PRODUCTOR,
): ResultadoMapa {
  const pares: ParSustitucion[] = []
  const descartes: DescartePar[] = []
  const errores: string[] = []
  /** ámbito -> origen -> destino ya aceptado. */
  const vistos = new Map<AmbitoSustitucion, Map<string, string>>()

  for (const entrada of entradas) {
    const origen = texto(entrada.origen)
    const destino = texto(entrada.destino)
    const base = { ambito: entrada.ambito, origen, destino }

    if (!origen && !destino) {
      descartes.push({ ...base, motivo: 'FILA_VACIA' })
      continue
    }
    if (!origen) {
      errores.push(
        `${entrada.ambito}: se indica destino «${destino}» sin decir qué código hay que sustituir`,
      )
      continue
    }
    if (!destino) {
      // La regla del vídeo, escrita donde se aplica: vacío conserva.
      descartes.push({ ...base, motivo: 'SIN_DESTINO_SE_CONSERVA' })
      continue
    }
    if (origen === destino) {
      descartes.push({ ...base, motivo: 'ORIGEN_IGUAL_A_DESTINO' })
      continue
    }

    const porAmbito = vistos.get(entrada.ambito) ?? new Map<string, string>()
    vistos.set(entrada.ambito, porAmbito)
    const anterior = porAmbito.get(origen)
    if (anterior !== undefined) {
      if (anterior === destino) {
        descartes.push({ ...base, motivo: 'PAR_REPETIDO' })
      } else {
        errores.push(
          `${entrada.ambito}: «${origen}» aparece dos veces con destinos distintos (${anterior} y ${destino})`,
        )
      }
      continue
    }
    porAmbito.set(origen, destino)
    pares.push({ ambito: entrada.ambito, origen, destino })
  }

  for (const ambito of AMBITOS_SUSTITUCION) {
    const cuantos = pares.filter((par) => par.ambito === ambito).length
    if (cuantos > limites[ambito]) {
      errores.push(`${ambito}: ${cuantos} sustituciones para un máximo de ${limites[ambito]}`)
    }
  }

  if (errores.length) return { ok: false, errores }
  return { ok: true, mapa: { pares }, descartes }
}

export const mapaVacio = (mapa: MapaSustitucion) => mapa.pares.length === 0

export interface Sustitucion {
  readonly ambito: AmbitoSustitucion
  readonly origen: string
  readonly destino: string
}

/**
 * Aplica el mapa a un código concreto.
 *
 * Si no hay par para ese ámbito y ese valor, devuelve el valor tal cual. Un
 * código nulo sigue nulo: la copia no inventa lo que el origen no tenía.
 */
export function sustituirCodigo(
  mapa: MapaSustitucion,
  ambito: AmbitoSustitucion,
  valor: string | null,
): { valor: string | null; sustitucion: Sustitucion | null } {
  if (valor === null || valor === '') return { valor, sustitucion: null }
  const par = mapa.pares.find((candidato) => candidato.ambito === ambito && candidato.origen === valor)
  if (!par) return { valor, sustitucion: null }
  return { valor: par.destino, sustitucion: par }
}
