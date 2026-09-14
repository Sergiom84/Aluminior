'use client'
import { useEffect, useState, type ChangeEvent, type RefObject } from 'react'
import type { EstadoEdicion } from '../../_lib/edicion/estado'

export function usarResultadoEdicion(estado: EstadoEdicion, formulario: RefObject<HTMLFormElement | null>, cerrar: () => void) {
  useEffect(() => {
    if (estado?.ok) cerrar()
    else if (estado) (formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      formulario.current?.querySelector<HTMLElement>('[role="alert"]'))?.focus()
    else formulario.current?.querySelector<HTMLElement>('input:not([type="hidden"]), textarea')?.focus()
  }, [estado, formulario, cerrar])
}

export function CampoEdicion({ id, nombre, etiqueta, valor, errores, largo, area = false, cantidad = false }: {
  id: string; nombre: string; etiqueta: string; valor: string | null; errores?: string[];
  largo?: number; area?: boolean; cantidad?: boolean
}) {
  const [texto, setTexto] = useState(valor ?? '')
  const comunes = { id, name: nombre, value: texto,
    onChange: (evento: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTexto(evento.target.value),
    'aria-invalid': errores?.length ? true : undefined,
    'aria-describedby': errores?.length ? `${id}-error` : undefined,
    className: 'w-full min-w-0 rounded-md border px-3 py-2 text-sm',
    style: { background: 'var(--al-surface)', borderColor: errores?.length ? 'var(--al-error)' : 'var(--al-border-strong)' },
  }
  return <div className="min-w-0">
    <label htmlFor={id} className="mb-1 block text-sm">{etiqueta}</label>
    {area ? <textarea {...comunes} rows={5} maxLength={largo} /> :
      <input {...comunes} maxLength={largo} type={cantidad ? 'number' : 'text'}
        min={cantidad ? '0.01' : undefined} max={cantidad ? '99999999.99' : undefined} step={cantidad ? '0.01' : undefined} />}
    {errores?.length ? <p id={`${id}-error`} className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{errores.join('. ')}</p> : null}
  </div>
}
