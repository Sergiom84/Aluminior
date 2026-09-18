'use server'

/**
 * Server Actions de artículos: validan, persisten y revalidan. La validación
 * vive en `ficha/validacion.ts` y las consultas en `ficha/consulta.ts`.
 */

import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { crearDb, schema } from '@aluminior/db'
import { validarArticulo } from './ficha/validacion.ts'
import { calcularSiguienteCodigo, existeArticulo } from './ficha/consulta.ts'

export type EstadoFormulario =
  | { ok: true; codigo: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }
  | null

export async function guardarArticulo(
  _previo: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const entrada: Record<string, string> = {}
  for (const [clave, valor] of datos) if (typeof valor === 'string') entrada[clave] = valor

  const r = validarArticulo(entrada)
  if (!r.ok) return { ok: false, errores: r.errores }

  const { codigo, ...resto } = r.datos
  const esNuevo = datos.get('_nuevo') === '1'
  const db = crearDb()

  try {
    if (esNuevo) {
      if (await existeArticulo(codigo)) {
        return { ok: false, errores: { codigo: ['Ya existe un artículo con ese código'] } }
      }
      await db.insert(schema.articulos).values({ codigo, ...resto })
    } else {
      await db.update(schema.articulos).set(resto).where(eq(schema.articulos.codigo, codigo))
    }
  } catch (e) {
    return { ok: false, errores: {}, mensaje: (e as Error).message }
  }

  revalidatePath('/dashboard/articulos')
  revalidatePath(`/dashboard/articulos/${encodeURIComponent(codigo)}`)
  return { ok: true, codigo }
}

/** «Obtener Código Siguiente» de la ficha en alta. */
export async function siguienteCodigoArticulo(): Promise<string> {
  return calcularSiguienteCodigo()
}

/** Familias para el filtro de la lista, con cuántos artículos tiene cada una. */
export async function familiasConUso() {
  const db = crearDb()
  return db.execute<{ codigo: string; descripcion: string; n: number }>(sql`
    SELECT f.codigo, f.descripcion, COUNT(a.codigo)::int AS n
    FROM familias f
    LEFT JOIN articulos a ON a.familia_codigo = f.codigo
    GROUP BY f.codigo, f.descripcion
    ORDER BY f.codigo
  `) as unknown as Promise<{ codigo: string; descripcion: string; n: number }[]>
}
