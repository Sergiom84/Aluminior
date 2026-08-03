'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { crearPresupuesto, type Estado } from '../_lib/acciones.ts'
import { Shell } from '../../_components/shell.tsx'
import { SelectorCliente } from './selector-cliente.tsx'

export default function NuevoPresupuesto() {
  const router = useRouter()
  const [estado, accion, enviando] = useActionState<Estado, FormData>(
    async (previo, datos) => {
      const r = await crearPresupuesto(previo, datos)
      if (r?.ok) router.push(`/dashboard/presupuestos/${r.id}#configurador`)
      return r
    },
    null,
  )

  const err = estado && !estado.ok ? estado.errores : {}
  const entrada = 'w-full rounded-md border px-3 py-2 text-sm'
  const estilo = { background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }

  return (
    <Shell moduloActivo="presupuestos">
      <form action={accion} className="al-new-document">
        {estado && !estado.ok && estado.mensaje && (
          <div className="al-form-alert"
            style={{ background: 'var(--al-error-soft)', borderColor: 'var(--al-error)' }}>
            {estado.mensaje}
          </div>
        )}

        <header className="al-document-heading">
          <h2>Nuevo Documento</h2>
        </header>

        <fieldset className="al-new-document-fields">
          <legend>Nuevo Documento de Ventas</legend>

          <div className="al-new-document-grid">
            <div>
              <label htmlFor="delegacion">Delegación</label>
              <input id="delegacion" value="0016" readOnly aria-readonly="true" className={entrada} style={estilo} />
            </div>

            <SelectorCliente errores={err.clienteCodigo} />

            <div>
              <label htmlFor="potencialCodigo">Potencial</label>
              <input id="potencialCodigo" name="potencialCodigo" className={entrada} style={estilo}
                placeholder="Código" />
            </div>

            <div className="al-span-2">
              <label htmlFor="nombreLibre">Nombre</label>
              <input id="nombreLibre" name="nombreLibre" className={entrada}
                style={{ ...estilo, borderColor: err.nombreLibre ? 'var(--al-error)' : estilo.borderColor }}
                placeholder="Nombre libre" autoFocus />
              {err.nombreLibre && (
                <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>
                  {err.nombreLibre.join('. ')}
                </p>
              )}
            </div>

            <div className="al-span-2">
              <label htmlFor="obraTexto">Obra</label>
              <input id="obraTexto" name="obraTexto" className={entrada} style={estilo}
                placeholder="Descripción de la obra" />
            </div>

            <div>
              <label htmlFor="serie">Serie</label>
              <input id="serie" value="A" readOnly aria-readonly="true" className={entrada} style={estilo} />
            </div>

            <div>
              <label htmlFor="numero">Número</label>
              <input id="numero" value="Automático" readOnly aria-readonly="true" className={entrada} style={estilo} />
            </div>

            <div>
              <label htmlFor="estado">Estado</label>
              <input id="estado" value="PENDIENTE" readOnly aria-readonly="true" className={entrada} style={estilo} />
            </div>

            <div>
              <label htmlFor="tarifa">Tarifa</label>
              <input id="tarifa" name="tarifa" type="number" min={1} max={9} defaultValue={1}
                className={entrada} style={estilo} />
            </div>

            <div className="al-span-2">
              <label htmlFor="formaPago">Forma de pago</label>
              <input id="formaPago" name="formaPago" className={entrada} style={estilo} />
            </div>
          </div>
        </fieldset>

        <fieldset className="al-new-document-notes">
          <legend>Observaciones del cliente</legend>
          <textarea id="observaciones" name="observaciones" rows={5} />
        </fieldset>

        <div className="al-new-document-actions">
          <button type="submit" disabled={enviando}
            className="al-command-primary disabled:opacity-50">
            {enviando ? 'Creando…' : 'Aceptar y continuar'}
          </button>
          <button type="button" onClick={() => router.push('/dashboard/presupuestos')}
            className="al-command">
            Cerrar
          </button>
        </div>
      </form>
    </Shell>
  )
}
