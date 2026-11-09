import { eq, and, or, ilike, asc } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import {
  condicionTelefonoCliente,
  condicionTextoCliente,
  fragmentosBusqueda,
} from '../../../../lib/busqueda-clientes.ts'

export interface ClienteEncontrado {
  codigo: string
  nombre: string
  poblacion: string | null
  direccion: string | null
  telefono: string | null
  telefonoMovil: string | null
}

/**
 * Buscador incremental del selector de cliente.
 *
 * Cada fragmento debe aparecer en el nombre, el nombre comercial, la calle o
 * el teléfono, en cualquier orden. Los apellidos no tienen columna propia:
 * forman parte del nombre. El código se busca además por prefijo.
 */
export async function buscarClientesEnCatalogo(cliente: ClienteEscritura, consulta: string): Promise<ClienteEncontrado[]> {
  const texto = consulta.trim().slice(0, 120)
  const fragmentos = fragmentosBusqueda(texto)
  const filtroTexto = fragmentos.length
    ? and(...fragmentos.map((fragmento) => condicionTextoCliente(fragmento)))
    : undefined

  const filtro = texto
    ? or(
        ilike(schema.clientes.codigo, `${texto.replace(/[%_\s]/g, '')}%`),
        filtroTexto,
        condicionTelefonoCliente(texto),
      )
    : undefined

  return cliente
    .select({
      codigo: schema.clientes.codigo,
      nombre: schema.clientes.nombre,
      poblacion: schema.clientes.poblacion,
      direccion: schema.clientes.direccion,
      telefono: schema.clientes.telefono,
      telefonoMovil: schema.clientes.telefonoMovil,
    })
    .from(schema.clientes)
    .where(and(eq(schema.clientes.activo, true), filtro))
    .orderBy(asc(schema.clientes.nombre))
    .limit(8)
}
