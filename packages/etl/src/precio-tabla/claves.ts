import { num, txt } from '../csv.ts'

/** Formato del export: coma decimal y punto sólo para grupos de miles. */
function numeroOrigen(valor: string | undefined): string | null {
  const texto = txt(valor)
  if (texto === null || !/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(texto)) return null
  return num(texto)
}

/** La tarifa identifica una clave; no admite redondear una fracción a otra tarifa. */
export function tarifaExacta(valor: string | undefined): number | null {
  const decimal = numeroOrigen(valor)
  if (decimal === null || !/^\d+(?:\.0+)?$/.test(decimal)) return null
  const tarifa = Number(decimal)
  return Number.isSafeInteger(tarifa) && tarifa > 0 && tarifa <= 2147483647 ? tarifa : null
}

/** numeric(10,3) debe conservar exactamente la cota que delimita el PVP. */
export function medidaExacta(valor: string | undefined): string | null {
  const decimal = numeroOrigen(valor)
  if (decimal === null) return null
  const [entero, fraccion = ''] = decimal.split('.')
  if (entero.replace(/^0+/, '').length > 7 || /[1-9]/.test(fraccion.slice(3)) || Number(decimal) <= 0) return null
  return decimal
}
