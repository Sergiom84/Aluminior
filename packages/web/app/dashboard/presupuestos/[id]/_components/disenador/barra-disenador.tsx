'use client'

import React from 'react'
import type { PlantillaDiseno } from '@aluminior/core/estructuras'

export type VistaDisenador = 'catalogo' | 'propiedades' | 'herraje' | 'acristalamiento'

/**
 * Barra superior del configurador: recuento, vista de la barra inferior
 * (catálogo, propiedades, uniones, herraje, cargos adicionales y acristalamiento),
 * deshacer y rehacer, medidas globales y colocación de una miniatura preparada.
 */
export function BarraDisenador({
  elementos, vista, onVista, uniones = 0, unionesSinConfigurar = 0, unionActiva = false, onUniones = null,
  medidas, preparada, onColocarDerecha, onColocarDebajo, onMedidas, onDeshacer, onRehacer,
}: {
  onMedidas?: () => void
  elementos: number
  vista: VistaDisenador
  onVista: (vista: VistaDisenador) => void
  uniones?: number
  unionesSinConfigurar?: number
  unionActiva?: boolean
  onUniones?: (() => void) | null
  medidas: { anchoMm: number; altoMm: number }
  preparada: PlantillaDiseno | null
  onColocarDerecha: (() => void) | null
  onColocarDebajo: (() => void) | null
  /** Null cuando no hay paso o hay una edición, inserción o movimiento a medias. */
  onDeshacer: (() => void) | null
  onRehacer: (() => void) | null
}) {
  return (
    <header className="al-designer-toolbar">
      <strong>CERRAMIENTO · {elementos} {elementos === 1 ? 'ELEMENTO' : 'ELEMENTOS'}</strong>
      <div className="al-designer-vistas" role="group" aria-label="Barra inferior">
        <button type="button" aria-pressed={vista === 'catalogo'} onClick={() => onVista('catalogo')}>Catálogo</button>
        <button type="button" aria-pressed={vista === 'propiedades' && !unionActiva} disabled={elementos === 0}
          onClick={() => onVista('propiedades')}>Propiedades</button>
        <button type="button" aria-pressed={vista === 'propiedades' && unionActiva} disabled={!onUniones}
          data-pendiente={unionesSinConfigurar > 0 || undefined} onClick={onUniones ?? undefined}
          title={uniones > 0
            ? 'Seleccionar la siguiente unión del cerramiento'
            : 'Añade dos o más elementos para configurar sus uniones'}>
          Uniones{uniones > 0 ? ` (${uniones})` : ''}
        </button>
        <button type="button" aria-pressed={vista === 'herraje'} disabled={elementos === 0}
          onClick={() => onVista('herraje')}>Opc.Herraje</button>
        <button type="button" disabled>Cargos Adic.</button>
        <button type="button" aria-pressed={vista === 'acristalamiento'} disabled={elementos === 0}
          onClick={() => onVista('acristalamiento')}>Acristalamiento</button>
      </div>
      <div className="al-designer-vistas" role="group" aria-label="Historial">
        <button type="button" disabled={!onDeshacer} onClick={onDeshacer ?? undefined}
          aria-keyshortcuts="Control+Z" title="Deshacer (Ctrl+Z)">Deshacer</button>
        <button type="button" disabled={!onRehacer} onClick={onRehacer ?? undefined}
          aria-keyshortcuts="Control+Y Control+Shift+Z" title="Rehacer (Ctrl+Y)">Rehacer</button>
      </div>
      {preparada && onColocarDerecha && (
        <button type="button" className="al-command-primary al-designer-colocar" onClick={onColocarDerecha}>
          Colocar {preparada.codigo} a la derecha
        </button>
      )}
      {preparada && onColocarDebajo && (
        <button type="button" className="al-command" onClick={onColocarDebajo}>
          Colocar {preparada.codigo} debajo
        </button>
      )}
      {onMedidas && <button type="button" className="al-command" onClick={onMedidas}>Medidas de nuevas ventanas</button>}
      <span className="al-designer-global">
        Ancho <b className="cifra">{medidas.anchoMm}</b> mm × Alto <b className="cifra">{medidas.altoMm}</b> mm
      </span>
    </header>
  )
}
