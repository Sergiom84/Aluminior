/** Qué hay cada día del mes: trabajos de la agenda y tareas pendientes. */
export interface MarcasDia {
  trabajos: number
  tareas: number
}

export function marcasPorDia(
  eventos: readonly { dia: string }[],
  notas: readonly { dia: string | null; hecha: boolean }[],
): Map<string, MarcasDia> {
  const marcas = new Map<string, MarcasDia>()
  const de = (dia: string) => {
    let actual = marcas.get(dia)
    if (!actual) {
      actual = { trabajos: 0, tareas: 0 }
      marcas.set(dia, actual)
    }
    return actual
  }
  for (const evento of eventos) de(evento.dia).trabajos += 1
  for (const nota of notas) {
    if (nota.dia && !nota.hecha) de(nota.dia).tareas += 1
  }
  return marcas
}
