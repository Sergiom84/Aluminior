'use client'

import { useActionState, useEffect, useState } from 'react'
import {
  anyadirLinea, borrarLinea, opcionesHerrajeDe,
  type Estado, type GrupoOpcionesHerraje,
} from '../../_lib/acciones.ts'

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

  // Opciones de herraje: dependen de serie + estructura, ambas medidas del
  // histórico. Sin regla medida el panel no aparece — no se adivina.
  const [serie, setSerie] = useState('')
  const [estructura, setEstructura] = useState('')
  const [gruposHerraje, setGruposHerraje] = useState<GrupoOpcionesHerraje[] | null>(null)
  useEffect(() => {
    let vigente = true
    if (tipo !== 'ESTRUCTURA' || !serie || !estructura) { setGruposHerraje(null); return }
    opcionesHerrajeDe(serie, estructura).then((g) => { if (vigente) setGruposHerraje(g) })
    return () => { vigente = false }
  }, [tipo, serie, estructura])

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
            placeholder={tipo === 'ESTRUCTURA' ? '1+1' : 'PSM001'}
            onBlur={(e) => setEstructura(e.target.value.trim())} />
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
                onChange={(e) => setSerie(e.target.value)}
                style={{ ...estilo, borderColor: err.serieCodigo ? 'var(--al-error)' : estilo.borderColor }}>
                <option value="" disabled>Elegir…</option>
                {series.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {err.serieCodigo && (
                <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{err.serieCodigo.join('. ')}</p>
              )}
            </div>

            {/* Vidrio del acristalamiento (código de familia 050). Sin él, el
                cristal queda "sin valorar" — el aviso lo dice. */}
            <div className="col-span-2">
              <label htmlFor="vidrioCodigo" className="mb-1 block text-sm font-medium">Vidrio</label>
              <input id="vidrioCodigo" name="vidrioCodigo" className={entrada}
                style={{ ...estilo, borderColor: err.vidrioCodigo ? 'var(--al-error)' : estilo.borderColor }}
                placeholder="V420AGS4" />
              {err.vidrioCodigo && (
                <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{err.vidrioCodigo.join('. ')}</p>
              )}
            </div>

            <div className="col-span-2">
              <label htmlFor="varianteAcristalamiento" className="mb-1 block text-sm font-medium">
                Acristalamiento
              </label>
              <select id="varianteAcristalamiento" name="varianteAcristalamiento"
                defaultValue="2" className={entrada} style={estilo}>
                <option value="2">Doble cristal</option>
                <option value="1">Cristal sencillo</option>
              </select>
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

      {/* Opciones de herraje: solo aparecen si hay regla MEDIDA del histórico
          para esta serie+estructura. Los defaults reproducen el original. */}
      {tipo === 'ESTRUCTURA' && gruposHerraje && (
        <fieldset key={`${serie}|${estructura}`} className="mt-4 rounded-md border p-4"
          style={{ borderColor: 'var(--al-border)' }}>
          <legend className="px-1 text-sm font-medium">Opciones de herraje</legend>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-3">
            {gruposHerraje.flatMap((g) =>
              g.opciones.map((o) => (
                <label key={`${g.conjuntoCodigo}|${o.codigo}`}
                  className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="opcionHerraje"
                    value={`${g.conjuntoCodigo}|${o.codigo}`}
                    defaultChecked={o.porDefecto} />
                  <span>{o.descripcion || `Opción ${o.codigo}`}</span>
                </label>
              )),
            )}
          </div>
          <p className="mt-2 text-xs" style={{ color: 'var(--al-text-soft)' }}>
            La elección se guarda con la línea. Los herrajes siguen sin valorarse
            hasta que la selección esté validada contra el histórico.
          </p>
        </fieldset>
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
