/**
 * Medida nominal al estilo de la descripción de Productor: miles con punto y
 * un decimal con coma, también en cuatro cifras (`1.200,0`).
 *
 * `Intl.NumberFormat('es-ES')` no agrupa cuatro cifras (`minimumGroupingDigits`
 * por defecto es 2): `1200` saldría `1200,0`. Aquí el grupo es siempre de tres.
 */
export function formatoMedida(mm: number): string {
  if (!Number.isFinite(mm)) throw new Error('La medida no es un número finito')
  const negativo = mm < 0
  const [entera, decimal] = Math.abs(mm).toFixed(1).split('.')
  const grupos = entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${negativo ? '-' : ''}${grupos},${decimal}`
}
