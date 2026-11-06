'use client'

import { useState } from 'react'
import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { deshacer, iniciarHistorial, registrar, rehacer, type Historial } from './historial.ts'

type Configuracion = ConfiguracionCerramiento | null

/**
 * Configuración del diseñador con deshacer y rehacer. `registrar` sustituye a
 * `setConfiguracion`: cada cambio aceptado es un paso. `alMoverse` recibe la
 * configuración resultante de deshacer o rehacer para ajustar la selección.
 */
export function useHistorialCerramiento(inicial: () => Configuracion, alMoverse: (configuracion: Configuracion) => void) {
  const [historial, setHistorial] = useState<Historial<Configuracion>>(() => iniciarHistorial(inicial()))
  const paso = (operacion: (h: Historial<Configuracion>) => Historial<Configuracion>) => {
    const siguiente = operacion(historial)
    if (siguiente === historial) return
    setHistorial(siguiente)
    alMoverse(siguiente.presente)
  }
  return {
    configuracion: historial.presente,
    registrar: (siguiente: Configuracion) => setHistorial((actual) => registrar(actual, siguiente)),
    deshacer: () => paso(deshacer),
    rehacer: () => paso(rehacer),
    puedeDeshacer: historial.pasado.length > 0,
    puedeRehacer: historial.futuro.length > 0,
  }
}
