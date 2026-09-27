import { distribuirComposicion } from './diseno/composicion.ts'
import type { ElementoColocado, NodoVisual, RectVisual } from './diseno/tipos.ts'

export interface GeometriaComposicion {
  nodo: NodoVisual
  /** Coordenadas físicas, sin descontar el grosor gráfico de los separadores. */
  rect: RectVisual
  hijos: readonly GeometriaComposicion[]
}

export type ResultadoGeometriaComposicion =
  | { valido: true; geometria: GeometriaComposicion }
  | { valido: false; motivo: 'ancho-invalido' | 'alto-invalido' |
      'composicion-invalida' | 'cota-invalida' | 'cota-fuera-de-rango' }

const positiva = (valor: unknown): valor is number =>
  typeof valor === 'number' && Number.isFinite(valor) && valor > 0

function resolverNodo(nodo: NodoVisual, rect: RectVisual): ResultadoGeometriaComposicion {
  const tieneCota = Object.hasOwn(nodo, 'cotaFija')
  if (nodo.tipo === 'hueco') return tieneCota
    ? { valido: false, motivo: 'cota-invalida' }
    : { valido: true, geometria: { nodo, rect, hijos: [] } }
  if ((nodo.eje !== 'horizontal' && nodo.eje !== 'vertical') ||
      !nodo.hijos.length || nodo.hijos.some(hijo => !positiva(hijo.proporcion))) {
    return { valido: false, motivo: 'composicion-invalida' }
  }
  const vertical = nodo.eje === 'vertical'
  const longitud = vertical ? rect.ancho : rect.alto
  const total = nodo.hijos.reduce((suma, hijo) => suma + hijo.proporcion, 0)
  if (!Number.isFinite(total)) return { valido: false, motivo: 'composicion-invalida' }
  let medidas = nodo.hijos.map(hijo => longitud * (hijo.proporcion / total))
  if (tieneCota) {
    const cota = nodo.cotaFija
    if (!cota || nodo.hijos.length !== 2 ||
        (cota.desde !== 'inicio' && cota.desde !== 'fin') || !positiva(cota.mm)) {
      return { valido: false, motivo: 'cota-invalida' }
    }
    if (cota.mm >= longitud) return { valido: false, motivo: 'cota-fuera-de-rango' }
    medidas = cota.desde === 'inicio' ? [cota.mm, longitud - cota.mm] : [longitud - cota.mm, cota.mm]
  }
  let cursor = vertical ? rect.x : rect.y
  const hijos: GeometriaComposicion[] = []
  for (const [indice, hijo] of nodo.hijos.entries()) {
    const medida = medidas[indice]
    if (!positiva(medida)) return { valido: false, motivo: 'composicion-invalida' }
    const hijoRect = vertical
      ? { x: cursor, y: rect.y, ancho: medida, alto: rect.alto }
      : { x: rect.x, y: cursor, ancho: rect.ancho, alto: medida }
    const resuelto = resolverNodo(hijo.nodo, hijoRect)
    if (!resuelto.valido) return resuelto
    hijos.push(resuelto.geometria)
    cursor += medida
  }
  return { valido: true, geometria: { nodo, rect, hijos } }
}

/** Resuelve cada cota desde el contenedor físico de su propia división. */
export function resolverGeometriaComposicion(
  nodo: NodoVisual, anchoMm: unknown, altoMm: unknown,
): ResultadoGeometriaComposicion {
  if (!positiva(anchoMm)) return { valido: false, motivo: 'ancho-invalido' }
  if (!positiva(altoMm)) return { valido: false, motivo: 'alto-invalido' }
  return resolverNodo(nodo, { x: 0, y: 0, ancho: anchoMm, alto: altoMm })
}

function contieneCota(geometria: GeometriaComposicion): boolean {
  return Object.hasOwn(geometria.nodo, 'cotaFija') || geometria.hijos.some(contieneCota)
}

/** Limita el trazo en huecos muy pequeños sin mover ningún eje físico. */
function medidaMinima(geometria: GeometriaComposicion, eje: 'ancho' | 'alto'): number {
  return geometria.hijos.length
    ? Math.min(...geometria.hijos.map(hijo => medidaMinima(hijo, eje)))
    : geometria.rect[eje]
}

interface Proyeccion {
  x: number
  y: number
  escalaX: number
  escalaY: number
  grosorX: number
  grosorY: number
}

function dibujarNodo(geometria: GeometriaComposicion, rect: RectVisual, p: Proyeccion): ElementoColocado[] {
  const { nodo, hijos } = geometria
  if (nodo.tipo === 'hueco') return [{
    ...rect, ...nodo, manilla: nodo.apertura !== 'fijo' && (nodo.manilla ?? true),
  }]
  const vertical = nodo.eje === 'vertical'
  const grosorMaximo = vertical ? p.grosorX : p.grosorY
  const grosor = nodo.separador === 'division-invisible' ? Math.min(2, grosorMaximo) : grosorMaximo
  const elementos: ElementoColocado[] = []
  let cursor = vertical ? rect.x : rect.y
  for (const [indice, hijo] of hijos.entries()) {
    const ultimo = indice === hijos.length - 1
    const eje = vertical
      ? p.x + (hijo.rect.x + hijo.rect.ancho) * p.escalaX
      : p.y + (hijo.rect.y + hijo.rect.alto) * p.escalaY
    const fin = ultimo ? (vertical ? rect.x + rect.ancho : rect.y + rect.alto) : eje - grosor / 2
    const medida = Math.max(0, fin - cursor)
    const hijoRect = vertical
      ? { x: cursor, y: rect.y, ancho: medida, alto: rect.alto }
      : { x: rect.x, y: cursor, ancho: rect.ancho, alto: medida }
    elementos.push(...dibujarNodo(hijo, hijoRect, p))
    if (!ultimo) elementos.push({
      tipo: 'separador', id: `${nodo.id}-${indice + 1}`, eje: nodo.eje, clase: nodo.separador,
      ...(vertical
        ? { x: eje - grosor / 2, y: rect.y, ancho: grosor, alto: rect.alto }
        : { x: rect.x, y: eje - grosor / 2, ancho: rect.ancho, alto: grosor }),
    })
    cursor = eje + grosor / 2
  }
  return elementos
}

/** Proyecta cotas absolutas; mantiene el reparto histórico en árboles sin cota. */
export function distribuirComposicionAcotada(
  nodo: NodoVisual,
  dimensiones: { anchoMm: number; altoMm: number },
  rect: RectVisual,
  grosorSeparador = 12,
): ElementoColocado[] {
  const resultado = resolverGeometriaComposicion(nodo, dimensiones.anchoMm, dimensiones.altoMm)
  if (!resultado.valido || !positiva(rect.ancho) || !positiva(rect.alto) ||
      !Number.isFinite(rect.x) || !Number.isFinite(rect.y) ||
      !Number.isFinite(grosorSeparador) || grosorSeparador < 0) return []
  if (!contieneCota(resultado.geometria)) return distribuirComposicion(nodo, rect, grosorSeparador)
  const escalaX = rect.ancho / dimensiones.anchoMm
  const escalaY = rect.alto / dimensiones.altoMm
  return dibujarNodo(resultado.geometria, rect, {
    x: rect.x, y: rect.y, escalaX, escalaY,
    grosorX: Math.min(grosorSeparador, medidaMinima(resultado.geometria, 'ancho') * escalaX),
    grosorY: Math.min(grosorSeparador, medidaMinima(resultado.geometria, 'alto') * escalaY),
  })
}
