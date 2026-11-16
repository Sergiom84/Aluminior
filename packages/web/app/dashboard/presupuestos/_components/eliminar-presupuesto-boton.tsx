'use client'

import { useEffect, useRef, useState, useTransition, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { eliminarPresupuesto } from '../_lib/borrar-presupuesto-action.ts'
import { ESTADO_BORRABLE } from '../_lib/borrado/borrar-presupuesto.ts'
import { referenciaPresupuesto } from '../_lib/identidad-documento.ts'

interface Props {
  readonly presupuestoId: string
  readonly numero: number
  readonly revision: number
  readonly estado: string
  /** Desde el detalle se vuelve al listado; desde el listado basta con refrescar. */
  readonly origen: 'detalle' | 'listado'
}

type Fase = { tipo: 'INACTIVO' } | { tipo: 'CONFIRMANDO' } | { tipo: 'ENVIANDO' } | { tipo: 'ERROR'; mensaje: string }

const ERROR_INESPERADO = 'No se pudo confirmar la eliminación. Vuelve a intentarlo.'

export function textoConfirmacionBorrado(numero: number, revision: number): string {
  return `¿Eliminar el presupuesto ${referenciaPresupuesto(numero, revision)}? No se puede deshacer.`
}

export function EliminarPresupuestoBoton({ presupuestoId, numero, revision, estado, origen }: Props) {
  const router = useRouter()
  const [fase, setFase] = useState<Fase>({ tipo: 'INACTIVO' })
  const [, iniciar] = useTransition()
  const abrirRef = useRef<HTMLButtonElement>(null)
  const enfocarAlVolver = useRef(false)

  useEffect(() => {
    if (fase.tipo === 'INACTIVO' && enfocarAlVolver.current) {
      enfocarAlVolver.current = false
      abrirRef.current?.focus()
    }
  }, [fase.tipo])

  // Cambiar de fila en el listado cierra una confirmación abierta de otra.
  useEffect(() => { setFase({ tipo: 'INACTIVO' }) }, [presupuestoId])

  if (estado !== ESTADO_BORRABLE) {
    return <button type="button" className="al-command al-command-danger" disabled>Eliminar</button>
  }

  const cancelar = () => {
    if (fase.tipo === 'ENVIANDO') return
    enfocarAlVolver.current = true
    setFase({ tipo: 'INACTIVO' })
  }

  const onKeyDownGrupo = (evento: KeyboardEvent) => {
    if (evento.key === 'Escape') cancelar()
  }

  const confirmar = () => {
    if (fase.tipo === 'ENVIANDO') return
    setFase({ tipo: 'ENVIANDO' })
    iniciar(async () => {
      try {
        const resultado = await eliminarPresupuesto(presupuestoId)
        if (!resultado.ok) {
          setFase({ tipo: 'ERROR', mensaje: resultado.mensaje })
          return
        }
        if (origen === 'detalle') router.replace('/dashboard/presupuestos')
        else {
          setFase({ tipo: 'INACTIVO' })
          router.refresh()
        }
      } catch {
        setFase({ tipo: 'ERROR', mensaje: ERROR_INESPERADO })
      }
    })
  }

  if (fase.tipo === 'INACTIVO') {
    return (
      <button type="button" ref={abrirRef} className="al-command al-command-danger"
        onClick={() => setFase({ tipo: 'CONFIRMANDO' })}>
        Eliminar
      </button>
    )
  }

  const enviando = fase.tipo === 'ENVIANDO'
  return (
    <div className="al-confirm-inline" role="alertdialog" aria-label="Eliminar presupuesto"
      aria-describedby={`eliminar-${presupuestoId}`} onKeyDown={onKeyDownGrupo}>
      <span id={`eliminar-${presupuestoId}`} className="al-confirm-inline-texto">
        {textoConfirmacionBorrado(numero, revision)}
      </span>
      <button type="button" className="al-command al-command-danger" disabled={enviando} onClick={confirmar}>
        {enviando ? 'Eliminando…' : 'Eliminar'}
      </button>
      <button type="button" className="al-command" disabled={enviando} onClick={cancelar} autoFocus>
        Cancelar
      </button>
      {fase.tipo === 'ERROR' && <p className="al-confirm-inline-error" role="alert">{fase.mensaje}</p>}
    </div>
  )
}
