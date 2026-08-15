/**
 * Referencia humana inequívoca de un presupuesto.
 *
 * Número y revisión forman juntos la identidad del documento; ocultar la
 * revisión cero o separar ambos datos permite confundir copias que conviven.
 */
export function referenciaPresupuesto(numero: number, revision: number): string {
  return `${numero} · Revisión ${revision}`
}
