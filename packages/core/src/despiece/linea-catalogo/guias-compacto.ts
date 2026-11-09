/**
 * Guías de persiana del compacto (`VAccesorios.CerrCodGuiaI/D`).
 *
 * En Productor la guía es un conjunto de la familia 051 (GMG001-GMG014,
 * PSG001-PSG011) cuyo componente `GP` es el perfil. Regla tomada del único caso
 * con guías de EMP0016 (presupuesto 970, copiado en 1034, albarán 280 y factura
 * 365): cuatro C2 de 1.600 de alto con COM005, cajón 155 y GMG010. Cada lado da
 * 1 × `GM6805L` a metro lineal de 1.445 mm (alto del compacto − cajón, funciones
 * GUIAIZ y GUIADE) y 5 minutos de `MOCOMP`.
 *
 * Sin contrastar todavía: otra guía, otra altura, el efecto de `DescuentoGuia`
 * y el origen de los 5 minutos. Por eso la línea se valora con aviso.
 */

import { fila, parcialVacio, type DespieceParcial } from './parcial.ts'
import type { CatalogoLinea, CompactoLineaCatalogo } from './tipos.ts'

export const MINUTOS_MANO_OBRA_GUIA = 5
export const ARTICULO_MANO_OBRA_COMPACTO = 'MOCOMP'
export const AVISO_GUIAS_SIN_CONTRASTE =
  'guías valoradas con la regla de un solo presupuesto de Productor (alto de la ventana y 5 min por guía), pendiente de contraste'

export function despiezarGuiasCompacto(
  catalogo: CatalogoLinea,
  compacto: CompactoLineaCatalogo,
  largoCompactoMm: number,
): DespieceParcial {
  const r = parcialVacio()
  const lados = [
    { conjunto: compacto.guiaIzquierda?.trim().toUpperCase(), funcion: 'GUIAIZ' },
    { conjunto: compacto.guiaDerecha?.trim().toUpperCase(), funcion: 'GUIADE' },
  ].filter((lado): lado is { conjunto: string; funcion: string } => Boolean(lado.conjunto))
  if (!lados.length) return r
  const largoMm = largoCompactoMm - compacto.altoCajonMm
  for (const lado of lados) {
    const articulo = catalogo.articuloGuia?.(lado.conjunto) ?? null
    if (!articulo) { r.incidencias.push(`guía ${lado.conjunto} sin perfil en el catálogo`); continue }
    r.filas.push(fila({
      origen: 'compacto', articulo, acabado: compacto.acabado, cantidad: 1, funcion: lado.funcion, largoMm,
    }))
    r.filas.push(fila({
      origen: 'compacto', articulo: ARTICULO_MANO_OBRA_COMPACTO, acabado: 'UNI',
      cantidad: MINUTOS_MANO_OBRA_GUIA, largoMm: null,
    }))
  }
  if (r.filas.length) r.avisos.push(AVISO_GUIAS_SIN_CONTRASTE)
  return r
}
