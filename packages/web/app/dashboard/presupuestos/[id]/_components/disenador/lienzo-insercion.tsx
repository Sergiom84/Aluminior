'use client'

import type { ReactNode } from 'react'
import { anclajesExtremosCerramiento, plantillaDiseno, type AnclajeLibre,
  type ConfiguracionCerramiento, type PlantillaDiseno } from '@aluminior/core/estructuras'
import { TIPO_ARRASTRE_ESTRUCTURA } from './catalogo-inferior.tsx'

export function LienzoVacio({ preparada, onColocar, onAbrir }: {
  preparada: PlantillaDiseno | null; onColocar: (plantilla: PlantillaDiseno) => void; onAbrir: () => void
}) {
  return <div className="al-lienzo-vacio"
    onDragOver={evento => { evento.preventDefault(); evento.dataTransfer.dropEffect = 'copy' }}
    onDrop={evento => {
      evento.preventDefault()
      const plantilla = plantillaDiseno(evento.dataTransfer.getData(TIPO_ARRASTRE_ESTRUCTURA))
      if (plantilla) onColocar(plantilla)
    }}>
    <button type="button" className="al-insertar-ventana" aria-label="Añadir primera ventana" onClick={onAbrir}>+</button>
    {preparada && <button type="button" className="al-command-primary" onClick={() => onColocar(preparada)}>
      Colocar {preparada.codigo}
    </button>}
  </div>
}

export function LienzoConExtremos({ configuracion, bloqueado, onAbrir, children }: {
  configuracion: ConfiguracionCerramiento; bloqueado: boolean
  onAbrir: (anclaje: AnclajeLibre) => void; children: ReactNode
}) {
  const extremos = anclajesExtremosCerramiento(configuracion)
  const boton = (lado: 'izquierda' | 'derecha') => {
    const destino = extremos.find(anclaje => anclaje.lado === lado)
    return <button type="button" className="al-insertar-ventana" disabled={bloqueado || !destino}
      aria-label={`Añadir ventana a la ${lado}`} onClick={() => destino && onAbrir(destino)}>+</button>
  }
  return <div className="al-lienzo-extremos">
    {boton('izquierda')}{children}{boton('derecha')}
  </div>
}
