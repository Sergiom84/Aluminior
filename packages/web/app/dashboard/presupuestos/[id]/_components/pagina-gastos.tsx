'use client'
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from 'react'
import { editarGastos } from '../../_lib/editar-gastos-action'
import type { EstadoEdicion } from '../../_lib/edicion/estado'

export interface DatosGastos {
  presupuestoId: string; comisionPorc: string; sumarComision: boolean; editable: boolean
}

/** Página `Gastos` de la ficha: `Comisión` % y `Sumar Comisión`. */
export function PaginaGastos({ datos: d }: { datos: DatosGastos }) {
  const [estado, accion, guardando] = useActionState<EstadoEdicion, FormData>(editarGastos, null)
  const formulario = useRef<HTMLFormElement>(null)
  // Envío sin `action`: React restablece el formulario tras una acción y perdería lo tecleado o la casilla.
  const [comision, setComision] = useState(String(Number(d.comisionPorc)))
  const [sumar, setSumar] = useState(d.sumarComision)
  useEffect(() => {
    if (estado && !estado.ok) formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus()
  }, [estado])
  const errores = estado && !estado.ok ? estado.errores.comisionPorc : undefined
  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    startTransition(() => accion(datos))
  }
  return <form ref={formulario} onSubmit={enviar} aria-label="Gastos" className="px-3 py-3">
    <input type="hidden" name="presupuestoId" value={d.presupuestoId} />
    {estado && !estado.ok && estado.mensaje &&
      <p role="alert" tabIndex={-1} className="mb-2 text-sm" style={{ color: 'var(--al-error)' }}>{estado.mensaje}</p>}
    {estado?.ok && <p role="status" className="mb-2 text-sm">{estado.mensaje}</p>}
    <fieldset disabled={!d.editable || guardando} className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <div>
        <label htmlFor="gastos-comision" className="mb-1 block text-sm">Comisión</label>
        <span className="inline-flex items-center gap-1">
          <input id="gastos-comision" name="comisionPorc" type="number" step="0.01" min="-99.99" max="999.99"
            value={comision} onChange={e => setComision(e.target.value)} inputMode="decimal"
            aria-invalid={errores?.length ? true : undefined}
            aria-describedby={errores?.length ? 'gastos-comision-error' : undefined}
            className="cifra w-28 rounded-md border px-3 py-2 text-right text-sm"
            style={{ background: 'var(--al-surface)', borderColor: errores?.length ? 'var(--al-error)' : 'var(--al-border-strong)' }} />
          <span className="text-sm">%</span>
        </span>
        {errores?.length ? <p id="gastos-comision-error" className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>
          {errores.join('. ')}</p> : null}
      </div>
      <label className="inline-flex items-center gap-2 py-2 text-sm">
        <input type="checkbox" name="sumarComision" checked={sumar} onChange={e => setSumar(e.target.checked)} /> Sumar Comisión
      </label>
      {d.editable && <button type="submit" className="al-command-primary">{guardando ? 'Guardando…' : 'Guardar cambios'}</button>}
    </fieldset>
  </form>
}
