import { eq, asc, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { presupuestoIncompleto } from '@aluminior/core/precios'
import { resolverDestinatarioPresupuesto } from '../../_lib/destinatario/index'
import { adaptarCerramientoPdf, DatosPdfIncoherentes } from './cerramiento-pdf'
import type { DatosPresupuestoPdf } from './tipos'

/** Una vista MVCC de cabecera y satélites, sin revalorar ni bloquear escritores. */
export async function cargarPresupuestoPdf(
  db: ReturnType<typeof crearDb>, id: string,
): Promise<DatosPresupuestoPdf | null> {
  return db.transaction(async tx => {
    const [p] = await tx.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, id)).limit(1)
    if (!p) return null
    const [cliente] = p.clienteCodigo ? await tx.select({ nombre: schema.clientes.nombre })
      .from(schema.clientes).where(eq(schema.clientes.codigo, p.clienteCodigo)).limit(1) : []
    const [potencial] = p.potencialCodigo ? await tx.select({ nombre: schema.clientesPotenciales.nombre })
      .from(schema.clientesPotenciales).where(eq(schema.clientesPotenciales.codigo, p.potencialCodigo)).limit(1) : []
    const lineas = await tx.select().from(schema.lineas)
      .where(eq(schema.lineas.presupuestoId, id)).orderBy(asc(schema.lineas.orden))
    const ids = lineas.filter(l => l.tipo === 'CERRAMIENTO').map(l => l.id)
    const configuraciones = ids.length ? await tx.select().from(schema.lineasCerramiento)
      .where(inArray(schema.lineasCerramiento.lineaId, ids)) : []
    const resultados = ids.length ? await tx.select().from(schema.lineasCerramientoResultados)
      .where(inArray(schema.lineasCerramientoResultados.lineaId, ids)) : []
    const manoObra = ids.length ? await tx.select().from(schema.lineasManoObra)
      .where(inArray(schema.lineasManoObra.lineaId, ids)).orderBy(asc(schema.lineasManoObra.concepto)) : []
    return {
      id: p.id, serie: p.serie, numero: p.numero, revision: p.revision, fecha: p.fecha, estado: p.estado,
      destinatario: resolverDestinatarioPresupuesto({ clienteNombre: cliente?.nombre,
        potencialNombre: potencial?.nombre, nombreLibre: p.nombreLibre }),
      obra: p.obraTexto, formaPago: p.formaPago, observaciones: p.observaciones,
      tarifa: p.tarifa, tipoIva: Number(p.tipoIva), baseImponible: Number(p.baseImponible),
      cuotaIva: Number(p.cuotaIva), total: Number(p.total), incompleto: presupuestoIncompleto(lineas),
      lineas: lineas.map(l => {
        const configuracion = configuraciones.find(c => c.lineaId === l.id)
        if (l.tipo === 'CERRAMIENTO' && !configuracion) {
          throw new DatosPdfIncoherentes('Falta la configuración del cerramiento')
        }
        return {
          id: l.id, orden: l.orden, tipo: l.tipo, descripcion: l.descripcion, referencia: l.referencia,
          anchoMm: l.anchoMm, altoMm: l.altoMm, cantidad: l.cantidad, precioUnitario: l.precioUnitario,
          total: l.total, valoracionCompleta: l.valoracionCompleta, avisoValoracion: l.avisoValoracion,
          cerramiento: configuracion ? adaptarCerramientoPdf({ ...configuracion,
            resultado: resultados.find(r => r.lineaId === l.id) ?? null,
            anchoMm: l.anchoMm, altoMm: l.altoMm,
            manoObra: manoObra.filter(m => m.lineaId === l.id),
          }) : null,
        }
      }),
    }
  }, { isolationLevel: 'repeatable read', accessMode: 'read only' })
}
