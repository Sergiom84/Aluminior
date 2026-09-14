import { z } from 'zod'

const campos = z.object({
  clienteCodigo: z.string().trim().optional().transform(v => v || null),
  potencialCodigo: z.string().trim().optional().transform(v => v || null),
  nombreLibre: z.string().trim().max(200).optional().transform(v => v || null),
  obraTexto: z.string().trim().max(200).optional().transform(v => v || null),
  formaPago: z.string().trim().max(60).optional().transform(v => v || null),
  observaciones: z.string().trim().max(4000).optional().transform(v => v || null),
})

function destinatario(d: z.infer<typeof campos>, ctx: z.RefinementCtx) {
  if (!d.clienteCodigo && !d.potencialCodigo && !d.nombreLibre)
    ctx.addIssue({ code: 'custom', path: ['nombreLibre'], message: 'Indica cliente, potencial o al menos un nombre' })
  if (d.clienteCodigo && d.potencialCodigo)
    ctx.addIssue({ code: 'custom', path: ['clienteCodigo'], message: 'Elige cliente o potencial, no ambos' })
}

export const esquemaCabeceraAlta = campos.extend({
  tarifa: z.coerce.number().int().min(1).max(9).default(1),
}).superRefine(destinatario)

export const esquemaCabeceraEdicion = campos.extend({ presupuestoId: z.string().uuid() })
  .strict().superRefine(destinatario)
export type EntradaCabecera = z.input<typeof esquemaCabeceraEdicion>
