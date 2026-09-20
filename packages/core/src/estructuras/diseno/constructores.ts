import type { AperturaVisual, ClaseSeparador, DivisionVisual, EjeDivision, HijoVisual, HuecoVisual, NodoVisual } from './tipos.ts'

export const hueco = (id: string, apertura: AperturaVisual, manilla?: boolean): HuecoVisual => ({
  tipo: 'hueco', id, apertura, ...(manilla === undefined ? {} : { manilla }),
})

export const division = (
  id: string,
  eje: EjeDivision,
  separador: ClaseSeparador,
  hijos: readonly HijoVisual[],
): DivisionVisual => ({ tipo: 'division', id, eje, separador, hijos })

export const hijo = (nodo: NodoVisual, proporcion = 1): HijoVisual => ({ nodo, proporcion })
