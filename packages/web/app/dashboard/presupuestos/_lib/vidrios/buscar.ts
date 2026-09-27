import { and, asc, eq, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'

export interface VidrioEncontrado { codigo: string; descripcion: string; unidad: string | null }

/** E10: código y descripción del catálogo. Nunca fabrica códigos de doble vidrio. */
export async function buscarVidriosCatalogo(cliente: ClienteEscritura, consulta: string): Promise<VidrioEncontrado[]> {
  const palabras = consulta.slice(0, 120).normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[%_\\]/g, '').trim().split(/\s+/).filter(Boolean)
  const texto = sql`translate(lower(${schema.articulos.codigo} || ' ' || ${schema.articulos.descripcion}), 'áéíóúüñ', 'aeiouun')`
  return cliente.select({ codigo: schema.articulos.codigo, descripcion: schema.articulos.descripcion,
    unidad: schema.articulos.tipoMetraje }).from(schema.articulos)
    .where(and(eq(schema.articulos.activo, true), eq(schema.articulos.familiaCodigo, '050'),
      ...palabras.map(p => sql`${texto} LIKE ${`%${p}%`}`)))
    .orderBy(asc(schema.articulos.codigo)).limit(50)
}
