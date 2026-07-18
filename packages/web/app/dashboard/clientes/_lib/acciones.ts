'use server'

/**
 * Server Actions de clientes. Toda escritura pasa por aquí: validación en
 * servidor con Zod y acceso a PostgreSQL. El navegador nunca toca la base.
 */

import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { crearDb, schema } from '@aluminior/db'

/**
 * Reglas heredadas del sistema original:
 *  - El código es de 5 dígitos con ceros a la izquierda ("00082").
 *  - El NIF NO es obligatorio: en los datos reales hay clientes sin él.
 *  - La provincia y población son texto libre, no catálogos.
 */
const esquemaCliente = z.object({
  codigo: z.string().trim().min(1, 'El código es obligatorio').max(20),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(200),
  nombreComercial: z.string().trim().max(200).optional().or(z.literal('')),
  nif: z.string().trim().max(20).optional().or(z.literal('')),
  direccion: z.string().trim().max(200).optional().or(z.literal('')),
  cp: z.string().trim().max(10).optional().or(z.literal('')),
  poblacion: z.string().trim().max(100).optional().or(z.literal('')),
  provincia: z.string().trim().max(100).optional().or(z.literal('')),
  pais: z.string().trim().max(5).default('ES'),
  personaContacto: z.string().trim().max(100).optional().or(z.literal('')),
  telefono: z.string().trim().max(30).optional().or(z.literal('')),
  telefonoMovil: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().email('Correo no válido').optional().or(z.literal('')),
  tarifa: z.coerce.number().int().min(1).max(9).default(1),
})

export type EstadoFormulario =
  | { ok: true; codigo: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }
  | null

/** Convierte '' a null: en base de datos preferimos ausencia a cadena vacía. */
function vacioANull<T extends Record<string, unknown>>(o: T): T {
  const r = { ...o }
  for (const k of Object.keys(r)) {
    if (r[k] === '') (r as Record<string, unknown>)[k] = null
  }
  return r
}

export async function guardarCliente(
  _previo: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const parseado = esquemaCliente.safeParse(Object.fromEntries(datos))

  if (!parseado.success) {
    return { ok: false, errores: parseado.error.flatten().fieldErrors }
  }

  const { codigo, ...resto } = vacioANull(parseado.data)
  const esNuevo = datos.get('_nuevo') === '1'
  const db = crearDb()

  try {
    if (esNuevo) {
      const existe = await db
        .select({ c: schema.clientes.codigo })
        .from(schema.clientes)
        .where(eq(schema.clientes.codigo, codigo))
        .limit(1)

      if (existe.length) {
        return {
          ok: false,
          errores: { codigo: ['Ya existe un cliente con ese código'] },
        }
      }

      await db.insert(schema.clientes).values({ codigo, ...resto })
    } else {
      await db.update(schema.clientes).set(resto).where(eq(schema.clientes.codigo, codigo))
    }
  } catch (e) {
    return { ok: false, errores: {}, mensaje: (e as Error).message }
  }

  revalidatePath('/dashboard/clientes')
  return { ok: true, codigo }
}

/** Siguiente código libre, con el formato de 5 dígitos del sistema original. */
export async function siguienteCodigo(): Promise<string> {
  const db = crearDb()
  const [fila] = await db.execute<{ max: string | null }>(sql`
    SELECT MAX(codigo) AS max FROM clientes WHERE codigo ~ '^[0-9]+$'
  `) as unknown as { max: string | null }[]

  const siguiente = Number(fila?.max ?? 0) + 1
  return String(siguiente).padStart(5, '0')
}
