import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import { precioConComision, totalLineaCerramiento } from '@aluminior/core/precios'
import type { PreparacionManoObra } from '../mano-obra/preparar-mano-obra.ts'

/** Material por composición; ajustes manuales por toda la línea, sin reparto; comisión opcional. */
export function importesLineaCerramiento(resultado: ResultadoCerramientoV1,
  cantidad: string, manoObra: PreparacionManoObra, comisionPorc: string | null = null,
) {
  const filas = manoObra.estado === 'PREPARADA' ? manoObra.filas : []
  const moCompleta = manoObra.estado === 'SIN_HORAS' ||
    (manoObra.estado === 'PREPARADA' && manoObra.valorable && filas.length > 0 &&
      filas.every(f => f.valoracionCompleta && f.importe != null))
  const precioUnitario = resultado.ventaMateriales.importe
  const total = totalLineaCerramiento(resultado.ventaMateriales, cantidad,
    moCompleta ? filas.map(f => ({ completo: true, importe: f.importe! })) : [{ completo: false, importe: null }])
  // `Sumar Comisión` de la cabecera: sobre el total de la línea, despiece en base.
  const conComision = (v: string | null) => v === null || !comisionPorc ? v : precioConComision(v, comisionPorc)
  return { precioUnitario: conComision(precioUnitario), total: conComision(total.importe), valoracionCompleta: total.completo }
}
