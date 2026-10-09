'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { borrarLinea } from '../../_lib/acciones.ts'

/** Un fallo deja la línea visible y permite reintentar, sin un botón bloqueado. */
export function BotonBorrarLinea({
  lineaId, presupuestoId,
}: { lineaId: string; presupuestoId: string }) {
  const router = useRouter()
  const [borrando, setBorrando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ocupado = useRef(false)
  const borrar = async () => {
    if (ocupado.current) return
    ocupado.current = true
    setBorrando(true)
    setError(null)
    try {
      const resultado = await borrarLinea(lineaId, presupuestoId)
      if (!resultado.ok) setError(resultado.mensaje ?? 'No se pudo eliminar la línea.')
      else router.refresh()
    } catch {
      setError('No se pudo confirmar la eliminación. Vuelve a intentarlo.')
    } finally {
      ocupado.current = false
      setBorrando(false)
    }
  }
  return <div>
    <button type="button" disabled={borrando} onClick={borrar}
      className="text-xs disabled:opacity-40" style={{ color: 'var(--al-error)' }}
      aria-label="Eliminar línea">
      {borrando ? 'Eliminando…' : 'Eliminar'}
    </button>
    {error && <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{error}</p>}
  </div>
}
