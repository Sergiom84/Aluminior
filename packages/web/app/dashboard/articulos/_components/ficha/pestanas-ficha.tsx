'use client'

import type { KeyboardEvent } from 'react'
import s from './ficha-articulo.module.css'

export const PESTANAS = [
  { id: 'general', etiqueta: 'General', disponible: true },
  { id: 'coste', etiqueta: 'Coste', disponible: true },
  { id: 'proveedor', etiqueta: 'Prv.Habitual', disponible: true },
  { id: 'stock', etiqueta: 'Stock', disponible: true },
  { id: 'dimensiones', etiqueta: 'Cod.Prv.&Dim.', disponible: false },
  { id: 'produccion', etiqueta: 'Producción', disponible: true },
  { id: 'mas', etiqueta: 'Mas Datos', disponible: false },
  { id: 'cla', etiqueta: 'CLA', disponible: false },
] as const

export type IdPestana = (typeof PESTANAS)[number]['id']

/** Pestañas inferiores de la ficha, en el orden de Productor. */
export function PestanasFicha({
  activa, onCambiar,
}: { activa: IdPestana; onCambiar: (id: IdPestana) => void }) {
  const disponibles = PESTANAS.filter((p) => p.disponible)

  function mover(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const i = disponibles.findIndex((p) => p.id === activa)
    const paso = e.key === 'ArrowRight' ? 1 : -1
    const siguiente = disponibles[(i + paso + disponibles.length) % disponibles.length]
    onCambiar(siguiente.id)
    document.getElementById(`pestana-${siguiente.id}`)?.focus()
    e.preventDefault()
  }

  return (
    <div className={s.pestanas} role="tablist" aria-label="Páginas de la ficha" onKeyDown={mover}>
      {PESTANAS.map((p) => (
        <button key={p.id} id={`pestana-${p.id}`} type="button" role="tab"
          aria-selected={activa === p.id} aria-controls={`panel-${p.id}`}
          tabIndex={activa === p.id ? 0 : -1} disabled={!p.disponible}
          onClick={() => onCambiar(p.id)}>
          {p.etiqueta}
        </button>
      ))}
    </div>
  )
}
