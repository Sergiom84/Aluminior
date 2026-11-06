'use client'

import React from 'react'
import {
  plantillaDiseno, type CambiosMaterial, type CotaCatalogo, type MaterialesGenerales, type ModuloCerramiento,
  type PlantillaDiseno, type RectVisual,
} from '@aluminior/core/estructuras'
import { MedidasElemento } from '../medidas-elemento.tsx'
import type { BorradorModulo } from '../use-borradores-cerramiento.ts'
import { MaterialesElemento } from './materiales-elemento.tsx'

/** Pestaña Elemento seleccionado: la posición se calcula, no se edita. */
export function PanelElemento({
  modulo, borrador, indice, rect, pendiente, bloqueado, preparada, eliminable, generales, series, modelos,
  cotasCatalogo = [], moviendo, movible, onChange, onActualizar, onActualizarModelos, onDescartar, onSustituir, onEliminar, onMover,
}: {
  modulo: ModuloCerramiento
  borrador: BorradorModulo
  indice: number
  rect: RectVisual
  pendiente: boolean
  bloqueado: boolean
  preparada: PlantillaDiseno | null
  eliminable: boolean
  generales: MaterialesGenerales
  series: readonly string[]
  /** Elementos con la misma estructura, incluido este. */
  modelos: number
  cotasCatalogo?: readonly CotaCatalogo[]
  onChange: (cambios: BorradorModulo) => void
  onActualizar: () => void
  onActualizarModelos: () => void
  onDescartar: () => void
  onSustituir: () => void
  onEliminar: () => void
  /** Elige destino en el lienzo; el primer elemento también se mueve si hay otro (DS2). */
  moviendo: boolean
  movible: boolean
  onMover: () => void
}) {
  const plantilla = plantillaDiseno(modulo.estructuraCodigo)
  const { serieCodigo: _s, vidrioCodigo: _v, cotas: cotasBorrador, ...medidas } = borrador
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
        <MedidasElemento modulo={{ ...modulo, ...medidas }} pendiente={pendiente}
          cotasCatalogo={cotasCatalogo} cotasBorrador={cotasBorrador}
          onChange={onChange} onActualizar={onActualizar} onDescartar={onDescartar} />
      </div>
      <div className="al-panel-fila">
        <MaterialesElemento modulo={modulo} borrador={borrador as CambiosMaterial}
          generales={generales} series={series} onChange={onChange} />
        <button type="button" className="al-command" disabled={!pendiente || modelos < 2}
          onClick={onActualizarModelos}>
          Aplicar a modelos iguales ({modelos})
        </button>
      </div>
      <div className="al-panel-fila">
        {preparada && preparada.codigo !== modulo.estructuraCodigo && (
          <button type="button" className="al-command" disabled={bloqueado} onClick={onSustituir}>
            Sustituir por {preparada.codigo}
          </button>
        )}
        <button type="button" className="al-command" aria-pressed={moviendo}
          disabled={bloqueado || !movible} onClick={onMover}>
          {moviendo ? 'Cancelar mover' : 'Mover elemento'}
        </button>
        <button type="button" className="al-command al-command-danger"
          disabled={bloqueado || !eliminable} onClick={onEliminar}>
          Eliminar elemento
        </button>
      </div>
    </div>
  )
}
