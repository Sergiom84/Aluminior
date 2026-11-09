/** 5 es más urgente que 1. Lo hecho queda debajo, sin perderse. */
export function ordenarNotas<T extends { urgencia: number; hecha: boolean; creadoEn: string }>(
  notas: readonly T[],
): T[] {
  return [...notas].sort((a, b) =>
    Number(a.hecha) - Number(b.hecha)
    || b.urgencia - a.urgencia
    || (a.creadoEn < b.creadoEn ? 1 : a.creadoEn > b.creadoEn ? -1 : 0))
}
