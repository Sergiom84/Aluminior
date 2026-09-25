'use client'

import React, { useState, type DragEvent, type RefObject } from 'react'
import {
  anclajeLibreMasProximo, anclajesLibresCerramiento, type AnclajeLibre, type ConfiguracionCerramiento,
} from '@aluminior/core/estructuras'

/**
 * Radio de captura: Productor ajustó al anclaje libre más próximo un soltado
 * dentro de un elemento y descartó uno alejado. El umbral exacto no se midió.
 */
export const RADIO_CAPTURA_RELATIVO = .35

const clave = (anclaje: Pick<AnclajeLibre, 'moduloId' | 'lado'>) => `${anclaje.moduloId}:${anclaje.lado}`

function puntoEnMm(svg: SVGSVGElement, x: number, y: number) {
  const matriz = svg.getScreenCTM()
  if (!matriz) return null
  const punto = svg.createSVGPoint()
  punto.x = x
  punto.y = y
  return punto.matrixTransform(matriz.inverse())
}

export function useSoltarEnLienzo({ svg, configuracion, activa, tamanoMm, onInsertar }: {
  svg: RefObject<SVGSVGElement | null>
  configuracion: ConfiguracionCerramiento
  activa: boolean
  tamanoMm: number
  onInsertar: (anclaje: AnclajeLibre) => void
}) {
  const [resaltado, setResaltado] = useState<string | null>(null)
  const localizar = (evento: DragEvent) => {
    const punto = svg.current && puntoEnMm(svg.current, evento.clientX, evento.clientY)
    return punto ? anclajeLibreMasProximo(configuracion, punto, tamanoMm * RADIO_CAPTURA_RELATIVO) : null
  }
  if (!activa) return { resaltado: null, manejadores: {} }
  return {
    resaltado,
    manejadores: {
      onDragOver: (evento: DragEvent<SVGSVGElement>) => {
        evento.preventDefault()
        const anclaje = localizar(evento)
        evento.dataTransfer.dropEffect = anclaje ? 'copy' : 'none'
        setResaltado(anclaje ? clave(anclaje) : null)
      },
      onDragLeave: () => setResaltado(null),
      onDrop: (evento: DragEvent<SVGSVGElement>) => {
        evento.preventDefault()
        const anclaje = localizar(evento)
        setResaltado(null)
        if (anclaje) onInsertar(anclaje)
      },
    },
  }
}

export function AnclajesLienzo({ configuracion, radioMm, resaltado, onInsertar }: {
  configuracion: ConfiguracionCerramiento
  radioMm: number
  resaltado: string | null
  onInsertar: (anclaje: AnclajeLibre) => void
}) {
  return <g className="al-anclajes">
    {anclajesLibresCerramiento(configuracion).map((anclaje) => {
      const indice = configuracion.modulos.findIndex((modulo) => modulo.id === anclaje.moduloId)
      return (
        <g key={clave(anclaje)} role="button" tabIndex={0} className="al-anclaje"
          data-resaltado={resaltado === clave(anclaje) || undefined}
          aria-label={`Insertar ${anclaje.lado === 'derecha' ? 'a la derecha' : 'debajo'} del elemento ${indice}`}
          onClick={(evento) => { evento.stopPropagation(); onInsertar(anclaje) }}
          onKeyDown={(evento) => {
            if (evento.key !== 'Enter' && evento.key !== ' ') return
            evento.preventDefault()
            evento.stopPropagation()
            onInsertar(anclaje)
          }}>
          <circle cx={anclaje.x} cy={anclaje.y} r={radioMm * 2.2} className="al-anclaje-zona" />
          <circle cx={anclaje.x} cy={anclaje.y} r={radioMm} className="al-anclaje-punto" />
        </g>
      )
    })}
  </g>
}
