'use client'

import { useActionState, useState } from 'react'
import {
  anyadirLinea, borrarLinea, cambiarEstado, costeSugerido, type Estado,
} from '../../_lib/acciones.ts'

const entrada = 'w-full rounded-md border px-3 py-2 text-sm'
const estilo = { background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }

/**
 * Alta de línea de pedido de compra.
 *
 * El coste unitario es INPUT del usuario. Al indicar artículo + acabado, se
 * intenta autocompletar la sugerencia desde `articulos_coste` (fuente medida),
 * pero SÓLO si es inequívoca; si no, el campo queda en blanco. Nunca se copia
 * el PVP ni se inventa un número (regla 3).
 */
export function AnyadirLinea({
  pedidoId, proveedorCodigo, acabados,
}: {
  pedidoId: string
  proveedorCodigo: string
  acabados: { codigo: string; descripcion: string }[]
}) {
  const [estado, accion, enviando] = useActionState<Estado, FormData>(anyadirLinea, null)
  const [articulo, setArticulo] = useState('')
  const [acabado, setAcabado] = useState('')
  const [coste, setCoste] = useState('')
  const [sugiriendo, setSugiriendo] = useState(false)
  const [sinSugerencia, setSinSugerencia] = useState(false)

  const err = estado && !estado.ok ? estado.errores : {}

  async function sugerir(codArticulo: string, codAcabado: string) {
    setSinSugerencia(false)
    if (!codArticulo.trim()) return
    setSugiriendo(true)
    try {
      const s = await costeSugerido(codArticulo.trim(), proveedorCodigo, codAcabado || undefined)
      if (s !== null) setCoste(String(s))
      else setSinSugerencia(true)
    } finally {
      setSugiriendo(false)
    }
  }

  return (
    <form action={accion} className="rounded-lg border p-5"
      style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
      <input type="hidden" name="pedidoId" value={pedidoId} />

      {estado && !estado.ok && estado.mensaje && (
        <div className="mb-4 rounded-md border p-3 text-sm"
          style={{ background: 'var(--al-warn-soft)', borderColor: 'var(--al-warn)' }}>
          {estado.mensaje}
        </div>
      )}

      <div className="grid grid-cols-12 items-end gap-3">
        <div className="col-span-2">
          <label htmlFor="articuloCodigo" className="mb-1 block text-sm font-medium">Artículo</label>
          <input id="articuloCodigo" name="articuloCodigo" className={entrada}
            style={{ ...estilo, borderColor: err.articuloCodigo ? 'var(--al-error)' : estilo.borderColor }}
            placeholder="PSM001"
            value={articulo}
            onChange={(e) => setArticulo(e.target.value)}
            onBlur={(e) => sugerir(e.target.value, acabado)} />
          {err.articuloCodigo && (
            <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{err.articuloCodigo.join('. ')}</p>
          )}
        </div>

        <div className="col-span-3">
          <label htmlFor="descripcion" className="mb-1 block text-sm font-medium">Descripción</label>
          <input id="descripcion" name="descripcion" className={entrada}
            style={{ ...estilo, borderColor: err.descripcion ? 'var(--al-error)' : estilo.borderColor }}
            placeholder="Se toma del artículo si se deja vacía" />
          {err.descripcion && (
            <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{err.descripcion.join('. ')}</p>
          )}
        </div>

        <div className="col-span-2">
          <label htmlFor="acabadoCodigo" className="mb-1 block text-sm font-medium">Acabado</label>
          <select id="acabadoCodigo" name="acabadoCodigo" value={acabado} className={entrada} style={estilo}
            onChange={(e) => { setAcabado(e.target.value); sugerir(articulo, e.target.value) }}>
            <option value="">— sin acabado —</option>
            {acabados.map((a) => (
              <option key={a.codigo} value={a.codigo}>{a.codigo} · {a.descripcion}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label htmlFor="cantidad" className="mb-1 block text-sm font-medium">Cdad.</label>
          <input id="cantidad" name="cantidad" type="number" defaultValue={1} min={0} step="any"
            className={`cifra ${entrada}`} style={estilo} />
        </div>

        <div className="col-span-2">
          <label htmlFor="costeUnitario" className="mb-1 block text-sm font-medium">Coste ud.</label>
          <input id="costeUnitario" name="costeUnitario" type="number" min={0} step="any"
            className={`cifra ${entrada}`}
            style={{ ...estilo, borderColor: err.costeUnitario ? 'var(--al-error)' : estilo.borderColor }}
            placeholder={sugiriendo ? 'buscando…' : 'sin coste'}
            value={coste}
            onChange={(e) => setCoste(e.target.value)} />
          {err.costeUnitario && (
            <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{err.costeUnitario.join('. ')}</p>
          )}
        </div>

        <div className="col-span-2">
          <button type="submit" disabled={enviando}
            className="w-full rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>
            {enviando ? '…' : 'Añadir'}
          </button>
        </div>
      </div>

      {sinSugerencia && (
        <p className="mt-2 text-xs" style={{ color: 'var(--al-text-soft)' }}>
          Sin coste fiable en el histórico para ese artículo y proveedor: introdúcelo a mano
          o déjalo vacío (la línea quedará &quot;sin coste&quot;).
        </p>
      )}
    </form>
  )
}

export function BotonBorrarLinea({
  lineaId, pedidoId,
}: { lineaId: string; pedidoId: string }) {
  const [borrando, setBorrando] = useState(false)
  return (
    <button
      type="button"
      disabled={borrando}
      onClick={async () => { setBorrando(true); await borrarLinea(lineaId, pedidoId) }}
      className="text-xs disabled:opacity-40"
      style={{ color: 'var(--al-error)' }}
      aria-label="Eliminar línea"
    >
      {borrando ? '…' : 'Eliminar'}
    </button>
  )
}

export function SelectorEstado({
  pedidoId, estado, estados,
}: {
  pedidoId: string
  estado: string
  estados: readonly string[]
}) {
  const [valor, setValor] = useState(estado)
  const [guardando, setGuardando] = useState(false)
  return (
    <select
      value={valor}
      disabled={guardando}
      onChange={async (e) => {
        const nuevo = e.target.value
        setValor(nuevo)
        setGuardando(true)
        try { await cambiarEstado(pedidoId, nuevo) } finally { setGuardando(false) }
      }}
      className="rounded px-2 py-0.5 text-xs uppercase tracking-wide"
      style={{ background: 'var(--al-accent-soft)', color: 'var(--al-accent-strong)', borderColor: 'var(--al-border)' }}
      aria-label="Estado del pedido"
    >
      {estados.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  )
}
