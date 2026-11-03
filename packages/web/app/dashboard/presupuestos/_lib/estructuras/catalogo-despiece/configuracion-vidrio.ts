import { esTipoHojaMarco, type FilaPlantillaCatalogo } from '@aluminior/core/despiece'
import type { RanuraAcristalamiento } from '../../lineas/guardar-linea.ts'

/** PLAN C.4: los slots son configuraciones de vidrio, no la cantidad de paños.
 * Esta entrada del motor aplica un solo vidrio a todos los huecos. El despiece
 * conserva cada paño con sus medidas; el snapshot registra esa configuración.
 */
export function configuracionVidrioCatalogo(plantilla: readonly FilaPlantillaCatalogo[],
  vidrio: string | null, variante: '1' | '2',
): RanuraAcristalamiento[] {
  const cristales = plantilla.filter(f => f.componente === '1')
  if (!cristales.length) return []
  return [{ slot: 1, variante,
    vidrioHojas: cristales.some(f => !esTipoHojaMarco(f.tipoHoja)) ? vidrio : null,
    vidrioFijos: cristales.some(f => esTipoHojaMarco(f.tipoHoja)) ? vidrio : null }]
}
