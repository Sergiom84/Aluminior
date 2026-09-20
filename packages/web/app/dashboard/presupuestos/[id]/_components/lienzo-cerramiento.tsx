'use client'

import {
  geometriaAperturaVisual, geometriaCerramiento, plantillaDiseno,
  type ConfiguracionCerramiento, type ElementoColocado, type RectVisual,
} from '@aluminior/core/estructuras'

export type ParteVisual = 'marco' | 'hoja' | 'vidrio' | 'travesano' | 'union'
export type ParteSeleccionada = { moduloId: string; elemento: string; parte: ParteVisual }

export function LienzoCerramiento({ configuracion, moduloActivoId, seleccion, onModuloActivo, onSeleccion }: {
  configuracion: ConfiguracionCerramiento
  moduloActivoId: string
  seleccion: ParteSeleccionada
  onModuloActivo: (id: string) => void
  onSeleccion: (seleccion: ParteSeleccionada) => void
}) {
  const geometria = geometriaCerramiento(configuracion)
  const margen = Math.max(40, geometria.altoVisibleMm * .08)
  return (
    <svg className="al-chain-drawing"
      viewBox={`${-margen} ${-margen} ${geometria.anchoMm + margen * 2} ${geometria.altoVisibleMm + margen * 2}`}
      preserveAspectRatio="xMidYMid meet" role="group" aria-label="Composición del cerramiento">
      {geometria.modulos.map((modulo, indice) => {
        const plantilla = plantillaDiseno(configuracion.modulos[indice].estructuraCodigo)!
        const activa = modulo.id === moduloActivoId
        return (
          <g key={modulo.id} role="button" tabIndex={0}
            aria-label={`Elemento ${indice + 1}: ${plantilla.descripcion}`}
            data-selected={activa} className="al-chain-module"
            onClick={() => {
              onModuloActivo(modulo.id)
              const hueco = modulo.elementos.find((elemento) => elemento.tipo === 'hueco')
              if (hueco) onSeleccion({ moduloId: modulo.id, elemento: hueco.id, parte: 'vidrio' })
            }}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault()
                evento.currentTarget.dispatchEvent(new MouseEvent('click', { bubbles: true }))
              }
            }}>
            <rect {...svgRect(modulo.rect)} className={activa ? 'al-frame al-module-selected' : 'al-frame'} />
            {modulo.elementos.map((elemento) => <ElementoModulo key={`${modulo.id}-${elemento.id}`}
              elemento={elemento} moduloId={modulo.id} seleccion={seleccion} onSeleccion={onSeleccion} />)}
          </g>
        )
      })}
      {geometria.uniones.map((union, indice) => (
        <g key={union.id} role="button" tabIndex={0} className="al-chain-union"
          aria-label={`Unión ${indice + 1}: ${union.codigo}`}
          data-selected={seleccion.parte === 'union' && seleccion.elemento === union.id}
          onClick={() => onSeleccion({ moduloId: union.id, elemento: union.id, parte: 'union' })}
          onKeyDown={(evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') {
              evento.preventDefault()
              onSeleccion({ moduloId: union.id, elemento: union.id, parte: 'union' })
            }
          }}>
          <rect {...svgRect(union.rect)} className="al-union" />
          <title>{union.codigo}</title>
        </g>
      ))}
    </svg>
  )
}

function ElementoModulo({ elemento, moduloId, seleccion, onSeleccion }: {
  elemento: ElementoColocado
  moduloId: string
  seleccion: ParteSeleccionada
  onSeleccion: (seleccion: ParteSeleccionada) => void
}) {
  const seleccionado = seleccion.moduloId === moduloId && seleccion.elemento === elemento.id
  if (elemento.tipo === 'separador') {
    const parte = elemento.clase === 'union' ? 'union' : 'travesano'
    const clase = elemento.clase === 'union' ? 'al-union' : elemento.clase === 'travesano'
      ? 'al-traverse' : 'al-invisible-divider'
    return <rect {...svgRect(elemento)} role="button" tabIndex={0}
      aria-label={`${parte === 'union' ? 'Unión' : 'Travesaño'} ${elemento.id}`}
      className={`${clase}${seleccionado ? ' al-part-selected' : ''}`}
      onClick={(evento) => { evento.stopPropagation(); onSeleccion({ moduloId, elemento: elemento.id, parte }) }}
      onKeyDown={(evento) => {
        if (evento.key === 'Enter' || evento.key === ' ') {
          evento.preventDefault(); evento.stopPropagation(); onSeleccion({ moduloId, elemento: elemento.id, parte })
        }
      }} />
  }
  const grosor = Math.min(elemento.ancho, elemento.alto) * .055
  const interior = contraer(elemento, grosor)
  return (
    <g>
      {elemento.apertura !== 'fijo' && <rect {...svgRect(elemento)} className="al-sash" />}
      <rect {...svgRect(interior)} role="button" tabIndex={0}
        aria-label={`Vidrio ${elemento.id}`}
        className={seleccionado && seleccion.parte === 'vidrio' ? 'al-glass al-part-selected' : 'al-glass'}
        onClick={(evento) => { evento.stopPropagation(); onSeleccion({ moduloId, elemento: elemento.id, parte: 'vidrio' }) }}
        onKeyDown={(evento) => {
          if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault(); evento.stopPropagation(); onSeleccion({ moduloId, elemento: elemento.id, parte: 'vidrio' })
          }
        }} />
      <Simbolo elemento={elemento} rect={interior} />
    </g>
  )
}

function contraer(rect: RectVisual, grosor: number): RectVisual {
  return { x: rect.x + grosor, y: rect.y + grosor,
    ancho: Math.max(1, rect.ancho - grosor * 2), alto: Math.max(1, rect.alto - grosor * 2) }
}

function svgRect(rect: RectVisual) {
  return { x: rect.x, y: rect.y, width: rect.ancho, height: rect.alto }
}

function Simbolo({ elemento, rect }: { elemento: Extract<ElementoColocado, { tipo: 'hueco' }>; rect: RectVisual }) {
  const apertura = geometriaAperturaVisual(elemento.apertura, rect)
  if (!apertura) return null
  return <g pointerEvents="none">
    {apertura.trazos.map((trazo, indice) => <path key={indice}
      d={trazo.map((punto, posicion) => `${posicion === 0 ? 'M' : 'L'} ${punto.x} ${punto.y}`).join(' ')}
      className="al-opening-line" />)}
    {elemento.manilla && <circle cx={apertura.xCierre} cy={rect.y + rect.alto / 2}
      r={Math.max(2, Math.min(rect.ancho, rect.alto) * .012)} className="al-handle-mark" />}
  </g>
}
