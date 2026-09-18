'use client'

import Link from 'next/link'
import s from './ficha-articulo.module.css'

const enlaceFicha = (codigo: string) => `/dashboard/articulos/${encodeURIComponent(codigo)}`

/**
 * Barra de `Artículos. Detalle`: Aceptar (F9), Cerrar (Esc), Emitir,
 * Siguiente Código, navegación entre registros y Eliminar. Emitir y
 * Eliminar aún no están disponibles y se muestran deshabilitados.
 */
export function BarraFicha({
  esNuevo, enviando, anterior, siguiente, confirmandoCierre,
  onCerrar, onConfirmarCierre, onCancelarCierre, onSiguienteCodigo,
}: {
  esNuevo: boolean
  enviando: boolean
  anterior: string | null
  siguiente: string | null
  confirmandoCierre: boolean
  onCerrar: () => void
  onConfirmarCierre: () => void
  onCancelarCierre: () => void
  onSiguienteCodigo: () => void
}) {
  return (
    <div className={`al-commandbar ${s.barra}`} aria-label="Acciones del artículo">
      <button type="submit" className="al-command-primary" disabled={enviando}
        title="Grabar datos (F9)" aria-keyshortcuts="F9">
        {enviando ? 'Grabando' : 'Aceptar'}
      </button>
      <button type="button" className="al-command" onClick={onCerrar}
        title="Cerrar sin grabar datos (Esc)" aria-keyshortcuts="Escape">Cerrar</button>
      <button type="button" className="al-command" disabled>Emitir</button>
      <button type="button" className="al-command" disabled={!esNuevo} onClick={onSiguienteCodigo}
        title="Obtener Código Siguiente">Siguiente Código</button>

      {confirmandoCierre && (
        <div className="al-confirm-inline" role="alertdialog" aria-label="Cerrar sin grabar">
          <span className="al-confirm-inline-texto">¿Desea cerrar sin grabar?</span>
          <button type="button" className="al-command" onClick={onConfirmarCierre} autoFocus>Sí</button>
          <button type="button" className="al-command" onClick={onCancelarCierre}>No</button>
        </div>
      )}

      <nav className={s.navegacion} aria-label="Navegación entre artículos">
        {anterior
          ? <Link className="al-command" href={enlaceFicha(anterior)} title="Pasar al registro anterior">Anterior</Link>
          : <span className="al-command" aria-disabled="true">Anterior</span>}
        {siguiente
          ? <Link className="al-command" href={enlaceFicha(siguiente)} title="Pasar al registro siguiente">Siguiente</Link>
          : <span className="al-command" aria-disabled="true">Siguiente</span>}
        <button type="button" className="al-command" disabled>Eliminar</button>
      </nav>
    </div>
  )
}
