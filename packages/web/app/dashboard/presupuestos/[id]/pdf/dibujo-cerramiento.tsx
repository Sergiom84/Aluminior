import React from 'react'
import { G, Path, Rect, Svg, Text, View } from '@react-pdf/renderer'
import {
  type AperturaVisual, type ConfiguracionCerramiento, type RectVisual,
} from '@aluminior/core/estructuras'
import {
  geometriaCerramientoPdf, geometriaHerrajesPdf, trazosAperturaPdf,
} from './geometria-cerramiento'

function Rectangulo({ rect, fill }: { rect: RectVisual; fill: string }) {
  return <Rect x={rect.x} y={rect.y} width={rect.ancho} height={rect.alto}
    fill={fill} stroke="#334155" strokeWidth={0.45} />
}

function HerrajesPdf({ apertura, manilla, rect }: {
  apertura: AperturaVisual; manilla: boolean; rect: RectVisual
}) {
  const geometria = geometriaHerrajesPdf(apertura, manilla, rect)
  if (!geometria) return null
  return <G>
    {geometria.bisagras.map((bisagra, indice) => <Rect key={indice}
      x={bisagra.x} y={bisagra.y} width={bisagra.ancho} height={bisagra.alto} fill="#334155" />)}
    {geometria.manilla && <Rect x={geometria.manilla.x} y={geometria.manilla.y}
      width={geometria.manilla.ancho} height={geometria.manilla.alto} fill="#334155" />}
  </G>
}

/** Bloque indivisible y acotado; recibe la configuración validada de la misma revisión. */
export function DibujoCerramientoPdf({ configuracion, ancho = 240, alto = 150 }: {
  configuracion: ConfiguracionCerramiento; ancho?: number; alto?: number
}) {
  const dibujo = geometriaCerramientoPdf(configuracion, ancho, alto)
  return <View wrap={false} style={{ width: ancho, height: alto }}>
    <Svg width={ancho} height={alto - 16} viewBox={`0 0 ${ancho} ${alto - 16}`}>
      {dibujo.modulos.map((modulo) => <G key={modulo.id}>
        <Rectangulo rect={modulo.rect} fill="#e2e8f0" />
        {modulo.elementos.map((elemento) => {
          if (elemento.tipo === 'separador') {
            return <Rectangulo key={elemento.id} rect={elemento} fill="#cbd5e1" />
          }
          // Espesor únicamente gráfico, limitado por el hueco; no descuenta fabricación.
          const margen = Math.min(3, elemento.ancho / 6, elemento.alto / 6)
          const vidrio = { x: elemento.x + margen, y: elemento.y + margen,
            ancho: elemento.ancho - 2 * margen, alto: elemento.alto - 2 * margen }
          return <G key={elemento.id}>
            <Rectangulo rect={vidrio} fill="#f8fafc" />
            {trazosAperturaPdf(elemento.apertura, vidrio).map((d, indice) =>
              <Path key={indice} d={d} fill="none" stroke="#475569" strokeWidth={0.55}
                strokeDasharray={indice === 1 ? '2 2' : undefined} />)}
            <HerrajesPdf apertura={elemento.apertura} manilla={elemento.manilla} rect={elemento} />
          </G>
        })}
      </G>)}
      {dibujo.uniones.map((union) => <Rectangulo key={union.id} rect={union.rect} fill="#94a3b8" />)}
    </Svg>
    <Text style={{ fontSize: 8, textAlign: 'center', fontFamily: 'Helvetica' }}>
      {dibujo.medidas.anchoMm} × {dibujo.medidas.altoMm} mm
    </Text>
  </View>
}
