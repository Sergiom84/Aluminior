'use client'

import React from 'react'
import type { PosicionTravesano } from '@aluminior/core/despiece'
import type { DivisionEditableDiseno } from '@aluminior/core/estructuras'

export const ETIQUETA_POSICION_TRAVESANO: Readonly<Record<PosicionTravesano, string>> = {
  HA: 'Horizontal (Arriba)',
  HB: 'Horizontal (Abajo)',
  VI: 'Vertical (Izquierda)',
  VD: 'Vertical (Derecha)',
}

export function PanelTravesanoDiseno({
  division, indice, valido, onCambiar, onEliminar,
}: {
  division: DivisionEditableDiseno
  indice: number
  valido: boolean
  onCambiar: (cambios: { posicion?: PosicionTravesano; tipoCota?: 0 | 2; huecos?: number; cotaMm?: number }) => void
  onEliminar: () => void
}) {
  const limite = division.posicion.startsWith('H') ? division.altoContenedorMm : division.anchoContenedorMm
  const textoContenedor = division.anchoContenedorMm && division.altoContenedorMm
    ? `${Math.round(division.anchoContenedorMm)} × ${Math.round(division.altoContenedorMm)} mm`
    : ''

  return (
    <div className="al-diseno-v3-panel" aria-label={`Propiedades de Travesaño ${indice}`}>
      <div className="al-diseno-v3-bloque">
        <div className="al-diseno-v3-cabecera">
          <h4 className="al-diseno-v3-titulo">Travesaño {indice}</h4>
          {textoContenedor && <span className="cifra">{textoContenedor}</span>}
        </div>
        <label className="al-designer-measure">
          <span className="al-designer-properties-label">Posición</span>
          <select aria-label="Posición del travesaño" value={division.posicion}
            onChange={e => onCambiar({ posicion: e.target.value as PosicionTravesano })}>
            {(['HB', 'HA', 'VI', 'VD'] as const).map(pos => (
              <option key={pos} value={pos}>{ETIQUETA_POSICION_TRAVESANO[pos]}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="al-diseno-v3-bloque">
        {division.tipoCota === 1 ? (
          <div className="al-diseno-v3-fila">
            <label className="al-designer-measure">
              <span className="al-designer-properties-label">Cota Variable</span>
              <input readOnly tabIndex={-1} value={division.simbolo ?? 'FI'} className="cifra" />
            </label>
            <label className="al-designer-measure">
              <span className="al-designer-properties-label">Cota por (mm)</span>
              <input aria-label="Cota por (mm)" type="number" min={1} max={limite ? limite - 1 : undefined} step={1}
                className="cifra" value={division.cotaMm}
                onChange={e => onCambiar({ cotaMm: Number(e.target.value) || 0 })} />
            </label>
          </div>
        ) : (
          <div className="al-diseno-v3-fila">
            <label className="al-designer-measure">
              <span className="al-designer-properties-label">Propiedades</span>
              <select aria-label="Tipo de cota del travesaño" value={String(division.tipoCota)}
                onChange={e => onCambiar({ tipoCota: Number(e.target.value) as 0 | 2 })}>
                <option value="2">Cota Fija</option>
                <option value="0">Equidistante</option>
              </select>
            </label>
            {division.tipoCota === 2 ? (
              <label className="al-designer-measure">
                <span className="al-designer-properties-label">Cota Fija (mm)</span>
                <input aria-label="Cota Fija (mm)" type="number" min={1} max={limite ? limite - 1 : undefined} step={1}
                  className="cifra" value={division.cotaMm}
                  onChange={e => onCambiar({ cotaMm: Number(e.target.value) || 0 })} />
              </label>
            ) : (
              <label className="al-designer-measure">
                <span className="al-designer-properties-label">Huecos</span>
                <span className="al-diseno-v3-pasos">
                  <button type="button" className="al-command" aria-label="Menos huecos"
                    disabled={division.huecos <= 2} onClick={() => onCambiar({ huecos: division.huecos - 1 })}>−</button>
                  <input aria-label="Huecos" type="number" min={2} max={6} step={1} className="cifra"
                    value={division.huecos} onChange={e => onCambiar({ huecos: Number(e.target.value) || 2 })} />
                  <button type="button" className="al-command" aria-label="Más huecos"
                    disabled={division.huecos >= 6} onClick={() => onCambiar({ huecos: division.huecos + 1 })}>+</button>
                </span>
              </label>
            )}
          </div>
        )}
        {!valido && <p role="alert">Cota para travesaño no válida.</p>}
      </div>

      <div className="al-diseno-v3-bloque">
        <button type="button" className="al-command al-command-danger" onClick={onEliminar}>
          Eliminar travesaño
        </button>
      </div>
    </div>
  )
}
