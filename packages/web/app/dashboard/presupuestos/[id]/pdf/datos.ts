/**
 * Carga de un presupuesto para el PDF.
 *
 * Lee EXACTAMENTE lo mismo que la página de detalle (`[id]/page.tsx`): la
 * cabecera, el destinatario y las líneas YA valoradas y persistidas. NO revalora
 * ni recalcula importes — consume el veredicto de la guarda (`lineaValorable`)
 * que `acciones.ts` grabó al añadir cada línea. El criterio "incompleto" es la
 * fuente única de `@aluminior/core`: `presupuestoIncompleto`.
 */
import { eq, asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { presupuestoIncompleto } from '@aluminior/core/precios'
import type { DatosPresupuestoPdf } from './documento.tsx'

export async function cargarPresupuestoPdf(
  db: ReturnType<typeof crearDb>,
  id: string,
): Promise<DatosPresupuestoPdf | null> {
  const [p] = await db.select().from(schema.presupuestos)
    .where(eq(schema.presupuestos.id, id)).limit(1)
  if (!p) return null

  const [cliente] = p.clienteCodigo
    ? await db.select({ nombre: schema.clientes.nombre })
        .from(schema.clientes).where(eq(schema.clientes.codigo, p.clienteCodigo)).limit(1)
    : []

  const lineas = await db.select()
    .from(schema.lineas)
    .where(eq(schema.lineas.presupuestoId, id))
    .orderBy(asc(schema.lineas.orden))

  return {
    numero: p.numero,
    revision: p.revision,
    fecha: p.fecha,
    estado: p.estado,
    destinatario: cliente?.nombre ?? p.nombreLibre ?? 'Sin destinatario',
    obra: p.obraTexto,
    tarifa: p.tarifa,
    tipoIva: Number(p.tipoIva),
    baseImponible: Number(p.baseImponible),
    cuotaIva: Number(p.cuotaIva),
    total: Number(p.total),
    incompleto: presupuestoIncompleto(lineas),
    lineas: lineas.map((l) => ({
      orden: l.orden,
      tipo: l.tipo,
      descripcion: l.descripcion,
      referencia: l.referencia,
      anchoMm: l.anchoMm,
      altoMm: l.altoMm,
      cantidad: l.cantidad,
      precioUnitario: l.precioUnitario,
      total: l.total,
      valoracionCompleta: l.valoracionCompleta,
      avisoValoracion: l.avisoValoracion,
    })),
  }
}
