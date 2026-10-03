'use client'

import React from 'react'
import {
  anclajesCerramiento, UNIONES_VISUALES, unionConfigurada, type ConfiguracionCerramiento,
} from '@aluminior/core/estructuras'

export type Entrada =
  | { tipo: 'modulo'; id: string; indice: number; texto: string }
  | { tipo: 'union'; id: string; indice: number; texto: string; configurada: boolean; lado: 'derecha' | 'abajo' | 'izquierda' }

/** Orden de creación, como la lista de Productor: cada elemento seguido de su unión. */
export function entradasCerramiento(configuracion: ConfiguracionCerramiento): Entrada[] {
  const anclajes = anclajesCerramiento(configuracion)
  const uniones = new Map(configuracion.uniones.map((union) => [union.id, union]))
  const entradas: Entrada[] = []
  for (const modulo of configuracion.modulos) {
    entradas.push({ tipo: 'modulo', id: modulo.id, indice: entradas.length,
      texto: `${modulo.estructuraCodigo} de ${modulo.anchoMm} x ${modulo.altoMm}` })
    const anclaje = anclajes.get(modulo.id)
    const union = anclaje && uniones.get(anclaje.unionId)
    if (!anclaje || !union) continue
    const catalogo = UNIONES_VISUALES.find((item) => item.codigo === union.codigo)
    entradas.push({ tipo: 'union', id: union.id, indice: entradas.length, lado: anclaje.lado,
      configurada: unionConfigurada(union),
      texto: unionConfigurada(union) ? `${union.codigo} ${catalogo?.descripcion ?? ''}`.trim() : '*(UNION NO CONFIG.)' })
  }
  return entradas
}

export function ListaElementos({ configuracion, seleccionadoId, onSeleccionar }: {
  configuracion: ConfiguracionCerramiento | null
  seleccionadoId: string | null
  onSeleccionar: (entrada: Entrada) => void
}) {
  const entradas = configuracion ? entradasCerramiento(configuracion) : []
  return (
    <ol className="al-lista-elementos" aria-label="Elementos y uniones">
      {entradas.map((entrada) => (
        <li key={entrada.id}>
          <button type="button" aria-current={entrada.id === seleccionadoId || undefined}
            data-tipo={entrada.tipo}
            data-pendiente={entrada.tipo === 'union' && !entrada.configurada || undefined}
            onClick={() => onSeleccionar(entrada)}>
            <span className="al-lista-icono" aria-hidden="true"
              data-lado={entrada.tipo === 'union' ? entrada.lado : undefined} />
            <span className="cifra">{entrada.indice}</span>
            <span>{entrada.texto}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}
