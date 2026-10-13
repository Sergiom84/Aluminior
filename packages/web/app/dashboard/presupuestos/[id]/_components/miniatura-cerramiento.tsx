import React from 'react'
import {
  geometriaAperturaVisual, geometriaCerramiento, proyectarCerramiento,
  type ConfiguracionCerramiento, type ElementoColocado, type RectVisual,
} from '@aluminior/core/estructuras'

function Rectangulo({ rect, clase }: { rect: RectVisual; clase: string }) {
  return <rect x={rect.x} y={rect.y} width={rect.ancho} height={rect.alto} className={clase} />
}

function ElementoMiniatura({ elemento }: { elemento: ElementoColocado }) {
  if (elemento.tipo === 'separador') {
    const clase = elemento.clase === 'union' ? 'al-union' : elemento.clase === 'travesano'
      ? 'al-traverse' : 'al-invisible-divider'
    return <Rectangulo rect={elemento} clase={clase} />
  }

  // Espesor gráfico acotado al hueco; no modifica las medidas de fabricación.
  const margen = Math.min(3, elemento.ancho / 6, elemento.alto / 6)
  const vidrio = { x: elemento.x + margen, y: elemento.y + margen,
    ancho: elemento.ancho - margen * 2, alto: elemento.alto - margen * 2 }
  const apertura = geometriaAperturaVisual(elemento.apertura, vidrio)
  const esOscilobatiente = elemento.apertura === 'oscilobatiente-izquierda'
    || elemento.apertura === 'oscilobatiente-derecha'
  return <g>
    {elemento.apertura !== 'fijo' && <Rectangulo rect={elemento} clase="al-sash" />}
    <Rectangulo rect={vidrio} clase="al-glass" />
    {apertura?.trazos.map((trazo, indice) => <path key={indice}
      d={trazo.map((punto, posicion) => `${posicion === 0 ? 'M' : 'L'} ${punto.x} ${punto.y}`).join(' ')}
      className={`al-opening-line${esOscilobatiente && indice === 1 ? ' al-opening-tilt' : ''}`} />)}
  </g>
}

/** Dibujo de la configuración guardada, completo y sin controles de edición. */
export function MiniaturaCerramiento({ configuracion }: { configuracion: ConfiguracionCerramiento }) {
  const geometria = geometriaCerramiento(configuracion)
  const { transformar } = proyectarCerramiento(geometria, {
    ancho: 240, alto: 160, margenX: 6, margenY: 6,
  })
  const modelos = configuracion.modulos.map((modulo) => modulo.estructuraCodigo).join(' + ')
  return <svg className="al-window-drawing" viewBox="0 0 240 160" width="100%"
    role="img" aria-label={`Cerramiento ${modelos}: ${geometria.anchoMm} × ${geometria.altoContractualMm} mm`}
    preserveAspectRatio="xMidYMid meet">
    <g pointerEvents="none">
      {geometria.modulos.map((modulo) => <g key={modulo.id}>
        <Rectangulo rect={transformar(modulo.rect)} clase="al-frame" />
        {modulo.elementos.map((elemento) => <ElementoMiniatura key={elemento.id}
          elemento={{ ...elemento, ...transformar(elemento) }} />)}
      </g>)}
      {geometria.uniones.map((union) => <Rectangulo key={union.id}
        rect={transformar(union.rect)} clase="al-union" />)}
    </g>
  </svg>
}
