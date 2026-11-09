'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import {
  columnasSolape, etiquetaDia, etiquetaSemana, franjas, porcentajeTramo, semanaDe, tramoVisible,
} from '@aluminior/core/agenda'
import { hrefDia } from '../_lib/rutas.ts'
import type { EventoVista } from '../_lib/tipos.ts'

const FRANJAS = franjas()

export function CalendarioSemana({
  dia, eventos, onNuevo, onEditar,
}: {
  dia: string
  eventos: readonly EventoVista[]
  onNuevo: (dia: string, inicio: string) => void
  onEditar: (evento: EventoVista) => void
}) {
  const scroll = useRef<HTMLDivElement>(null)
  const dias = semanaDe(dia) ?? []
  const fuera = eventos.filter((evento) => dias.includes(evento.dia) && !tramoVisible(evento.horaInicio, evento.horaFin))

  useEffect(() => {
    const columna = document.getElementById(`semana-${dia}`)
    const caja = scroll.current
    if (!columna || !caja) return
    const contenedor = caja.getBoundingClientRect()
    const objetivo = columna.getBoundingClientRect()
    if (objetivo.left < contenedor.left) caja.scrollLeft -= contenedor.left - objetivo.left
    else if (objetivo.right > contenedor.right) caja.scrollLeft += objetivo.right - contenedor.right
  }, [dia])

  return (
    <section className="al-agenda-bloque" aria-labelledby="agenda-semana">
      <h2 id="agenda-semana">Semana {etiquetaSemana(dias)}</h2>
      <div className="al-semana-scroll" ref={scroll}>
        <div className="al-semana-tabla">
          <div className="al-semana-horas" aria-hidden="true">
            <div />
            {FRANJAS.map((franja) => <div key={franja.inicio}>{franja.inicio}</div>)}
          </div>
          {dias.map((fecha) => {
            const etiqueta = etiquetaDia(fecha)
            const puestos = columnasSolape(
              eventos.filter((evento) => evento.dia === fecha && tramoVisible(evento.horaInicio, evento.horaFin)),
            )
            return (
              <div
                className="al-semana-columna"
                id={`semana-${fecha}`}
                key={fecha}
                data-seleccionado={fecha === dia ? 'true' : undefined}
              >
                <Link
                  href={hrefDia(fecha)}
                  prefetch={false}
                  className="al-semana-cabecera"
                  aria-current={fecha === dia ? 'date' : undefined}
                >
                  <span>{etiqueta?.corto}</span>
                  <span>{etiqueta?.numero}</span>
                </Link>
                <div className="al-semana-cuerpo">
                  {FRANJAS.map((franja) => (
                    <button
                      key={franja.inicio}
                      type="button"
                      className="al-semana-franja"
                      aria-label={`${etiqueta?.corto ?? ''} ${etiqueta?.numero ?? ''} ${franja.inicio}`}
                      onClick={() => onNuevo(fecha, franja.inicio)}
                    />
                  ))}
                  {puestos.map(({ item, columna, total }) => {
                    const tramo = tramoVisible(item.horaInicio, item.horaFin)
                    if (!tramo) return null
                    const caja = porcentajeTramo(tramo)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="al-semana-evento"
                        style={{
                          top: `${caja.top}%`,
                          height: `${caja.alto}%`,
                          left: `calc(${(columna / total) * 100}% + 1px)`,
                          width: `calc(${100 / total}% - 2px)`,
                        }}
                        onClick={() => onEditar(item)}
                      >
                        <span>{item.horaInicio}</span> {item.titulo}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {fuera.length > 0 && (
        <div className="al-agenda-fuera">
          <h3 className="al-overline">Fuera de horario</h3>
          <ul>
            {fuera.map((evento) => (
              <li key={evento.id}>
                <button type="button" className="al-command" onClick={() => onEditar(evento)}>
                  {evento.dia.slice(8)} {evento.horaInicio}–{evento.horaFin} {evento.titulo}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
