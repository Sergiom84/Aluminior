'use client'

import { useRouter } from 'next/navigation'
import { useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { CopiarRevisionBoton } from './copiar-revision-boton.tsx'
import { resolverDestinatarioPresupuesto } from '../_lib/destinatario'
import { textoTotalListado } from '../_lib/listado-presupuestos.ts'

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export interface FilaPresupuesto {
  id: string
  numero: number
  revision: number
  serie: string
  fecha: string | Date | null
  estado: string
  clienteCodigo: string | null
  tarifa: number
  nombreLibre: string | null
  obraTexto: string | null
  total: string | number | null
  cliente: string | null
  potencial: string | null
  lineas: number
  tieneLineaSinValorar: boolean
}

export function ListaPresupuestos({ filas }: { filas: FilaPresupuesto[] }) {
  const router = useRouter()
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const activo = filas.find((fila) => fila.id === seleccionado) ?? null

  const abrir = (id: string) => router.push(`/dashboard/presupuestos/${id}`)

  const onKeyDown = (evento: KeyboardEvent<HTMLTableSectionElement>) => {
    if (!filas.length) return
    const indice = filas.findIndex((fila) => fila.id === seleccionado)
    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setSeleccionado(filas[Math.min(filas.length - 1, Math.max(0, indice) + 1)].id)
    }
    if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setSeleccionado(filas[Math.max(0, indice <= 0 ? 0 : indice - 1)].id)
    }
    if (evento.key === 'Enter' && activo) abrir(activo.id)
  }

  return (
    <>
      <div className="al-commandbar" aria-label="Acciones sobre el presupuesto seleccionado">
        <button type="button" className="al-command" disabled={!activo}
          onClick={() => activo && abrir(activo.id)}>Editar</button>
        {activo ? (
          <a href={`/dashboard/presupuestos/${activo.id}/pdf`} target="_blank" rel="noopener"
            className="al-command">Emitir</a>
        ) : (
          <span className="al-command" aria-disabled="true">Emitir</span>
        )}
        {activo ? (
          <CopiarRevisionBoton presupuestoId={activo.id} numero={activo.numero}
            revision={activo.revision} serie={activo.serie} />
        ) : (
          <span className="al-command" aria-disabled="true">Revisión</span>
        )}
      </div>

      <div className="al-data-table-wrap">
        <table className="al-data-table">
          <thead>
            <tr>
              {['Número', 'Rev.', 'Fecha', 'Código', 'Cliente', 'Obra', 'Tarifa', 'Serie', 'Estado', 'Líneas', 'Total', ''].map((h, i) => (
                <th key={h + i} style={{ textAlign: i >= 9 && i <= 10 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody onKeyDown={onKeyDown}>
            {filas.map((p) => (
              <tr key={p.id} aria-selected={seleccionado === p.id}
                data-selected={seleccionado === p.id || undefined}
                tabIndex={0}
                onClick={() => setSeleccionado(p.id)}>
                <td>
                  <Link href={`/dashboard/presupuestos/${p.id}`} data-primary-link>
                    {String(p.numero).padStart(6, '0')}
                  </Link>
                </td>
                <td className="cifra" style={{ textAlign: 'left' }}>{p.revision}</td>
                <td>{p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : '—'}</td>
                <td className="font-mono text-[11px]">{p.clienteCodigo ?? '—'}</td>
                <td className="max-w-72 overflow-hidden text-ellipsis">
                  {resolverDestinatarioPresupuesto({
                    clienteNombre: p.cliente, potencialNombre: p.potencial, nombreLibre: p.nombreLibre,
                  })}
                </td>
                <td className="max-w-64 overflow-hidden text-ellipsis" style={{ color: 'var(--al-text-muted)' }}>
                  {p.obraTexto ?? '—'}
                </td>
                <td className="cifra" style={{ textAlign: 'left' }}>{p.tarifa}</td>
                <td className="font-mono">{p.serie}</td>
                <td><span className="al-status" data-status={p.estado}>{p.estado}</span></td>
                <td className="cifra">{p.lineas}</td>
                <td className="cifra font-semibold">
                  {textoTotalListado(p.total, p.tieneLineaSinValorar, (valor) => eur.format(valor))}
                </td>
                <td className="al-row-actions">
                  <Link href={`/dashboard/presupuestos/${p.id}`} className="font-semibold"
                    style={{ color: 'var(--al-accent-strong)' }}>Editar</Link>
                  <a href={`/dashboard/presupuestos/${p.id}/pdf`} target="_blank" rel="noopener">Emitir</a>
                  <CopiarRevisionBoton presupuestoId={p.id} numero={p.numero}
                    revision={p.revision} serie={p.serie} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
