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

/** «+» a los extremos laterales y debajo (del elemento seleccionado, o el inferior libre). */
export function LienzoConExtremos({ configuracion, inferior, bloqueado, onAbrir, children }: {
  configuracion: ConfiguracionCerramiento; inferior: AnclajeLibre | null; bloqueado: boolean
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
    <button type="button" className="al-insertar-ventana al-insertar-debajo" disabled={bloqueado || !inferior}
      aria-label="Añadir ventana debajo" onClick={() => inferior && onAbrir(inferior)}>+</button>
  </div>
}
