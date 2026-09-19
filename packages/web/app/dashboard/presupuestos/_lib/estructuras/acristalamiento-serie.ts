/** Catálogo 0021; durante la transición la opción 1 conserva el catálogo previo. */
import { eq, inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { opcionesAcristalamiento, type OpcionAcristalamiento } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'

export async function opcionesAcristalamientoDeSerie(
  cliente: ClienteEscritura,
  serieCodigo: string,
): Promise<OpcionAcristalamiento[]> {
  if (!serieCodigo) return []
  const filas = await cliente.select().from(schema.conjuntoAcristalamientos)
    .where(eq(schema.conjuntoAcristalamientos.conjuntoCodigo, serieCodigo))
  if (!filas.length) {
    const [conjunto] = await cliente.select().from(schema.conjuntos)
      .where(eq(schema.conjuntos.codigo, serieCodigo)).limit(1)
    return conjunto ? opcionesAcristalamiento([{ hojas: conjunto.tablaHojas, fijos: conjunto.tablaFijos }]) : []
  }
  const codigos = [...new Set(filas.flatMap(f => [f.tablaHojas, f.tablaFijos]).filter((c): c is string => !!c))]
  const nombres = codigos.length ? await cliente.select().from(schema.tablasAcristalamiento)
    .where(inArray(schema.tablasAcristalamiento.codigo, codigos)) : []
  const tablas = Array.from({ length: 5 }, (_, i) => {
    const fila = filas.find(f => f.opcion === i + 1)
    return { hojas: fila?.tablaHojas ?? null, fijos: fila?.tablaFijos ?? null }
  })
  return opcionesAcristalamiento(tablas, new Map(nombres.map(n => [n.codigo, n.descripcion])))
}
