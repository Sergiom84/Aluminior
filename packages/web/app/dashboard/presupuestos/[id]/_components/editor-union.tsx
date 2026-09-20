'use client'

import React from 'react'
import { UNIONES_VISUALES, type UnionCerramiento } from '@aluminior/core/estructuras'

export function EditorUnion({ union, indice, pendiente, onChange, onActualizar, onDescartar }: {
  union: UnionCerramiento; indice: number; pendiente: boolean
  onChange: (cambios: Partial<UnionCerramiento>) => void
  onActualizar: () => void; onDescartar: () => void
}) {
  return <fieldset>
    <legend>Unión {indice + 1}</legend>
    <select aria-label={`Código unión ${indice + 1}`} value={union.codigo} onChange={evento => {
      const catalogo = UNIONES_VISUALES.find(item => item.codigo === evento.target.value)
      if (catalogo) onChange({ codigo: catalogo.codigo, grosorMm: catalogo.grosorMm })
    }}>
      {UNIONES_VISUALES.map(item => <option key={item.codigo} value={item.codigo}>
        {item.codigo} · {item.descripcion}
      </option>)}
    </select>
    <label>Longitud
      <input aria-label={`Longitud unión ${indice + 1}`} type="number" min={1} step="any"
        value={Number.isFinite(union.longitudMm) ? union.longitudMm : ''}
        onChange={evento => onChange({ longitudMm: evento.target.valueAsNumber })} />
      <span>mm</span>
    </label>
    <label>Grosor
      <input aria-label={`Grosor unión ${indice + 1}`} type="number" min={1} step="any"
        readOnly={union.codigo === 'PSU001'}
        value={Number.isFinite(union.grosorMm) ? union.grosorMm : ''}
        onChange={evento => onChange({ grosorMm: evento.target.valueAsNumber })} />
      <span>mm</span>
    </label>
    <button type="button" disabled={!pendiente} onClick={onActualizar}
      aria-label={`Actualizar unión ${indice + 1}`}>Actualizar</button>
    {pendiente && <button type="button" onClick={onDescartar}
      aria-label={`Descartar cambios unión ${indice + 1}`}>Descartar cambios</button>}
  </fieldset>
}
