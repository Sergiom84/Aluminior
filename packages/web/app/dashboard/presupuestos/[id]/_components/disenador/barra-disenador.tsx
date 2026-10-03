'use client'

import React from 'react'
import type { PlantillaDiseno } from '@aluminior/core/estructuras'

export type VistaDisenador = 'catalogo' | 'propiedades'

/**
 * Barra superior del configurador: recuento, vista de la barra inferior,
 * medidas globales y, con una miniatura preparada, su colocación lateral.
 */
export function BarraDisenador({
  elementos, vista, onVista, medidas, preparada, onColocarDerecha, onMedidas,
}: {
  onMedidas?: () => void
  elementos: number
  vista: VistaDisenador
  onVista: (vista: VistaDisenador) => void
  medidas: { anchoMm: number; altoMm: number }
  preparada: PlantillaDiseno | null
  onColocarDerecha: (() => void) | null
}) {
  return (
    <header className="al-designer-toolbar">
      <strong>CERRAMIENTO · {elementos} {elementos === 1 ? 'ELEMENTO' : 'ELEMENTOS'}</strong>
      <div className="al-designer-vistas" role="group" aria-label="Barra inferior">
        <button type="button" aria-pressed={vista === 'catalogo'} onClick={() => onVista('catalogo')}>Catálogo</button>
        <button type="button" aria-pressed={vista === 'propiedades'} disabled={elementos === 0}
          onClick={() => onVista('propiedades')}>Propiedades</button>
      </div>
      {preparada && onColocarDerecha && (
        <button type="button" className="al-command-primary al-designer-colocar" onClick={onColocarDerecha}>
          Colocar {preparada.codigo} a la derecha
        </button>
      )}
      {onMedidas && <button type="button" className="al-command" onClick={onMedidas}>Medidas de nuevas ventanas</button>}
      <span className="al-designer-global">
        Ancho <b className="cifra">{medidas.anchoMm}</b> mm × Alto <b className="cifra">{medidas.altoMm}</b> mm
      </span>
    </header>
  )
}
