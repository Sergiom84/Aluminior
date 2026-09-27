'use client'

import React from 'react'
import type { CambiosMaterial, MaterialesGenerales, ModuloCerramiento } from '@aluminior/core/estructuras'
import { CampoVidrio } from '../vidrios/campo-vidrio.tsx'

/**
 * PERFILES y VIDRIO del elemento. Vacío significa heredar el valor general de
 * la línea; lo escrito es una excepción del elemento que se aplica con Actualizar.
 */
export function MaterialesElemento({ modulo, borrador, generales, series, onChange }: {
  modulo: ModuloCerramiento
  borrador: CambiosMaterial
  generales: MaterialesGenerales
  series: readonly string[]
  onChange: (cambios: CambiosMaterial) => void
}) {
  const valor = (campo: keyof CambiosMaterial) => Object.hasOwn(borrador, campo)
    ? borrador[campo] ?? '' : modulo.materiales?.[campo] ?? ''
  const general = (campo: keyof CambiosMaterial) => `General · ${generales[campo] || 'sin asignar'}`
  const serie = valor('serieCodigo')
  return <>
    <label className="al-designer-measure">
      <span className="al-designer-properties-label">Perfiles</span>
      <select value={serie} data-excepcion={Boolean(serie) || undefined}
        onChange={(evento) => onChange({ serieCodigo: evento.target.value || null })}>
        <option value="">{general('serieCodigo')}</option>
        {serie && !series.includes(serie) && <option value={serie}>{serie}</option>}
        {series.map((codigo) => <option key={codigo} value={codigo}>{codigo}</option>)}
      </select>
    </label>
    <label className="al-designer-measure">
      <span className="al-designer-properties-label">Vidrio</span>
      <CampoVidrio aria-label="Vidrio" value={valor('vidrioCodigo')} placeholder={general('vidrioCodigo')}
        data-excepcion={Boolean(valor('vidrioCodigo')) || undefined} className="cifra"
        onChange={codigo => onChange({ vidrioCodigo: codigo || null })} />
    </label>
  </>
}
