import { compararDecimal, multiplicarDecimal, sumarDecimal } from './decimal.ts'
import type { ImporteSnapshot } from '../estructuras/resultado-cerramiento/tipos.ts'

/** Materiales por composición; importes manuales ya valorados para toda la línea. */
export function totalLineaCerramiento(materiales: ImporteSnapshot, cantidad: string,
  manoObra: readonly ImporteSnapshot[], escala = 2): ImporteSnapshot {
  if (!/^\d+(?:\.\d{1,3})?$/.test(cantidad) || compararDecimal(cantidad, '0') <= 0)
    throw new Error('Cantidad comercial no válida')
  if (!materiales.completo || manoObra.some(m => !m.completo))
    return { completo: false, importe: null }
  if (materiales.importe === null || manoObra.some(m => m.importe === null))
    throw new Error('Importe completo sin valor')
  return { completo: true, importe: manoObra.reduce((s, m) =>
    sumarDecimal(s, m.importe!, escala), multiplicarDecimal(materiales.importe, cantidad, escala)) }
}
