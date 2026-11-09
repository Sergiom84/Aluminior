'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  DIAS_CORTOS, desplazarMes, diasDelMes, etiquetaDia, nombreMes, sumarDias,
} from '@aluminior/core/agenda'
import { hrefDia } from '../_lib/rutas.ts'
import type { EventoVista } from '../_lib/tipos.ts'

export function CalendarioMes({
  dia, mes, hoy, eventos,
}: {
  dia: string
  mes: string
  hoy: string
  eventos: readonly EventoVista[]
}) {
  const router = useRouter()
  const enfocar = useRef(false)
  const anio = Number(mes.slice(0, 4))
  const numeroMes = Number(mes.slice(5, 7))
  const celdas = diasDelMes(anio, numeroMes) ?? []
  const anterior = desplazarMes(anio, numeroMes, -1)
  const siguiente = desplazarMes(anio, numeroMes, 1)
  const cuentas = new Map<string, number>()
  for (const evento of eventos) cuentas.set(evento.dia, (cuentas.get(evento.dia) ?? 0) + 1)

  useEffect(() => {
    if (!enfocar.current) return
    enfocar.current = false
    document.getElementById(`dia-${dia}`)?.focus()
  }, [dia])

  function mover(origen: string, tecla: string) {
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[tecla]
    if (!delta) return
    const destino = sumarDias(origen, delta)
    if (!destino) return
    enfocar.current = true
    router.push(hrefDia(destino))
  }

  function mesDe(valor: { anio: number; mes: number }) {
    return `${valor.anio}-${String(valor.mes).padStart(2, '0')}`
  }

  return (
    <section className="al-agenda-bloque" aria-labelledby="agenda-mes">
      <div className="al-agenda-barra">
        {anterior && <Link className="al-command" href={hrefDia(dia, mesDe(anterior))}>Anterior</Link>}
        <h2 id="agenda-mes">{nombreMes(anio, numeroMes)}</h2>
        {siguiente && <Link className="al-command" href={hrefDia(dia, mesDe(siguiente))}>Siguiente</Link>}
        <Link className="al-command" href={hrefDia(hoy)}>Hoy</Link>
      </div>
      <div className="al-agenda-mes" role="grid" aria-labelledby="agenda-mes">
        <div role="row" className="al-agenda-mes-fila">
          {DIAS_CORTOS.map((nombre) => <div role="columnheader" key={nombre}>{nombre}</div>)}
        </div>
        {Array.from({ length: celdas.length / 7 }, (_, fila) => (
          <div role="row" className="al-agenda-mes-fila" key={celdas[fila * 7].fecha}>
            {celdas.slice(fila * 7, fila * 7 + 7).map((celda) => {
              const etiqueta = etiquetaDia(celda.fecha)
              const cuenta = cuentas.get(celda.fecha) ?? 0
              return (
                <div role="gridcell" key={celda.fecha}>
                  <Link
                    id={`dia-${celda.fecha}`}
                    href={hrefDia(celda.fecha)}
                    prefetch={false}
                    className="al-agenda-dia"
                    data-fuera={celda.enMes ? undefined : 'true'}
                    data-hoy={celda.fecha === hoy ? 'true' : undefined}
                    aria-current={celda.fecha === dia ? 'date' : undefined}
                    aria-label={etiqueta ? `${etiqueta.corto} ${etiqueta.numero}${cuenta ? `, ${cuenta}` : ''}` : celda.fecha}
                    onKeyDown={(evento) => {
                      if (!evento.key.startsWith('Arrow')) return
                      evento.preventDefault()
                      mover(celda.fecha, evento.key)
                    }}
                  >
                    <span>{etiqueta?.numero}</span>
                    {cuenta > 0 && <span className="al-agenda-cuenta">{cuenta}</span>}
                  </Link>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
