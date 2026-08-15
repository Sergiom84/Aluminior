export type TotalListado = string | number | null

/**
 * El total de cabecera puede ser cero aunque una línea siga incompleta.
 * La lista debe conservar esa incertidumbre, igual que el detalle y el PDF.
 */
export function textoTotalListado(
  total: TotalListado,
  tieneLineaSinValorar: boolean,
  formatear: (valor: number) => string,
): string {
  if (tieneLineaSinValorar || total === null) return 'sin valorar'
  return formatear(Number(total))
}
