/**
 * Optimización de corte 1D (cutting-stock) para la hoja de corte.
 *
 * Problema: dada una lista de cortes requeridos de un mismo perfil
 * (cada uno con su longitud y cuántos hacen falta), repartirlos en el menor
 * número posible de barras de longitud fija, minimizando el desperdicio.
 *
 * ⚠️ Es una HEURÍSTICA, no el óptimo exacto. El cutting-stock 1D (bin packing)
 * es NP-difícil; aquí se usa First-Fit-Decreasing (FFD): se ordenan los cortes
 * de mayor a menor y cada uno se coloca en la primera barra donde entra, o en
 * una nueva. FFD garantiza a lo sumo (11/9·óptimo + 6/9) barras y en la
 * práctica industrial queda muy cerca del óptimo; pero NO promete el mínimo
 * absoluto. Nunca se presenta como "óptimo".
 *
 * Principio del proyecto (regla 3): no se inventan valores. Un corte más largo
 * que la barra no se recorta a la fuerza ni se ignora en silencio: sale en
 * `imposibles` con su motivo, para que quien lea la hoja lo vea.
 *
 * NO hay E/S aquí: función pura, testeable con datos sintéticos.
 */

/** Un corte que hay que producir: longitud en mm y cuántas unidades. */
export interface CorteRequerido {
  /** Longitud de corte en mm. */
  longitud: number
  /** Nº de piezas de esa longitud. Debe ser entero ≥ 0 (las piezas no se parten). */
  cantidad: number
  /**
   * Etiqueta opcional para trazar el corte en la hoja (p. ej. ángulos o
   * función). El optimizador la arrastra sin interpretarla.
   */
  ref?: string
}

/** Una pieza ya colocada en una barra. */
export interface CorteColocado {
  longitud: number
  ref?: string
}

/** Una barra del plan, con sus cortes y el sobrante que queda al final. */
export interface BarraPlan {
  cortes: CorteColocado[]
  /** mm libres tras colocar los cortes (descontando kerf). */
  sobrante: number
}

/** Un corte que no cabe en la barra: no se coloca, se reporta. */
export interface CorteImposible {
  longitud: number
  cantidad: number
  ref?: string
  motivo: string
}

export interface PlanCorte {
  barras: BarraPlan[]
  nBarras: number
  /** Longitud de barra usada para el plan (mm). */
  longitudBarra: number
  /** Ancho de sierra descontado por corte (mm). */
  kerf: number
  /** mm de barra desaprovechados: sobrantes + material perdido en kerf. */
  desperdicioTotal: number
  /** Desperdicio como % del material total consumido (0..100). */
  porcentajeDesperdicio: number
  /** mm útiles: suma de longitudes de los cortes colocados. */
  totalUtil: number
  /** Cortes que no caben en una barra (longitud + kerf > longitudBarra). */
  imposibles: CorteImposible[]
}

export interface OpcionesOptimizar {
  /** Longitud de la barra en bruto, en mm. Obligatoria: no hay un valor de barra fiable en el catálogo. */
  longitudBarra: number
  /**
   * Ancho de la hoja de sierra (kerf) en mm. Cada corte consume su longitud
   * MÁS este kerf (el material que se lleva la sierra). Por defecto 0.
   */
  kerf?: number
}

/**
 * Redondeo a la milésima para evitar que la aritmética en coma flotante
 * deje sobrantes tipo -0.00000001 o 2999.9999998.
 */
function redondear(mm: number): number {
  return Math.round(mm * 1000) / 1000
}

/**
 * Reparte los cortes en barras con First-Fit-Decreasing.
 *
 * @param cortes         lista de cortes requeridos (longitud + cantidad)
 * @param opciones       longitud de barra (obligatoria) y kerf (opcional)
 */
export function optimizarCorte(
  cortes: CorteRequerido[],
  opciones: OpcionesOptimizar,
): PlanCorte {
  const longitudBarra = opciones.longitudBarra
  const kerf = opciones.kerf ?? 0

  if (!Number.isFinite(longitudBarra) || longitudBarra <= 0) {
    throw new Error(`longitudBarra debe ser un número positivo, recibido: ${longitudBarra}`)
  }
  if (!Number.isFinite(kerf) || kerf < 0) {
    throw new Error(`kerf debe ser un número ≥ 0, recibido: ${kerf}`)
  }

  // Expandir a piezas individuales, validando cada corte.
  const piezas: CorteColocado[] = []
  const imposibles: CorteImposible[] = []

  for (const c of cortes) {
    if (!Number.isFinite(c.longitud) || c.longitud <= 0) {
      throw new Error(`longitud de corte debe ser un número positivo, recibido: ${c.longitud}`)
    }
    if (!Number.isInteger(c.cantidad) || c.cantidad < 0) {
      throw new Error(`cantidad debe ser un entero ≥ 0, recibido: ${c.cantidad}`)
    }
    if (c.cantidad === 0) continue

    // Un corte que ni siquiera cabe una vez en la barra (con su kerf) es
    // imposible: no se recorta ni se ignora, se reporta.
    if (redondear(c.longitud + kerf) > longitudBarra) {
      imposibles.push({
        longitud: c.longitud,
        cantidad: c.cantidad,
        ref: c.ref,
        motivo: `el corte (${c.longitud} mm + ${kerf} mm de sierra) supera la barra de ${longitudBarra} mm`,
      })
      continue
    }

    for (let i = 0; i < c.cantidad; i++) {
      piezas.push({ longitud: c.longitud, ref: c.ref })
    }
  }

  // Decreasing: de mayor a menor. Meter primero las piezas grandes deja los
  // huecos pequeños para las pequeñas y reduce el nº de barras.
  piezas.sort((a, b) => b.longitud - a.longitud)

  // Cada barra lleva su "usado" (longitud consumida, con kerf incluido).
  const barras: { cortes: CorteColocado[]; usado: number }[] = []

  for (const pieza of piezas) {
    const coste = pieza.longitud + kerf
    // First-Fit: primera barra donde entra.
    let colocada = false
    for (const barra of barras) {
      if (redondear(barra.usado + coste) <= longitudBarra) {
        barra.cortes.push(pieza)
        barra.usado = redondear(barra.usado + coste)
        colocada = true
        break
      }
    }
    if (!colocada) {
      barras.push({ cortes: [pieza], usado: redondear(coste) })
    }
  }

  const barrasPlan: BarraPlan[] = barras.map((b) => ({
    cortes: b.cortes,
    sobrante: redondear(longitudBarra - b.usado),
  }))

  const nBarras = barrasPlan.length
  const totalUtil = redondear(
    piezas.reduce((acc, p) => acc + p.longitud, 0),
  )
  const totalBarras = redondear(nBarras * longitudBarra)
  const desperdicioTotal = redondear(totalBarras - totalUtil)
  const porcentajeDesperdicio = totalBarras > 0
    ? redondear((desperdicioTotal / totalBarras) * 100)
    : 0

  return {
    barras: barrasPlan,
    nBarras,
    longitudBarra,
    kerf,
    desperdicioTotal,
    porcentajeDesperdicio,
    totalUtil,
    imposibles,
  }
}

/** Longitud de barra por defecto (mm) cuando no hay un dato fiable en el artículo.
 *
 * NO es un dato del catálogo: en `articulos` no existe ninguna columna de
 * longitud de barra estándar (sí `metrajeMinimo` y `metrajeMultiploLargo`, que
 * son de facturación, no de stock físico). El estándar comercial del sector es
 * la barra de 6 m. Se expone como parámetro editable en la UI: este valor es
 * sólo el punto de partida visible, nunca una suposición silenciosa. */
export const LONGITUD_BARRA_POR_DEFECTO_MM = 6000
