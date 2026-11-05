/**
 * Reparto del grosor de las uniones configuradas, observado en Productor
 * (docs/paridad/COMPARATIVA-PRESUPUESTOS-2026-11-01.md y contraste del
 * 02/11/2026): la unión no añade ancho al conjunto. Con `repartoUniones:
 * 'PIEZAS'` recorre la junta y resta la mitad de su grosor, una vez, a cada
 * pieza que toca. En un par aislado el recorrido es el lado común.
 *
 * Solo con ese campo, que pone crearConfiguracionCerramiento desde el
 * 02/11/2026. Las líneas anteriores, también al editarlas, conservan la
 * geometría con la que se guardaron. La unión sin configurar separa 20 mm,
 * como el diseñador de Productor, y deja la línea sin valorar.
 * El dibujo no cambia: `posicionesCerramiento` sigue acortando el rectángulo
 * de la unión al par anclado.
 */
import type { ConfiguracionCerramiento, ModuloCerramiento } from './cerramiento.ts'
import { type LadoAnclaje } from './composicion-cerramiento.ts'
import { recorridosUniones } from './recorrido-uniones.ts'

/** Longitud del lado común entre la pieza y su padre en el anclaje. */
export function longitudLadoComun(
  padre: Pick<ModuloCerramiento, 'anchoMm' | 'altoMm'>,
  hijo: Pick<ModuloCerramiento, 'anchoMm' | 'altoMm'>,
  lado: LadoAnclaje,
): number {
  return lado === 'abajo' ? Math.min(padre.anchoMm, hijo.anchoMm) : Math.min(padre.altoMm, hijo.altoMm)
}

export interface MedidasFabricacionCerramiento {
  modulos: ReadonlyMap<string, { anchoMm: number; altoMm: number }>
  uniones: ReadonlyMap<string, { longitudMm: number }>
}

/** Medidas con las que se despieza y valora cada pieza y cada unión. */
export function medidasFabricacionCerramiento(configuracion: ConfiguracionCerramiento): MedidasFabricacionCerramiento {
  const modulos = new Map(configuracion.modulos.map(m => [m.id, { anchoMm: m.anchoMm, altoMm: m.altoMm }]))
  const uniones = new Map(configuracion.uniones.map(u => [u.id, { longitudMm: u.longitudMm }]))
  if (configuracion.repartoUniones !== 'PIEZAS') return { modulos, uniones }
  const grosor = new Map(configuracion.uniones.map(u => [u.id, u.grosorMm]))
  for (const recorrido of recorridosUniones(configuracion)) {
    const mitad = (grosor.get(recorrido.unionId) ?? 0) / 2
    const campo = recorrido.eje === 'vertical' ? 'anchoMm' : 'altoMm'
    for (const id of recorrido.modulos) {
      const medidas = modulos.get(id)
      if (!medidas) continue
      modulos.set(id, { ...medidas, [campo]: medidas[campo] - mitad })
    }
    uniones.set(recorrido.unionId, { longitudMm: recorrido.longitudMm })
  }
  return { modulos, uniones }
}
