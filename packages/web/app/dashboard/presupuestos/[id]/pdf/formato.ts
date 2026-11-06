import { formatoMedida } from '@aluminior/core/estructuras'

// `Intl.NumberFormat('es-ES')` no agrupa cuatro cifras (`1391,88`); Productor
// muestra `1.391,88` (comparativa del 01/11/2026). El grupo es siempre de tres.
export const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' })
const numero = new Intl.NumberFormat('es-ES', { useGrouping: 'always', maximumFractionDigits: 3 })
/** Cantidad u horas con coma decimal, sin ceros de relleno: `2,5`, `1.250`. */
export const fmtNumero = (valor: string | number) => numero.format(Number(valor))
/** Ancho × alto con el formato de la descripción de Productor: `970,0 × 1.999,5`. */
export const fmtMedidas = (anchoMm: number, altoMm: number) => `${formatoMedida(anchoMm)} × ${formatoMedida(altoMm)}`
export const fmtFecha = (fecha: string | null) => fecha ? new Date(fecha).toLocaleDateString('es-ES') : ''
