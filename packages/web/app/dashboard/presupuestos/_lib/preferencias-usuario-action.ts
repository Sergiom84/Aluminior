'use server'

import { revalidatePath } from 'next/cache'
import { crearDb } from '@aluminior/db'
import { registrarFallo } from './errores.ts'
import { usuarioActual } from './usuario-actual.ts'
import {
  guardarPrecioHoraColocacion, validarPrecioHoraColocacion,
} from './preferencias-usuario/preferencias.ts'

export type ResultadoPreferenciaPrecio =
  | { ok: true; precioHora: string }
  | { ok: false; mensaje: string }

/** Guarda el precio por hora de colocación por defecto solo para el usuario de la sesión. */
export async function guardarPrecioColocacionDefecto(
  precioHora: string,
  presupuestoId?: string,
): Promise<ResultadoPreferenciaPrecio> {
  const normalizado = validarPrecioHoraColocacion(precioHora)
  if (!normalizado) {
    return { ok: false, mensaje: 'Indica un precio por hora válido mayor que cero (máximo 2 decimales).' }
  }
  try {
    const usuario = await usuarioActual()
    if (!usuario) return { ok: false, mensaje: 'Sesión no válida' }
    const guardado = await guardarPrecioHoraColocacion(crearDb(), usuario, normalizado)
    if (presupuestoId) revalidatePath(`/dashboard/presupuestos/${presupuestoId}`)
    return { ok: true, precioHora: guardado }
  } catch (error) {
    return { ok: false, mensaje: registrarFallo('guardarPrecioColocacionDefecto', error) }
  }
}
