/**
 * Lectura del documento origen de una copia.
 *
 * Capa delgada: no decide nada. Trae el presupuesto, sus líneas y los
 * satélites que hay que duplicar, y traduce cada línea a los cuatro códigos
 * sustituibles que entiende el plan.
 */

import { and, asc, eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { CodigosLinea, LineaOrigen, TipoLinea } from './plan-copia.ts'

export interface LineaConSatelites {
  readonly linea: typeof schema.lineas.$inferSelect
  readonly cerramiento: typeof schema.lineasCerramiento.$inferSelect | null
  readonly estructura: typeof schema.lineasEstructura.$inferSelect | null
  readonly despiece: readonly (typeof schema.lineasDespiece.$inferSelect)[]
  readonly acristalamiento: readonly (typeof schema.lineasAcristalamiento.$inferSelect)[]
  readonly opcionesHerraje: readonly (typeof schema.lineasOpcionesHerraje.$inferSelect)[]
  readonly manoObra: readonly (typeof schema.lineasManoObra.$inferSelect)[]
}

export interface DocumentoOrigen {
  readonly presupuesto: typeof schema.presupuestos.$inferSelect
  readonly lineas: readonly LineaConSatelites[]
  /** Revisiones ya escritas de ese número y serie, incluida la del origen. */
  readonly revisionesUsadas: readonly number[]
  /** Lo que la lectura no pudo resolver, con su motivo. */
  readonly avisos: readonly string[]
}

const porLinea = <T extends { lineaId: string }>(filas: readonly T[]) => {
  const mapa = new Map<string, T[]>()
  for (const fila of filas) {
    const lista = mapa.get(fila.lineaId) ?? []
    lista.push(fila)
    mapa.set(fila.lineaId, lista)
  }
  return mapa
}

/**
 * El vidrio de una línea ESTRUCTURA vive en `lineas_acristalamiento`, un slot
 * por alojamiento. Hoy Aluminior escribe el mismo código en todos, pero un
 * documento migrado puede traer varios: en ese caso se devuelve `null` y se
 * avisa, en vez de elegir uno y sustituir a ciegas los demás.
 */
function vidrioDeLinea(
  ranuras: readonly (typeof schema.lineasAcristalamiento.$inferSelect)[],
): { codigo: string | null; ambiguo: boolean } {
  const codigos = new Set<string>()
  for (const ranura of ranuras) {
    if (ranura.vidrioHojas) codigos.add(ranura.vidrioHojas)
    if (ranura.vidrioFijos) codigos.add(ranura.vidrioFijos)
  }
  if (codigos.size > 1) return { codigo: null, ambiguo: true }
  return { codigo: [...codigos][0] ?? null, ambiguo: false }
}

export function codigosDeLinea(entrada: LineaConSatelites): CodigosLinea {
  if (entrada.cerramiento) {
    return {
      serie: entrada.cerramiento.serieCodigo,
      vidrio: entrada.cerramiento.vidrioCodigo,
      // `lineas_cerramiento` no guarda acabado de accesorios ni de madera.
      acabadoAccesorios: null,
      acabadoMadera: null,
    }
  }
  if (entrada.estructura) {
    return {
      serie: entrada.estructura.serieCodigo,
      vidrio: vidrioDeLinea(entrada.acristalamiento).codigo,
      acabadoAccesorios: entrada.estructura.accesoriosAcabado,
      acabadoMadera: entrada.estructura.maderaCodigo,
    }
  }
  return { serie: null, vidrio: null, acabadoAccesorios: null, acabadoMadera: null }
}

export function lineaOrigenDe(entrada: LineaConSatelites): LineaOrigen {
  return {
    id: entrada.linea.id,
    orden: entrada.linea.orden,
    tipo: entrada.linea.tipo as TipoLinea,
    descripcionManual: entrada.linea.descripcionManual,
    codigos: codigosDeLinea(entrada),
  }
}

export async function leerDocumentoOrigen(
  cliente: ClienteEscritura,
  presupuestoId: string,
): Promise<DocumentoOrigen | null> {
  const [presupuesto] = await cliente.select().from(schema.presupuestos)
    .where(eq(schema.presupuestos.id, presupuestoId)).limit(1)
  if (!presupuesto) return null

  const lineas = await cliente.select().from(schema.lineas)
    .where(eq(schema.lineas.presupuestoId, presupuestoId))
    .orderBy(asc(schema.lineas.orden))
  const ids = lineas.map((linea) => linea.id)

  const [cerramientos, estructuras, despiece, acristalamiento, opciones, manoObra] = ids.length
    ? await Promise.all([
        cliente.select().from(schema.lineasCerramiento)
          .where(inArray(schema.lineasCerramiento.lineaId, ids)),
        cliente.select().from(schema.lineasEstructura)
          .where(inArray(schema.lineasEstructura.lineaId, ids)),
        cliente.select().from(schema.lineasDespiece)
          .where(inArray(schema.lineasDespiece.lineaId, ids)),
        cliente.select().from(schema.lineasAcristalamiento)
          .where(inArray(schema.lineasAcristalamiento.lineaId, ids)),
        cliente.select().from(schema.lineasOpcionesHerraje)
          .where(inArray(schema.lineasOpcionesHerraje.lineaId, ids)),
        cliente.select().from(schema.lineasManoObra)
          .where(inArray(schema.lineasManoObra.lineaId, ids)),
      ])
    : [[], [], [], [], [], []]

  // Revisiones ya escritas de ESTE número y serie: es lo que impide que la
  // copia pise una revisión existente.
  const revisiones = await cliente.select({ revision: schema.presupuestos.revision })
    .from(schema.presupuestos)
    .where(and(
      eq(schema.presupuestos.numero, presupuesto.numero),
      eq(schema.presupuestos.serie, presupuesto.serie),
    ))

  const cerramientoPorLinea = new Map(cerramientos.map((fila) => [fila.lineaId, fila]))
  const estructuraPorLinea = new Map(estructuras.map((fila) => [fila.lineaId, fila]))
  const despiecePorLinea = porLinea(despiece)
  const acrisPorLinea = porLinea(acristalamiento)
  const opcionesPorLinea = porLinea(opciones)
  const manoObraPorLinea = porLinea(manoObra)

  const avisos: string[] = []
  const conSatelites: LineaConSatelites[] = lineas.map((linea) => {
    const ranuras = acrisPorLinea.get(linea.id) ?? []
    if (vidrioDeLinea(ranuras).ambiguo) {
      avisos.push(`Línea ${linea.orden}: varios vidrios distintos; su sustitución de vidrio no se aplica`)
    }
    return {
      linea,
      cerramiento: cerramientoPorLinea.get(linea.id) ?? null,
      estructura: estructuraPorLinea.get(linea.id) ?? null,
      despiece: despiecePorLinea.get(linea.id) ?? [],
      acristalamiento: ranuras,
      opcionesHerraje: opcionesPorLinea.get(linea.id) ?? [],
      manoObra: manoObraPorLinea.get(linea.id) ?? [],
    }
  })

  return {
    presupuesto,
    lineas: conSatelites,
    revisionesUsadas: revisiones.map((fila) => fila.revision),
    avisos,
  }
}
