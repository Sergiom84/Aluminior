/** Valor guardado → etiqueta del CHM (guardado = número del CHM − 1, hipótesis del plan M1). */
export const TIPOS_UNION = [
  ['0', '1 Recto'],
  ['1', '2 Abatible-Corredera'],
  ['2', '3 90º'],
  ['3', '4 Regulable (Tubo)'],
  ['4', '5 Regulable (Macho-Hembra)'],
] as const

export function etiquetaTipoUnion(tipo: number | undefined | null): string {
  return TIPOS_UNION.find(([valor]) => Number(valor) === tipo)?.[1] ?? ''
}
