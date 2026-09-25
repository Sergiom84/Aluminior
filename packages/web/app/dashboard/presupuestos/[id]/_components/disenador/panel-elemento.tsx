'use client'

import React from 'react'
import {
  plantillaDiseno, type ModuloCerramiento, type PlantillaDiseno, type RectVisual,
} from '@aluminior/core/estructuras'
import { MedidasElemento } from '../medidas-elemento.tsx'

type Medidas = Partial<Pick<ModuloCerramiento, 'anchoMm' | 'altoMm' | 'fiMm'>>

/** Pestaña Elemento seleccionado: la posición se calcula, no se edita. */
export function PanelElemento({
  modulo, indice, rect, pendiente, bloqueado, preparada, eliminable, onChange, onActualizar, onDescartar,
  onSustituir, onEliminar,
}: {
  modulo: ModuloCerramiento
  indice: number
  rect: RectVisual
  pendiente: boolean
  bloqueado: boolean
  preparada: PlantillaDiseno | null
  eliminable: boolean
  onChange: (cambios: Medidas) => void
  onActualizar: () => void
  onDescartar: () => void
  onSustituir: () => void
  onEliminar: () => void
}) {
  const plantilla = plantillaDiseno(modulo.estructuraCodigo)
  return (
    <div className="al-panel-elemento" aria-label={`Elemento ${indice}`}>
      <div className="al-panel-fila">
        <label className="al-designer-measure">
          <span className="al-designer-properties-label">Estructura</span>
          <input readOnly value={modulo.estructuraCodigo} className="cifra" />
        </label>
        <span className="al-panel-descripcion">{plantilla?.descripcion}</span>
      </div>
      <div className="al-panel-fila">
        {([['X', rect.x], ['Y', rect.y]] as const).map(([eje, valor]) => (
          <label key={eje} className="al-designer-measure">
            <span className="al-designer-properties-label">Posición {eje}</span>
            <input readOnly tabIndex={-1} value={valor} className="cifra" />
          </label>
        ))}
        <MedidasElemento modulo={modulo} pendiente={pendiente}
          onChange={onChange} onActualizar={onActualizar} onDescartar={onDescartar} />
      </div>
      <div className="al-panel-fila">
        {preparada && preparada.codigo !== modulo.estructuraCodigo && (
          <button type="button" className="al-command" disabled={bloqueado} onClick={onSustituir}>
            Sustituir por {preparada.codigo}
          </button>
        )}
        <button type="button" className="al-command al-command-danger"
          disabled={bloqueado || !eliminable} onClick={onEliminar}>
          Eliminar elemento
        </button>
      </div>
    </div>
  )
}
