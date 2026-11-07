'use client'

import React from 'react'
import {
  UNION_SIN_CONFIGURAR, UNIONES_VISUALES, unionesOfrecidas, type UnionCerramiento, type UnionVisual,
} from '@aluminior/core/estructuras'

export function EditorUnion({ union, indice, pendiente, onChange, onActualizar, onDescartar,
  onSiguienteUnion = null, catalogoUniones = UNIONES_VISUALES, serieCodigo = null }: {
  union: UnionCerramiento; indice: number; pendiente: boolean
  onChange: (cambios: Partial<UnionCerramiento>) => void
  onActualizar: () => void; onDescartar: () => void
  onSiguienteUnion?: (() => void) | null
  catalogoUniones?: readonly UnionVisual[]
  serieCodigo?: string | null
}) {
  const ofrecidas = unionesOfrecidas(catalogoUniones, serieCodigo)
  const opciones = ofrecidas.some(item => item.codigo === union.codigo) || !union.codigo
    ? ofrecidas
    : [...ofrecidas, ...catalogoUniones.filter(item => item.codigo === union.codigo)]
  const catalogo = opciones.find(item => item.codigo === union.codigo)
  return <fieldset>
    <legend>Unión {indice}</legend>
    <label>Unión
      <select aria-label={`Código unión ${indice}`} value={union.codigo} onChange={evento => {
        if (evento.target.value === UNION_SIN_CONFIGURAR.codigo) {
          onChange({ ...UNION_SIN_CONFIGURAR })
          return
        }
        const elegido = opciones.find(item => item.codigo === evento.target.value)
        if (elegido) onChange({ codigo: elegido.codigo, grosorMm: elegido.grosorMm })
      }}>
        <option value={UNION_SIN_CONFIGURAR.codigo}>*(UNION NO CONFIG.)</option>
        {opciones.map(item => <option key={item.codigo} value={item.codigo}>
          {item.codigo} · {item.descripcion}
        </option>)}
      </select>
    </label>
    {catalogo && <span className="al-union-descripcion">{catalogo.descripcion}</span>}
    {catalogo?.codigo && <img alt={catalogo.codigo} className="al-union-elegida"
      src={`/dashboard/articulos/uniones/imagen?archivo=${encodeURIComponent(catalogo.imagen || `${catalogo.codigo}.bmp`)}`}
      onError={evento => { evento.currentTarget.hidden = true }} />}
    <label>Longitud
      <input aria-label={`Longitud unión ${indice}`} type="number" min={1} step="any"
        value={Number.isFinite(union.longitudMm) ? union.longitudMm : ''}
        onChange={evento => onChange({ longitudMm: evento.target.valueAsNumber })} />
      <span>mm</span>
    </label>
    <label>Grosor
      <input aria-label={`Grosor unión ${indice}`} type="number" min={0} step="any"
        readOnly value={Number.isFinite(union.grosorMm) ? union.grosorMm : ''} />
      <span>mm</span>
    </label>
    <button type="button" className="al-command-primary" disabled={!pendiente} onClick={onActualizar}
      aria-label={`Actualizar unión ${indice}`}>Actualizar</button>
    {pendiente && <button type="button" className="al-command" onClick={onDescartar}
      aria-label={`Descartar cambios unión ${indice}`}>Descartar cambios</button>}
    {onSiguienteUnion && <button type="button" className="al-command" onClick={onSiguienteUnion}>
      Siguiente unión
    </button>}
  </fieldset>
}
