export function hrefDia(dia: string, mes = dia.slice(0, 7)): string {
  return `/dashboard?dia=${encodeURIComponent(dia)}&mes=${encodeURIComponent(mes)}`
}
