'use client'

import { useState } from 'react'
import {
  anclajesParaMover, moverModuloCerramiento, type AnclajeLibre, type ConfiguracionCerramiento,
} from '@aluminior/core/estructuras'

export const AVISO_MOVER_PENDIENTE = 'Pulsa Actualizar o Descartar cambios antes de mover el elemento.'

/**
 * Recolocar un elemento ya colocado en otro anclaje (DS2): con el botón del
 * panel o arrastrándolo en el lienzo. Los que colgaban de él se quedan fijos.
 * Con cambios sin actualizar no se mueve, pero se dice por qué en vez de ignorar el gesto.
 */
export function useMoverElemento({ configuracion, bloqueado, onMovido, onAviso }: {
  configuracion: ConfiguracionCerramiento | null
  bloqueado: boolean
  onMovido: (siguiente: ConfiguracionCerramiento, id: string) => void
  onAviso: (aviso: string | null) => void
}) {
  const [moviendo, setMoviendo] = useState<string | null>(null)
  const activo = configuracion && moviendo && !bloqueado ? moviendo : null
  const anclajes = activo ? anclajesParaMover(configuracion!, activo) : []
  return {
    moviendo: activo,
    anclajes,
    puedeMover: (id: string) => Boolean(configuracion) && !bloqueado && configuracion!.modulos.length > 1
      && configuracion!.modulos.some((m) => m.id === id),
    /** Hay otro elemento al que referirse; ignora los cambios pendientes. */
    movible: (id: string) => Boolean(configuracion) && configuracion!.modulos.length > 1
      && configuracion!.modulos.some((m) => m.id === id),
    avisarBloqueo: () => onAviso(AVISO_MOVER_PENDIENTE),
    iniciar: (id: string) => {
      if (bloqueado) { onAviso(AVISO_MOVER_PENDIENTE); return }
      if (!configuracion || configuracion.modulos.length < 2) return
      onAviso(anclajesParaMover(configuracion, id).length ? null
        : 'Este elemento no tiene otra posición libre donde colocarse.')
      setMoviendo(id)
    },
    cancelar: () => setMoviendo(null),
    mover: (anclaje: AnclajeLibre) => {
      if (!configuracion || !activo) return
      const resultado = moverModuloCerramiento(configuracion, activo, anclaje)
      setMoviendo(null)
      if (!resultado.ok) { onAviso(resultado.motivo); return }
      onAviso(null)
      onMovido(resultado.configuracion, activo)
    },
  }
}
