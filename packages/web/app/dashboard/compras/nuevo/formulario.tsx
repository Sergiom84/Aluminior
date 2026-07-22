'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { crearPedido, type Estado } from '../_lib/acciones.ts'

export function FormularioNuevoPedido({
  proveedores,
}: {
  proveedores: { codigo: string; nombre: string }[]
}) {
  const router = useRouter()
  const [estado, accion, enviando] = useActionState<Estado, FormData>(
    async (previo, datos) => {
      const r = await crearPedido(previo, datos)
      if (r?.ok) router.push(`/dashboard/compras/${r.id}`)
      return r
    },
    null,
  )

  const err = estado && !estado.ok ? estado.errores : {}
  const entrada = 'w-full rounded-md border px-3 py-2 text-sm'
  const estilo = { background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }

  return (
    <form action={accion} className="max-w-2xl">
      {estado && !estado.ok && estado.mensaje && (
        <div className="mb-5 rounded-md border p-3 text-sm"
          style={{ background: 'var(--al-error-soft)', borderColor: 'var(--al-error)' }}>
          {estado.mensaje}
        </div>
      )}

      <fieldset className="mb-5 rounded-lg border p-5"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <legend className="px-2 text-sm font-semibold">Datos del pedido</legend>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label htmlFor="proveedorCodigo" className="mb-1 block text-sm font-medium">Proveedor</label>
            <select id="proveedorCodigo" name="proveedorCodigo" defaultValue="" className={entrada}
              style={{ ...estilo, borderColor: err.proveedorCodigo ? 'var(--al-error)' : estilo.borderColor }}>
              <option value="" disabled>Elegir…</option>
              {proveedores.map((p) => (
                <option key={p.codigo} value={p.codigo}>{p.codigo} · {p.nombre}</option>
              ))}
            </select>
            {err.proveedorCodigo && (
              <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>
                {err.proveedorCodigo.join('. ')}
              </p>
            )}
          </div>

          <div className="col-span-1">
            <label htmlFor="referencia" className="mb-1 block text-sm font-medium">Referencia</label>
            <input id="referencia" name="referencia" className={entrada} style={estilo}
              placeholder="Nº de oferta / albarán" />
          </div>

          <div className="col-span-2">
            <label htmlFor="observaciones" className="mb-1 block text-sm font-medium">Observaciones</label>
            <textarea id="observaciones" name="observaciones" rows={2} className={entrada} style={estilo} />
          </div>
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button type="submit" disabled={enviando}
          className="rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50"
          style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>
          {enviando ? 'Creando…' : 'Crear pedido'}
        </button>
        <button type="button" onClick={() => router.push('/dashboard/compras')}
          className="rounded-md border px-5 py-2 text-sm"
          style={{ borderColor: 'var(--al-border-strong)' }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
