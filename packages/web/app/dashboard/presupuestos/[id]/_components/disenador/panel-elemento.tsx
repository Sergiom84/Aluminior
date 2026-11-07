'use client'

import React from 'react'
import {
  plantillaDiseno, type CambiosMaterial, type CotaCatalogo, type MaterialesGenerales, type ModuloCerramiento,
  type PlantillaDiseno, type RectVisual,
} from '@aluminior/core/estructuras'
import { MedidasElemento } from '../medidas-elemento.tsx'
import type { BorradorModulo } from '../use-borradores-cerramiento.ts'
import { MaterialesElemento } from './materiales-elemento.tsx'

/**
 * Pestaña Elemento seleccionado, en una fila de izquierda a derecha: qué es,
 * dónde está (calculado), medidas, materiales propios y acciones.
 */
export function PanelElemento({
  modulo, borrador, indice, rect, pendiente, bloqueado, preparada, eliminable, generales, series, modelos,
  cotasCatalogo = [], moviendo, movible, invisible = false, materialesPropios = true, onChange, onActualizar, onActualizarModelos, onDescartar,
  onSustituir, onEliminar, onMover, onInvisible,
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
  /** Hueco que no se instala (viga, pared): precio 0 y sin despiece (DS3). */
  invisible?: boolean
  onInvisible?: () => void
  /**
   * Con un único elemento sin excepciones, sus Perfiles/Vidrio repetirían la
   * Serie y el Vidrio de la línea: se omiten.
   */
  materialesPropios?: boolean
}) {
  const plantilla = plantillaDiseno(modulo.estructuraCodigo)
  const { serieCodigo: _s, vidrioCodigo: _v, cotas: cotasBorrador, ...medidas } = borrador
  return (
    <div className="al-panel-elemento" aria-label={`Elemento ${indice}`}>
      <div className="al-panel-grupo al-panel-estructura">
        <label className="al-designer-measure">
          <span className="al-designer-properties-label">Estructura</span>
          <input readOnly value={modulo.estructuraCodigo} className="cifra" />
        </label>
        <span className="al-panel-descripcion">{invisible ? 'HUECO (no se instala)' : plantilla?.descripcion}</span>
      </div>
      <div className="al-panel-grupo">
        {([['X', rect.x], ['Y', rect.y]] as const).map(([eje, valor]) => (
          <label key={eje} className="al-designer-measure al-panel-posicion">
            <span className="al-designer-properties-label">Posición {eje}</span>
            <input readOnly tabIndex={-1} value={valor} className="cifra" />
          </label>
        ))}
      </div>
      <div className="al-panel-grupo">
        <MedidasElemento modulo={{ ...modulo, ...medidas }} pendiente={pendiente}
          cotasCatalogo={cotasCatalogo} cotasBorrador={cotasBorrador}
          onChange={onChange} onActualizar={onActualizar} onDescartar={onDescartar} />
      </div>
      {materialesPropios && <div className="al-panel-grupo">
        <MaterialesElemento modulo={modulo} borrador={borrador as CambiosMaterial}
          generales={generales} series={series} onChange={onChange} />
        {modelos > 1 && <button type="button" className="al-command" disabled={!pendiente}
          onClick={onActualizarModelos}>
          Aplicar a modelos iguales ({modelos})
        </button>}
      </div>}
      <div className="al-panel-grupo al-panel-acciones">
        {preparada && preparada.codigo !== modulo.estructuraCodigo && (
          <button type="button" className="al-command" disabled={bloqueado} onClick={onSustituir}>
            Sustituir por {preparada.codigo}
          </button>
        )}
        <button type="button" className="al-command" aria-pressed={moviendo}
          disabled={!movible} onClick={onMover}>
          {moviendo ? 'Cancelar mover' : 'Mover elemento'}
        </button>
        {onInvisible && <button type="button" className="al-command" aria-pressed={invisible}
          disabled={bloqueado} onClick={onInvisible}>
          {invisible ? 'Volver a ventana' : 'Convertir en hueco'}
        </button>}
        <button type="button" className="al-command al-command-danger"
          disabled={bloqueado || !eliminable} onClick={onEliminar}>
          Eliminar elemento
        </button>
      </div>
    </div>
  )
}
