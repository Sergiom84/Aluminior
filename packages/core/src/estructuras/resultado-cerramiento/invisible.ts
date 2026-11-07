import { compararDecimal } from '../../precios/decimal.ts'
import type { ResultadoOrigenCerramiento } from './tipos.ts'

export const REGLA_ELEMENTO_INVISIBLE = 'ELEMENTO_INVISIBLE'

/**
 * Elemento invisible (DS3): importe 0 completo y sin piezas. No es una receta
 * vacía ni un precio desconocido: Productor lo guarda así (precio 0, sin despiece).
 */
export function esOrigenInvisible(v: ResultadoOrigenCerramiento): boolean {
  return v.origen.tipo === 'MODULO' && v.reglaMaterial === REGLA_ELEMENTO_INVISIBLE &&
    v.venta.completo && v.coste.completo &&
    v.venta.importe !== null && compararDecimal(v.venta.importe, '0') === 0 &&
    v.coste.importe !== null && compararDecimal(v.coste.importe, '0') === 0 &&
    [v.piezas, v.partidasValoracion, v.acristalamiento, v.opcionesHerraje, v.diagnosticos]
      .every(filas => filas.length === 0)
}

export function origenInvisible(origen: ResultadoOrigenCerramiento): ResultadoOrigenCerramiento {
  return { ...origen, reglaMaterial: REGLA_ELEMENTO_INVISIBLE,
    venta: { completo: true, importe: '0.00' }, coste: { completo: true, importe: '0.0000' },
    piezas: [], partidasValoracion: [], acristalamiento: [], opcionesHerraje: [], diagnosticos: [] }
}
