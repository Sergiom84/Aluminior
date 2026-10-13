/**
 * Propuesta de coste y PVP de los dobles acristalamientos con una tarifa de
 * proveedor nueva. Solo calcula: no escribe en ninguna base.
 *
 * El PVP de cada tarifa de venta se obtiene con el mismo factor sobre coste que
 * reproduce los PVP guardados (se mide, no se supone) y se redondea a céntimo
 * como los guardados. Un artículo sin coste nuevo conserva su motivo y no
 * recibe PVP: nunca se completa con el precio anterior ni con cero.
 */
import {
  costeDobleAcristalamiento, multiplicarDecimal, normalizarDecimal, type MotivoSinCoste,
  type TarifaDobleAcristalamiento,
} from '../../../packages/core/src/precios/index.ts'
import type { ArticuloCompuesto, TarifaDerivada } from './derivar.ts'

export interface ArticuloConPvp extends ArticuloCompuesto {
  /** PVP guardado por tarifa de venta ('1', '2', '3'). */
  pvp: Readonly<Record<string, string>>
}

export interface FactorTarifa { tarifa: string; factor: string; reproducidos: number; total: number }

/** Impide exportar una propuesta basada en un modelo que no explica el catálogo. */
export function validarModeloGuardado(guardada: TarifaDerivada, factores: readonly FactorTarifa[]): void {
  if (guardada.reproducidos === 0 || guardada.discrepancias.length > 0)
    throw new Error('El modelo no reproduce todos los costes guardados; se conserva el catálogo sin propuesta')
  if (factores.length === 0 || factores.some(f => f.total === 0 || f.reproducidos !== f.total))
    throw new Error('Los factores no reproducen todos los PVP guardados; no se exporta la propuesta')
}

export interface FilaPropuesta {
  codigo: string
  costeActual: string | null
  costeNuevo: string | null
  motivo: MotivoSinCoste | null
  detalle: string | null
  pvpActual: Record<string, string | null>
  pvpNuevo: Record<string, string | null>
}

const centimos = (v: string) => normalizarDecimal(v, 2)

/** Factor PVP/coste de cada tarifa: el más frecuente y cuántos PVP reproduce exactamente. */
export function medirFactores(articulos: readonly ArticuloConPvp[]): FactorTarifa[] {
  const tarifas = [...new Set(articulos.flatMap(a => Object.keys(a.pvp)))].sort()
  return tarifas.map(tarifa => {
    const frecuencia = new Map<string, number>()
    const pares = articulos.filter(a => a.coste !== null && Number(a.coste) > 0 && a.pvp[tarifa] !== undefined)
    for (const a of pares) {
      const f = (Number(a.pvp[tarifa]) / Number(a.coste)).toFixed(3)
      frecuencia.set(f, (frecuencia.get(f) ?? 0) + 1)
    }
    const factor = [...frecuencia].sort((x, y) => y[1] - x[1])[0]?.[0]
    if (factor === undefined) throw new Error(`La tarifa ${tarifa} no tiene pares coste/PVP`)
    const reproducidos = pares.filter(a => centimos(multiplicarDecimal(a.coste!, factor, 4)) === centimos(a.pvp[tarifa])).length
    return { tarifa, factor: String(Number(factor)), reproducidos, total: pares.length }
  })
}

export function construirPropuesta(
  articulos: readonly ArticuloConPvp[],
  tarifa: TarifaDobleAcristalamiento,
  factores: readonly FactorTarifa[],
): FilaPropuesta[] {
  return articulos.map(a => {
    const r = costeDobleAcristalamiento(a.composicion, tarifa)
    const costeNuevo = r.estado === 'CALCULADO' ? r.coste : null
    const pvpActual: Record<string, string | null> = {}, pvpNuevo: Record<string, string | null> = {}
    for (const f of factores) {
      pvpActual[f.tarifa] = a.pvp[f.tarifa] === undefined ? null : centimos(a.pvp[f.tarifa])
      pvpNuevo[f.tarifa] = costeNuevo === null ? null : centimos(multiplicarDecimal(costeNuevo, f.factor, 4))
    }
    return { codigo: a.codigo, costeActual: a.coste, costeNuevo,
      motivo: r.estado === 'SIN_COSTE' ? r.motivo : null, detalle: r.estado === 'SIN_COSTE' ? r.detalle : null,
      pvpActual, pvpNuevo }
  })
}

export interface ResumenPropuesta {
  articulos: number
  conCosteNuevo: number
  sinCoste: Record<string, number>
  vidriosSinPrecio: Record<string, number>
  /** Variación media del coste en los artículos con coste antes y después, en %. */
  variacionMediaCostePorc: number | null
  suben: number
  bajan: number
}

export function resumirPropuesta(filas: readonly FilaPropuesta[]): ResumenPropuesta {
  const sinCoste: Record<string, number> = {}, vidriosSinPrecio: Record<string, number> = {}
  let suma = 0, n = 0, suben = 0, bajan = 0
  for (const f of filas) {
    if (f.motivo) {
      sinCoste[f.motivo] = (sinCoste[f.motivo] ?? 0) + 1
      if (f.detalle) vidriosSinPrecio[f.detalle] = (vidriosSinPrecio[f.detalle] ?? 0) + 1
      continue
    }
    if (f.costeActual === null || Number(f.costeActual) === 0 || f.costeNuevo === null) continue
    const d = Number(f.costeNuevo) - Number(f.costeActual)
    suma += d / Number(f.costeActual); n++
    if (d > 0) suben++; else if (d < 0) bajan++
  }
  return { articulos: filas.length, conCosteNuevo: filas.filter(f => f.costeNuevo !== null).length,
    sinCoste, vidriosSinPrecio, variacionMediaCostePorc: n ? Math.round(suma / n * 10000) / 100 : null, suben, bajan }
}
