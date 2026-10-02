import type { PartidaValoracionCerramiento, RedondeoVentaCerramiento } from './tipos.ts'

export interface EtapasVentaCerramiento {
  materiales: string
  conVidrio: string
  acristalamiento: string
  total: string
}

/** Protocolo heredado ESTRUCTURA_NUMBER_V1, sin corregir sus bordes binarios.
 * importeExacto es evidencia decimal; el motor comercial actual multiplica Number.
 * El orden de partidas se conserva dentro de cada etapa.
 *
 * FILA_CENTIMOS: cada partida es una fila del despiece de Productor y su
 * importe se redondea a céntimos antes de sumar, como en el documento original
 * (fase-7/06, hijas de factura 2026).
 */
export function etapasVentaCerramiento(
  partidas: readonly PartidaValoracionCerramiento[],
  redondeo: RedondeoVentaCerramiento = 'ESTRUCTURA_NUMBER_V1',
): EtapasVentaCerramiento | null {
  if (partidas.some(p => p.incidencia !== null || p.cantidadFacturable === null ||
    p.precioUnitario === null)) return null
  const fila = (n: number) => redondeo === 'FILA_CENTIMOS' ? Math.round((n + Math.sign(n) * 1e-9) * 100) / 100 : n
  const suma = (grupo: PartidaValoracionCerramiento['grupoValoracion']) => partidas
    .filter(p => p.grupoValoracion === grupo)
    .reduce((n, p) => n + fila(Number(p.cantidadFacturable) * Number(p.precioUnitario)), 0)
  const redondear = (n: number) => Math.round(n * 100) / 100
  const materiales = redondear(suma('MATERIALES'))
  const conVidrio = redondear(materiales + suma('VIDRIO'))
  const acristalamiento = redondear(suma('ACRISTALAMIENTO'))
  const total = redondear(conVidrio + acristalamiento)
  if (![materiales, conVidrio, acristalamiento, total].every(Number.isFinite)) return null
  return { materiales: materiales.toFixed(2), conVidrio: conVidrio.toFixed(2),
    acristalamiento: acristalamiento.toFixed(2), total: total.toFixed(2) }
}
