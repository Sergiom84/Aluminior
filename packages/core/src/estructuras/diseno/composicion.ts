import { division, hijo } from './constructores.ts'
import type { DivisionVisual, ElementoColocado, HuecoVisual, NodoVisual, RectVisual, UnionVisual } from './tipos.ts'

/**
 * Convierte el árbol en rectángulos de dibujo. El grosor es visual; las cotas
 * de fabricación siguen viviendo en el modelo de despiece.
 */
export function distribuirComposicion(
  nodo: NodoVisual,
  rect: RectVisual,
  grosorSeparador = 12,
): ElementoColocado[] {
  if (nodo.tipo === 'hueco') return [{
    ...rect, ...nodo, manilla: nodo.apertura !== 'fijo' && (nodo.manilla ?? true),
  }]
  if (nodo.hijos.length === 0) return []

  const grosor = nodo.separador === 'division-invisible' ? 2 : grosorSeparador
  const totalSeparadores = grosor * Math.max(0, nodo.hijos.length - 1)
  const longitud = nodo.eje === 'vertical' ? rect.ancho : rect.alto
  const disponible = Math.max(0, longitud - totalSeparadores)
  const totalProporcion = nodo.hijos.reduce(
    (suma, actual) => suma + Math.max(0, actual.proporcion), 0,
  )
  if (totalProporcion === 0) return []

  const elementos: ElementoColocado[] = []
  let cursor = nodo.eje === 'vertical' ? rect.x : rect.y

  nodo.hijos.forEach((actual, indice) => {
    const ultimo = indice === nodo.hijos.length - 1
    const finalRect = nodo.eje === 'vertical' ? rect.x + rect.ancho : rect.y + rect.alto
    const medida = ultimo
      ? finalRect - cursor
      : disponible * Math.max(0, actual.proporcion) / totalProporcion
    const hijoRect: RectVisual = nodo.eje === 'vertical'
      ? { x: cursor, y: rect.y, ancho: medida, alto: rect.alto }
      : { x: rect.x, y: cursor, ancho: rect.ancho, alto: medida }
    elementos.push(...distribuirComposicion(actual.nodo, hijoRect, grosorSeparador))
    cursor += medida

    if (!ultimo) {
      elementos.push(nodo.eje === 'vertical'
        ? {
          tipo: 'separador', id: `${nodo.id}-${indice + 1}`, eje: nodo.eje,
          clase: nodo.separador, x: cursor, y: rect.y, ancho: grosor, alto: rect.alto,
        }
        : {
          tipo: 'separador', id: `${nodo.id}-${indice + 1}`, eje: nodo.eje,
          clase: nodo.separador, x: rect.x, y: cursor, ancho: rect.ancho, alto: grosor,
        })
      cursor += grosor
    }
  })
  return elementos
}

export function primerHueco(nodo: NodoVisual): HuecoVisual {
  if (nodo.tipo === 'hueco') return nodo
  for (const actual of nodo.hijos) {
    const encontrado = primerHueco(actual.nodo)
    if (encontrado) return encontrado
  }
  throw new Error('La composición no contiene huecos')
}

export function buscarHueco(nodo: NodoVisual, id: string): HuecoVisual | null {
  if (nodo.tipo === 'hueco') return nodo.id === id ? nodo : null
  for (const actual of nodo.hijos) {
    const encontrado = buscarHueco(actual.nodo, id)
    if (encontrado) return encontrado
  }
  return null
}

/** Compone dos cerramientos independientes mediante una unión de catálogo. */
export function unirCerramientos(
  izquierda: NodoVisual,
  derecha: NodoVisual,
  union: UnionVisual,
): DivisionVisual {
  return division(`union-${union.codigo}`, 'vertical', 'union', [
    hijo(izquierda), hijo(derecha),
  ])
}
