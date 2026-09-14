import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import { totalLineaCerramiento } from '@aluminior/core/precios'
import type { PreparacionManoObra } from '../mano-obra/preparar-mano-obra.ts'

/** Material por composición; ajustes manuales por toda la línea, sin reparto. */
export function importesLineaCerramiento(resultado: ResultadoCerramientoV1,
  cantidad: string, manoObra: PreparacionManoObra,
) {
  const filas = manoObra.estado === 'PREPARADA' ? manoObra.filas : []
  const moCompleta = manoObra.estado === 'SIN_HORAS' ||
    (manoObra.estado === 'PREPARADA' && manoObra.valorable && filas.length > 0 &&
      filas.every(f => f.valoracionCompleta && f.importe != null))
  const precioUnitario = resultado.ventaMateriales.importe
  const total = totalLineaCerramiento(resultado.ventaMateriales, cantidad,
    moCompleta ? filas.map(f => ({ completo: true, importe: f.importe! })) : [{ completo: false, importe: null }])
  return { precioUnitario, total: total.importe, valoracionCompleta: total.completo }
}
