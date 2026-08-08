'use client'

import { useEffect, useRef, useTransition, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import { copiarComoRevision } from '../_lib/copia/copiar-revision-identica.ts'
import { ESTADO_INICIAL, reducirConfirmacion } from './estado-copia-revision.ts'

interface Props {
  readonly presupuestoId: string
  readonly numero: number
  readonly revision: number
  readonly serie: string
}

const ERROR_INESPERADO = 'No se pudo copiar el presupuesto como nueva revisión'

export function CopiarRevisionBoton({ presupuestoId, numero, revision, serie }: Props) {
  const router = useRouter()
  const [estado, dispatch] = useReducer(reducirConfirmacion, ESTADO_INICIAL)
  const [, iniciar] = useTransition()
  const abrirRef = useRef<HTMLButtonElement>(null)
  const enfocarAlVolver = useRef(false)

  useEffect(() => {
    if (estado.fase === 'INACTIVO' && enfocarAlVolver.current) {
      enfocarAlVolver.current = false
      abrirRef.current?.focus()
    }
  }, [estado.fase])

  const cancelar = () => {
    enfocarAlVolver.current = true
    dispatch({ tipo: 'CANCELAR' })
  }

  const confirmar = () => {
    if (estado.fase !== 'ARMADO' && estado.fase !== 'ERROR') return
    dispatch({ tipo: 'ENVIAR' })
    iniciar(async () => {
      try {
        const resultado = await copiarComoRevision(presupuestoId)
        if (!resultado.ok) {
          dispatch({ tipo: 'FALLO', mensaje: resultado.error })
          return
        }
        dispatch({ tipo: 'EXITO' })
        router.push(`/dashboard/presupuestos/${resultado.presupuestoId}`)
      } catch {
        // Rechazo de la propia acción del servidor o fallo de red: mismo
        // mensaje genérico que un error controlado, nunca el detalle técnico.
        dispatch({ tipo: 'FALLO', mensaje: ERROR_INESPERADO })
      }
    })
  }

  if (estado.fase === 'INACTIVO') {
    return (
      <button type="button" ref={abrirRef} className="al-command"
        onClick={() => dispatch({ tipo: 'ARMAR' })}>
        Copiar como revisión
      </button>
    )
  }

  const pendiente = estado.fase === 'ENVIANDO'

  return (
    <div className="al-confirm-inline" role="group" aria-label="Confirmar copia como revisión"
      onKeyDown={(evento) => { if (evento.key === 'Escape') cancelar() }}>
      <span className="al-confirm-inline-texto">
        Copiar {String(numero).padStart(6, '0')}-{revision} ({serie}) como nueva revisión
      </span>
      <button type="button" className="al-command-primary" disabled={pendiente}
        onClick={confirmar} autoFocus>
        {pendiente ? 'Copiando…' : 'Confirmar'}
      </button>
      <button type="button" className="al-command" disabled={pendiente} onClick={cancelar}>
        Cancelar
      </button>
      {estado.fase === 'ERROR' && (
        <p className="al-confirm-inline-error" role="alert">{estado.mensaje}</p>
      )}
    </div>
  )
}
