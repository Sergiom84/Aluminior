import { and, ilike, or, sql, type SQL, type SQLWrapper } from 'drizzle-orm'
import { schema } from '@aluminior/db'

/**
 * Criterio compartido del maestro de clientes.
 *
 * No hay columna de apellidos: en Productor el nombre completo vive en
 * `Nombre`. Cada fragmento debe aparecer en el nombre, el nombre comercial,
 * la calle o el teléfono, en cualquier orden. `c/` se trata como calle.
 */

const SINONIMOS_CALLE: Record<string, string> = {
  'c/': 'calle',
  'cl.': 'calle',
  'avda': 'avenida',
  'avda.': 'avenida',
  'pza': 'plaza',
  'pza.': 'plaza',
  'ctra': 'carretera',
  'ctra.': 'carretera',
}

export function normalizarFragmento(fragmento: string): string {
  const plano = fragmento
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[%_]/g, '')
    .toLowerCase()
  return SINONIMOS_CALLE[plano] ?? plano
}

export function fragmentosBusqueda(consulta: string): string[] {
  return consulta.trim().slice(0, 120).split(/\s+/).map(normalizarFragmento).filter(Boolean)
}

function contiene(columna: SQLWrapper, fragmento: string): SQL {
  return sql<boolean>`translate(lower(coalesce(${columna}, '')), 'áéíóúüñ', 'aeiouun') LIKE ${`%${fragmento}%`}`
}

function calleNormalizada(): SQL {
  return sql`replace(replace(replace(replace(replace(replace(replace(
    translate(lower(coalesce(${schema.clientes.direccion}, '')), 'áéíóúüñ', 'aeiouun'),
    'avda.', 'avenida '), 'avda', 'avenida '),
    'ctra.', 'carretera '), 'ctra', 'carretera '),
    'pza.', 'plaza '), 'pza', 'plaza '),
    'c/', 'calle ')`
}

function contieneTelefono(columna: SQLWrapper, digitos: string): SQL {
  return sql<boolean>`regexp_replace(coalesce(${columna}, ''), '[^0-9]', '', 'g') LIKE ${`%${digitos}%`}`
}

/** Un fragmento ya normalizado coincide con nombre, calle o teléfono. */
export function condicionTextoCliente(fragmento: string): SQL {
  const digitos = fragmento.replace(/\D/g, '')
  const partes: SQL[] = [
    contiene(schema.clientes.nombre, fragmento),
    contiene(schema.clientes.nombreComercial, fragmento),
    sql<boolean>`${calleNormalizada()} LIKE ${`%${fragmento}%`}`,
  ]
  if (digitos.length >= 3) {
    partes.push(contieneTelefono(schema.clientes.telefono, digitos))
    partes.push(contieneTelefono(schema.clientes.telefonoMovil, digitos))
  }
  return or(...partes)!
}

/** El teléfono escrito con espacios o guiones se compara por sus dígitos. */
export function condicionTelefonoCliente(consulta: string): SQL | undefined {
  const digitos = consulta.replace(/\D/g, '')
  if (digitos.length < 3) return undefined
  return or(
    contieneTelefono(schema.clientes.telefono, digitos),
    contieneTelefono(schema.clientes.telefonoMovil, digitos),
  )
}

/** Listado de clientes: conserva código, NIF y población, y añade calle y teléfono. */
export function filtroListadoClientes(consulta: string): SQL | undefined {
  const texto = consulta.trim().slice(0, 120)
  if (!texto) return undefined
  const patron = `%${texto.replace(/[%_]/g, '')}%`
  const fragmentos = fragmentosBusqueda(texto)
  const porFragmentos = fragmentos.length
    ? and(...fragmentos.map((fragmento) => or(
        condicionTextoCliente(fragmento),
        contiene(schema.clientes.poblacion, fragmento),
        contiene(schema.clientes.nif, fragmento),
        contiene(schema.clientes.codigo, fragmento),
      )))
    : undefined
  return or(
    ilike(schema.clientes.codigo, patron),
    ilike(schema.clientes.nif, patron),
    ilike(schema.clientes.nombre, patron),
    ilike(schema.clientes.nombreComercial, patron),
    ilike(schema.clientes.poblacion, patron),
    ilike(schema.clientes.direccion, patron),
    porFragmentos,
    condicionTelefonoCliente(texto),
  )
}
