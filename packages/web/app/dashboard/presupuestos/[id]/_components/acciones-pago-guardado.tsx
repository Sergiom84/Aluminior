'use client'

import React, { useEffect, useState, useTransition, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { MetodoPagoPresupuesto } from '@aluminior/db/schema'
import { guardarPresupuestoAction, pagarPresupuestoAction } from '../../_lib/pago-presupuesto-action.ts'

type Fase =
  | { tipo: 'INACTIVO' }
  | { tipo: 'GUARDANDO' }
  | { tipo: 'GUARDADO' }
  | { tipo: 'ELIGIENDO_METODO' }
  | { tipo: 'CONFIRMANDO_PAGO'; metodo: MetodoPagoPresupuesto }
  | { tipo: 'PAGANDO'; metodo: MetodoPagoPresupuesto }
  | { tipo: 'ERROR'; mensaje: string }

function etiquetaMetodo(metodo: MetodoPagoPresupuesto): string {
  return metodo === 'METALICO' ? 'Metálico' : 'Transferencia'
}

export function AccionesPagoGuardado({
  presupuestoId, estado, metodoPago,
}: {
  presupuestoId: string
  estado: string
  metodoPago: string | null
}) {
  const router = useRouter()
  const [fase, setFase] = useState<Fase>({ tipo: 'INACTIVO' })
  const [, iniciar] = useTransition()
  const editable = estado === 'PENDIENTE'
  const ocupado = fase.tipo === 'GUARDANDO' || fase.tipo === 'PAGANDO'

  useEffect(() => {
    setFase({ tipo: 'INACTIVO' })
  }, [presupuestoId, estado])

  const guardar = () => {
    if (!editable || ocupado) return
    setFase({ tipo: 'GUARDANDO' })
    iniciar(async () => {
      try {
        const res = await guardarPresupuestoAction(presupuestoId)
        if (!res.ok) {
          setFase({ tipo: 'ERROR', mensaje: res.mensaje })
          return
        }
        setFase({ tipo: 'GUARDADO' })
        router.refresh()
      } catch {
        setFase({ tipo: 'ERROR', mensaje: 'No se pudo guardar el presupuesto. Vuelve a intentarlo.' })
      }
    })
  }

  const confirmarPago = (metodo: MetodoPagoPresupuesto) => {
    if (!editable || ocupado) return
    setFase({ tipo: 'PAGANDO', metodo })
    iniciar(async () => {
      try {
        const res = await pagarPresupuestoAction(presupuestoId, metodo)
        if (!res.ok) {
          setFase({ tipo: 'ERROR', mensaje: res.mensaje })
          return
        }
        setFase({ tipo: 'INACTIVO' })
        router.refresh()
      } catch {
        setFase({ tipo: 'ERROR', mensaje: 'No se pudo registrar el pago. Vuelve a intentarlo.' })
      }
    })
  }

  const onEscape = (evento: KeyboardEvent) => {
    if (evento.key === 'Escape' && !ocupado) setFase({ tipo: 'INACTIVO' })
  }

  return (
    <>
      <button type="button" className="al-command" disabled={!editable || ocupado} onClick={guardar}>
        {fase.tipo === 'GUARDANDO' ? 'Guardando…' : 'Guardar'}
      </button>
      <button type="button" className="al-command" disabled={!editable || ocupado}
        onClick={() => setFase({ tipo: 'ELIGIENDO_METODO' })}>
        Pagar
      </button>

      {fase.tipo === 'GUARDADO' && (
        <span role="status" className="text-xs font-medium" style={{ color: 'var(--al-ok)' }}>
          Guardado
        </span>
      )}

      {fase.tipo === 'ELIGIENDO_METODO' && (
        <div className="al-confirm-inline" role="group" aria-label="Elegir método de pago" onKeyDown={onEscape}>
          <span className="al-confirm-inline-texto">Pago:</span>
          <button type="button" className="al-command" autoFocus
            onClick={() => setFase({ tipo: 'CONFIRMANDO_PAGO', metodo: 'METALICO' })}>
            Metálico
          </button>
          <button type="button" className="al-command"
            onClick={() => setFase({ tipo: 'CONFIRMANDO_PAGO', metodo: 'TRANSFERENCIA' })}>
            Transferencia
          </button>
          <button type="button" className="al-command" onClick={() => setFase({ tipo: 'INACTIVO' })}>
            Cancelar
          </button>
        </div>
      )}

      {(fase.tipo === 'CONFIRMANDO_PAGO' || fase.tipo === 'PAGANDO') && (
        <div className="al-confirm-inline" role="alertdialog" aria-label="Confirmar pago" onKeyDown={onEscape}>
          <span className="al-confirm-inline-texto">
            ¿Confirmar pago por {etiquetaMetodo(fase.metodo)}?
          </span>
          <button type="button" className="al-command-primary" disabled={ocupado}
            onClick={() => confirmarPago(fase.metodo)}>
            {ocupado ? 'Pagando…' : 'Confirmar pago'}
          </button>
          <button type="button" className="al-command" disabled={ocupado} autoFocus
            onClick={() => setFase({ tipo: 'INACTIVO' })}>
            Cancelar
          </button>
        </div>
      )}

      {fase.tipo === 'ERROR' && (
        <span role="alert" className="text-xs" style={{ color: 'var(--al-error)' }}>
          {fase.mensaje}
        </span>
      )}

      {estado === 'ABONADO' && metodoPago && (
        <span className="text-xs" style={{ color: 'var(--al-text-muted)' }}>
          ({etiquetaMetodo(metodoPago as MetodoPagoPresupuesto)})
        </span>
      )}
    </>
  )
}
