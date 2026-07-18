'use server'

/**
 * Server Actions de artículos.
 *
 * Los artículos son el material: perfiles, herrajes, vidrios, accesorios.
 * El campo determinante es `tipoMetraje`, que decide cómo se calcula el
 * consumo en el despiece:
 *   ML - metro lineal (perfiles): consume por longitud de corte
 *   UD - unidad (herrajes): consume por piezas
 *   M2 - metro cuadrado (vidrio): consume por superficie
 */

import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { crearDb, schema } from '@aluminior/db'

/**
 * Número con coma o punto decimal.
 *
 * DEBE aceptar `undefined`: el formulario sólo renderiza los campos que
 * corresponden al tipo de metraje elegido, así que los del resto de tipos
 * ni siquiera viajan en el FormData. Si aquí se exigiera `z.string()`, la
 * validación fallaría en campos que el usuario no ve, sin mensaje visible.
 * Ocurrió el 18/07/2026 y costó un rato encontrarlo.
 */
const numeroOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === undefined || v === '' ? null : v.replace(',', '.')))
  .refine((v) => v === null || Number.isFinite(Number(v)), 'Debe ser un número')

/** Texto opcional que tolera ausencia, por el mismo motivo. */
const textoOpcional = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => v ?? '')

const esquemaArticulo = z.object({
  codigo: z.string().trim().min(1, 'El código es obligatorio').max(40),
  descripcion: z.string().trim().min(1, 'La descripción es obligatoria').max(300),
  familiaCodigo: textoOpcional(40),
  subfamiliaCodigo: textoOpcional(40),
  tipoMetraje: z.enum(['ML', 'UD', 'M2'], {
    message: 'Selecciona una unidad de medida',
  }),
  metrajeMinimo: numeroOpcional,
  metrajeMultiploLargo: numeroOpcional,
  metrajeMultiploAncho: numeroOpcional,
  pesoMl: numeroOpcional,
  grosorPesoVidrio: numeroOpcional,
  tamJunquilloGoma: textoOpcional(40),
  proveedorHabitual: textoOpcional(40),
  apareceEnHojaDespiece: z.coerce.boolean().default(false),
  apareceEnHojaCorte: z.coerce.boolean().default(false),
  controlaStock: z.coerce.boolean().default(false),
})

export type EstadoFormulario =
  | { ok: true; codigo: string }
  | { ok: false; errores: Record<string, string[]>; mensaje?: string }
  | null

function vacioANull<T extends Record<string, unknown>>(o: T): T {
  const r = { ...o }
  for (const k of Object.keys(r)) if (r[k] === '') (r as Record<string, unknown>)[k] = null
  return r
}

export async function guardarArticulo(
  _previo: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const crudo = Object.fromEntries(datos)
  // Los checkbox no enviados no aparecen en FormData: se normalizan a booleano.
  for (const c of ['apareceEnHojaDespiece', 'apareceEnHojaCorte', 'controlaStock']) {
    crudo[c] = datos.get(c) === 'on' || datos.get(c) === 'true' ? 'true' : ''
  }

  const parseado = esquemaArticulo.safeParse(crudo)
  if (!parseado.success) {
    const errores = parseado.error.flatten().fieldErrors as Record<string, string[]>

    /**
     * Red de seguridad: si TODOS los errores caen en campos que el formulario
     * no está mostrando (por ejemplo los de otro tipo de metraje), el usuario
     * vería el envío fallar sin ningún mensaje. Preferimos un aviso genérico
     * feo a un fallo silencioso.
     */
    const visibles = new Set(Object.keys(crudo))
    const invisibles = Object.keys(errores).filter((k) => !visibles.has(k))
    if (invisibles.length && invisibles.length === Object.keys(errores).length) {
      return {
        ok: false,
        errores,
        mensaje: `Validación fallida en campos no visibles: ${invisibles.join(', ')}. Es un fallo del formulario, no tuyo.`,
      }
    }

    return { ok: false, errores }
  }

  const { codigo, ...resto } = vacioANull(parseado.data)
  const esNuevo = datos.get('_nuevo') === '1'
  const db = crearDb()

  try {
    if (esNuevo) {
      const existe = await db
        .select({ c: schema.articulos.codigo })
        .from(schema.articulos)
        .where(eq(schema.articulos.codigo, codigo))
        .limit(1)

      if (existe.length) {
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
  return { ok: true, codigo }
}

/** Familias para el desplegable, con cuántos artículos tiene cada una. */
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
