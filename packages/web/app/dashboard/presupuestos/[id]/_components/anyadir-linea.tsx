'use client'

import { useActionState, useState } from 'react'
import { anyadirLinea, borrarLinea, type Estado } from '../../_lib/acciones.ts'

const entrada = 'w-full rounded-md border px-3 py-2 text-sm'
const estilo = { background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }

/**
 * Alta de línea. Dos modos, como en el sistema original:
 *   ARTICULO    producto de tarifa, precio directo
 *   ESTRUCTURA  elemento configurado: se pide el hueco y se calcula el
 *               despiece y el precio a partir de sus componentes
 */
export function AnyadirLinea({
  presupuestoId, series, acabados,
}: {
  presupuestoId: string
  series: string[]
  acabados: { codigo: string; descripcion: string }[]
}) {
  const [tipo, setTipo] = useState<'ARTICULO' | 'ESTRUCTURA'>('ESTRUCTURA')
  const [estado, accion, enviando] = useActionState<Estado, FormData>(anyadirLinea, null)

  const err = estado && !estado.ok ? estado.errores : {}

  return (
    <form action={accion}
      className="rounded-lg border p-5"
      style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
      <input type="hidden" name="presupuestoId" value={presupuestoId} />
      <input type="hidden" name="tipo" value={tipo} />

      <div className="mb-4 flex gap-2">
        {(['ESTRUCTURA', 'ARTICULO'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTipo(t)}
            className="rounded-md border px-4 py-1.5 text-sm"
            style={{
              background: tipo === t ? 'var(--al-accent)' : 'var(--al-surface)',
              color: tipo === t ? 'var(--al-accent-contrast)' : 'var(--al-text)',
              borderColor: tipo === t ? 'var(--al-accent)' : 'var(--al-border-strong)',
            }}>
            {t === 'ESTRUCTURA' ? 'Elemento configurado' : 'Artículo de catálogo'}
          </button>
        ))}
      </div>

      {/* Mensaje de aviso: importe incompleto, no bloquea pero se ve */}
      {estado && !estado.ok && estado.mensaje && (
        <div className="mb-4 rounded-md border p-3 text-sm"
          style={{ background: 'var(--al-warn-soft)', borderColor: 'var(--al-warn)' }}>
          {estado.mensaje}
        </div>
      )}

      <div className="grid grid-cols-12 items-end gap-3">
        <div className={tipo === 'ESTRUCTURA' ? 'col-span-2' : 'col-span-3'}>
          <label htmlFor="codigo" className="mb-1 block text-sm font-medium">
            {tipo === 'ESTRUCTURA' ? 'Estructura' : 'Artículo'}
          </label>
          <input id="codigo" name="codigo" className={entrada}
            style={{ ...estilo, borderColor: err.codigo ? 'var(--al-error)' : estilo.borderColor }}
            placeholder={tipo === 'ESTRUCTURA' ? '1+1' : 'PSM001'} />
          {err.codigo && (
            <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{err.codigo.join('. ')}</p>
          )}
        </div>

        <div className={tipo === 'ESTRUCTURA' ? 'col-span-2' : 'col-span-3'}>
          <label htmlFor="referencia" className="mb-1 block text-sm font-medium">Ubicación</label>
          <input id="referencia" name="referencia" className={entrada} style={estilo}
            placeholder="SALÓN" />
        </div>

        {tipo === 'ESTRUCTURA' && (
          <>
            {/* La serie es prerrequisito: sin ella los perfiles del despiece
                son genéricos y no hay precio ("Indique Serie primero"). */}
            <div className="col-span-2">
              <label htmlFor="serieCodigo" className="mb-1 block text-sm font-medium">Serie</label>
              <select id="serieCodigo" name="serieCodigo" defaultValue="" className={entrada}
                style={{ ...estilo, borderColor: err.serieCodigo ? 'var(--al-error)' : estilo.borderColor }}>
                <option value="" disabled>Elegir…</option>
                {series.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {err.serieCodigo && (
                <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{err.serieCodigo.join('. ')}</p>
              )}
            </div>

            {/* El coste real depende del acabado; sin él, las piezas con coste
                distinto por acabado quedan "sin coste" en vez de adivinarse. */}
            <div className="col-span-2">
              <label htmlFor="acabadoCodigo" className="mb-1 block text-sm font-medium">Acabado</label>
              <select id="acabadoCodigo" name="acabadoCodigo" defaultValue="" className={entrada} style={estilo}>
                <option value="">— sin acabado —</option>
                {acabados.map((a) => (
                  <option key={a.codigo} value={a.codigo}>{a.codigo} · {a.descripcion}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="anchoMm" className="mb-1 block text-sm font-medium">Ancho (mm)</label>
              <input id="anchoMm" name="anchoMm" type="number" defaultValue={1600} step={10}
                className={`cifra ${entrada}`}
                style={{ ...estilo, borderColor: err.anchoMm ? 'var(--al-error)' : estilo.borderColor }} />
            </div>
            <div className="col-span-2">
              <label htmlFor="altoMm" className="mb-1 block text-sm font-medium">Alto (mm)</label>
              <input id="altoMm" name="altoMm" type="number" defaultValue={1230} step={10}
                className={`cifra ${entrada}`} style={estilo} />
            </div>
          </>
        )}

        <div className={tipo === 'ESTRUCTURA' ? 'col-span-1' : 'col-span-2'}>
          <label htmlFor="cantidad" className="mb-1 block text-sm font-medium">Cdad.</label>
          <input id="cantidad" name="cantidad" type="number" defaultValue={1} min={1} step={1}
            className={`cifra ${entrada}`} style={estilo} />
        </div>

        <div className={tipo === 'ESTRUCTURA' ? 'col-span-1' : 'col-span-4'}>
          <button type="submit" disabled={enviando}
            className="w-full rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>
            {enviando ? '…' : 'Añadir'}
          </button>
        </div>
      </div>

      {err.anchoMm && (
        <p className="mt-2 text-xs" style={{ color: 'var(--al-error)' }}>{err.anchoMm.join('. ')}</p>
      )}
    </form>
  )
}

export function BotonBorrarLinea({
  lineaId, presupuestoId,
}: { lineaId: string; presupuestoId: string }) {
  const [borrando, setBorrando] = useState(false)
  return (
    <button
      type="button"
      disabled={borrando}
      onClick={async () => { setBorrando(true); await borrarLinea(lineaId, presupuestoId) }}
      className="text-xs disabled:opacity-40"
      style={{ color: 'var(--al-error)' }}
      aria-label="Eliminar línea"
    >
      {borrando ? '…' : 'Eliminar'}
    </button>
  )
}
