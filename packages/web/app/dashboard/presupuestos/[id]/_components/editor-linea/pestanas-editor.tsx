'use client'

import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import styles from './editor-linea.module.css'

export interface PestanaEditor {
  readonly id: string
  readonly etiqueta: string
  readonly deshabilitada?: boolean
}

/**
 * Pestañas del editor de línea (patrón WAI-ARIA tabs, activación automática).
 * Flechas, Inicio y Fin mueven entre pestañas habilitadas. Los paneles no se
 * desmontan al cambiar: sus campos siguen en el formulario al aceptar.
 */
export function PestanasEditor({
  pestanas, activa, onCambiar, paneles, etiqueta,
}: {
  pestanas: readonly PestanaEditor[]
  activa: string
  onCambiar: (id: string) => void
  paneles: Readonly<Record<string, ReactNode>>
  etiqueta: string
}) {
  const botones = useRef<Record<string, HTMLButtonElement | null>>({})
  const habilitadas = pestanas.filter((p) => !p.deshabilitada)

  const mover = (evento: KeyboardEvent<HTMLDivElement>) => {
    const indice = habilitadas.findIndex((p) => p.id === activa)
    const destino = {
      ArrowRight: habilitadas[(indice + 1) % habilitadas.length],
      ArrowLeft: habilitadas[(indice - 1 + habilitadas.length) % habilitadas.length],
      Home: habilitadas[0],
      End: habilitadas[habilitadas.length - 1],
    }[evento.key]
    if (!destino) return
    evento.preventDefault()
    onCambiar(destino.id)
    botones.current[destino.id]?.focus()
  }

  return (
    <div className={styles.pestanas}>
      <div role="tablist" aria-label={etiqueta} className={styles.lista} onKeyDown={mover}>
        {pestanas.map((pestana) => (
          <button key={pestana.id} type="button" role="tab" id={`pestana-${pestana.id}`}
            ref={(nodo) => { botones.current[pestana.id] = nodo }}
            aria-selected={pestana.id === activa} aria-controls={`panel-${pestana.id}`}
            tabIndex={pestana.id === activa ? 0 : -1} disabled={pestana.deshabilitada}
            className={styles.pestana} onClick={() => onCambiar(pestana.id)}>
            {pestana.etiqueta}
          </button>
        ))}
      </div>
      {pestanas.filter((p) => !p.deshabilitada).map((pestana) => (
        <div key={pestana.id} role="tabpanel" id={`panel-${pestana.id}`}
          aria-labelledby={`pestana-${pestana.id}`} hidden={pestana.id !== activa}
          tabIndex={0} className={styles.panel}>
          {paneles[pestana.id]}
        </div>
      ))}
    </div>
  )
}
