'use client'
import { useActionState, useCallback, useRef, useState } from 'react'
import { SelectorCliente } from '../../nuevo/selector-cliente'
import { editarCabecera } from '../../_lib/editar-cabecera-action'
import type { EstadoEdicion } from '../../_lib/edicion/estado'
import { CampoEdicion, usarResultadoEdicion } from './campo-edicion'

export interface DatosCabeceraEdicion {
  presupuestoId: string; clienteCodigo: string | null; clienteNombre: string | null;
  potencialCodigo: string | null; nombreLibre: string | null; obraTexto: string | null;
  formaPago: string | null; observaciones: string | null
}

function FormularioCabecera({ datos: d, cerrar }: { datos: DatosCabeceraEdicion; cerrar: () => void }) {
  const [estado, accion, guardando] = useActionState<EstadoEdicion, FormData>(editarCabecera, null)
  const formulario = useRef<HTMLFormElement>(null)
  usarResultadoEdicion(estado, formulario, cerrar)
  const errores = estado && !estado.ok ? estado.errores : {}
  return <form ref={formulario} action={accion} aria-label="Editar cabecera"
    className="mt-3 rounded-md border p-3" style={{ borderColor: 'var(--al-accent)' }}>
    <input type="hidden" name="presupuestoId" value={d.presupuestoId} />
    {estado && !estado.ok && estado.mensaje && <p role="alert" tabIndex={-1} style={{ color: 'var(--al-error)' }}>{estado.mensaje}</p>}
    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      <SelectorCliente inicial={d.clienteCodigo ? { codigo: d.clienteCodigo, nombre: d.clienteNombre ?? d.clienteCodigo } : null}
        errores={errores.clienteCodigo} />
      <CampoEdicion id="editar-potencial" nombre="potencialCodigo" etiqueta="Potencial" valor={d.potencialCodigo} errores={errores.potencialCodigo} />
      <CampoEdicion id="editar-nombre" nombre="nombreLibre" etiqueta="Nombre" valor={d.nombreLibre} errores={errores.nombreLibre} largo={200} />
      <CampoEdicion id="editar-obra" nombre="obraTexto" etiqueta="Obra" valor={d.obraTexto} errores={errores.obraTexto} largo={200} />
      <CampoEdicion id="editar-pago" nombre="formaPago" etiqueta="Forma de pago" valor={d.formaPago} errores={errores.formaPago} largo={60} />
      <CampoEdicion id="editar-observaciones" nombre="observaciones" etiqueta="Observaciones" valor={d.observaciones} errores={errores.observaciones} largo={4000} area />
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="submit" disabled={guardando} className="al-command-primary">{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
      <button type="button" disabled={guardando} onClick={cerrar} className="al-command">Cancelar</button>
    </div>
  </form>
}

export function EditarCabecera({ datos }: { datos: DatosCabeceraEdicion }) {
  const [abierto, setAbierto] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  const cerrar = useCallback(() => { setAbierto(false); requestAnimationFrame(() => boton.current?.focus()) }, [])
  return <div className="mt-3">
    <button ref={boton} type="button" className="al-command" aria-expanded={abierto}
      onClick={() => setAbierto(a => !a)}>Editar cabecera</button>
    {abierto && <FormularioCabecera datos={datos} cerrar={cerrar} />}
  </div>
}
