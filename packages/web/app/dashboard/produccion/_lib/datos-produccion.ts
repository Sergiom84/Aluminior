import { asc, eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { resolverDestinatarioPresupuesto } from '../../presupuestos/_lib/destinatario/index'
import type { DatosProduccion } from './tipos'

export interface DocumentoProduccion extends DatosProduccion { serie: string; destinatario: string }

/** Una sola foto MVCC del documento y de todas sus piezas; nunca recompone recetas. */
export async function cargarProduccion(db: ReturnType<typeof crearDb>, id: string): Promise<DocumentoProduccion | null> {
  return db.transaction(async tx => {
    const [p] = await tx.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, id)).limit(1)
    if (!p) return null
    const [cliente] = p.clienteCodigo ? await tx.select({ nombre: schema.clientes.nombre }).from(schema.clientes)
      .where(eq(schema.clientes.codigo, p.clienteCodigo)).limit(1) : []
    const [potencial] = p.potencialCodigo ? await tx.select({ nombre: schema.clientesPotenciales.nombre }).from(schema.clientesPotenciales)
      .where(eq(schema.clientesPotenciales.codigo, p.potencialCodigo)).limit(1) : []
    const destinatario = resolverDestinatarioPresupuesto({ clienteNombre: cliente?.nombre,
      potencialNombre: potencial?.nombre, nombreLibre: p.nombreLibre })
    const lineas = await tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, id)).orderBy(asc(schema.lineas.orden))
    const ids = lineas.map(l => l.id)
    const configuraciones = ids.length ? await tx.select().from(schema.lineasCerramiento).where(inArray(schema.lineasCerramiento.lineaId, ids)) : []
    const resultados = ids.length ? await tx.select().from(schema.lineasCerramientoResultados).where(inArray(schema.lineasCerramientoResultados.lineaId, ids)) : []
    const piezas = ids.length ? await tx.select().from(schema.lineasDespiece).where(inArray(schema.lineasDespiece.lineaId, ids))
      .orderBy(asc(schema.lineasDespiece.origenId), asc(schema.lineasDespiece.origenOrdinal), asc(schema.lineasDespiece.id)) : []
    const codigos = [...new Set(piezas.map(pieza => pieza.articuloCodigo))]
    const articulos = codigos.length ? await tx.select({ codigo: schema.articulos.codigo, descripcion: schema.articulos.descripcion,
      apareceEnHojaCorte: schema.articulos.apareceEnHojaCorte, apareceEnHojaDespiece: schema.articulos.apareceEnHojaDespiece })
      .from(schema.articulos).where(inArray(schema.articulos.codigo, codigos)) : []
    return { id: p.id, serie: p.serie, destinatario, documento: { numero: String(p.numero), revision: p.revision,
      clienteCodigo: p.clienteCodigo, clienteNombre: destinatario, obra: p.obraTexto }, articulos,
      lineas: lineas.map(l => ({ ...l, configuracion: configuraciones.find(c => c.lineaId === l.id)?.configuracion ?? null,
        versionConfiguracion: configuraciones.find(c => c.lineaId === l.id)?.version ?? null,
        resultado: resultados.find(r => r.lineaId === l.id)?.resultado ?? null,
        versionResultado: resultados.find(r => r.lineaId === l.id)?.version ?? null, piezas: piezas.filter(pieza => pieza.lineaId === l.id) })) }
  }, { isolationLevel: 'repeatable read', accessMode: 'read only' })
}
