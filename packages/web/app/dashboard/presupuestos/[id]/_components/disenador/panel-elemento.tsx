'use client'

import React from 'react'
import {
  CAMPOS_MATERIAL, plantillaDiseno, type CambiosComplementosModulo, type CambiosMaterial, type CotaCatalogo,
  type MaterialesGenerales, type ModuloCerramiento, type PlantillaDiseno, type RectVisual,
} from '@aluminior/core/estructuras'
import { MedidasElemento } from '../medidas-elemento.tsx'
import type { BorradorModulo } from '../use-borradores-cerramiento.ts'
import { ComplementosElemento, type CatalogoComplementosDisenador } from './complementos-elemento.tsx'
import { MaterialesElemento } from './materiales-elemento.tsx'
import type { AcabadoCatalogo } from './acabados-elemento.tsx'

/**
 * Pestaña Elemento seleccionado, en una fila de izquierda a derecha: qué es,
 * dónde está (calculado), medidas, materiales propios, complementos y acciones.
 */
export function PanelElemento({
  modulo, borrador, indice, rect, pendiente, bloqueado, preparada, eliminable, generales, series, acabados,
  cotasCatalogo = [], complementosCatalogo, moviendo, movible, invisible = false, materialesPropios = true,
  onChange, onActualizar, onActualizarTodos = null, onDescartar, onSustituir, onEliminar, onMover, onInvisible, onDisenoPropio,
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
  acabados?: readonly AcabadoCatalogo[]
  cotasCatalogo?: readonly CotaCatalogo[]
  complementosCatalogo?: CatalogoComplementosDisenador
  onChange: (cambios: BorradorModulo) => void
  onActualizar: () => void
  /** Copia medidas, materiales y complementos a todos los elementos; null con un solo elemento. */
  onActualizarTodos?: (() => void) | null
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
  /** Abre el editor `Diseño V3` del elemento seleccionado (DS4). */
  onDisenoPropio?: () => void
  /**
   * Con un único elemento sin excepciones, sus Perfiles/Vidrio repetirían la
   * Serie y el Vidrio de la línea: se omiten.
   */
  materialesPropios?: boolean
}) {
  const plantilla = plantillaDiseno(modulo.estructuraCodigo)
  const { serieCodigo: _s, vidrioCodigo: _v, acabadoCodigo: _a, acabadoAccesoriosCodigo: _aa,
    compacto: _c, tapajuntas: _t, cotas: cotasBorrador, ...medidas } = borrador
  const hayComplementos = Boolean(complementosCatalogo &&
    (complementosCatalogo.compactos.length > 0 || complementosCatalogo.tapajuntas.length > 0))
  const tieneExcepcionMaterial = CAMPOS_MATERIAL.some((campo) =>
    Boolean(modulo.materiales?.[campo]) || Boolean(borrador[campo]),
  )
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
          onChange={onChange} onActualizar={onActualizar} onActualizarTodos={onActualizarTodos} onDescartar={onDescartar} />
      </div>
      {(materialesPropios || hayComplementos) && <div className="al-panel-grupo">
        {materialesPropios && (
          <details key={modulo.id} className="al-materiales-propios" open={tieneExcepcionMaterial || undefined}>
            <summary className="al-command">Materiales propios del elemento</summary>
            <div className="al-materiales-propios-campos">
              <MaterialesElemento modulo={modulo} borrador={borrador as CambiosMaterial}
                generales={generales} series={series} acabados={acabados} onChange={onChange} />
            </div>
          </details>
        )}
        {hayComplementos && complementosCatalogo && (
          <ComplementosElemento modulo={modulo} borrador={borrador as CambiosComplementosModulo}
            catalogo={complementosCatalogo} onChange={onChange} />
        )}
      </div>}
      <div className="al-panel-grupo al-panel-acciones">
        {preparada && preparada.codigo !== modulo.estructuraCodigo && (
          <button type="button" className="al-command" disabled={bloqueado} onClick={onSustituir}>
            Sustituir por {preparada.codigo}
          </button>
        )}
        {!invisible && !modulo.sinDibujo && onDisenoPropio && (
          <button type="button" className="al-command"
            data-excepcion={Boolean(modulo.disenoPropio) || undefined}
            disabled={bloqueado} onClick={onDisenoPropio}>
            {modulo.disenoPropio ? 'Diseño específico (activo)' : 'Diseño específico'}
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
