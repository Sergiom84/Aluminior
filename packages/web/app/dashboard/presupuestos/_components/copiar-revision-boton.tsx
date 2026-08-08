'use client'

import { useEffect, useRef, useReducer, useTransition, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { copiarComoRevision } from '../_lib/copia/copiar-revision-identica.ts'
import { copiarComoNuevo } from '../_lib/copia/copiar-como-nuevo.ts'
import { ESTADO_INICIAL, reducirConfirmacion, type Operacion } from './estado-copia-revision.ts'

interface Props {
  readonly presupuestoId: string
  readonly numero: number
  readonly revision: number
  readonly serie: string
}

const ERROR_INESPERADO = 'No se pudo copiar el presupuesto'

const EJECUTOR: Record<Operacion, (id: string) => Promise<{ ok: true; presupuestoId: string } | { ok: false; error: string }>> = {
  REVISION: copiarComoRevision,
  NUEVO: copiarComoNuevo,
}

const TEXTO_PROGRESO: Record<Operacion, string> = {
  REVISION: 'Copiando como nueva revisión…',
  NUEVO: 'Copiando como nuevo presupuesto…',
}

const ETIQUETA_OPERACION: Record<Operacion, string> = {
  REVISION: 'Nueva revisión',
  NUEVO: 'Nuevo presupuesto',
}

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

  const onKeyDownGrupo = (evento: KeyboardEvent) => {
    // Escape cierra la elección o un error; NO interrumpe un envío en curso
    // — el reducer ignora CANCELAR mientras la fase es ENVIANDO.
    if (evento.key === 'Escape') cancelar()
  }

  const ejecutar = (operacion: Operacion) => {
    if (estado.fase !== 'ELIGIENDO' && estado.fase !== 'ERROR') return
    dispatch({ tipo: 'ENVIAR', operacion })
    iniciar(async () => {
      try {
        const resultado = await EJECUTOR[operacion](presupuestoId)
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
        Copiar…
      </button>
    )
  }

  const documento = `${String(numero).padStart(6, '0')}-${revision} (${serie})`

  if (estado.fase === 'ELIGIENDO') {
    return (
      <div className="al-confirm-inline" role="group" aria-label="Copiar presupuesto" onKeyDown={onKeyDownGrupo}>
        <span className="al-confirm-inline-texto">Copiar {documento} como:</span>
        <button type="button" className="al-command-primary" onClick={() => ejecutar('REVISION')} autoFocus>
          Nueva revisión
        </button>
        <button type="button" className="al-command" onClick={() => ejecutar('NUEVO')}>
          Nuevo presupuesto
        </button>
        <button type="button" className="al-command" onClick={cancelar}>
          Cancelar
        </button>
      </div>
    )
  }

  const pendiente = estado.fase === 'ENVIANDO'
  const operacion = estado.operacion

  return (
    <div className="al-confirm-inline" role="group" aria-label="Copiar presupuesto" onKeyDown={onKeyDownGrupo}>
      <span className="al-confirm-inline-texto">
        {pendiente ? TEXTO_PROGRESO[operacion] : `Copiar ${documento} como ${ETIQUETA_OPERACION[operacion]}`}
      </span>
      <button type="button" className="al-command-primary" disabled={pendiente}
        onClick={() => ejecutar(operacion)} autoFocus>
        {pendiente ? 'Copiando…' : 'Reintentar'}
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
