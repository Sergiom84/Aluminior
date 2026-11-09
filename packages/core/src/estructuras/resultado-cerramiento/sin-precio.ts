/**
 * Piezas sin PVP dentro del resultado guardado de un cerramiento.
 *
 * Se guardan como diagnóstico no bloqueante (`SIN_PRECIO`), con la pieza en
 * JSON, para que la pantalla pueda preguntar al operador cómo valorarlas sin
 * repetir el cálculo. El bloqueo del total lo pone el diagnóstico de venta.
 */
import type { FilaValorable } from '../../precios/importe-fila.ts'
import { clavePrecio, type PiezaSinPrecio } from '../../precios/precio-manual.ts'
import type { DiagnosticoCerramiento, ResultadoCerramientoV1 } from './tipos.ts'

export const CODIGO_SIN_PRECIO = 'SIN_PRECIO'

export function diagnosticosSinPrecio(piezas: readonly PiezaSinPrecio[] | undefined): DiagnosticoCerramiento[] {
  return (piezas ?? []).map(p => ({
    codigo: CODIGO_SIN_PRECIO, ambito: 'VENTA', bloqueante: false,
    detalle: JSON.stringify({ articulo: p.articulo, acabado: p.acabado, tipoMetraje: p.tipoMetraje,
      cantidad: p.cantidad, largoMm: p.largoMm, anchoMm: p.anchoMm }),
  }))
}

const numeroONull = (v: unknown) => v === null || (typeof v === 'number' && Number.isFinite(v))

function leerPieza(detalle: string): PiezaSinPrecio | null {
  try {
    const p = JSON.parse(detalle) as Partial<PiezaSinPrecio>
    if (typeof p.articulo !== 'string' || !p.articulo || typeof p.acabado !== 'string' || !p.acabado ||
      typeof p.tipoMetraje !== 'string' || typeof p.cantidad !== 'number' || !Number.isFinite(p.cantidad) ||
      !numeroONull(p.largoMm) || !numeroONull(p.anchoMm)) return null
    return { articulo: p.articulo, acabado: p.acabado, tipoMetraje: p.tipoMetraje, cantidad: p.cantidad,
      largoMm: p.largoMm ?? null, anchoMm: p.anchoMm ?? null }
  } catch {
    return null
  }
}

/** Una pieza pendiente de precio por artículo y acabado, con todas sus medidas. */
export interface PendientePrecio {
  articulo: string
  acabado: string
  tipoMetraje: string
  filas: FilaValorable[]
}

/** Agrupa las piezas sin PVP de todos los elementos; ignora diagnósticos ilegibles. */
export function pendientesDePrecio(resultado: Pick<ResultadoCerramientoV1, 'origenes'>): PendientePrecio[] {
  const grupos = new Map<string, PendientePrecio>()
  for (const origen of resultado.origenes) {
    for (const d of origen.diagnosticos) {
      if (d.codigo !== CODIGO_SIN_PRECIO) continue
      const p = leerPieza(d.detalle)
      if (!p) continue
      const clave = clavePrecio(p.articulo, p.acabado)
      const grupo = grupos.get(clave) ?? { articulo: p.articulo, acabado: p.acabado, tipoMetraje: p.tipoMetraje, filas: [] }
      grupo.filas.push({ cantidad: p.cantidad, largoMm: p.largoMm, anchoMm: p.anchoMm })
      grupos.set(clave, grupo)
    }
  }
  return [...grupos.values()]
}
