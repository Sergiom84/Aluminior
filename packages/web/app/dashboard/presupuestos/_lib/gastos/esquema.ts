import { z } from 'zod'
import { compararDecimal, normalizarDecimal } from '@aluminior/core/precios'

/** Con signo: EMP0016 tiene comisiones de -50 % a 25 %. Punto decimal, como el resto de importes tecleados. */
const FORMA_PORCENTAJE = /^-?\d{1,3}(\.\d{1,2})?$/

const porcentajeComision = z.preprocess(
  v => v === undefined || v === null || String(v).trim() === '' ? '0' : String(v).trim(),
  z.string().superRefine((texto, ctx) => {
    const error = (message: string) => ctx.addIssue({ code: 'custom', message })
    if (texto.includes(',')) return error('Usa punto decimal')
    if (!FORMA_PORCENTAJE.test(texto)) return error('Indica un porcentaje con dos decimales como máximo')
    if (compararDecimal(texto, '-100') <= 0) return error('Debe ser mayor que -100')
  }).transform(texto => normalizarDecimal(texto, 2)),
)

export const esquemaGastos = z.object({
  presupuestoId: z.string().uuid(),
  comisionPorc: porcentajeComision,
  // Casilla HTML: ausente cuando no está marcada.
  sumarComision: z.literal('on').optional().transform(v => v === 'on'),
}).strict()

export type GastosPresupuesto = Omit<z.output<typeof esquemaGastos>, 'presupuestoId'>
