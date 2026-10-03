'use client'

import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { PREFERENCIAS_MEDIDAS, type PreferenciaMedidas } from '@aluminior/core/estructuras'
import { cambiarPreferenciaMedidas } from '../../../_lib/medidas-insercion-action.ts'

interface PreferenciaContexto {
  preferencia: PreferenciaMedidas
  guardando: boolean
  error: string | null
  cambiar: (preferencia: PreferenciaMedidas) => Promise<boolean>
}
const Contexto = createContext<PreferenciaContexto | null>(null)

export function PreferenciaMedidasPresupuesto({ presupuestoId, inicial, children }: {
  presupuestoId: string; inicial: string; children: ReactNode
}) {
  const [preferencia, setPreferencia] = useState<PreferenciaMedidas>(
    PREFERENCIAS_MEDIDAS.includes(inicial as PreferenciaMedidas) ? inicial as PreferenciaMedidas : 'PREGUNTAR')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ocupado = useRef(false)
  const cambiar = async (siguiente: PreferenciaMedidas) => {
    if (ocupado.current) return false
    ocupado.current = true
    setGuardando(true)
    setError(null)
    try {
      const resultado = await cambiarPreferenciaMedidas(presupuestoId, siguiente)
      if (!resultado.ok) { setError(resultado.mensaje); return false }
      setPreferencia(siguiente)
      return true
    } catch {
      setError('No se pudo guardar la preferencia. Vuelve a intentarlo.')
      return false
    } finally { ocupado.current = false; setGuardando(false) }
  }
  return <Contexto.Provider value={{ preferencia, guardando, error, cambiar }}>{children}</Contexto.Provider>
}

/** El configurador aislado (pruebas/QA) puede trabajar sin presupuesto. */
export function usePreferenciaMedidas(): PreferenciaContexto {
  const contexto = useContext(Contexto)
  const [local, setLocal] = useState<PreferenciaMedidas>('PREGUNTAR')
  return contexto ?? { preferencia: local, guardando: false, error: null,
    cambiar: async siguiente => { setLocal(siguiente); return true } }
}
