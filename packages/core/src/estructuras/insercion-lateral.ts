import type { ConfiguracionCerramiento } from './cerramiento.ts'
import { anclajesLibresCerramiento, type AnclajeLibre } from './composicion-cerramiento.ts'

/**
 * Anclaje por defecto para seguir componiendo a los lados, que es como se
 * compone en la práctica (indicación del operador, 26/09/2026): el anclaje
 * derecho libre más alto y, a igual altura, el más a la derecha. En una fila
 * de ventanas es siempre el extremo derecho de la fila superior.
 */
export function anclajeLateral(configuracion: ConfiguracionCerramiento): AnclajeLibre | null {
  return anclajesLibresCerramiento(configuracion)
    .filter((anclaje) => anclaje.lado === 'derecha')
    .sort((a, b) => a.y - b.y || b.x - a.x)[0] ?? null
}

/** Dos extremos físicos del conjunto; el origen sigue siendo el primer módulo. */
export function anclajesExtremosCerramiento(configuracion: ConfiguracionCerramiento): AnclajeLibre[] {
  const libres = anclajesLibresCerramiento(configuracion, true)
  const izquierda = libres.filter(a => a.lado === 'izquierda').sort((a, b) => a.x - b.x || a.y - b.y)[0]
  const derecha = libres.filter(a => a.lado === 'derecha').sort((a, b) => b.x - a.x || a.y - b.y)[0]
  return [izquierda, derecha].filter((a): a is AnclajeLibre => Boolean(a))
}
