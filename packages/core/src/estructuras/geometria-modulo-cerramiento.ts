import { distribuirComposicion, plantillaDiseno,
  type ElementoColocado, type RectVisual } from './diseno.ts'
import type { ModuloCerramiento } from './cerramiento.ts'
import { resolverGeometriaFi1Ofi } from './geometria-1ofi.ts'

/**
 * Adapta la geometría persistida a una caja de representación. El grosor del
 * travesaño es solo gráfico y queda centrado sobre el eje físico resuelto.
 */
export function distribuirModuloCerramiento(
  modulo: ModuloCerramiento,
  rect: RectVisual,
  grosorSeparador = 12,
): ElementoColocado[] {
  const plantilla = plantillaDiseno(modulo.estructuraCodigo)
  if (!plantilla) return []
  if (plantilla.codigo !== '1OFI' || !Object.hasOwn(modulo, 'fiMm')) {
    return distribuirComposicion(plantilla.composicion, rect, grosorSeparador)
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
