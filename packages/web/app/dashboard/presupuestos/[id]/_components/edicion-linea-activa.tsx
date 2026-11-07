'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Un solo editor de línea a la vez, como en Productor: mientras se edita una
 * línea guardada, el alta se oculta (sin desmontarse, para no perder lo que
 * hubiera a medias) y no se puede abrir otra edición.
 */
const Contexto = createContext<{
  activa: string | null
  abrir: (id: string) => void
  cerrar: () => void
}>({ activa: null, abrir: () => undefined, cerrar: () => undefined })

export function EdicionLineaActiva({ children, inicial = null }: { children: ReactNode; inicial?: string | null }) {
  const [activa, setActiva] = useState<string | null>(inicial)
  const valor = useMemo(() => ({ activa, abrir: setActiva, cerrar: () => setActiva(null) }), [activa])
  return <Contexto.Provider value={valor}>
    {children}
  </Contexto.Provider>
}

export const useEdicionLineaActiva = () => useContext(Contexto)

/** Alta de línea: oculta mientras haya una línea en edición. */
export function AltaSinEdicionActiva({ children }: { children: ReactNode }) {
  const { activa } = useEdicionLineaActiva()
  return <div hidden={activa !== null}>{children}</div>
}
