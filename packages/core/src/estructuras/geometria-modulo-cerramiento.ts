import { plantillaDiseno,
  type ElementoColocado, type NodoVisual, type RectVisual } from './diseno.ts'
import type { ModuloCerramiento } from './cerramiento.ts'
import { cotasEfectivasModulo } from './cotas-cerramiento.ts'
import { composicionVisualDisenoPropio } from './diseno-propio-cerramiento.ts'
import { resolverGeometriaFi1Ofi } from './geometria-1ofi.ts'
import { distribuirComposicionAcotada } from './geometria-composicion.ts'

/**
 * Lleva FI/FS de la línea al travesaño horizontal acotado de la plantilla:
 * `cotaFija` desde el fin es FI (desde abajo) y desde el inicio es FS (desde
 * arriba), la misma regla con la que se siembra el diseño propio. Sin cota de
 * línea se conserva la de plantilla.
 */
export function composicionConCotasModulo(
  composicion: NodoVisual,
  cotas: Readonly<Record<string, number>> | null,
): NodoVisual {
  if (!cotas || composicion.tipo !== 'division') return composicion
  const simbolo = composicion.eje === 'horizontal' && composicion.cotaFija
    ? (composicion.cotaFija.desde === 'fin' ? 'FI' : 'FS') : null
  const mm = simbolo ? cotas[simbolo] : undefined
  const hijos = composicion.hijos.map(hijo => {
    const nodo = composicionConCotasModulo(hijo.nodo, cotas)
    return nodo === hijo.nodo ? hijo : { ...hijo, nodo }
  })
  const cambiaCota = typeof mm === 'number' && Number.isFinite(mm) && mm !== composicion.cotaFija!.mm
  if (!cambiaCota && hijos.every((hijo, indice) => hijo === composicion.hijos[indice])) return composicion
  return {
    ...composicion, hijos,
    ...(cambiaCota ? { cotaFija: { ...composicion.cotaFija!, mm: mm! } } : {}),
  }
}

/**
 * Adapta la geometría persistida a una caja de representación. El grosor del
 * travesaño es solo gráfico y queda centrado sobre el eje físico resuelto.
 */
export function distribuirModuloCerramiento(
  modulo: ModuloCerramiento,
  rect: RectVisual,
  grosorSeparador = 12,
): ElementoColocado[] {
  if (modulo.disenoPropio) {
    const composicion = composicionVisualDisenoPropio(modulo.disenoPropio, cotasEfectivasModulo(modulo))
    if (!composicion) return []
    return distribuirComposicionAcotada(composicion, modulo, rect, grosorSeparador)
  }
  const plantilla = plantillaDiseno(modulo.estructuraCodigo)
  if (!plantilla) return []
  if (plantilla.codigo !== '1OFI' || !Object.hasOwn(modulo, 'fiMm')) {
    const composicion = composicionConCotasModulo(plantilla.composicion, cotasEfectivasModulo(modulo))
    return distribuirComposicionAcotada(composicion, modulo, rect, grosorSeparador)
  }

  const geometria = resolverGeometriaFi1Ofi(modulo.anchoMm, modulo.altoMm, modulo.fiMm)
  if (!geometria.valido) return []
  const escalaY = rect.alto / modulo.altoMm
  const ejeY = rect.y + geometria.ejeY * escalaY
  const grosor = Math.min(grosorSeparador, 2 * (ejeY - rect.y),
    2 * (rect.y + rect.alto - ejeY))
  const ySeparador = ejeY - grosor / 2
  const yInferior = ejeY + grosor / 2
  return [
    {
      tipo: 'hueco', id: 'hoja-superior', apertura: 'oscilobatiente-izquierda', manilla: true,
      x: rect.x, y: rect.y, ancho: rect.ancho, alto: ySeparador - rect.y,
    },
    {
      tipo: 'separador', id: 'travesano-fi-1', eje: 'horizontal', clase: 'travesano',
      x: rect.x, y: ySeparador, ancho: rect.ancho, alto: grosor,
    },
    {
      tipo: 'hueco', id: 'fijo-inferior', apertura: 'fijo', manilla: false,
      x: rect.x, y: yInferior, ancho: rect.ancho, alto: rect.y + rect.alto - yInferior,
    },
  ]
}
