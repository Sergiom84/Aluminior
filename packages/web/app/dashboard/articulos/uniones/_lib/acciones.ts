'use server'

import { revalidatePath } from 'next/cache'
import { ilike, or, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { guardarUnion } from '../../../../../lib/catalogo-uniones/guardar.ts'
import { guardarSubida } from '../../../../../lib/catalogo-uniones/subir.ts'
import { sesionValida } from '../../../../../lib/catalogo-uniones/sesion.ts'
import { precioPerfil } from '../../../../../lib/catalogo-uniones/leer.ts'
import { validarUnion } from '../../../../../lib/catalogo-uniones/validar.ts'

export type EstadoUnion =
  | { ok: true; codigo: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }
  | null

export async function guardarUnionAction(_previo: EstadoUnion, datos: FormData): Promise<EstadoUnion> {
  if (!await sesionValida()) return { ok: false, errores: {}, mensaje: 'Sesión no válida' }
  const entrada: Record<string, string | string[]> = {}
  for (const [clave, valor] of datos) {
    if (typeof valor !== 'string') continue
    if (clave === 'series') {
      const lista = entrada.series
      entrada.series = [...(Array.isArray(lista) ? lista : []), valor]
    } else entrada[clave] = valor
  }
  const archivo = datos.get('archivo')
  if (archivo instanceof File && archivo.size > 0) {
    const subida = await guardarSubida(archivo)
    if (!subida.ok) return subida
    entrada.imagen = subida.nombre
  }
  const validada = validarUnion(entrada)
  if (!validada.ok) return validada
  try {
    const resultado = await guardarUnion(validada.datos, datos.get('_nuevo') === '1')
    if (!resultado.ok) return resultado
    revalidatePath('/dashboard/articulos/uniones')
    revalidatePath(`/dashboard/articulos/uniones/${encodeURIComponent(resultado.codigo)}`)
    revalidatePath('/dashboard/presupuestos')
    return resultado
  } catch (error) {
    return { ok: false, errores: {}, mensaje: error instanceof Error ? error.message : 'No se ha guardado' }
  }
}

export async function buscarPerfiles(texto: string) {
  const q = texto.trim()
  if (q.length < 1) return []
  const db = crearDb()
  return db.select({ codigo: schema.articulos.codigo, descripcion: schema.articulos.descripcion })
    .from(schema.articulos)
    .where(or(ilike(schema.articulos.codigo, `${q}%`), ilike(schema.articulos.descripcion, `%${q}%`)))
    .orderBy(sql`${schema.articulos.codigo}`)
    .limit(12)
}

export async function consultarPrecioPerfil(codigo: string) {
  return precioPerfil(codigo)
}
