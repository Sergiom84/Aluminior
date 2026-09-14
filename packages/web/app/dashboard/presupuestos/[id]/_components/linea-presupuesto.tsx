'use client'

import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import { useCallback, useRef, useState } from 'react'
import { EditarArticulo } from './editar-articulo'
import { BotonBorrarLinea } from './anyadir-linea.tsx'
import { EditarCerramiento, type DatosEdicionCerramiento } from './editar-cerramiento.tsx'
import styles from '../presupuesto-movil.module.css'

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export interface LineaDetalle {
  id: string
  orden: number
  tipo: string
  descripcion: string
  referencia: string | null
  anchoMm: number | null
  altoMm: number | null
  cantidad: string
  precioUnitario: string | null
  total: string | null
  valoracionCompleta: boolean
  avisoValoracion: string | null
}

export interface PiezaDetalle {
  id: string
  articuloCodigo: string
  origenTipo: string | null
  origenId: string | null
  origenOrdinal: number | null
  cantidad: string
  largoCorteMm: string | null
  anchoCorteMm: string | null
  funcion: string | null
  costeUnitario: string | null
  costeTotal: string | null
}

export function LineaPresupuesto({
  linea: l, presupuestoId, despiece, edicion, series, acabados, resultado, manoObra, articuloEditable,
}: {
  articuloEditable: boolean
  linea: LineaDetalle
  resultado: ResultadoCerramientoV1 | null
  manoObra: { id: string; concepto: string; horas: string | null; importe: string | null }[]
  presupuestoId: string
  despiece: PiezaDetalle[]
  edicion: DatosEdicionCerramiento | null
  series: string[]
  acabados: { codigo: string; descripcion: string }[]
}) {
  const [editando, setEditando] = useState(false)
  const botonEditar = useRef<HTMLButtonElement>(null)
  const cerrarEditor = useCallback(() => { setEditando(false); requestAnimationFrame(() => botonEditar.current?.focus()) }, [])
  const esArticuloEditable = articuloEditable && l.tipo === 'ARTICULO'
  const costeTotal = despiece.reduce((acc, pieza) => acc + (pieza.costeTotal ? Number(pieza.costeTotal) : 0), 0)
  const sinCoste = despiece.filter((pieza) => pieza.costeTotal === null).length
  const etiqueta = l.tipo === 'ESTRUCTURA' ? 'estr' : l.tipo === 'CERRAMIENTO' ? 'cerr' : 'art'

  return (
    <>
      <tr className="border-b" style={{ borderColor: 'var(--al-border)' }}>
        <td className="cifra px-3 py-2" style={{ textAlign: 'left', color: 'var(--al-text-faint)' }}>{l.orden}</td>
        <td className="px-3 py-2">
          <span className="mr-2 rounded px-1.5 py-0.5 text-[10px] uppercase"
            style={{
              background: l.tipo === 'ESTRUCTURA' ? 'var(--al-accent-soft)' : 'var(--al-surface-muted)',
              color: l.tipo === 'ESTRUCTURA' ? 'var(--al-accent-strong)' : 'var(--al-text-muted)',
            }}>
            {etiqueta}
          </span>
          {l.descripcion}
          {l.valoracionCompleta && l.avisoValoracion && (
            <div className="mt-0.5 text-xs" style={{ color: 'var(--al-warn)' }}>{l.avisoValoracion}</div>
          )}
        </td>
        <td className="px-3 py-2" style={{ color: 'var(--al-text-muted)' }}>{l.referencia ?? '—'}</td>
        <td className="px-3 py-2" style={{ color: 'var(--al-text-muted)' }}>
          {l.anchoMm && l.altoMm ? `${l.anchoMm} × ${l.altoMm}` : '—'}
        </td>
        <td className="cifra px-3 py-2">{Number(l.cantidad)}</td>
        <td className="cifra px-3 py-2">
          {!l.valoracionCompleta ? (
            <span className="text-xs" style={{ color: 'var(--al-warn)' }}
              title={l.avisoValoracion ?? 'La línea tiene partes pendientes de valorar.'}>sin valorar</span>
          ) : (
            <>
              {eur.format(Number(l.precioUnitario))}
              {l.avisoValoracion && <div className="text-[10px] uppercase" style={{ color: 'var(--al-warn)' }}>con avisos</div>}
            </>
          )}
        </td>
        <td className="cifra px-3 py-2 font-medium">
          {!l.valoracionCompleta || l.total === null ? '—' : eur.format(Number(l.total))}
          {manoObra.map(f => <div key={f.id} className="mt-1 text-xs font-normal" style={{ color: 'var(--al-text-muted)' }}>
            {f.concepto === 'COLOCACION' ? 'Colocación' : 'Fabricación'} {f.horas === null ? '—' : Number(f.horas)} h total línea: {f.importe === null ? 'sin valorar' : eur.format(Number(f.importe))}
          </div>)}
        </td>
        <td className="px-3 py-2 text-right">
          <div className="flex justify-end gap-2">
            {(edicion || esArticuloEditable) && (
              <button ref={botonEditar} type="button" onClick={() => setEditando((actual) => !actual)}
                className="text-xs" style={{ color: 'var(--al-accent)' }} aria-expanded={editando}>
                {editando ? 'Cerrar edición' : 'Editar'}
              </button>
            )}
            <BotonBorrarLinea lineaId={l.id} presupuestoId={presupuestoId} />
          </div>
        </td>
      </tr>
      {editando && edicion && (
        <tr className="border-b" style={{ borderColor: 'var(--al-border)' }}>
          <td colSpan={8} className={`${styles.editorCell} p-3`}>
            <EditarCerramiento presupuestoId={presupuestoId} lineaId={l.id} datos={edicion}
              series={series} acabados={acabados} onCancelar={cerrarEditor} />
          </td>
        </tr>
      )}
      {editando && esArticuloEditable && <tr><td colSpan={8} className={`${styles.editorCell} p-3`}>
        <EditarArticulo presupuestoId={presupuestoId} lineaId={l.id} cantidad={l.cantidad}
          referencia={l.referencia} onCancelar={cerrarEditor} />
      </td></tr>}
      {despiece.length > 0 && (
        <tr className="border-b" style={{ borderColor: 'var(--al-border)' }}>
          <td colSpan={8} className="px-3 py-1" style={{ background: 'var(--al-surface-muted)' }}>
            <details>
              <summary className="cursor-pointer py-1 text-xs" style={{ color: 'var(--al-text-muted)' }}>
                Despiece: {despiece.length} piezas · {l.tipo === 'CERRAMIENTO'
                  ? `coste de materiales por composición ${resultado?.costeMateriales.importe != null ? eur.format(Number(resultado.costeMateriales.importe)) : 'sin valorar'}`
                  : `coste de perfiles ${eur.format(costeTotal)}`}
                {sinCoste > 0 && ` · ${sinCoste} piezas sin coste`}
              </summary>
              <div className={styles.partsScroll} tabIndex={0} aria-label="Despiece desplazable">
                <table className={`${styles.partsTable} mb-2 mt-1 text-xs`}>
                  <thead><tr style={{ color: 'var(--al-text-muted)' }}>
                    {['Origen', 'Artículo', 'Función', 'Cdad.', 'Corte (mm)', 'Coste ud.', 'Coste'].map((titulo, indice) => (
                      <th key={titulo} className={`px-2 py-1 font-medium ${indice > 1 ? 'text-right' : 'text-left'}`}>{titulo}</th>
                    ))}
                  </tr></thead>
                  <tbody>{despiece.map((pieza) => (
                    <tr key={pieza.id}>
                      <td className="px-2 py-0.5">{pieza.origenId ? `${pieza.origenTipo === 'UNION' ? 'Unión' : 'Módulo'} ${pieza.origenId} · ${pieza.origenOrdinal}` : '—'}</td>
                      <td className="px-2 py-0.5">{pieza.articuloCodigo}</td>
                      <td className="px-2 py-0.5" style={{ color: 'var(--al-text-muted)' }}>{pieza.funcion ?? '—'}</td>
                      <td className="cifra px-2 py-0.5 text-right">{Number(pieza.cantidad)}</td>
                      <td className="cifra px-2 py-0.5 text-right">
                        {pieza.largoCorteMm !== null
                          ? Number(pieza.largoCorteMm).toLocaleString('es-ES') +
                            (pieza.anchoCorteMm !== null ? ` × ${Number(pieza.anchoCorteMm).toLocaleString('es-ES')}` : '')
                          : '—'}
                      </td>
                      <td className="cifra px-2 py-0.5 text-right">
                        {pieza.costeUnitario !== null ? eur.format(Number(pieza.costeUnitario)) : (
                          <span style={{ color: 'var(--al-warn)' }}>sin coste</span>
                        )}
                      </td>
                      <td className="cifra px-2 py-0.5 text-right">
                        {pieza.costeTotal !== null ? eur.format(Number(pieza.costeTotal)) : '—'}
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </details>
          </td>
        </tr>
      )}
    </>
  )
}
