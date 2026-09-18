'use client'

import {
  distribuirComposicion, type AperturaVisual, type ClaseSeparador, type PlantillaDiseno,
} from '@aluminior/core/estructuras'

export type ParteVisual = 'marco' | 'hoja' | 'vidrio' | 'travesano' | 'union'
export type ParteSeleccionada = { elemento: string; parte: ParteVisual }

export function DibujoEstructura({
  plantilla, compacto = false, anchoMm = plantilla.anchoMm, altoMm = plantilla.altoMm,
  seleccion, onSeleccion,
}: {
  plantilla: PlantillaDiseno
  compacto?: boolean
  anchoMm?: number
  altoMm?: number
  seleccion?: ParteSeleccionada
  onSeleccion?: (seleccion: ParteSeleccionada) => void
}) {
  const viewH = compacto ? 420 : 500
  const margen = compacto ? 24 : 38
  const altoDibujo = viewH - margen * 2
  const proporcionReal = compacto
    ? plantilla.anchoMm / Math.max(1, plantilla.altoMm)
    : anchoMm / Math.max(1, altoMm)
  const proporcion = Math.max(0.25, Math.min(4, proporcionReal))
  const viewW = Math.max(260, Math.min(820, altoDibujo * proporcion + margen * 2))
  const elementos = distribuirComposicion(plantilla.composicion, {
    x: margen, y: margen, ancho: viewW - margen * 2, alto: viewH - margen * 2,
  }, compacto ? 12 : 18)
  const marco = compacto ? 13 : 20

  return (
    <svg className="al-window-drawing" viewBox={`0 0 ${viewW} ${viewH}`}
      role="img" aria-label={plantilla.descripcion} preserveAspectRatio="xMidYMid meet">
      <g onClick={() => onSeleccion?.({ elemento: 'marco', parte: 'marco' })}
        className="al-window-part">
        <rect x={margen} y={margen} width={viewW - margen * 2} height={viewH - margen * 2}
          className={seleccion?.parte === 'marco' ? 'al-frame al-part-selected' : 'al-frame'} />
      </g>
      {elementos.filter((e) => e.tipo === 'hueco').map((hueco) => {
        const { x, y, ancho: w, alto: h } = hueco
        const esFijo = hueco.apertura === 'fijo'
        const relleno = esFijo ? marco * .7 : marco
        return (
          <g key={hueco.id}>
            {!esFijo && (
              <MarcoModulo x={x} y={y} w={w} h={h} grosor={marco}
                seleccionado={seleccion?.elemento === hueco.id && seleccion.parte === 'hoja'}
                onClick={() => onSeleccion?.({ elemento: hueco.id, parte: 'hoja' })} />
            )}
            <Vidrio x={x + relleno} y={y + relleno}
              w={Math.max(3, w - relleno * 2)} h={Math.max(3, h - relleno * 2)}
              seleccionado={seleccion?.elemento === hueco.id && seleccion.parte === 'vidrio'}
              onClick={() => onSeleccion?.({ elemento: hueco.id, parte: 'vidrio' })} />
            <SimboloApertura apertura={hueco.apertura} x={x + marco} y={y + marco}
              w={Math.max(3, w - marco * 2)} h={Math.max(3, h - marco * 2)} />
            {!esFijo && !compacto && (
              <>
                <Tirador apertura={hueco.apertura} x={x} y={y} w={w} h={h} />
                <Bisagras apertura={hueco.apertura} x={x} y={y} w={w} h={h} />
              </>
            )}
          </g>
        )
      })}
      {elementos.filter((e) => e.tipo === 'separador').map((separador) => (
        <Separador key={separador.id} {...separador}
          seleccionado={seleccion?.elemento === separador.id}
          onClick={() => onSeleccion?.({
            elemento: separador.id,
            parte: separador.clase === 'union' ? 'union' : 'travesano',
          })} />
      ))}
    </svg>
  )
}

function Separador({
  x, y, ancho, alto, clase, seleccionado, onClick,
}: {
  x: number; y: number; ancho: number; alto: number; clase: ClaseSeparador
  seleccionado: boolean; onClick: () => void
}) {
  const claseCss = clase === 'union' ? 'al-union' : clase === 'travesano'
    ? 'al-traverse' : 'al-invisible-divider'
  return (
    <g onClick={onClick} className="al-window-part">
      <rect x={x} y={y} width={ancho} height={alto}
        className={`${claseCss}${seleccionado ? ' al-part-selected' : ''}`} />
    </g>
  )
}

function MarcoModulo({ x, y, w, h, grosor, seleccionado, onClick }: {
  x: number; y: number; w: number; h: number; grosor: number
  seleccionado: boolean; onClick: () => void
}) {
  return (
    <g onClick={onClick} className="al-window-part">
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4}
        className={seleccionado ? 'al-sash al-part-selected' : 'al-sash'} />
      <line x1={x} y1={y} x2={x + grosor} y2={y + grosor} className="al-mitre" />
      <line x1={x + w} y1={y} x2={x + w - grosor} y2={y + grosor} className="al-mitre" />
      <line x1={x} y1={y + h} x2={x + grosor} y2={y + h - grosor} className="al-mitre" />
      <line x1={x + w} y1={y + h} x2={x + w - grosor} y2={y + h - grosor} className="al-mitre" />
    </g>
  )
}

function Vidrio({ x, y, w, h, seleccionado, onClick }: {
  x: number; y: number; w: number; h: number; seleccionado: boolean; onClick: () => void
}) {
  return <rect x={x} y={y} width={w} height={h} onClick={onClick}
    className={seleccionado ? 'al-glass al-part-selected' : 'al-glass'} />
}

function SimboloApertura({ apertura, x, y, w, h }: {
  apertura: AperturaVisual; x: number; y: number; w: number; h: number
}) {
  if (apertura === 'fijo') return null
  const derecha = apertura.endsWith('derecha')
  const bisagraX = derecha ? x : x + w
  const cierreX = derecha ? x + w : x
  const oscilo = apertura.startsWith('oscilobatiente')
  return (
    <g pointerEvents="none">
      <path d={`M ${bisagraX} ${y} L ${cierreX} ${y + h / 2} L ${bisagraX} ${y + h}`}
        className="al-opening-line" />
      {oscilo && (
        <path d={`M ${x} ${y + h} L ${x + w / 2} ${y} L ${x + w} ${y + h}`}
          className="al-opening-line al-opening-tilt" />
      )}
    </g>
  )
}

function Tirador({ apertura, x, y, w, h }: {
  apertura: AperturaVisual; x: number; y: number; w: number; h: number
}) {
  const derecha = apertura.endsWith('derecha')
  const tx = derecha ? x + w - 12 : x + 12
  return (
    <g className="al-handle" pointerEvents="none">
      <rect x={tx - 3} y={y + h / 2 - 18} width={6} height={36} rx={2} />
      <line x1={tx} y1={y + h / 2} x2={derecha ? tx - 9 : tx + 9} y2={y + h / 2} />
    </g>
  )
}

function Bisagras({ apertura, x, y, w, h }: {
  apertura: AperturaVisual; x: number; y: number; w: number; h: number
}) {
  const derecha = apertura.endsWith('derecha')
  const bx = derecha ? x - 3 : x + w - 3
  return (
    <g className="al-hinge" pointerEvents="none">
      <rect x={bx} y={y + 24} width={6} height={30} rx={2} />
      <rect x={bx} y={y + h - 54} width={6} height={30} rx={2} />
    </g>
  )
}
