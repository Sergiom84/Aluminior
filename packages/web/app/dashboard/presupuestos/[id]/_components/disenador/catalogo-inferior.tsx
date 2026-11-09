'use client'

import React, { useId, useMemo, useState } from 'react'
import {
  buscarVentanasPorCodigo, CATEGORIAS_ESCAPARATE, categoriaConCatalogo, categoriaInicialEscaparate,
  itemsEscaparate, paginaEscaparate, type PlantillaDiseno,
} from '@aluminior/core/estructuras'
import { DibujoEstructura } from '../dibujo-estructura.tsx'

export const TIPO_ARRASTRE_ESTRUCTURA = 'application/x-aluminior-estructura'
const POR_PAGINA = 6

/**
 * Barra inferior del configurador: familias, código y miniaturas paginadas.
 * En Productor la miniatura se arrastra; aquí el clic la deja preparada, el
 * doble clic la coloca a la derecha y el código exacto más Intro la elige.
 */
export function CatalogoInferior({ preparada, onPreparar, onArrastre, onColocar, onElegir, panelMosquiteras }: {
  /** Sustituye las miniaturas de la familia Mosquiteras (artículos con medidas, no módulos dibujables). */
  panelMosquiteras?: React.ReactNode
  onElegir?: (plantilla: PlantillaDiseno) => void
  preparada: PlantillaDiseno | null
  onPreparar: (plantilla: PlantillaDiseno | null) => void
  onArrastre: (plantilla: PlantillaDiseno | null) => void
  onColocar: (plantilla: PlantillaDiseno) => void
}) {
  const codigoId = useId()
  const avisoId = useId()
  const [categoriaId, setCategoriaId] = useState(() => categoriaInicialEscaparate().id)
  const [pagina, setPagina] = useState(1)
  const [consulta, setConsulta] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const busqueda = useMemo(() => buscarVentanasPorCodigo(consulta), [consulta])
  const buscando = busqueda.consulta.length > 0
  const items = useMemo(
    () => buscando ? busqueda.coincidencias : itemsEscaparate(categoriaId),
    [buscando, busqueda.coincidencias, categoriaId],
  )
  const vista = paginaEscaparate(items, pagina, POR_PAGINA)
  const mosquiterasActivas = Boolean(panelMosquiteras && categoriaId === 'mosquiteras' && !buscando)

  const cambiarConsulta = (valor: string) => {
    setConsulta(valor.toUpperCase().replace(/[\r\n]/g, ''))
    setAviso(null)
    setPagina(1)
  }
  const elegir = (plantilla: PlantillaDiseno) => {
    if (onElegir) onElegir(plantilla)
    else onColocar(plantilla)
  }
  const confirmarCodigo = () => {
    if (!busqueda.consulta) return
    if (busqueda.exacta) elegir(busqueda.exacta)
    else setAviso(`No hay una ventana con el código ${busqueda.consulta}.`)
  }

  return (
    <div className="al-catalogo-inferior" aria-label="Catálogo de estructuras">
      <div className="al-catalogo-familias" role="listbox" aria-label="Familias">
        {CATEGORIAS_ESCAPARATE.map((categoria) => (
          <button key={categoria.id} type="button" role="option"
            aria-selected={!buscando && categoria.id === categoriaId}
            data-empty={(!categoriaConCatalogo(categoria) && !(panelMosquiteras && categoria.id === 'mosquiteras')) || undefined}
            onClick={() => { setCategoriaId(categoria.id); setPagina(1); setConsulta(''); setAviso(null) }}>
            {categoria.nombre}
          </button>
        ))}
      </div>
      <div className="al-catalogo-modelos">
        <div className="al-catalogo-codigo">
          <label htmlFor={codigoId}>Código
            <input id={codigoId} className="cifra" value={consulta} autoComplete="off" autoCapitalize="characters"
              spellCheck={false} data-foco-inicial={onElegir ? true : undefined}
              aria-invalid={aviso ? true : undefined} aria-describedby={aviso ? avisoId : undefined}
              onChange={(evento) => cambiarConsulta(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key !== 'Enter') return
                evento.preventDefault()
                confirmarCodigo()
              }} />
          </label>
          <button type="button" className="al-command" disabled={!busqueda.consulta} onClick={confirmarCodigo}>Elegir</button>
          {busqueda.exacta && <span className="al-catalogo-codigo-nombre" title={busqueda.exacta.descripcion}>
            {busqueda.exacta.descripcion}
          </span>}
          {aviso && <p id={avisoId} role="alert">{aviso}</p>}
        </div>
        {mosquiterasActivas ? panelMosquiteras : (
          <div className="al-catalogo-miniaturas">
            {buscando && vista.totalItems === 0 ? <p className="al-catalogo-vacio">Sin modelos con ese código.</p>
              : vista.items.map((plantilla) => (
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
        )}
      </div>
      {!mosquiterasActivas && <div className="al-catalogo-paginas">
        <button type="button" className="al-command" aria-label="Página anterior"
          disabled={vista.pagina <= 1} onClick={() => setPagina(vista.pagina - 1)}>&lt;&lt;</button>
        <button type="button" className="al-command" aria-label="Página siguiente"
          disabled={vista.pagina >= vista.totalPaginas} onClick={() => setPagina(vista.pagina + 1)}>&gt;&gt;</button>
        <span>Pág <b className="cifra">{vista.pagina}</b></span>
        <span>Total <b className="cifra">{vista.totalPaginas}</b></span>
      </div>}
    </div>
  )
}
