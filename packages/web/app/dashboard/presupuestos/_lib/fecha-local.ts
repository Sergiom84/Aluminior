/**
 * Fecha comercial del documento en Europe/Madrid, no en UTC (T.72.1.2).
 *
 * `new Date().toISOString().slice(0, 10)` da la fecha UTC: de noche en verano
 * (UTC+2) o en invierno (UTC+1), ya es el día siguiente en Madrid y esa fecha
 * UTC queda un día atrasada. Se extrae por `formatToParts` en vez de
 * `Intl.DateTimeFormat.format`: el resultado no depende del orden ni del
 * separador de ningún locale, así que no hay formato ambiguo que evitar.
 */

const PARTES_MADRID = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
})

export function fechaLocalMadrid(instante: Date = new Date()): string {
  const partes = PARTES_MADRID.formatToParts(instante)
  const parte = (tipo: 'year' | 'month' | 'day') => partes.find((p) => p.type === tipo)?.value ?? ''
  return `${parte('year')}-${parte('month')}-${parte('day')}`
}
