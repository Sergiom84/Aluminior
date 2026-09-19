'use client'

import { useState } from 'react'
import { descripcionLineaEstructura } from '@aluminior/core/estructuras'
import { PestanasEditor, type PestanaEditor } from './editor-linea/pestanas-editor.tsx'
import { PestanaEstructura, type PropsPestanaEstructura } from './editor-linea/pestana-estructura.tsx'
import { ErroresSeleccion } from './editor-linea/errores-seleccion.tsx'
import { PestanaHerraje } from './editor-linea/pestana-herraje.tsx'
import { PestanaAcristalamiento } from './editor-linea/pestana-acristalamiento.tsx'

const entrada = 'w-full rounded-md border px-3 py-2 text-sm'
const estilo = { background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }

/**
 * `Edición de Línea` de una estructura: cabecera `Código`, pestañas en el
 * orden de Productor (RECON-CERRAMIENTOS.md §5) y pie con la descripción.
 * `Cargos Adic.` queda visible y deshabilitada hasta que exista su tabla.
 */
const PESTANAS: readonly PestanaEditor[] = [
  { id: 'estructura', etiqueta: 'Estructura' },
  { id: 'herraje', etiqueta: 'Opc.Herraje' },
  { id: 'cargos', etiqueta: 'Cargos Adic.', deshabilitada: true },
  { id: 'acristalamiento', etiqueta: 'Acristalamiento' },
]

export function EditorLineaEstructura(props: PropsPestanaEstructura & { onCambiarEstructura: () => void }) {
  const { plantilla, acabados, acabado, anchoMm, altoMm, serie, vidrio, variante, onCambiarEstructura } = props
  const [activa, setActiva] = useState('estructura')
  const acabadoEtiqueta = acabados.find((item) => item.codigo === acabado)
  const descripcion = descripcionLineaEstructura({
    plantilla, anchoMm, altoMm, serie: serie || null, vidrio: vidrio || null,
    acabado: acabadoEtiqueta ? `${acabadoEtiqueta.codigo} · ${acabadoEtiqueta.descripcion}` : acabado || null,
    varianteAcristalamiento: variante,
  })

  return (
    <div className="al-line-editor">
      <div className="al-line-editor-code">
        <label htmlFor="codigo">Código</label>
        <input id="codigo" name="codigo" value={plantilla.codigo} readOnly className={entrada} style={estilo} />
        <button type="button" className="al-command" onClick={onCambiarEstructura}>Escaparate</button>
      </div>

      <PestanasEditor etiqueta="Edición de Línea" pestanas={PESTANAS} activa={activa} onCambiar={setActiva}
        paneles={{
          estructura: <PestanaEstructura {...props} />,
          herraje: <PestanaHerraje serie={serie} estructuraCodigo={plantilla.codigo} />,
          acristalamiento: <PestanaAcristalamiento serie={serie} />,
        }} />

      <ErroresSeleccion errores={props.err} />

      <label className="al-line-editor-desc">
        Descripción
        <textarea readOnly rows={3} value={descripcion} />
      </label>
    </div>
  )
}
