'use server'
import { crearDb } from '@aluminior/db'
import type { OpcionAcristalamiento } from '@aluminior/core/estructuras'
import { usuarioActual } from './usuario-actual'
import { opcionesAcristalamientoDeSerie } from './estructuras/acristalamiento-serie'

/** Lectura para la pestaña `Acristalamiento`. Sin sesión no devuelve nada. */
export async function opcionesAcristalamientoLinea(serieCodigo: string): Promise<OpcionAcristalamiento[]> {
  if (!await usuarioActual()) return []
  return opcionesAcristalamientoDeSerie(crearDb(), serieCodigo)
}
