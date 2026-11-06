/**
 * Historial de deshacer y rehacer del diseñador (DS2, decisión de Sergio del
 * 06/11/2026): un paso por cada cambio del conjunto. Puro, sin React.
 */
export interface Historial<T> { pasado: readonly T[]; presente: T; futuro: readonly T[] }

/** Pasos que se conservan hacia atrás; los más antiguos se descartan. */
export const LIMITE_HISTORIAL = 100

export const iniciarHistorial = <T>(presente: T): Historial<T> => ({ pasado: [], presente, futuro: [] })

/** Un cambio nuevo borra lo que se podía rehacer. Registrar el mismo valor no crea paso. */
export function registrar<T>(h: Historial<T>, siguiente: T): Historial<T> {
  if (Object.is(siguiente, h.presente)) return h
  return { pasado: [...h.pasado, h.presente].slice(-LIMITE_HISTORIAL), presente: siguiente, futuro: [] }
}

export function deshacer<T>(h: Historial<T>): Historial<T> {
  if (!h.pasado.length) return h
  return { pasado: h.pasado.slice(0, -1), presente: h.pasado.at(-1)!, futuro: [h.presente, ...h.futuro] }
}

export function rehacer<T>(h: Historial<T>): Historial<T> {
  if (!h.futuro.length) return h
  return { pasado: [...h.pasado, h.presente], presente: h.futuro[0]!, futuro: h.futuro.slice(1) }
}

/** Ctrl/Cmd+Z deshace; Ctrl/Cmd+Y o Ctrl/Cmd+Mayús+Z rehace. Los campos de texto conservan el suyo. */
export function accionDeTeclado(evento: { key: string; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean;
  altKey: boolean; target: EventTarget | null }): 'deshacer' | 'rehacer' | null {
  if (!(evento.ctrlKey || evento.metaKey) || evento.altKey) return null
  const objetivo = evento.target as HTMLElement | null
  if (objetivo && (objetivo.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(objetivo.tagName))) return null
  const tecla = evento.key.toLowerCase()
  if (tecla === 'z') return evento.shiftKey ? 'rehacer' : 'deshacer'
  if (tecla === 'y' && !evento.shiftKey) return 'rehacer'
  return null
}
