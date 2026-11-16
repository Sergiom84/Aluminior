'use client'

import React, { useMemo } from 'react'
import {
  registrarCatalogoDiseno, registrarEstructurasSinDibujo,
  type EstructuraSinDibujo, type PlantillaDiseno,
} from '@aluminior/core/estructuras'

/**
 * Registra en el navegador el catálogo generado en el servidor antes de
 * pintar a sus hijos, que validan y dibujan por código de estructura.
 */
export function CatalogoDiseno({ plantillas, sinDibujo = [], children }: {
  plantillas: readonly PlantillaDiseno[]
  sinDibujo?: readonly EstructuraSinDibujo[]
  children: React.ReactNode
}) {
  useMemo(() => {
    registrarCatalogoDiseno(plantillas)
    registrarEstructurasSinDibujo(sinDibujo)
  }, [plantillas, sinDibujo])
  return <>{children}</>
}
