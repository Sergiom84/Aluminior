'use client'

import { useEffect, useState } from 'react'
import type { LineaPendientePrecio } from '../../../_lib/precios-manuales/index.ts'
import { DialogoPrecios } from './dialogo-precios.tsx'

/** Firma de lo pendiente: si cambian las piezas, la ventana vuelve a abrirse sola. */
export function firmaPendiente(linea: LineaPendientePrecio): string {
  return `precios:${linea.lineaId}:${linea.piezas.map((p) => `${p.articulo}|${p.acabado}`).sort().join(',')}`
}

export function PreciosPendientes({ presupuestoId, tarifa, lineas, editable }: {
  presupuestoId: string; tarifa: number; lineas: readonly LineaPendientePrecio[]; editable: boolean
}) {
  const [abierta, setAbierta] = useState<string | null>(null)

  useEffect(() => {
    if (!editable) return
    const nueva = lineas.find((l) => !sessionStorage.getItem(firmaPendiente(l)))
    if (!nueva) return
    sessionStorage.setItem(firmaPendiente(nueva), '1')
    setAbierta(nueva.lineaId)
  }, [lineas, editable])

  if (!lineas.length) return null
  const linea = lineas.find((l) => l.lineaId === abierta)
  return (
    <div className="al-precios-pendientes" role="status">
      {lineas.map((l) => (
        <p key={l.lineaId}>
          <span><span className="cifra">{l.articuloLinea}</span>: {l.piezas.length === 1
            ? `${l.piezas[0]!.articulo} sin precio` : `${l.piezas.length} piezas sin precio`}</span>
          {editable && (
            <button type="button" className="al-command" onClick={() => setAbierta(l.lineaId)}>Poner precio</button>
          )}
        </p>
      ))}
      {linea && <DialogoPrecios presupuestoId={presupuestoId} tarifa={tarifa} linea={linea} onCerrar={() => setAbierta(null)} />}
    </div>
  )
}
