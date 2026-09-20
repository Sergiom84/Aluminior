import type { Decimal } from '../decimal.ts'
import { admitirTarifaEnVentas, permitirActualizacionTarifa, type TarifaVenta } from '../tarifa-venta.ts'
import { calcularPrecioVenta, type ArticuloClasificado, type MargenTarifa, type PrecioVenta } from './calculo.ts'

/** Una línea del recálculo masivo: el artículo y su desenlace. */
export interface LineaRecalculo {
  articuloCodigo: string
  resultado: PrecioVenta
}

export type RecalculoTarifa =
  | { estado: 'RECHAZADO'; motivo: 'TARIFA_BLOQUEADA' | 'TARIFA_NO_VALIDA_PARA_VENTAS' }
  | { estado: 'APLICADO'; lineas: LineaRecalculo[]; sinMargen: string[]; completo: boolean }

/**
 * Recalcula desde el coste los precios de venta de una tarifa entera.
 *
 * Comprueba el bloqueo ANTES de calcular nada: es el proceso masivo que el
 * bloqueo existe para frenar, y devolver un lote de precios «que no se van a
 * escribir» invita a que alguien los escriba igualmente.
 *
 * Los artículos sin margen no salen a precio de coste ni desaparecen: salen con
 * su motivo y marcan el lote como incompleto, igual que la valoración del
 * despiece hace con los artículos sin precio.
 */
export function recalcularPreciosDeVenta(
  tarifa: TarifaVenta,
  articulos: readonly { articulo: ArticuloClasificado; coste: Decimal }[],
  margenes: readonly MargenTarifa[],
): RecalculoTarifa {
  const permiso = permitirActualizacionTarifa(tarifa)
  if (permiso.estado === 'DENEGADA') return { estado: 'RECHAZADO', motivo: permiso.motivo }

  const admision = admitirTarifaEnVentas(tarifa)
  if (admision.estado === 'RECHAZADA') return { estado: 'RECHAZADO', motivo: admision.motivo }

  const lineas: LineaRecalculo[] = []
  const sinMargen: string[] = []
  for (const { articulo, coste } of articulos) {
    const resultado = calcularPrecioVenta(tarifa, articulo, coste, margenes)
    if (resultado.estado === 'NO_CALCULABLE') sinMargen.push(articulo.codigo)
    lineas.push({ articuloCodigo: articulo.codigo, resultado })
  }
  return { estado: 'APLICADO', lineas, sinMargen, completo: sinMargen.length === 0 }
}
