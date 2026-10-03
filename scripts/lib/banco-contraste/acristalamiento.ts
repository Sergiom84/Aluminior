import { numero } from './datos.ts'

/**
 * VDatosLinEstr.nTAcris: 0 conserva la selección base y 1 identifica la
 * primera opción. Contrastado por artículos de junquillo/juntas con las
 * tablas de Conjuntos en la copia del banco (informe, iteración 3).
 * No extrapolar a 2..5: necesitan su propia evidencia y soporte del motor.
 */
export function opcionAcristalamientoOrigen(valor: unknown): 1 | null {
  const n = numero(valor)
  return n === 0 || n === 1 ? 1 : null
}
