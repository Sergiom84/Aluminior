import type { FilaDespieceCatalogo } from './tipos.ts'

/** Resultado intermedio de una etapa del despiece, antes de valorar. */
export interface DespieceParcial {
  filas: FilaDespieceCatalogo[]
  incidencias: string[]
  avisos: string[]
}

export const parcialVacio = (): DespieceParcial => ({ filas: [], incidencias: [], avisos: [] })

export function fila(parcial: Omit<FilaDespieceCatalogo, 'metraje' | 'importe' | 'anchoMm' | 'funcion'> &
  Partial<Pick<FilaDespieceCatalogo, 'anchoMm' | 'funcion'>>): FilaDespieceCatalogo {
  return { anchoMm: null, funcion: null, ...parcial, metraje: null, importe: null }
}
