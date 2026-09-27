import { division, hijo, hueco } from './constructores.ts'
import type { NodoVisual, PlantillaDiseno } from './tipos.ts'

/** Rejillas equidistantes acreditadas por los árboles EMP0016; no se descifra el código. */
function rejilla(filas: number, columnas: number, prefijo = 'fijo'): NodoVisual {
  const fila = (indice: number): NodoVisual => columnas === 1
    ? hueco(`${prefijo}-${indice}-1`, 'fijo')
    : division(`${prefijo}-columnas-${indice}`, 'vertical', 'travesano',
      Array.from({ length: columnas }, (_, c) => hijo(hueco(`${prefijo}-${indice}-${c + 1}`, 'fijo'))))
  return filas === 1 ? fila(1) : division(`${prefijo}-filas`, 'horizontal', 'travesano',
    Array.from({ length: filas }, (_, f) => hijo(fila(f + 1))))
}

/** Lista de admisión compacta; la evidencia completa se regenera localmente, no se versiona. */
const verificados = [
  ['03H', 'FIJO DE 3 HUECOS HORIZONTALES', '005', 1200, 1200, 3, 1],
  ['03V', 'FIJO DE 3 HUECOS VERTICALES', '005', 1200, 1200, 1, 3],
  ['06', 'FIJO DE 6 HUECOS (2X3)', '005', 800, 1200, 3, 2],
  ['CF', 'FIJO PERIMETRAL INDEPENDIENTE DE CORREDERA', '009', 1200, 300, 1, 1],
  ['CFT', 'FIJO PERIMETRAL INDEPENDIENTE DE CORREDERA CON PARTELUZ', '009', 1200, 300, 1, 2],
  ['FC', 'FIJO CORREDERA NO PERIMETRAL', '009', 1200, 300, 1, 1],
] as const

export const FIJOS_CATALOGO: readonly PlantillaDiseno[] = verificados.map(
  ([codigo, descripcion, familiaCodigo, anchoMm, altoMm, filas, columnas]) => ({
    codigo, descripcion, familiaCodigo, anchoMm, altoMm, familia: 'FIJOS',
    composicion: rejilla(filas, columnas),
  }),
)
