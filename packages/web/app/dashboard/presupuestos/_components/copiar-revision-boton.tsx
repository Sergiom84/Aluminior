'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { copiarComoRevision } from '../_lib/copia/copiar-revision-identica.ts'

interface Props {
  readonly presupuestoId: string
  readonly numero: number
  readonly revision: number
  readonly serie: string
}

export function CopiarRevisionBoton({ presupuestoId, numero, revision, serie }: Props) {
  const router = useRouter()
  const [armado, setArmado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, iniciar] = useTransition()

  if (!armado) {
    return (
      <button type="button" className="al-command" disabled={enviando}
        onClick={() => { setError(null); setArmado(true) }}>
        Copiar como revisión
      </button>
    )
  }

  const confirmar = () => {
    iniciar(async () => {
      const resultado = await copiarComoRevision(presupuestoId)
      if (!resultado.ok) {
        setError(resultado.error)
        setArmado(false)
        return
      }
      router.push(`/dashboard/presupuestos/${resultado.presupuestoId}`)
    })
  }

  return (
    <div className="al-confirm-inline" role="group" aria-label="Confirmar copia como revisión">
      <span className="al-confirm-inline-texto">
        Copiar {String(numero).padStart(6, '0')}-{revision} ({serie}) como nueva revisión
      </span>
      <button type="button" className="al-command-primary" disabled={enviando}
        onClick={confirmar} autoFocus>
        {enviando ? 'Copiando…' : 'Confirmar'}
      </button>
      <button type="button" className="al-command" disabled={enviando}
        onClick={() => setArmado(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') setArmado(false) }}>
        Cancelar
      </button>
      {error && <p className="al-confirm-inline-error" role="alert">{error}</p>}
    </div>
  )
}
