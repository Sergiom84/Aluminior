import type { RectVisual } from '@aluminior/core/estructuras'

/** Cajón y guías dibujados sobre el hueco para que la elección se vea. */
export function CajonPersiana({ rect, altoCajonMm, altoModuloMm, guiaCentral, conGuias }: {
  rect: RectVisual
  altoCajonMm: number
  altoModuloMm: number
  guiaCentral: boolean
  conGuias: boolean
}) {
  const alto = Math.max(8, rect.alto * Math.min(0.32, altoCajonMm / Math.max(altoModuloMm, 1)))
  const guia = Math.max(3, rect.ancho * 0.035)
  const lamas = [0.35, 0.62]
  return (
    <g pointerEvents="none" aria-hidden="true">
      <rect x={rect.x} y={rect.y} width={rect.ancho} height={alto} className="al-cajon">
        <title>{`Cajón ${altoCajonMm} mm`}</title>
      </rect>
      {lamas.map((fraccion) => (
        <line key={fraccion} className="al-cajon-lama"
          x1={rect.x} x2={rect.x + rect.ancho} y1={rect.y + alto * fraccion} y2={rect.y + alto * fraccion} />
      ))}
      {conGuias && (
        <>
          <rect className="al-guia-persiana" x={rect.x} y={rect.y + alto} width={guia} height={Math.max(1, rect.alto - alto)} />
          <rect className="al-guia-persiana" x={rect.x + rect.ancho - guia} y={rect.y + alto} width={guia} height={Math.max(1, rect.alto - alto)} />
        </>
      )}
      {guiaCentral && (
        <line className="al-guia-central" x1={rect.x + rect.ancho / 2} x2={rect.x + rect.ancho / 2}
          y1={rect.y} y2={rect.y + alto} />
      )}
    </g>
  )
}
