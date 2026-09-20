'use client'

import React from 'react'
import { resolverGeometriaFi1Ofi, type ModuloCerramiento } from '@aluminior/core/estructuras'

type Medidas = Partial<Pick<ModuloCerramiento, 'anchoMm' | 'altoMm' | 'fiMm'>>
export function MedidasElemento({ modulo, pendiente, onChange, onActualizar, onDescartar }: {
  modulo: ModuloCerramiento; pendiente: boolean
  onChange: (cambios: Medidas) => void; onActualizar: () => void; onDescartar: () => void
}) {
  const geometriaFi = modulo.estructuraCodigo === '1OFI' && Object.hasOwn(modulo, 'fiMm')
    ? resolverGeometriaFi1Ofi(modulo.anchoMm, modulo.altoMm, modulo.fiMm) : null
  return <>
    {(['anchoMm', 'altoMm'] as const).map(campo => <label key={campo} className="al-designer-measure">
      <span className="al-designer-properties-label">{campo === 'anchoMm' ? 'Ancho elemento' : 'Alto elemento'}</span>
      <input type="number" min={1} step={1}
        value={Number.isFinite(modulo[campo]) ? modulo[campo] : ''}
        onChange={evento => onChange({ [campo]: evento.target.valueAsNumber })} />
    </label>)}
    {modulo.estructuraCodigo === '1OFI' && <label className="al-designer-measure">
      <span className="al-designer-properties-label">FIJO INFERIOR</span>
      <input type="number" step="any" value={Number.isFinite(modulo.fiMm) ? modulo.fiMm : ''}
        aria-invalid={geometriaFi?.valido === false || undefined}
        aria-describedby={geometriaFi?.valido === false ? `fi-error-${modulo.id}` : undefined}
        onChange={evento => onChange({ fiMm: evento.target.valueAsNumber })} />
      <span>mm</span>
      {geometriaFi?.valido === false && <small id={`fi-error-${modulo.id}`} style={{ color: 'var(--al-error)' }}>
        FI debe ser un número mayor que 0 y menor que el alto del elemento.
      </small>}
    </label>}
    <button type="button" disabled={!pendiente} onClick={onActualizar}
      aria-label="Actualizar elemento">Actualizar</button>
    {pendiente && <button type="button" onClick={onDescartar}>Descartar cambios</button>}
  </>
}
