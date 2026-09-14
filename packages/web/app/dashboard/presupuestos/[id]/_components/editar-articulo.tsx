'use client'
import { useActionState, useRef } from 'react'
import { editarArticulo } from '../../_lib/editar-articulo-action'
import type { EstadoEdicion } from '../../_lib/edicion/estado'
import { CampoEdicion, usarResultadoEdicion } from './campo-edicion'
import styles from '../presupuesto-movil.module.css'

export function EditarArticulo({ presupuestoId, lineaId, cantidad, referencia, onCancelar }: {
  presupuestoId: string; lineaId: string; cantidad: string; referencia: string | null; onCancelar: () => void
}) {
  const [estado, accion, guardando] = useActionState<EstadoEdicion, FormData>(editarArticulo, null)
  const formulario = useRef<HTMLFormElement>(null)
  usarResultadoEdicion(estado, formulario, onCancelar)
  const errores = estado && !estado.ok ? estado.errores : {}
  return <form ref={formulario} action={accion} aria-label="Editar artículo"
    className={`${styles.editorForm} rounded-md border p-4`} style={{ borderColor: 'var(--al-accent)' }}>
    <input type="hidden" name="presupuestoId" value={presupuestoId} />
    <input type="hidden" name="lineaId" value={lineaId} />
    {estado && !estado.ok && estado.mensaje && <p role="alert" tabIndex={-1} style={{ color: 'var(--al-error)' }}>{estado.mensaje}</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <CampoEdicion id={`cantidad-${lineaId}`} nombre="cantidad" etiqueta="Cantidad" valor={cantidad} errores={errores.cantidad} cantidad />
      <CampoEdicion id={`referencia-${lineaId}`} nombre="referencia" etiqueta="Ubicación" valor={referencia} errores={errores.referencia} largo={60} />
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="submit" disabled={guardando} className="al-command-primary">{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
      <button type="button" disabled={guardando} onClick={onCancelar} className="al-command">Cancelar</button>
    </div>
  </form>
}
