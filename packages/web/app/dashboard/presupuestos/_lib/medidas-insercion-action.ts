'use server'

import { crearDb } from '@aluminior/db'
import { revalidatePath } from 'next/cache'
import { usuarioActual } from './usuario-actual.ts'
import { registrarFallo } from './errores.ts'
import { guardarPreferenciaMedidas } from './medidas-insercion/preferencia.ts'
import type { PreferenciaMedidas } from '@aluminior/core/estructuras'

export async function cambiarPreferenciaMedidas(presupuestoId: string, preferencia: PreferenciaMedidas) {
  try {
    if (!await usuarioActual()) return { ok: false as const, mensaje: 'Sesión no válida' }
    const resultado = await guardarPreferenciaMedidas(crearDb(), { presupuestoId, preferencia })
    if (resultado.ok) revalidatePath(`/dashboard/presupuestos/${presupuestoId}`)
    return resultado
  } catch (error) {
    return { ok: false as const, mensaje: registrarFallo('cambiarPreferenciaMedidas', error) }
  }
}
