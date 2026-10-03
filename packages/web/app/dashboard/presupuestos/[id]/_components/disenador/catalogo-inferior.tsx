'use client'

import React, { useMemo, useState } from 'react'
import {
  CATEGORIAS_ESCAPARATE, categoriaConCatalogo, categoriaInicialEscaparate, itemsEscaparate,
  paginaEscaparate, type PlantillaDiseno,
} from '@aluminior/core/estructuras'
import { DibujoEstructura } from '../dibujo-estructura.tsx'

export const TIPO_ARRASTRE_ESTRUCTURA = 'application/x-aluminior-estructura'
const POR_PAGINA = 6

/**
 * Barra inferior del configurador: familias y miniaturas paginadas. En
 * Productor la miniatura solo actúa al arrastrarla; aquí el clic la deja
 * preparada para colocarla con teclado o pulsación en un anclaje, y el doble
 * clic la coloca directamente a la derecha.
 */
export function CatalogoInferior({ preparada, onPreparar, onArrastre, onColocar, onElegir }: {
  onElegir?: (plantilla: PlantillaDiseno) => void
  preparada: PlantillaDiseno | null
  onPreparar: (plantilla: PlantillaDiseno | null) => void
  onArrastre: (plantilla: PlantillaDiseno | null) => void
  onColocar: (plantilla: PlantillaDiseno) => void
}) {
  const [categoriaId, setCategoriaId] = useState(() => categoriaInicialEscaparate().id)
  const [pagina, setPagina] = useState(1)
  const items = useMemo(() => itemsEscaparate(categoriaId), [categoriaId])
  const vista = paginaEscaparate(items, pagina, POR_PAGINA)

  return (
    <div className="al-catalogo-inferior" aria-label="Catálogo de estructuras">
      <div className="al-catalogo-familias" role="listbox" aria-label="Familias">
        {CATEGORIAS_ESCAPARATE.map((categoria) => (
          <button key={categoria.id} type="button" role="option"
            aria-selected={categoria.id === categoriaId}
            data-foco-inicial={onElegir && categoria.id === categoriaId || undefined}
            data-empty={!categoriaConCatalogo(categoria) || undefined}
            onClick={() => { setCategoriaId(categoria.id); setPagina(1) }}>
            {categoria.nombre}
          </button>
        ))}
      </div>
      <div className="al-catalogo-miniaturas">
        {vista.items.map((plantilla) => (
          <button key={plantilla.codigo} type="button" draggable={!onElegir}
            className="al-designer-thumb" aria-pressed={preparada?.codigo === plantilla.codigo}
            title={`${plantilla.descripcion} [${plantilla.codigo}]`}
            aria-label={`${plantilla.descripcion} [${plantilla.codigo}]`}
            onClick={(evento) => {
              if (onElegir) { onElegir(plantilla); return }
              if (evento.detail < 2) onPreparar(preparada?.codigo === plantilla.codigo ? null : plantilla)
            }}
            onDoubleClick={() => { if (!onElegir) onColocar(plantilla) }}
            onDragStart={(evento) => {
              evento.dataTransfer.setData(TIPO_ARRASTRE_ESTRUCTURA, plantilla.codigo)
              evento.dataTransfer.effectAllowed = 'copy'
              onArrastre(plantilla)
            }}
            onDragEnd={() => onArrastre(null)}>
            <DibujoEstructura plantilla={plantilla} compacto />
            <span>{plantilla.codigo}</span>
          </button>
        ))}
      </div>
      <div className="al-catalogo-paginas">
        <button type="button" className="al-command" aria-label="Página anterior"
          disabled={vista.pagina <= 1} onClick={() => setPagina(vista.pagina - 1)}>&lt;&lt;</button>
        <button type="button" className="al-command" aria-label="Página siguiente"
          disabled={vista.pagina >= vista.totalPaginas} onClick={() => setPagina(vista.pagina + 1)}>&gt;&gt;</button>
        <span>Pág <b className="cifra">{vista.pagina}</b></span>
        <span>Total <b className="cifra">{vista.totalPaginas}</b></span>
      </div>
    </div>
  )
}
