/**
 * Pestaña `Cargos Adic.` de la edición de línea.
 *
 * Evidencia: CHM 5.3.1.3.2.2 (código, color, cantidad —«si no indica cantidad
 * el programa pone cantidad 0»—, medidas, precio cargado de la ficha para el
 * color y la tarifa, y `Respetar PVP` para conservar un precio manual al
 * recalcular), recon 18/09 (columnas y `Total Cargos`) y `VCargosAd` (269
 * cargos: `ImporteTotal = Metraje x Precio` en los 269; `Metraje = Cantidad`
 * en unidades y `Cantidad x Largo/1000` en el único cargo con largo).
 *
 * Fuera de esta función, por falta de evidencia: metraje de artículos por M2
 * (ningún cargo de la muestra lo usa), mínimos y múltiplos de facturación en
 * cargos, y cómo suma `Total Cargos` al precio de la línea.
 */

import { multiplicarDecimal, sumarDecimal, type Decimal } from './decimal.ts'

export const ESCALA_METRAJE_CARGO = 3
export const ESCALA_IMPORTE_CARGO = 2

export interface CargoAdicional {
  readonly articuloCodigo: string
  /** `ML`, `UD` o `M2`, de la ficha del artículo. */
  readonly tipoMetraje: string
  /** Texto decimal; vacío o ausente cuenta como 0, como en el original. */
  readonly cantidad: Decimal | null
  readonly largoMm: Decimal | null
  readonly anchoMm: Decimal | null
  /** Precio por unidad de metraje; `null` si el artículo no está tarifado. */
  readonly precio: Decimal | null
  readonly respetarPrecio: boolean
}

export type ResultadoCargo =
  | { readonly completo: true; readonly metraje: Decimal; readonly importe: Decimal }
  | { readonly completo: false; readonly metraje: Decimal | null; readonly importe: null; readonly incidencia: string }

const cantidadDe = (cargo: CargoAdicional): Decimal => cargo.cantidad?.trim() || '0'

/** Metraje facturable del cargo, o la incidencia que impide saberlo. */
export function metrajeCargo(cargo: CargoAdicional): { metraje: Decimal } | { incidencia: string } {
  const cantidad = cantidadDe(cargo)
  switch (cargo.tipoMetraje) {
    case 'UD':
      return { metraje: multiplicarDecimal(cantidad, '1', ESCALA_METRAJE_CARGO) }
    case 'ML': {
      const largo = cargo.largoMm?.trim()
      if (!largo || Number(largo) <= 0) return { incidencia: 'largo no indicado para un artículo por metro lineal' }
      return { metraje: multiplicarDecimal(cantidad, multiplicarDecimal(largo, '0.001', 6), ESCALA_METRAJE_CARGO) }
    }
    default:
      return { incidencia: `metraje ${cargo.tipoMetraje || 'desconocido'} sin regla verificada para cargos` }
  }
}

/** Importe de un cargo. Sin precio no se valora en cero: queda incompleto. */
export function valorarCargo(cargo: CargoAdicional): ResultadoCargo {
  const medida = metrajeCargo(cargo)
  if ('incidencia' in medida) {
    return { completo: false, metraje: null, importe: null, incidencia: medida.incidencia }
  }
  if (cargo.precio === null || !cargo.precio.trim()) {
    return { completo: false, metraje: medida.metraje, importe: null, incidencia: 'sin precio en esta tarifa' }
  }
  return {
    completo: true,
    metraje: medida.metraje,
    importe: multiplicarDecimal(medida.metraje, cargo.precio, ESCALA_IMPORTE_CARGO),
  }
}

/** `Total Cargos`: suma de importes; incompleto si falta cualquiera. */
export function totalCargos(
  cargos: readonly CargoAdicional[],
): { completo: boolean; importe: Decimal | null; incidencias: string[] } {
  const incidencias: string[] = []
  let importe: Decimal = '0.00'
  for (const cargo of cargos) {
    const resultado = valorarCargo(cargo)
    if (resultado.completo) importe = sumarDecimal(importe, resultado.importe, ESCALA_IMPORTE_CARGO)
    else incidencias.push(`${cargo.articuloCodigo}: ${resultado.incidencia}`)
  }
  return incidencias.length
    ? { completo: false, importe: null, incidencias }
    : { completo: true, importe, incidencias }
}

/**
 * Precio del cargo tras recalcular el documento: con `Respetar PVP` se
 * conserva el manual; sin él manda el de la tarifa vigente.
 */
export function precioCargoTrasRecalculo(cargo: CargoAdicional, precioTarifa: Decimal | null): Decimal | null {
  return cargo.respetarPrecio ? cargo.precio : precioTarifa
}
