/**
 * Emparejamiento del vidrio con su alojamiento (T.70.2).
 *
 * Segunda responsabilidad extraída del bloque del vidrio. Decide de qué perfil
 * y de qué medidas de corte sale el vidrio de una estructura NO mixta:
 *
 *  - con hojas (HV/HH): vidrio de HOJA, descontado del corte de hoja
 *  - sin hojas: vidrio de FIJO, descontado del corte del CERCO (MV/MH)
 *
 * Es una función PURA sobre el despiece ya calculado: no consulta el galce ni
 * valora. Su única salida es «de aquí sale la medida» o «no se puede saber».
 *
 * Principio, y es la razón de que devuelva un aviso en vez de una medida
 * aproximada: si el emparejamiento no es inequívoco NO se calcula. Extrapolar el
 * vidrio de hoja a los huecos fijos sería inventar un precio para esos huecos.
 *
 * Tres comportamientos se CONSERVAN tal cual estaban, no se corrigen aquí:
 *
 *  1. La rama de HOJA filtra los cortes horizontales por el perfil de
 *     referencia; la de FIJO **no**. La asimetría estaba en el original y
 *     cambiarla movería medidas de vidrio ya calculadas.
 *  2. El recuento `nCristales === nHojas` se exige sólo en la rama de HOJA. En
 *     la de FIJO no hay comprobación equivalente.
 *  3. `nHojas` se deduce del total de montantes verticales dividido entre dos y
 *     redondeado. Una hoja con un número impar de HV lo falsearía; no se ha
 *     medido que ocurra.
 */

import type { PiezaCortada } from '@aluminior/core/despiece'

/** Dónde se aloja el vidrio. Decide de qué tabla sale el descuento de galce. */
export type ContextoVidrio = 'HOJA' | 'FIJO'

export type EmparejamientoVidrio =
  | {
    ok: true
    contexto: ContextoVidrio
    /** Perfil del que se descuenta el galce. */
    perfilCodigo: string
    /** Corte vertical: HV en hojas, MV en cerco fijo. */
    corteVerticalMm: number
    /** Corte horizontal: HH en hojas, MH en cerco fijo. */
    corteHorizontalMm: number
  }
  | { ok: false; aviso: string }

/**
 * Mensaje único del emparejamiento imposible.
 *
 * Se conserva palabra por palabra —incluida la pregunta entre paréntesis— y con
 * un solo texto para las cinco causas: varios perfiles, varios cortes
 * verticales, varios horizontales, recuento que no cuadra y estructura sin
 * cristales. Distinguirlas ayudaría al operador, pero es un cambio de mensaje
 * visible y no se hace de refilón en una extracción.
 */
const AVISO_AMBIGUO =
  'vidrio sin calcular: emparejamiento ambiguo para esta estructura (¿mezcla hojas y fijos?)'

/** El único valor del conjunto, o `null` si hay ninguno o varios. */
function unico<T>(valores: Iterable<T>): T | null {
  const conjunto = new Set(valores)
  return conjunto.size === 1 ? [...conjunto][0] : null
}

/**
 * De qué perfil y qué cortes sale el vidrio.
 *
 * @param piezas      despiece ya calculado de la estructura.
 * @param nCristales  ranuras de cristal de la plantilla resuelta.
 */
export function emparejarVidrio(
  piezas: readonly PiezaCortada[],
  nCristales: number,
): EmparejamientoVidrio {
  const hvs = piezas.filter((pz) => pz.funcion === 'HV' && pz.largoMm !== null)
  const hayHojas = hvs.length > 0
  const contexto: ContextoVidrio = hayHojas ? 'HOJA' : 'FIJO'

  const verticales = hayHojas
    ? hvs
    : piezas.filter((pz) => pz.funcion === 'MV' && pz.largoMm !== null)
  const perfilCodigo = unico(verticales.map((pz) => pz.articuloCodigo))
  const corteVerticalMm = unico(verticales.map((pz) => pz.largoMm))

  // Asimetría conservada (1): con hojas, el corte horizontal debe ser del MISMO
  // perfil; en el cerco fijo se admite cualquiera. Con `perfilCodigo` a null el
  // filtro no casa con nada y el corte queda sin resolver, que es lo que hacía.
  const horizontales = hayHojas
    ? piezas.filter((pz) =>
      pz.funcion === 'HH' && pz.articuloCodigo === perfilCodigo && pz.largoMm !== null)
    : piezas.filter((pz) => pz.funcion === 'MH' && pz.largoMm !== null)
  const corteHorizontalMm = unico(horizontales.map((pz) => pz.largoMm))

  // Conservado (2) y (3): un cristal por hoja, y las hojas se deducen del total
  // de montantes verticales entre dos. Sólo se exige con hojas.
  const nHojas = Math.round(hvs.reduce((acc, pz) => acc + pz.cantidad, 0) / 2)
  const recuentoCuadra = !hayHojas || nCristales === nHojas

  if (
    perfilCodigo === null || corteVerticalMm === null || corteHorizontalMm === null
    || !recuentoCuadra || nCristales === 0
  ) {
    return { ok: false, aviso: AVISO_AMBIGUO }
  }
  return { ok: true, contexto, perfilCodigo, corteVerticalMm, corteHorizontalMm }
}
