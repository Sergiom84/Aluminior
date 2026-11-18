'use client'

import React from 'react'
import type { CambiosMaterialUnion } from '@aluminior/core/estructuras'

export interface AcabadoCatalogo { codigo: string; descripcion: string }
type CampoAcabado = 'acabadoCodigo' | 'acabadoAccesoriosCodigo'

const CAMPOS: readonly (readonly [CampoAcabado, string])[] = [['acabadoCodigo', 'Acabado'], ['acabadoAccesoriosCodigo', 'Aca. Acc.']]

/**
 * Acabado y acabado de accesorios (`Acabado2`) propios de un módulo o una
 * unión. Vacío hereda el de la línea; lo elegido se aplica con Actualizar.
 */
export function AcabadosElemento({ acabados, valor, onChange, elemento, claseCampo }: {
  acabados: readonly AcabadoCatalogo[]
  valor: (campo: CampoAcabado) => string
  onChange: (cambios: Pick<CambiosMaterialUnion, CampoAcabado>) => void
  /** Completa la etiqueta accesible: «Acabado del elemento», «Acabado unión 2». */
  elemento: string
  claseCampo?: string
}) {
  return <>
    {CAMPOS.map(([campo, etiqueta]) => {
      const actual = valor(campo)
      return <label key={campo} className={claseCampo}>
        <span className={claseCampo ? 'al-designer-properties-label' : undefined}>{etiqueta}</span>
        <select aria-label={`${etiqueta} ${elemento}`} value={actual} data-excepcion={Boolean(actual) || undefined}
          onChange={(evento) => onChange({ [campo]: evento.target.value || null })}>
          <option value="">Según línea</option>
          {actual && !acabados.some((a) => a.codigo === actual) && <option value={actual}>{actual}</option>}
          {acabados.map((a) => <option key={a.codigo} value={a.codigo}>{a.codigo} · {a.descripcion}</option>)}
        </select>
      </label>
    })}
  </>
}
