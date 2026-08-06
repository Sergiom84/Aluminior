/**
 * Qué le pasa a cada línea al copiar el presupuesto. Función pura.
 *
 * Todo lo que decide la copia —qué se sustituye, qué se conserva, qué líneas
 * entran, qué precio deja de ser válido— vive aquí y se prueba sin base de
 * datos. La capa de persistencia se limita a ejecutar este plan.
 *
 * Evidencia: EVIDENCIA-VIDEO-PRESUPUESTO.md §8 y ROADMAP.md G3.
 */

import {
  mapaVacio, sustituirCodigo,
  type MapaSustitucion, type Sustitucion,
} from './mapa-sustitucion.ts'
import {
  lineaSeleccionada, seleccionSobrante, TODAS_LAS_LINEAS, type SeleccionLineas,
} from './seleccion-lineas.ts'

export type TipoLinea = 'ARTICULO' | 'ESTRUCTURA' | 'CERRAMIENTO'

/**
 * Los cuatro códigos sustituibles de una línea, ya leídos de sus satélites.
 *
 * `null` significa «esta línea no tiene ese código», y así se queda: la copia
 * no rellena lo que el origen no tenía. Hoy sólo `lineas_estructura` guarda
 * acabado de accesorios (`accesorios_acabado`) y madera (`madera_codigo`); una
 * línea CERRAMIENTO llega con esos dos en null y el plan lo dice.
 */
export interface CodigosLinea {
  readonly serie: string | null
  readonly vidrio: string | null
  readonly acabadoAccesorios: string | null
  readonly acabadoMadera: string | null
}

export interface LineaOrigen {
  readonly id: string
  readonly orden: number
  readonly tipo: TipoLinea
  /** `lineas.descripcion_manual`: el operador la escribió, no se autogenera. */
  readonly descripcionManual: boolean
  readonly codigos: CodigosLinea
}

/**
 * Opción «Detalle de estructuras» del diálogo.
 *
 * Sólo se modelan las dos que este módulo puede razonar. `Anular` existe en
 * Productor pero la evidencia no dice qué hace exactamente con el detalle, y
 * adivinarlo sería inventar: queda fuera hasta tener la observación.
 */
export const DETALLES_ESTRUCTURAS = ['COPIAR_ACTUAL', 'GENERAR_NUEVO'] as const
export type DetalleEstructuras = (typeof DETALLES_ESTRUCTURAS)[number]

export interface OpcionesCopia {
  readonly mapa: MapaSustitucion
  readonly seleccion: SeleccionLineas
  /** «Volver a generar la descripción de cada Línea». */
  readonly regenerarDescripcion: boolean
  /** «Volver a generar los dibujos de cada Línea». Decisión independiente. */
  readonly regenerarDibujo: boolean
  readonly detalleEstructuras: DetalleEstructuras
}

export interface CambioLinea {
  readonly lineaId: string
  readonly orden: number
  readonly seleccionada: boolean
  /** Códigos resultantes. Iguales a los del origen si no hubo sustitución. */
  readonly codigos: CodigosLinea
  readonly sustituciones: readonly Sustitucion[]
  readonly regenerarDescripcion: boolean
  readonly regenerarDibujo: boolean
  /** Copiar tal cual el despiece y el acristalamiento persistidos del origen. */
  readonly copiarDetalle: boolean
  /** El precio del origen sigue siendo el precio de esta línea. */
  readonly conservarPrecio: boolean
  readonly motivos: readonly string[]
}

export type ResultadoPlan =
  | { ok: true; plan: PlanCopia }
  | { ok: false; errores: readonly string[] }

export interface PlanCopia {
  readonly lineas: readonly CambioLinea[]
  readonly sustitucionesAplicadas: number
  readonly avisos: readonly string[]
}

export const OPCIONES_COPIA_IDENTICA: Omit<OpcionesCopia, 'mapa'> = {
  seleccion: TODAS_LAS_LINEAS,
  regenerarDescripcion: false,
  regenerarDibujo: false,
  detalleEstructuras: 'COPIAR_ACTUAL',
}

/**
 * El dibujo del cerramiento se deriva de `lineas_cerramiento.configuracion`
 * cada vez que se pinta: en Aluminior no hay imagen persistida que regenerar.
 * La casilla se respeta como decisión —viaja en el plan— pero hoy no cambia
 * nada escrito, y eso se dice en vez de aparentar que hizo algo.
 */
export const AVISO_DIBUJO_DERIVADO =
  'El dibujo se deriva de la configuración en cada dibujado: no hay artefacto persistido que regenerar.'

export const MOTIVO_DESCRIPCION_MANUAL =
  'descripción escrita a mano: se conserva'

export const MOTIVO_PRECIO_INVALIDADO =
  'precio no copiado: la línea cambia de código y su valoración es la del original'

export const MOTIVO_DETALLE_DESFASADO =
  'el detalle copiado es el del código anterior'

export const ERROR_GENERAR_NUEVO =
  'Generar nuevo detalle de estructuras no está implementado: el motor de despiece vive hoy en acciones.ts y este módulo no lo alcanza.'

/** Aplica el mapa a los cuatro códigos de una línea. */
function sustituirCodigosLinea(mapa: MapaSustitucion, codigos: CodigosLinea) {
  const serie = sustituirCodigo(mapa, 'SERIE', codigos.serie)
  const vidrio = sustituirCodigo(mapa, 'VIDRIO', codigos.vidrio)
  const accesorios = sustituirCodigo(mapa, 'ACABADO_ACCESORIOS', codigos.acabadoAccesorios)
  const madera = sustituirCodigo(mapa, 'ACABADO_MADERA', codigos.acabadoMadera)
  const sustituciones = [serie, vidrio, accesorios, madera]
    .map((resultado) => resultado.sustitucion)
    .filter((sustitucion): sustitucion is Sustitucion => sustitucion !== null)
  return {
    codigos: {
      serie: serie.valor,
      vidrio: vidrio.valor,
      acabadoAccesorios: accesorios.valor,
      acabadoMadera: madera.valor,
    } satisfies CodigosLinea,
    sustituciones,
  }
}

function lineaSinCambios(linea: LineaOrigen, seleccionada: boolean, motivos: string[]): CambioLinea {
  return {
    lineaId: linea.id,
    orden: linea.orden,
    seleccionada,
    codigos: linea.codigos,
    sustituciones: [],
    regenerarDescripcion: false,
    regenerarDibujo: false,
    copiarDetalle: true,
    conservarPrecio: true,
    motivos,
  }
}

/**
 * Calcula el plan de copia.
 *
 * Reglas, todas comprobables:
 * 1. Una línea no seleccionada se copia idéntica: mismos códigos, mismo precio.
 * 2. Un ámbito sin par en el mapa conserva su código. Vacío conserva.
 * 3. Regenerar descripción y regenerar dibujo son independientes; la
 *    descripción escrita a mano no se pisa.
 * 4. Una línea con al menos una sustitución pierde el precio: la valoración
 *    guardada es la del código anterior y presentarla como buena sería un
 *    importe falso (regla del dinero del proyecto).
 */
export function planificarCopia(
  lineas: readonly LineaOrigen[],
  opciones: OpcionesCopia,
): ResultadoPlan {
  if (opciones.detalleEstructuras === 'GENERAR_NUEVO') {
    return { ok: false, errores: [ERROR_GENERAR_NUEVO] }
  }

  const avisos: string[] = []
  const sobrantes = seleccionSobrante(opciones.seleccion, lineas.map((linea) => linea.id))
  if (sobrantes.length) {
    avisos.push(`${sobrantes.length} líneas seleccionadas no pertenecen al documento origen`)
  }
  if (opciones.regenerarDibujo) avisos.push(AVISO_DIBUJO_DERIVADO)

  const cambios = lineas.map((linea) => {
    const seleccionada = lineaSeleccionada(opciones.seleccion, linea.id)
    if (!seleccionada) return lineaSinCambios(linea, false, [])
    if (mapaVacio(opciones.mapa) && !opciones.regenerarDescripcion && !opciones.regenerarDibujo) {
      return lineaSinCambios(linea, true, [])
    }

    const { codigos, sustituciones } = sustituirCodigosLinea(opciones.mapa, linea.codigos)
    const motivos: string[] = []

    const regenerarDescripcion = opciones.regenerarDescripcion && !linea.descripcionManual
    if (opciones.regenerarDescripcion && linea.descripcionManual) {
      motivos.push(MOTIVO_DESCRIPCION_MANUAL)
    }

    const conservarPrecio = sustituciones.length === 0
    if (!conservarPrecio) {
      motivos.push(MOTIVO_PRECIO_INVALIDADO)
      if (linea.tipo !== 'ARTICULO') motivos.push(MOTIVO_DETALLE_DESFASADO)
    }

    return {
      lineaId: linea.id,
      orden: linea.orden,
      seleccionada: true,
      codigos,
      sustituciones,
      regenerarDescripcion,
      regenerarDibujo: opciones.regenerarDibujo,
      copiarDetalle: true,
      conservarPrecio,
      motivos,
    } satisfies CambioLinea
  })

  return {
    ok: true,
    plan: {
      lineas: cambios,
      sustitucionesAplicadas: cambios.reduce((suma, linea) => suma + linea.sustituciones.length, 0),
      avisos,
    },
  }
}
