'use client'

import { useState } from 'react'
import type { Opcion } from '../../_lib/ficha/consulta.ts'
import s from './ficha-articulo.module.css'

/** Código con sugerencias y nombre resuelto a la derecha, como en Productor. */
export function CampoBusqueda({
  id, nombre, valor, opciones, errores, onCambio,
}: {
  id: string
  nombre: string
  valor: string | null
  opciones: Opcion[]
  errores?: string[]
  onCambio?: (codigo: string) => void
}) {
  const [codigo, setCodigo] = useState(valor ?? '')
  const resuelto = opciones.find((o) => o.codigo === codigo.trim())

  return (
    <div className={s.busqueda}>
      <input
        id={id} name={nombre} value={codigo} list={`${id}-opciones`}
        autoComplete="off" spellCheck={false}
        aria-invalid={errores ? true : undefined}
        aria-describedby={errores ? `${id}-error` : undefined}
        className={`${s.campo} ${s.codigo}`}
        onChange={(e) => { setCodigo(e.target.value); onCambio?.(e.target.value.trim()) }}
      />
      <span className={s.resuelto}>{resuelto?.descripcion ?? ''}</span>
      <datalist id={`${id}-opciones`}>
        {opciones.map((o) => <option key={o.codigo} value={o.codigo}>{o.descripcion}</option>)}
      </datalist>
      {errores && <span id={`${id}-error`} className={s.error}>{errores.join('. ')}</span>}
    </div>
  )
}
