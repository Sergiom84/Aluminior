import { and, gte, lte } from 'drizzle-orm'
import { ordenarNotas } from '@aluminior/core/agenda'
import { crearDb, schema } from '@aluminior/db'
import { mensajeAgenda } from './mensaje.ts'
import type { EventoVista, NotaVista } from './tipos.ts'

export type AgendaLeida =
  | { ok: true; eventos: EventoVista[]; notas: NotaVista[] }
  | { ok: false; mensaje: string }

export async function leerAgenda(desde: string, hasta: string): Promise<AgendaLeida> {
  try {
    const db = crearDb()
    const eventos = await db.select({
      id: schema.agendaEventos.id,
      titulo: schema.agendaEventos.titulo,
      dia: schema.agendaEventos.dia,
      horaInicio: schema.agendaEventos.horaInicio,
      horaFin: schema.agendaEventos.horaFin,
      observaciones: schema.agendaEventos.observaciones,
    }).from(schema.agendaEventos).where(and(
      gte(schema.agendaEventos.dia, desde),
      lte(schema.agendaEventos.dia, hasta),
    ))
    const notas = await db.select({
      id: schema.agendaNotas.id,
      texto: schema.agendaNotas.texto,
      observaciones: schema.agendaNotas.observaciones,
      urgencia: schema.agendaNotas.urgencia,
      hecha: schema.agendaNotas.hecha,
      creadoEn: schema.agendaNotas.creadoEn,
    }).from(schema.agendaNotas)
    return {
      ok: true,
      eventos,
      notas: ordenarNotas(notas.map((nota) => ({ ...nota, creadoEn: nota.creadoEn.toISOString() }))),
    }
  } catch (error) {
    return { ok: false, mensaje: mensajeAgenda(error, 'abrir') }
  }
}
