'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { crearPresupuesto, type Estado } from '../_lib/acciones.ts'
import { Shell } from '../../_components/shell.tsx'

export default function NuevoPresupuesto() {
  const router = useRouter()
  const [estado, accion, enviando] = useActionState<Estado, FormData>(
    async (previo, datos) => {
      const r = await crearPresupuesto(previo, datos)
      if (r?.ok) router.push(`/dashboard/presupuestos/${r.id}`)
      return r
    },
    null,
  )

  const err = estado && !estado.ok ? estado.errores : {}
  const entrada = 'w-full rounded-md border px-3 py-2 text-sm'
  const estilo = { background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }

  return (
    <Shell moduloActivo="presupuestos">
      <form action={accion} className="max-w-2xl">
        {estado && !estado.ok && estado.mensaje && (
          <div className="mb-5 rounded-md border p-3 text-sm"
            style={{ background: 'var(--al-error-soft)', borderColor: 'var(--al-error)' }}>
            {estado.mensaje}
          </div>
        )}

        <fieldset className="mb-5 rounded-lg border p-5"
          style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
          <legend className="px-2 text-sm font-semibold">Datos del presupuesto</legend>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label htmlFor="clienteCodigo" className="mb-1 block text-sm font-medium">
                Código de cliente
              </label>
              <input id="clienteCodigo" name="clienteCodigo" className={entrada} style={estilo}
                placeholder="00082" />
              <p className="mt-1 text-xs" style={{ color: 'var(--al-text-faint)' }}>
                Opcional si escribes un nombre abajo.
              </p>
            </div>

            <div className="col-span-1">
              <label htmlFor="tarifa" className="mb-1 block text-sm font-medium">Tarifa</label>
              <input id="tarifa" name="tarifa" type="number" min={1} max={9} defaultValue={1}
                className={entrada} style={estilo} />
            </div>

            <div className="col-span-2">
              <label htmlFor="nombreLibre" className="mb-1 block text-sm font-medium">
                Nombre (si no hay ficha de cliente)
              </label>
              <input id="nombreLibre" name="nombreLibre" className={entrada}
                style={{ ...estilo, borderColor: err.nombreLibre ? 'var(--al-error)' : estilo.borderColor }}
                placeholder="LUISFER" />
              {err.nombreLibre && (
                <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>
                  {err.nombreLibre.join('. ')}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label htmlFor="obraTexto" className="mb-1 block text-sm font-medium">Obra</label>
              <input id="obraTexto" name="obraTexto" className={entrada} style={estilo}
                placeholder="MANOJO DE ROSAS 120" />
            </div>

            <div className="col-span-1">
              <label htmlFor="formaPago" className="mb-1 block text-sm font-medium">Forma de pago</label>
              <input id="formaPago" name="formaPago" className={entrada} style={estilo}
                placeholder="TRANSFERENCIA" />
            </div>
          </div>
        </fieldset>

        <div className="flex gap-3">
          <button type="submit" disabled={enviando}
            className="rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>
            {enviando ? 'Creando…' : 'Crear presupuesto'}
          </button>
          <button type="button" onClick={() => router.push('/dashboard/presupuestos')}
            className="rounded-md border px-5 py-2 text-sm"
            style={{ borderColor: 'var(--al-border-strong)' }}>
            Cancelar
          </button>
        </div>
      </form>
    </Shell>
  )
}
