import { eq, sql, and, or, ilike, asc } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'

export interface ClienteEncontrado {
  codigo: string
  nombre: string
  poblacion: string | null
}

/**
 * Buscador incremental del selector de cliente.
 *
 * Cada fragmento escrito debe aparecer en el nombre o nombre comercial, por
 * lo que `ser her la` encuentra `SERGIO HERNÁNDEZ LARA`. El código se busca
 * además por prefijo. Se limita en servidor para no volcar el maestro entero.
 */
export async function buscarClientesEnCatalogo(cliente: ClienteEscritura, consulta: string): Promise<ClienteEncontrado[]> {
  const texto = consulta.trim().slice(0, 120)
  const fragmentos = texto
    .split(/\s+/)
    .map((fragmento) => fragmento
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[%_]/g, '')
      .toLowerCase())
    .filter(Boolean)

  const filtroNombre = fragmentos.length
    ? and(...fragmentos.map((fragmento) => or(
        sql<boolean>`translate(lower(${schema.clientes.nombre}), 'áéíóúüñ', 'aeiouun') LIKE ${`%${fragmento}%`}`,
        sql<boolean>`translate(lower(coalesce(${schema.clientes.nombreComercial}, '')), 'áéíóúüñ', 'aeiouun') LIKE ${`%${fragmento}%`}`,
      )))
    : undefined

  const filtro = texto
    ? or(
        ilike(schema.clientes.codigo, `${texto.replace(/[%_\s]/g, '')}%`),
        filtroNombre,
      )
    : undefined

  return cliente
    .select({
      codigo: schema.clientes.codigo,
      nombre: schema.clientes.nombre,
      poblacion: schema.clientes.poblacion,
    })
    .from(schema.clientes)
    .where(and(eq(schema.clientes.activo, true), filtro))
    .orderBy(asc(schema.clientes.nombre))
    .limit(8)
}
