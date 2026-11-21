import { eq } from 'drizzle-orm'
import { PRECIO_HORA_COLOCACION_DEFECTO } from '@aluminior/core/precios'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import {
  MAXIMO_PRECIO_HORA_COLOCACION, normalizarClaveUsuario, validarPrecioHoraColocacion,
} from './validacion.ts'

export { MAXIMO_PRECIO_HORA_COLOCACION, normalizarClaveUsuario, validarPrecioHoraColocacion }

export async function leerPrecioHoraColocacion(
  db: Pick<ClienteEscritura, 'select'>,
  usuario: string | null | undefined,
): Promise<string> {
  const clave = normalizarClaveUsuario(usuario)
  if (!clave) return PRECIO_HORA_COLOCACION_DEFECTO
  try {
    const [fila] = await db
      .select({ precioHoraColocacion: schema.preferenciasUsuario.precioHoraColocacion })
      .from(schema.preferenciasUsuario)
      .where(eq(schema.preferenciasUsuario.usuarioClave, clave))
      .limit(1)
    return fila?.precioHoraColocacion ?? PRECIO_HORA_COLOCACION_DEFECTO
  } catch (error) {
    if ((error as { code?: string } | null)?.code === '42P01') {
      return PRECIO_HORA_COLOCACION_DEFECTO
    }
    throw error
  }
}

export async function guardarPrecioHoraColocacion(
  db: Pick<ClienteEscritura, 'insert'>,
  usuario: string,
  precioHora: string,
): Promise<string> {
  const clave = normalizarClaveUsuario(usuario)
  if (!clave) throw new Error('Usuario no válido')
  const normalizado = validarPrecioHoraColocacion(precioHora)
  if (!normalizado) throw new Error('Precio por hora de colocación no válido')
  const ahora = new Date()
  await db
    .insert(schema.preferenciasUsuario)
    .values({
      usuarioClave: clave,
      precioHoraColocacion: normalizado,
      actualizadoEn: ahora,
    })
    .onConflictDoUpdate({
      target: schema.preferenciasUsuario.usuarioClave,
      set: {
        precioHoraColocacion: normalizado,
        actualizadoEn: ahora,
      },
    })
  return normalizado
}
