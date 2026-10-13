'use client'

import { useEffect } from 'react'
import { ejecutarAtajoPresupuesto } from './teclado-presupuesto.ts'

export function AtajosPresupuesto() {
  useEffect(() => {
    const escuchar = (evento: KeyboardEvent) => { ejecutarAtajoPresupuesto(evento, document) }
    document.addEventListener('keydown', escuchar)
    return () => document.removeEventListener('keydown', escuchar)
  }, [])
  return null
}
