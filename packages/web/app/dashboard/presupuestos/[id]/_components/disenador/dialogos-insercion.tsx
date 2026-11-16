'use client'

import type { EstructuraSinDibujo, PlantillaDiseno, PreferenciaMedidas } from '@aluminior/core/estructuras'
import { CatalogoInferior } from './catalogo-inferior.tsx'
import { DialogoDisenador } from './dialogo-disenador.tsx'

/** Elegir cierra el diálogo, con dibujo o sin él; un código inexistente lo deja abierto con el aviso. */
export function SelectorVentana({ onElegir, onElegirSinDibujo, onCerrar }: {
  onElegir: (plantilla: PlantillaDiseno) => void
  onElegirSinDibujo?: (estructura: EstructuraSinDibujo) => void
  onCerrar: () => void
}) {
  return <DialogoDisenador titulo="Añadir ventana" onCerrar={onCerrar}>
    <CatalogoInferior preparada={null} onPreparar={() => undefined} onArrastre={() => undefined}
      onColocar={onElegir} onElegir={onElegir}
      onColocarSinDibujo={onElegirSinDibujo && (estructura => { onElegirSinDibujo(estructura); onCerrar() })} />
  </DialogoDisenador>
}

export function PreguntaMedidas({ anchoMm, altoMm, onElegir, onCerrar, guardando, error }: {
  anchoMm: number; altoMm: number
  onElegir: (opcion: 'UNA' | 'TODAS' | 'NO') => void
  onCerrar: () => void; guardando: boolean; error: string | null
}) {
  return <DialogoDisenador titulo="¿Quieres ajustar a la misma medida?" onCerrar={onCerrar} bloqueado={guardando}>
    <p className="cifra">{anchoMm} × {altoMm} mm</p>
    <div className="al-dialogo-opciones">
      <button type="button" className="al-command-primary" data-foco-inicial disabled={guardando} onClick={() => onElegir('UNA')}>Sí</button>
      <button type="button" className="al-command" disabled={guardando} onClick={() => onElegir('TODAS')}>
        Sí, para esta ventana y todas las que vaya a añadir
      </button>
      <button type="button" className="al-command" disabled={guardando} onClick={() => onElegir('NO')}>
        No, y no vuelvas a preguntarlo en este presupuesto
      </button>
    </div>
    {error && <p role="alert">{error}</p>}
  </DialogoDisenador>
}

export function OpcionesMedidas({ preferencia, onElegir, onCerrar, guardando, error }: {
  preferencia: PreferenciaMedidas; onElegir: (opcion: PreferenciaMedidas) => void
  onCerrar: () => void; guardando: boolean; error: string | null
}) {
  return <DialogoDisenador titulo="Medidas de nuevas ventanas" onCerrar={onCerrar} bloqueado={guardando}>
    <div className="al-dialogo-opciones">
      {([
        ['PREGUNTAR', 'Preguntar al añadir'],
        ['COPIAR_PRIMERA', 'Copiar de la primera'],
        ['MODELO', 'Usar medidas del modelo'],
      ] as const).map(([valor, etiqueta]) => <button type="button" key={valor} className="al-command"
        aria-pressed={preferencia === valor} data-foco-inicial={preferencia === valor || undefined} disabled={guardando} onClick={() => onElegir(valor)}>{etiqueta}</button>)}
    </div>
    {error && <p role="alert">{error}</p>}
  </DialogoDisenador>
}
