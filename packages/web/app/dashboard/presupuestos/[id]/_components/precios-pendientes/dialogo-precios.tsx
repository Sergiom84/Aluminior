'use client'

import { useState, useTransition } from 'react'
import { metrajeEnUnidad, type UnidadPrecioManual } from '@aluminior/core/precios'
import { DialogoDisenador } from '../disenador/dialogo-disenador.tsx'
import { ponerPreciosLinea } from '../../../_lib/precios-manuales-action.ts'
import type { LineaPendientePrecio, PiezaPendientePrecio } from '../../../_lib/precios-manuales/index.ts'

const UNIDAD: Record<string, { precio: string; cantidad: string }> = {
  ML: { precio: '€/metro', cantidad: 'm' },
  M2: { precio: '€/m²', cantidad: 'm²' },
  UD: { precio: '€/unidad', cantidad: 'ud' },
}
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
const num = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 })

type Destino = 'TARIFA' | 'OBRA'

/** «12,50», «1.250,75» y «12.5» son precios; con coma, el punto separa miles. */
export function leerPrecio(texto: string): number | null {
  const limpio = texto.trim().replace(/\s|€/g, '')
  const normal = limpio.includes(',') ? limpio.replace(/\./g, '').replace(',', '.') : limpio
  const valor = Number(normal)
  return limpio && /^\d+(\.\d+)?$/.test(normal) && valor > 0 ? Math.round(valor * 10000) / 10000 : null
}

function unidadDe(pieza: PiezaPendientePrecio, destino: Destino, elegida: string | undefined): string {
  if (destino === 'TARIFA') return pieza.unidadCatalogo
  return elegida ?? (pieza.unidades.includes(pieza.unidadCatalogo as UnidadPrecioManual) ? pieza.unidadCatalogo : pieza.unidades[0]!)
}

export function DialogoPrecios({ presupuestoId, tarifa, linea, onCerrar }: {
  presupuestoId: string; tarifa: number; linea: LineaPendientePrecio; onCerrar: () => void
}) {
  const [destino, setDestino] = useState<Destino>('TARIFA')
  const [unidades, setUnidades] = useState<Record<string, string>>({})
  const [precios, setPrecios] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [guardando, iniciar] = useTransition()
  const clave = (p: PiezaPendientePrecio) => `${p.articulo}|${p.acabado}`

  const filas = linea.piezas.map((pieza) => {
    const unidad = unidadDe(pieza, destino, unidades[clave(pieza)])
    const precio = leerPrecio(precios[clave(pieza)] ?? '')
    const medida = UNIDAD[unidad] && unidad !== '?' ? metrajeEnUnidad(pieza.filas, unidad as UnidadPrecioManual, precio ?? 0) : null
    return { pieza, unidad, precio, medida }
  })
  const completas = filas.filter((f) => f.precio !== null)

  function guardar() {
    setError(null)
    if (!completas.length) { setError('Escribe al menos un precio mayor que cero'); return }
    iniciar(async () => {
      const r = await ponerPreciosLinea({
        presupuestoId, lineaId: linea.lineaId, destino,
        precios: completas.map((f) => ({ articulo: f.pieza.articulo, acabado: f.pieza.acabado, unidad: f.unidad, precio: f.precio })),
      })
      if (r.ok) onCerrar()
      else setError(r.mensaje)
    })
  }

  return (
    <DialogoDisenador titulo={`Piezas sin precio · ${linea.articuloLinea}`} onCerrar={onCerrar} bloqueado={guardando}>
      <form className="al-precios-dialogo" onSubmit={(e) => { e.preventDefault(); guardar() }}>
        <fieldset className="al-precios-destino">
          <legend>Guardar el precio</legend>
          <label><input type="radio" name="destino" checked={destino === 'TARIFA'} data-foco-inicial
            onChange={() => setDestino('TARIFA')} /> En la tarifa {tarifa}</label>
          <label><input type="radio" name="destino" checked={destino === 'OBRA'}
            onChange={() => setDestino('OBRA')} /> Solo en este presupuesto</label>
        </fieldset>
        <div className="al-precios-tabla" role="region" aria-label="Piezas sin precio" tabIndex={0}>
          <table>
            <thead><tr><th>Elemento</th><th>Color</th><th>Cómo valorarlo</th><th>Precio</th><th>Cantidad</th><th>Importe</th></tr></thead>
            <tbody>{filas.map(({ pieza, unidad, precio, medida }) => {
              const id = clave(pieza)
              return (
                <tr key={id}>
                  <th scope="row"><span className="cifra">{pieza.articulo}</span> {pieza.descripcion}</th>
                  <td className="cifra">{pieza.acabado}</td>
                  <td>
                    <select aria-label={`Cómo valorar ${pieza.articulo}`} value={unidad} disabled={destino === 'TARIFA'}
                      onChange={(e) => setUnidades((u) => ({ ...u, [id]: e.target.value }))}>
                      {(destino === 'TARIFA' ? [pieza.unidadCatalogo] : pieza.unidades).map((u) => (
                        <option key={u} value={u}>{UNIDAD[u]?.precio ?? u}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input aria-label={`Precio de ${pieza.articulo}`} inputMode="decimal" className="cifra"
                      value={precios[id] ?? ''} placeholder="0,00"
                      onChange={(e) => setPrecios((p) => ({ ...p, [id]: e.target.value }))} />
                  </td>
                  <td className="cifra">{medida ? `${num.format(medida.metraje)} ${UNIDAD[unidad]!.cantidad}` : '—'}</td>
                  <td className="cifra">{medida && precio !== null ? eur.format(medida.importe) : '—'}</td>
                </tr>
              )
            })}</tbody>
          </table>
        </div>
        {error && <p role="alert" className="al-precios-error">{error}</p>}
        <div className="al-precios-acciones">
          <button type="button" className="al-command" onClick={onCerrar} disabled={guardando}>Cancelar</button>
          <button type="submit" className="al-command-primary" disabled={guardando || !completas.length}>
            {guardando ? 'Guardando…' : 'Guardar precios'}
          </button>
        </div>
      </form>
    </DialogoDisenador>
  )
}
