'use client'

import { useCallback, useState } from 'react'
import { CalendarioMes } from './calendario-mes.tsx'
import { CalendarioSemana } from './calendario-semana.tsx'
import { FormularioEvento, type BorradorEvento } from './formulario-evento.tsx'
import { Notas } from './notas.tsx'
import type { EventoVista, NotaVista } from '../_lib/tipos.ts'

export function PanelAgenda({
  dia, mes, hoy, eventos, notas,
}: {
  dia: string
  mes: string
  hoy: string
  eventos: readonly EventoVista[]
  notas: readonly NotaVista[]
}) {
  const [borrador, setBorrador] = useState<BorradorEvento | null>(null)
  const cerrar = useCallback(() => setBorrador(null), [])

  return (
    <div className="al-agenda">
      <h1 className="al-agenda-titulo">Dashboard</h1>
      <div className="al-agenda-principal">
        <CalendarioMes dia={dia} mes={mes} hoy={hoy} eventos={eventos} />
        <CalendarioSemana
          dia={dia}
          eventos={eventos}
          onNuevo={(fecha, inicio) => setBorrador({ dia: fecha, horaInicio: inicio })}
          onEditar={(evento) => setBorrador(evento)}
        />
      </div>
      <Notas notas={notas} />
      {borrador && (
        <FormularioEvento
          key={borrador.id ?? `${borrador.dia}-${borrador.horaInicio}`}
          borrador={borrador}
          onCerrar={cerrar}
        />
      )}
    </div>
  )
}
