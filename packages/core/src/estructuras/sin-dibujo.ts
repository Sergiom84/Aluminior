/**
 * Estructuras de catálogo que el motor sabe valorar y el dibujo aún no.
 * No son una plantilla visual: no se les inventa hoja, marco ni apertura.
 */
export interface EstructuraSinDibujo {
  readonly codigo: string
  readonly descripcion: string
  readonly anchoMm: number
  readonly altoMm: number
}

let registro: readonly EstructuraSinDibujo[] = []

const codigoComparable = (codigo: string) => codigo.trim().toUpperCase().replace(/\s+/g, '')

export function registrarEstructurasSinDibujo(lista: readonly EstructuraSinDibujo[]): void {
  registro = lista.map((item) => ({
    codigo: codigoComparable(item.codigo),
    descripcion: item.descripcion,
    anchoMm: item.anchoMm,
    altoMm: item.altoMm,
  }))
}

export function estructuraSinDibujo(codigo: string): EstructuraSinDibujo | null {
  const buscado = codigoComparable(codigo)
  if (!buscado) return null
  return registro.find((item) => item.codigo === buscado) ?? null
}

export function estructurasSinDibujo(): readonly EstructuraSinDibujo[] {
  return registro
}
