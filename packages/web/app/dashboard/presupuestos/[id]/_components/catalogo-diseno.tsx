'use client'

import React, { useMemo } from 'react'
import { registrarCatalogoDiseno, type PlantillaDiseno } from '@aluminior/core/estructuras'

/**
 * Registra en el navegador el catálogo generado en el servidor antes de
 * pintar a sus hijos, que validan y dibujan por código de estructura.
 */
export function CatalogoDiseno({ plantillas, children }: {
  plantillas: readonly PlantillaDiseno[]
  children: React.ReactNode
}) {
  useMemo(() => registrarCatalogoDiseno(plantillas), [plantillas])
  return <>{children}</>
}
