'use client'

import { useMemo, useState } from 'react'
import {
  CATEGORIAS_ESCAPARATE, categoriaConCatalogo, categoriaInicialEscaparate,
  itemsEscaparate, paginaEscaparate, type PlantillaDiseno,
} from '@aluminior/core/estructuras'
import { DibujoEstructura } from './dibujo-estructura.tsx'

export function Escaparate({
  onElegir,
}: {
  onElegir: (plantilla: PlantillaDiseno) => void
}) {
  const inicial = categoriaInicialEscaparate()
  const [categoriaId, setCategoriaId] = useState(inicial.id)
  const [pagina, setPagina] = useState(1)
  const items = useMemo(() => itemsEscaparate(categoriaId), [categoriaId])
  const vista = paginaEscaparate(items, pagina)

  return (
    <div className="al-escaparate" role="dialog" aria-label="Escaparate de estructuras">
      <nav className="al-escaparate-cats" aria-label="Categorías">
        {CATEGORIAS_ESCAPARATE.map((categoria) => {
          const conCatalogo = categoriaConCatalogo(categoria)
          return (
            <button key={categoria.id} type="button"
              aria-current={categoria.id === categoriaId ? 'true' : undefined}
              data-empty={!conCatalogo || undefined}
              onClick={() => { setCategoriaId(categoria.id); setPagina(1) }}>
              {categoria.nombre}
            </button>
          )
        })}
      </nav>

      <div className="al-escaparate-main">
        {vista.totalItems === 0 ? (
          <p className="al-escaparate-empty">
            Sin catálogo en esta categoría. Las estructuras verificadas están en
            Ventanas abatibles y Fijos.
          </p>
        ) : (
          <div className="al-escaparate-grid">
            {vista.items.map((plantilla) => (
              <button key={plantilla.codigo} type="button" className="al-escaparate-card"
                onClick={() => onElegir(plantilla)}
                aria-label={`${plantilla.descripcion} [${plantilla.codigo}]`}>
                <DibujoEstructura plantilla={plantilla} compacto />
                <span className="al-escaparate-name">{plantilla.descripcion}</span>
                <span className="al-escaparate-code">[{plantilla.codigo}]</span>
              </button>
            ))}
          </div>
        )}

        <footer className="al-escaparate-pager">
          <button type="button" className="al-command" disabled={vista.pagina <= 1}
            onClick={() => setPagina((actual) => actual - 1)}>Anterior</button>
          <span>Página {vista.pagina} de {vista.totalPaginas}</span>
          <button type="button" className="al-command"
            disabled={vista.pagina >= vista.totalPaginas}
            onClick={() => setPagina((actual) => actual + 1)}>Siguiente</button>
        </footer>
      </div>
    </div>
  )
}
