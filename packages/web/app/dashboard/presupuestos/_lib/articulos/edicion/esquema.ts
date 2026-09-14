import { z } from 'zod'
import { esquemaLinea } from '../../lineas/esquema-linea'

export const esquemaEdicionArticulo = esquemaLinea.pick({ presupuestoId: true, cantidad: true, referencia: true })
  .extend({ lineaId: z.string().uuid(), cantidad: z.unknown()
    .refine(v => v !== undefined && v !== null && String(v).trim() !== '', 'Indica la cantidad')
    .pipe(esquemaLinea.shape.cantidad) }).strict()
