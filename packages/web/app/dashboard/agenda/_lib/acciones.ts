'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { validarEvento, validarId, validarNota } from '@aluminior/core/agenda'
import { crearDb, schema } from '@aluminior/db'
import { qaLocalActiva, USUARIO_QA_LOCAL } from '../../../../lib/qa-local.ts'
import { crearClienteServidor } from '../../../../lib/supabase/servidor.ts'
import { mensajeAgenda } from './mensaje.ts'

export type EstadoAccion =
  | { ok: true }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }

export type EstadoFormulario = EstadoAccion | null

function fallo(mensaje: string): EstadoAccion {
  return { ok: false, errores: {}, mensaje }
}

async function actor(): Promise<string | null> {
  try {
    const host = (await headers()).get('host')
    if (qaLocalActiva({ host })) return USUARIO_QA_LOCAL
    const supabase = await crearClienteServidor()
    const { data, error } = await supabase.auth.getClaims()
    if (error || !data?.claims) return null
    const claims = data.claims as { email?: string; sub?: string }
    return claims.email ?? claims.sub ?? null
  } catch {
    return null
  }
}

function refrescar() {
  revalidatePath('/dashboard', 'page')
}

export async function guardarEvento(_previo: EstadoFormulario, datos: FormData): Promise<EstadoAccion> {
  const resultado = validarEvento({
    id: String(datos.get('id') ?? ''),
    titulo: String(datos.get('titulo') ?? ''),
    dia: String(datos.get('dia') ?? ''),
    horaInicio: String(datos.get('horaInicio') ?? ''),
    horaFin: String(datos.get('horaFin') ?? ''),
    observaciones: String(datos.get('observaciones') ?? ''),
  })
  if (!resultado.ok) return resultado
  const { id, ...valor } = resultado.valor
  try {
    const db = crearDb()
    if (id) {
      const filas = await db.update(schema.agendaEventos).set({
        ...valor, actualizadoEn: new Date(),
      }).where(eq(schema.agendaEventos.id, id)).returning({ id: schema.agendaEventos.id })
      if (!filas.length) return fallo('El trabajo ya no está')
    } else {
      await db.insert(schema.agendaEventos).values({ ...valor, creadoPor: await actor() })
    }
  } catch (error) {
    return fallo(mensajeAgenda(error, 'guardar'))
  }
  refrescar()
  return { ok: true }
}

export async function borrarEvento(id: string): Promise<EstadoAccion> {
  const limpio = validarId(id)
  if (!limpio) return fallo('No se pudo quitar')
  try {
    await crearDb().delete(schema.agendaEventos).where(eq(schema.agendaEventos.id, limpio))
  } catch (error) {
    return fallo(mensajeAgenda(error, 'quitar'))
  }
  refrescar()
  return { ok: true }
}

export async function guardarNota(_previo: EstadoFormulario, datos: FormData): Promise<EstadoAccion> {
  const resultado = validarNota({
    id: String(datos.get('id') ?? ''),
    texto: String(datos.get('texto') ?? ''),
    observaciones: String(datos.get('observaciones') ?? ''),
    urgencia: String(datos.get('urgencia') ?? ''),
    dia: String(datos.get('dia') ?? ''),
  })
  if (!resultado.ok) return resultado
  const { id, ...valor } = resultado.valor
  try {
    const db = crearDb()
    if (id) {
      const filas = await db.update(schema.agendaNotas).set({
        ...valor, actualizadoEn: new Date(),
      }).where(eq(schema.agendaNotas.id, id)).returning({ id: schema.agendaNotas.id })
      if (!filas.length) return fallo('La nota ya no está')
    } else {
      await db.insert(schema.agendaNotas).values({ ...valor, creadoPor: await actor() })
    }
  } catch (error) {
    return fallo(mensajeAgenda(error, 'guardar'))
  }
  refrescar()
  return { ok: true }
}

export async function marcarNota(id: string, hecha: boolean): Promise<EstadoAccion> {
  const limpio = validarId(id)
  if (!limpio || typeof hecha !== 'boolean') return fallo('No se pudo guardar')
  try {
    const filas = await crearDb().update(schema.agendaNotas).set({
      hecha, actualizadoEn: new Date(),
    }).where(eq(schema.agendaNotas.id, limpio)).returning({ id: schema.agendaNotas.id })
    if (!filas.length) return fallo('La nota ya no está')
  } catch (error) {
    return fallo(mensajeAgenda(error, 'guardar'))
  }
  refrescar()
  return { ok: true }
}

export async function cambiarUrgencia(id: string, urgencia: number): Promise<EstadoAccion> {
  const limpio = validarId(id)
  if (!limpio || !Number.isInteger(urgencia) || urgencia < 1 || urgencia > 5) return fallo('No se pudo guardar')
  try {
    const filas = await crearDb().update(schema.agendaNotas).set({
      urgencia, actualizadoEn: new Date(),
    }).where(eq(schema.agendaNotas.id, limpio)).returning({ id: schema.agendaNotas.id })
    if (!filas.length) return fallo('La nota ya no está')
  } catch (error) {
    return fallo(mensajeAgenda(error, 'guardar'))
  }
  refrescar()
  return { ok: true }
}

export async function borrarNota(id: string): Promise<EstadoAccion> {
  const limpio = validarId(id)
  if (!limpio) return fallo('No se pudo quitar')
  try {
    await crearDb().delete(schema.agendaNotas).where(eq(schema.agendaNotas.id, limpio))
  } catch (error) {
    return fallo(mensajeAgenda(error, 'quitar'))
  }
  refrescar()
  return { ok: true }
}
