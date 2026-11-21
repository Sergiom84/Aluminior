'use server'

import { revalidatePath } from 'next/cache'
import { crearDb } from '@aluminior/db'
import type { MetodoPagoPresupuesto } from '@aluminior/db/schema'
import { registrarFallo } from './errores.ts'
import { usuarioActual } from './usuario-actual.ts'
import {
  confirmarGuardadoPresupuesto, registrarPagoPresupuesto,
  type ResultadoGuardadoPresupuesto, type ResultadoPagoPresupuesto,
} from './pago/acciones-presupuesto.ts'

export async function guardarPresupuestoAction(presupuestoId: string): Promise<ResultadoGuardadoPresupuesto> {
  try {
    if (!await usuarioActual()) return { ok: false, mensaje: 'Sesión no válida' }
    const resultado = await confirmarGuardadoPresupuesto(crearDb(), presupuestoId)
    if (resultado.ok) {
      revalidatePath(`/dashboard/presupuestos/${presupuestoId}`)
      revalidatePath('/dashboard/presupuestos')
    }
    return resultado
  } catch (error) {
    return { ok: false, mensaje: registrarFallo('guardarPresupuestoAction', error) }
  }
}

export async function pagarPresupuestoAction(
  presupuestoId: string,
  metodoPago: MetodoPagoPresupuesto,
): Promise<ResultadoPagoPresupuesto> {
  try {
    const usuario = await usuarioActual()
    if (!usuario) return { ok: false, mensaje: 'Sesión no válida' }
    const resultado = await registrarPagoPresupuesto(crearDb(), { presupuestoId, metodoPago, usuario })
    if (resultado.ok) {
      revalidatePath(`/dashboard/presupuestos/${presupuestoId}`)
      revalidatePath('/dashboard/presupuestos')
    }
    return resultado
  } catch (error) {
    return { ok: false, mensaje: registrarFallo('pagarPresupuestoAction', error) }
  }
}
