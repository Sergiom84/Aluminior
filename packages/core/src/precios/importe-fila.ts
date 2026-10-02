/**
 * Importe de una fila de despiece tal como lo guarda Productor.
 *
 * Contrastado con las 21.195 hijas valoradas de las facturas 2026 (fase-7/06):
 * - UD: metraje = cantidad (100 %).
 * - ML: metraje = cantidad × metros de la pieza redondeados a 2 decimales
 *   (99,6 %; las diferencias son barrotillos de diseño).
 * - M2: cada lado al múltiplo en cm hacia arriba, superficie a 2 decimales,
 *   mínimo, y porcentaje de `ArticulosIncrPrecio`: MET por metraje unitario,
 *   MED por el lado mayor (96,2 %).
 * El importe se redondea a céntimos por fila. Sin PVP no hay importe.
 *
 * `valorarDespiece` agrega por artículo antes de redondear y conserva su uso;
 * esta función reproduce la fila del documento de Productor.
 */

export interface IncrementoPrecio {
  tipo: 'MET' | 'MED'
  desde: number
  hasta: number
  porcentaje: number
}

export interface ArticuloTarifado {
  tipoMetraje: string
  pvp: number | null
  multiploLargoCm: number
  multiploAnchoCm: number
  minimo: number
  incrementos: readonly IncrementoPrecio[]
}

export interface FilaValorable {
  cantidad: number
  largoMm: number | null
  anchoMm: number | null
}

export interface ImporteFila {
  metraje: number | null
  importe: number | null
  incidencia: string | null
}

export const redondearCentimos = (x: number) => Math.round((x + Math.sign(x) * 1e-9) * 100) / 100
const alMultiplo = (mm: number, cm: number) => cm > 0 ? Math.ceil(mm / (cm * 10) - 1e-9) * cm * 10 : mm

function metrajeSuperficie(fila: FilaValorable, a: ArticuloTarifado): number {
  const l = alMultiplo(fila.largoMm!, a.multiploLargoCm)
  const w = alMultiplo(fila.anchoMm!, a.multiploAnchoCm)
  let m = redondearCentimos(l * w / 1e6)
  if (a.minimo > 0 && m < a.minimo) m = a.minimo
  const ladoMayor = Math.max(fila.largoMm!, fila.anchoMm!)
  let porcentaje = 0
  for (const i of a.incrementos) {
    const valor = i.tipo === 'MET' ? m : ladoMayor
    if (valor >= i.desde && valor <= i.hasta) porcentaje += i.porcentaje
  }
  return m * (1 + porcentaje / 100)
}

export function importeFila(fila: FilaValorable, articulo: ArticuloTarifado | null): ImporteFila {
  if (!articulo) return { metraje: null, importe: null, incidencia: 'artículo ausente del catálogo' }
  let metraje: number
  switch (articulo.tipoMetraje) {
    case 'UD':
      metraje = fila.cantidad
      break
    case 'ML':
      if (fila.largoMm === null || !(fila.largoMm > 0)) return { metraje: null, importe: null, incidencia: 'sin largo' }
      if (articulo.minimo > 0 || articulo.multiploLargoCm > 0) {
        return { metraje: null, importe: null, incidencia: 'mínimo o múltiplo por metro sin contrastar' }
      }
      metraje = fila.cantidad * redondearCentimos(fila.largoMm / 1000)
      break
    case 'M2':
      if (fila.largoMm === null || fila.anchoMm === null || !(fila.largoMm > 0) || !(fila.anchoMm > 0)) {
        return { metraje: null, importe: null, incidencia: 'sin superficie' }
      }
      metraje = fila.cantidad * metrajeSuperficie(fila, articulo)
      break
    default:
      return { metraje: null, importe: null, incidencia: `tipo de metraje ${articulo.tipoMetraje} sin contrastar` }
  }
  if (articulo.pvp === null) return { metraje, importe: null, incidencia: 'sin PVP en la tarifa' }
  return { metraje, importe: redondearCentimos(articulo.pvp * metraje), incidencia: null }
}
