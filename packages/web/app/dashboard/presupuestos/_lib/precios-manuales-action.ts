'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { crearDb } from '@aluminior/db'
import { UNIDADES_PRECIO_MANUAL } from '@aluminior/core/precios'
import { usuarioActual } from './usuario-actual.ts'
import { registrarFallo } from './errores.ts'
import { ErrorOperacionCerramiento } from './cerramientos/error-operativo.ts'
import { asegurarCatalogoDiseno } from './catalogo-diseno/index.ts'
import { leerCatalogoUniones } from '../../../../lib/catalogo-uniones/leer.ts'
import { aplicarPreciosLinea } from './precios-manuales/index.ts'

export type EstadoPreciosLinea = { ok: true; mensaje: string } | { ok: false; mensaje: string }

const esquema = z.object({
  presupuestoId: z.string().uuid(),
  lineaId: z.string().uuid(),
  destino: z.enum(['OBRA', 'TARIFA']),
  precios: z.array(z.object({
    articulo: z.string().trim().min(1).max(40),
    acabado: z.string().trim().min(1).max(20),
    unidad: z.enum(UNIDADES_PRECIO_MANUAL),
    precio: z.number().positive().lt(1_000_000),
  })).min(1).max(50),
})

/** Server action fina: valida, autoriza, aplica los precios y revalida. */
export async function ponerPreciosLinea(entrada: unknown): Promise<EstadoPreciosLinea> {
  const p = esquema.safeParse(entrada)
  if (!p.success) return { ok: false, mensaje: 'Revisa los precios: deben ser mayores que cero' }
  try {
    if (!await usuarioActual()) return { ok: false, mensaje: 'Sesión no válida' }
    const db = crearDb()
    await asegurarCatalogoDiseno(db)
    const resultado = await aplicarPreciosLinea(db, { ...p.data, catalogoUniones: (await leerCatalogoUniones()).uniones })
    if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje ?? 'No se pudo guardar el precio' }
    revalidatePath(`/dashboard/presupuestos/${p.data.presupuestoId}`)
    revalidatePath('/dashboard/presupuestos')
    return { ok: true, mensaje: resultado.aviso }
  } catch (error) {
    if (error instanceof ErrorOperacionCerramiento) return { ok: false, mensaje: error.message }
    return { ok: false, mensaje: registrarFallo('ponerPreciosLinea', error) }
  }
}
