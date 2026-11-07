import { compararDecimal, multiplicarDecimal, sumarDecimal } from './decimal.ts'
import type { ImporteSnapshot } from '../estructuras/resultado-cerramiento/tipos.ts'

/** Materiales y mano de obra unitarios por composición; la cantidad comercial escala el conjunto. */
export function totalLineaCerramiento(materiales: ImporteSnapshot, cantidad: string,
  manoObra: readonly ImporteSnapshot[], escala = 2): ImporteSnapshot {
  if (!/^\d+(?:\.\d{1,3})?$/.test(cantidad) || compararDecimal(cantidad, '0') <= 0)
    throw new Error('Cantidad comercial no válida')
  if (!materiales.completo || manoObra.some(m => !m.completo))
    return { completo: false, importe: null }
  if (materiales.importe === null || manoObra.some(m => m.importe === null))
    throw new Error('Importe completo sin valor')
  const unitario = manoObra.reduce((s, m) => sumarDecimal(s, m.importe!, escala), materiales.importe)
  return { completo: true, importe: multiplicarDecimal(unitario, cantidad, escala) }
}
