'use server'
import { revalidatePath } from 'next/cache'
import { crearDb } from '@aluminior/db'
import { usuarioActual } from './usuario-actual'
import { registrarFallo } from './errores'
import { actualizarCabecera } from './cabecera/editar'
import { camposEdicion, type EstadoEdicion } from './edicion/estado'

export async function editarCabecera(_previo: EstadoEdicion, datos: FormData): Promise<EstadoEdicion> {
  try {
    if (!await usuarioActual()) return { ok: false, errores: {}, mensaje: 'Sesión no válida' }
    const resultado = await actualizarCabecera(crearDb(), camposEdicion(datos))
    if (resultado.ok) {
      revalidatePath(`/dashboard/presupuestos/${datos.get('presupuestoId')}`)
      revalidatePath('/dashboard/presupuestos')
    }
    return resultado
  } catch (error) { return { ok: false, errores: {}, mensaje: registrarFallo('editarCabecera', error) } }
}
