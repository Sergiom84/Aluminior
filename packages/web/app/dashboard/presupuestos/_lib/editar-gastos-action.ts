'use server'
import { revalidatePath } from 'next/cache'
import { crearDb } from '@aluminior/db'
import { usuarioActual } from './usuario-actual'
import { registrarFallo } from './errores'
import { actualizarGastos } from './gastos/index.ts'
import { camposEdicion, type EstadoEdicion } from './edicion/estado'

export async function editarGastos(_previo: EstadoEdicion, datos: FormData): Promise<EstadoEdicion> {
  try {
    if (!await usuarioActual()) return { ok: false, errores: {}, mensaje: 'Sesión no válida' }
    const resultado = await actualizarGastos(crearDb(), camposEdicion(datos))
    if (resultado.ok) revalidatePath(`/dashboard/presupuestos/${datos.get('presupuestoId')}`)
    return resultado
  } catch (error) { return { ok: false, errores: {}, mensaje: registrarFallo('editarGastos', error) } }
}
