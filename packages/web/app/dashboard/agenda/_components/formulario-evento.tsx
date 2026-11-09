'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { finSugerido } from '@aluminior/core/agenda'
import { borrarEvento, guardarEvento, type EstadoFormulario } from '../_lib/acciones.ts'

export interface BorradorEvento {
  id?: string
  titulo?: string
  dia: string
  horaInicio: string
  horaFin?: string
  observaciones?: string | null
}

export function FormularioEvento({
  borrador, onCerrar,
}: {
  borrador: BorradorEvento
  onCerrar: () => void
}) {
  const router = useRouter()
  const dialogo = useRef<HTMLDialogElement>(null)
  const cerrando = useRef(false)
  const [estado, accion, pendiente] = useActionState(guardarEvento, null as EstadoFormulario)
  const [confirmando, setConfirmando] = useState(false)
  const [errorQuitar, setErrorQuitar] = useState<string | null>(null)
  const [quitando, iniciar] = useTransition()
  const errores = estado && !estado.ok ? estado.errores : {}
  const fin = borrador.horaFin || finSugerido(borrador.horaInicio) || ''

  useEffect(() => {
    const nodo = dialogo.current
    cerrando.current = false
    nodo?.showModal()
    return () => {
      cerrando.current = true
      nodo?.close()
    }
  }, [])

  useEffect(() => {
    if (!estado?.ok) return
    onCerrar()
    router.refresh()
  }, [estado, onCerrar, router])

  function quitar() {
    if (!borrador.id) return
    iniciar(async () => {
      const resultado = await borrarEvento(borrador.id!)
      if (!resultado.ok) {
        setErrorQuitar(resultado.mensaje ?? 'No se pudo quitar')
        return
      }
      onCerrar()
      router.refresh()
    })
  }

  return (
    <dialog
      ref={dialogo}
      className="al-agenda-dialogo"
      aria-labelledby="agenda-trabajo"
      onClose={() => { if (!cerrando.current) onCerrar() }}
    >
      <form action={accion}>
        <h2 id="agenda-trabajo">Trabajo</h2>
        {estado && !estado.ok && estado.mensaje && <p role="alert" className="al-agenda-error">{estado.mensaje}</p>}
        {borrador.id && <input type="hidden" name="id" value={borrador.id} />}
        <label>
          Título
          <input name="titulo" required maxLength={200} autoFocus defaultValue={borrador.titulo ?? ''} data-invalido={errores.titulo ? 'true' : undefined} />
        </label>
        {errores.titulo && <p className="al-agenda-error">{errores.titulo.join('. ')}</p>}
        <div className="al-agenda-horas">
          <label>
            Día
            <input name="dia" type="date" required defaultValue={borrador.dia} data-invalido={errores.dia ? 'true' : undefined} />
          </label>
          <label>
            Inicio
            <input name="horaInicio" type="time" required step={60} defaultValue={borrador.horaInicio} data-invalido={errores.horaInicio ? 'true' : undefined} />
          </label>
          <label>
            Fin
            <input name="horaFin" type="time" required step={60} defaultValue={fin} data-invalido={errores.horaFin ? 'true' : undefined} />
          </label>
        </div>
        {errores.horaFin && <p className="al-agenda-error">{errores.horaFin.join('. ')}</p>}
        <label>
          Observaciones
          <textarea name="observaciones" rows={3} maxLength={4000} defaultValue={borrador.observaciones ?? ''} />
        </label>
        <div className="al-agenda-acciones">
          <button type="submit" className="al-command-primary" disabled={pendiente || quitando}>Guardar</button>
          <button type="button" className="al-command" onClick={onCerrar}>Cancelar</button>
          {borrador.id && !confirmando && (
            <button type="button" className="al-command" onClick={() => setConfirmando(true)}>Quitar</button>
          )}
          {confirmando && (
            <span className="al-confirm-inline">
              <button type="button" className="al-command" disabled={quitando} onClick={quitar}>Quitar</button>
              <button type="button" className="al-command" onClick={() => setConfirmando(false)}>Cancelar</button>
            </span>
          )}
        </div>
        {errorQuitar && <p role="alert" className="al-agenda-error">{errorQuitar}</p>}
      </form>
    </dialog>
  )
}
