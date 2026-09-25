'use client'

import React from 'react'
import {
  UNION_SIN_CONFIGURAR, UNIONES_VISUALES, unionConfigurada, type UnionCerramiento,
} from '@aluminior/core/estructuras'

/** Grosor de solo lectura: sin configurar (20, E07) y PSU001 (2, E08). */
function grosorFijo(union: UnionCerramiento) {
  return !unionConfigurada(union) || union.codigo === 'PSU001'
}

export function EditorUnion({ union, indice, pendiente, onChange, onActualizar, onDescartar }: {
  union: UnionCerramiento; indice: number; pendiente: boolean
  onChange: (cambios: Partial<UnionCerramiento>) => void
  onActualizar: () => void; onDescartar: () => void
}) {
  const catalogo = UNIONES_VISUALES.find(item => item.codigo === union.codigo)
  return <fieldset>
    <legend>Unión {indice}</legend>
    <label>Unión
      <select aria-label={`Código unión ${indice}`} value={union.codigo} onChange={evento => {
        if (evento.target.value === UNION_SIN_CONFIGURAR.codigo) {
          onChange({ ...UNION_SIN_CONFIGURAR })
          return
        }
        const elegido = UNIONES_VISUALES.find(item => item.codigo === evento.target.value)
        if (elegido) onChange({ codigo: elegido.codigo, grosorMm: elegido.grosorMm })
      }}>
        <option value={UNION_SIN_CONFIGURAR.codigo}>*(UNION NO CONFIG.)</option>
        {UNIONES_VISUALES.map(item => <option key={item.codigo} value={item.codigo}>
          {item.codigo} · {item.descripcion}
        </option>)}
      </select>
    </label>
    {catalogo && <span className="al-union-descripcion">{catalogo.descripcion}</span>}
    <label>Longitud
      <input aria-label={`Longitud unión ${indice}`} type="number" min={1} step="any"
        value={Number.isFinite(union.longitudMm) ? union.longitudMm : ''}
        onChange={evento => onChange({ longitudMm: evento.target.valueAsNumber })} />
      <span>mm</span>
    </label>
    <label>Grosor
      <input aria-label={`Grosor unión ${indice}`} type="number" min={1} step="any"
        readOnly={grosorFijo(union)}
        value={Number.isFinite(union.grosorMm) ? union.grosorMm : ''}
        onChange={evento => onChange({ grosorMm: evento.target.valueAsNumber })} />
      <span>mm</span>
    </label>
    <button type="button" disabled={!pendiente} onClick={onActualizar}
      aria-label={`Actualizar unión ${indice}`}>Actualizar</button>
    {pendiente && <button type="button" onClick={onDescartar}
      aria-label={`Descartar cambios unión ${indice}`}>Descartar cambios</button>}
  </fieldset>
}
