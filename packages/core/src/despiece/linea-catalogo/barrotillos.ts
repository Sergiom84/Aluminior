/**
 * Barrotillo interior del vidrio (`DisComponente = BI`, nodo de diseño tipo 7).
 *
 * Observado el 13/11/2026 en los 8 nodos del presupuesto real con barrotillos
 * (1OFI, 2OFI y 2O+1OFI de 2026): cada fila lleva el artículo real, su
 * `Cantidad` es el número de barras y mide el cristal que referencia, sin
 * descuento: el ancho del vidrio si trabaja a lo ancho (`A`) y su largo si
 * trabaja a lo largo (`L`). Una fila con cantidad 0 no produce pieza.
 */

import type { MedidaPlantilla } from '../medidas-plantilla.ts'
import { fila, parcialVacio, type DespieceParcial } from './parcial.ts'
import type { FilaPlantillaCatalogo } from './tipos.ts'

export const COMPONENTE_BARROTILLO = 'BI'

export function despiezarBarrotillos(
  plantilla: readonly FilaPlantillaCatalogo[],
  medidas: ReadonlyMap<number, MedidaPlantilla>,
  acabado: string,
): DespieceParcial {
  const r = parcialVacio()
  for (const f of plantilla) {
    if (f.componente !== COMPONENTE_BARROTILLO || !(f.cantidad > 0)) continue
    const cristal = f.referenciaLargo === null ? undefined : medidas.get(f.referenciaLargo)
    const largoMm = (f.posicionTrabajo === 'A' ? cristal?.anchoMm : cristal?.largoMm) ?? null
    if (largoMm === null) { r.incidencias.push(`barrotillo ${f.articulo}: cristal ${f.referenciaLargo ?? '-'} sin medida`); continue }
    r.filas.push(fila({ origen: 'plantilla', articulo: f.articulo, acabado, cantidad: f.cantidad, largoMm, funcion: f.funcion }))
  }
  return r
}
