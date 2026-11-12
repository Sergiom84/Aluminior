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
 *
 * Contrastado en Productor el 12/11/2026 (empresa de pruebas, presupuesto 260504):
 * GMG010 a ambos lados con alto 1.200 y cajón 155 da 2 × `GM6805L` de 1.045 y
 * 5 + 5 minutos; PSG002 solo a la izquierda con alto 1.700 y cajón 185 da
 * 1 × `PSG100` de 1.515 y 5 minutos. El estrechamiento de la ventana
 * (`DescuentoGuia`) está en `estructuras/descuento-guias.ts`.
 */

import { fila, parcialVacio, type DespieceParcial } from './parcial.ts'
import type { CatalogoLinea, CompactoLineaCatalogo } from './tipos.ts'

export const MINUTOS_MANO_OBRA_GUIA = 5
export const ARTICULO_MANO_OBRA_COMPACTO = 'MOCOMP'

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
  return r
}
