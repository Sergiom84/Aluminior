/**
 * Reparto del grosor de las uniones configuradas, observado en Productor
 * (docs/paridad/COMPARATIVA-PRESUPUESTOS-2026-11-01.md): la unión no añade
 * ancho al conjunto, resta la mitad de su grosor a cada pieza contigua y mide
 * lo que el lado común. Ej.: 960 + GMU038 + 850 = 1810, piezas de 930 y 820.
 *
 * Solo con `repartoUniones: 'PIEZAS'`, que pone crearConfiguracionCerramiento
 * desde el 02/11/2026. Las líneas anteriores, también al editarlas, conservan
 * la geometría con la que se guardaron. La unión sin configurar
 * separa 20 mm, como el diseñador de Productor, y deja la línea sin valorar.
 */
import type { ConfiguracionCerramiento, ModuloCerramiento } from './cerramiento.ts'
import { anclajesCerramiento, unionConfigurada, type LadoAnclaje } from './composicion-cerramiento.ts'

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
  const porId = new Map(configuracion.modulos.map(m => [m.id, m]))
  const uniones = new Map(configuracion.uniones.map(u => [u.id, { longitudMm: u.longitudMm }]))
  const unionPorId = new Map(configuracion.uniones.map(u => [u.id, u]))
  for (const [hijoId, anclaje] of anclajesCerramiento(configuracion)) {
    const union = unionPorId.get(anclaje.unionId)
    const padre = porId.get(anclaje.moduloId)
    const hijo = porId.get(hijoId)
    if (configuracion.repartoUniones !== 'PIEZAS' || !union || !padre || !hijo || !unionConfigurada(union)) continue
    const mitad = union.grosorMm / 2
    const campo = anclaje.lado === 'abajo' ? 'altoMm' : 'anchoMm'
    for (const id of [padre.id, hijo.id]) {
      const medidas = modulos.get(id)!
      modulos.set(id, { ...medidas, [campo]: medidas[campo] - mitad })
    }
    uniones.set(union.id, { longitudMm: longitudLadoComun(padre, hijo, anclaje.lado) })
  }
  return { modulos, uniones }
}
