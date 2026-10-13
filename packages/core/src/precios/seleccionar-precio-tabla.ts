/**
 * Selector dimensional original: clave exacta, restricciones desactivadas y un
 * único largo en la tabla. La evidencia no decide la precedencia entre varios
 * largos ni las políticas especiales; esas entradas permanecen sin valorar.
 * Quien llama aporta todas las filas de la clave, sin prefiltrar por medidas.
 */
export interface FilaPrecioTabla {
  articuloCodigo: string
  acabadoCodigo: string
  tarifa: string
  anchoMm: number
  largoMm: number
  precio: number
}

/** Ausente o null significa desconocido, nunca una restricción desactivada. */
export interface PoliticasPrecioTabla {
  noMedidasInferiores?: boolean | null
  noMedidasSuperiores?: boolean | null
  soloMedidasAncho?: boolean | null
  soloMedidasLargo?: boolean | null
  noPrecioCero?: boolean | null
}

export interface EntradaPrecioTabla {
  articuloCodigo: string
  acabadoCodigo: string
  tarifa: string
  anchoMm: number | null
  largoMm: number | null
  politicas?: PoliticasPrecioTabla | null
  /** Catálogo completo por clave; puede incluir otras claves, que se ignoran. */
  filas: readonly FilaPrecioTabla[]
}

export type MotivoPrecioTabla =
  | 'Artículo, acabado o tarifa no disponibles'
  | 'Medidas de la pieza no válidas'
  | 'Configuración de precio por medidas no disponible'
  | 'Restricciones de precio por medidas pendientes de verificar'
  | 'Precio por medidas no disponible para el artículo, acabado y tarifa'
  | 'Datos de la tabla de precios no válidos'
  | 'Tabla con varios largos pendiente de verificar'
  | 'Tabla con medidas duplicadas pendiente de verificar'
  | 'Medidas fuera de la tabla de precios'

type FuentePrecioTabla = 'ARTICULOS_PRECIO_TABLA_PVP'

export type ResultadoPrecioTabla =
  | {
    completo: true
    precio: number
    datos: FilaPrecioTabla
    fuente: FuentePrecioTabla
    motivo: null
  }
  | {
    completo: false
    precio: null
    datos: null
    fuente: FuentePrecioTabla
    motivo: MotivoPrecioTabla
  }

const FUENTE: FuentePrecioTabla = 'ARTICULOS_PRECIO_TABLA_PVP'
const POLITICAS = [
  'noMedidasInferiores', 'noMedidasSuperiores', 'soloMedidasAncho',
  'soloMedidasLargo', 'noPrecioCero',
] as const

const dimensionValida = (valor: number | null): valor is number =>
  typeof valor === 'number' && Number.isFinite(valor) && valor > 0

const claveValida = (valor: string): boolean =>
  typeof valor === 'string' && valor.trim().length > 0

function incompleto(motivo: MotivoPrecioTabla): ResultadoPrecioTabla {
  return { completo: false, precio: null, datos: null, fuente: FUENTE, motivo }
}

/** No usa precios planos, reservas de tarifa, comodines ni redondeos de medidas. */
export function seleccionarPrecioTabla(entrada: EntradaPrecioTabla): ResultadoPrecioTabla {
  if (![entrada.articuloCodigo, entrada.acabadoCodigo, entrada.tarifa].every(claveValida)) {
    return incompleto('Artículo, acabado o tarifa no disponibles')
  }
  const { anchoMm, largoMm } = entrada
  if (!dimensionValida(anchoMm) || !dimensionValida(largoMm)) {
    return incompleto('Medidas de la pieza no válidas')
  }
  const politicas = entrada.politicas
  if (!politicas || POLITICAS.some((campo) => typeof politicas[campo] !== 'boolean')) {
    return incompleto('Configuración de precio por medidas no disponible')
  }
  if (POLITICAS.some((campo) => politicas[campo] !== false)) {
    return incompleto('Restricciones de precio por medidas pendientes de verificar')
  }

  const filas = entrada.filas.filter((fila) =>
    fila.articuloCodigo === entrada.articuloCodigo
    && fila.acabadoCodigo === entrada.acabadoCodigo
    && fila.tarifa === entrada.tarifa)
  if (!filas.length) {
    return incompleto('Precio por medidas no disponible para el artículo, acabado y tarifa')
  }
  if (filas.some((fila) => !dimensionValida(fila.anchoMm) || !dimensionValida(fila.largoMm)
    || typeof fila.precio !== 'number' || !Number.isFinite(fila.precio) || fila.precio < 0)) {
    return incompleto('Datos de la tabla de precios no válidos')
  }
  if (new Set(filas.map((fila) => fila.largoMm)).size !== 1) {
    return incompleto('Tabla con varios largos pendiente de verificar')
  }
  // Con largo único, dos anchos iguales repiten la misma clave dimensional.
  // Se bloquean incluso si coinciden en precio: ese caso no está contrastado.
  if (new Set(filas.map((fila) => fila.anchoMm)).size !== filas.length) {
    return incompleto('Tabla con medidas duplicadas pendiente de verificar')
  }
  const elegibles = filas.filter((fila) => fila.anchoMm >= anchoMm && fila.largoMm >= largoMm)
  if (!elegibles.length) return incompleto('Medidas fuera de la tabla de precios')
  const fila = elegibles.reduce((menor, actual) => actual.anchoMm < menor.anchoMm ? actual : menor)
  return { completo: true, precio: fila.precio, datos: { ...fila }, fuente: FUENTE, motivo: null }
}
