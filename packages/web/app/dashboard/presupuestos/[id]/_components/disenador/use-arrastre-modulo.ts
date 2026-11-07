'use client'

import { useRef, useState, type PointerEvent, type RefObject } from 'react'
import type { AnclajeLibre } from '@aluminior/core/estructuras'
import { RADIO_CAPTURA_RELATIVO } from './anclajes-lienzo.tsx'

/** Píxeles que debe recorrer el puntero para que un clic pase a ser arrastre. */
const UMBRAL_ARRASTRE_PX = 6

export interface MovimientoLienzo {
  moduloId: string | null
  anclajes: readonly AnclajeLibre[]
  puedeMover: (id: string) => boolean
  onIniciar: (id: string) => void
  onMover: (anclaje: AnclajeLibre) => void
  onCancelar: () => void
  /** El gesto de arrastre empezó sobre un elemento que ahora no se puede mover. */
  onBloqueado?: (id: string) => void
}

const clave = (a: AnclajeLibre) => `${a.moduloId}:${a.lado}`

function puntoEnMm(svg: SVGSVGElement, x: number, y: number) {
  const matriz = svg.getScreenCTM()
  if (!matriz) return null
  const punto = svg.createSVGPoint()
  punto.x = x
  punto.y = y
  return punto.matrixTransform(matriz.inverse())
}

/**
 * Arrastre con puntero de un elemento colocado: el anclaje más próximo dentro
 * del radio de captura se resalta (ajuste magnético) y al soltar se mueve ahí.
 */
export function useArrastreModulo({ svg, movimiento, tamanoMm }: {
  svg: RefObject<SVGSVGElement | null>
  movimiento?: MovimientoLienzo
  tamanoMm: number
}) {
  const inicio = useRef<{ id: string; x: number; y: number; arrastrando: boolean; bloqueado: boolean } | null>(null)
  const [resaltado, setResaltado] = useState<string | null>(null)
  const proximo = (evento: PointerEvent) => {
    const punto = svg.current && puntoEnMm(svg.current, evento.clientX, evento.clientY)
    if (!punto || !movimiento) return null
    let mejor: AnclajeLibre | null = null
    let distancia = tamanoMm * RADIO_CAPTURA_RELATIVO
    for (const anclaje of movimiento.anclajes) {
      const d = Math.hypot(anclaje.x - punto.x, anclaje.y - punto.y)
      if (d <= distancia) { mejor = anclaje; distancia = d }
    }
    return mejor
  }
  if (!movimiento) return { resaltado: null, alPulsarModulo: () => undefined, manejadores: {} }
  return {
    resaltado,
    alPulsarModulo: (evento: PointerEvent, id: string) => {
      if (evento.button !== 0) return
      inicio.current = { id, x: evento.clientX, y: evento.clientY, arrastrando: false,
        bloqueado: !movimiento.puedeMover(id) }
    },
    manejadores: {
      onPointerMove: (evento: PointerEvent<SVGSVGElement>) => {
        const actual = inicio.current
        if (!actual) return
        if (!actual.arrastrando) {
          if (Math.hypot(evento.clientX - actual.x, evento.clientY - actual.y) < UMBRAL_ARRASTRE_PX) return
          if (actual.bloqueado) {
            inicio.current = null
            movimiento.onBloqueado?.(actual.id)
            return
          }
          actual.arrastrando = true
          svg.current?.setPointerCapture(evento.pointerId)
          movimiento.onIniciar(actual.id)
        }
        const anclaje = proximo(evento)
        setResaltado(anclaje ? clave(anclaje) : null)
      },
      onPointerUp: (evento: PointerEvent<SVGSVGElement>) => {
        const actual = inicio.current
        inicio.current = null
        setResaltado(null)
        if (!actual?.arrastrando) return
        const anclaje = proximo(evento)
        if (anclaje) movimiento.onMover(anclaje)
        else movimiento.onCancelar()
      },
      onPointerCancel: () => {
        if (inicio.current?.arrastrando) movimiento.onCancelar()
        inicio.current = null
        setResaltado(null)
      },
    },
  }
}
