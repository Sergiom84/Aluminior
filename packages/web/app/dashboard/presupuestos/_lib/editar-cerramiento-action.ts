'use server'

import { revalidatePath } from 'next/cache'
import { crearDb } from '@aluminior/db'
import { registrarFallo } from './errores.ts'
import { esquemaLinea } from './lineas/esquema-linea.ts'
import { actualizarCerramiento } from './cerramientos/index.ts'

export type EstadoEdicionCerramiento =
  | { ok: true; mensaje: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }
  | null

/** Server action fina: valida el transporte, llama al caso de uso y revalida. */
export async function editarCerramiento(
  _previo: EstadoEdicionCerramiento,
  datos: FormData,
): Promise<EstadoEdicionCerramiento> {
  const lineaId = String(datos.get('lineaId') ?? '')
  const p = esquemaLinea.safeParse(Object.fromEntries(datos))
  if (!p.success) return { ok: false, errores: p.error.flatten().fieldErrors }
  if (!lineaId || p.data.tipo !== 'CERRAMIENTO') {
    return { ok: false, errores: {}, mensaje: 'La edición sólo admite cerramientos' }
  }

  try {
    const resultado = await actualizarCerramiento(crearDb(), {
      presupuestoId: p.data.presupuestoId,
      lineaId,
      configuracionSerializada: p.data.configuracionCerramiento,
      serieCodigo: p.data.serieCodigo,
      vidrioCodigo: p.data.vidrioCodigo,
      acabadoCodigo: p.data.acabadoCodigo,
      varianteAcristalamiento: p.data.varianteAcristalamiento,
      referencia: p.data.referencia,
      cantidad: p.data.cantidad,
      horasFabricacion: p.data.horasFabricacion,
      horasColocacion: p.data.horasColocacion,
    })
    if (!resultado.ok) return resultado
    revalidatePath(`/dashboard/presupuestos/${p.data.presupuestoId}`)
    revalidatePath('/dashboard/presupuestos')
    return { ok: true, mensaje: resultado.aviso }
  } catch (error) {
    return { ok: false, errores: {}, mensaje: registrarFallo('editarCerramiento', error) }
  }
}
