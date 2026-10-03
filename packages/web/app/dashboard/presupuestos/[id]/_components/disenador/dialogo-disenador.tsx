'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

/** Diálogo nativo: foco atrapado, Escape y retorno al control que lo abrió. */
export function DialogoDisenador({ titulo, onCerrar, children, bloqueado = false }: {
  titulo: string; onCerrar: () => void; children: ReactNode; bloqueado?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const tituloId = useId()
  useEffect(() => {
    const dialogo = ref.current!
    const anterior = document.activeElement as HTMLElement | null
    const region = anterior?.closest('.al-designer')
    dialogo.showModal()
    dialogo.querySelector<HTMLElement>('[data-foco-inicial]')?.focus()
    return () => {
      dialogo.close()
      if (anterior?.isConnected) anterior.focus()
      else queueMicrotask(() => region?.querySelector<SVGElement>('.al-chain-module[data-selected="true"]')?.focus())
    }
  }, [])
  return <dialog ref={ref} aria-labelledby={tituloId} className="al-dialogo-disenador"
    onCancel={evento => { evento.preventDefault(); if (!bloqueado) onCerrar() }}>
    <div className="al-dialogo-cabecera">
      <h3 id={tituloId}>{titulo}</h3>
      <button type="button" className="al-command" onClick={onCerrar} disabled={bloqueado}>Cerrar</button>
    </div>
    {children}
  </dialog>
}
