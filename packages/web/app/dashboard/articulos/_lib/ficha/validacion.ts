/**
 * Validación de la ficha de artículo.
 *
 * Productor exige la familia al grabar («Debe indicar el campo 'Familia'»)
 * y acepta la descripción vacía; Aluminior exige ambas. Diferencia
 * intencional registrada en RECON-ARTICULOS.md.
 *
 * Los campos de metraje llegan siempre: la ficha deja en solo lectura los que
 * el tipo no usa, sin ocultarlos. Aun así todo lo opcional tolera `undefined`
 * para no fallar en silencio si un campo deja de enviarse.
 */

import { z } from 'zod'

const numeroOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === undefined || v === '' ? null : v.replace(',', '.')))
  .refine((v) => v === null || Number.isFinite(Number(v)), 'Debe ser un número')

const textoOpcional = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null))

export const CASILLAS_ARTICULO = [
  'apareceEnHojaDespiece', 'apareceEnHojaCorte', 'controlaStock',
] as const

const esquema = z.object({
  codigo: z.string().trim().min(1, 'Debe indicar el campo Código').max(40),
  descripcion: z.string().trim().min(1, 'Debe indicar el campo Descripción').max(300),
  familiaCodigo: z.string().trim().min(1, 'Debe indicar el campo Familia').max(40),
  subfamiliaCodigo: textoOpcional(40),
  tipoMetraje: z.enum(['ML', 'UD', 'M2'], { message: 'Tipo de metraje no válido' }),
  metrajeMinimo: numeroOpcional,
  metrajeMultiploLargo: numeroOpcional,
  metrajeMultiploAncho: numeroOpcional,
  pesoMl: numeroOpcional,
  grosorPesoVidrio: numeroOpcional,
  tamJunquilloGoma: textoOpcional(40),
  proveedorHabitual: textoOpcional(40),
  apareceEnHojaDespiece: z.boolean(),
  apareceEnHojaCorte: z.boolean(),
  controlaStock: z.boolean(),
})

export type ArticuloValidado = z.infer<typeof esquema>

export type ResultadoValidacion =
  | { ok: true; datos: ArticuloValidado }
  | { ok: false; errores: Record<string, string[]> }

/** Una casilla marcada llega como `on`; una desmarcada no llega. */
export function validarArticulo(entrada: Record<string, string | undefined>): ResultadoValidacion {
  const crudo: Record<string, unknown> = { ...entrada }
  for (const casilla of CASILLAS_ARTICULO) {
    crudo[casilla] = entrada[casilla] === 'on' || entrada[casilla] === 'true'
  }
  const r = esquema.safeParse(crudo)
  if (r.success) return { ok: true, datos: r.data }
  return { ok: false, errores: r.error.flatten().fieldErrors as Record<string, string[]> }
}
