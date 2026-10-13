import { and, eq, inArray, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { seleccionarPrecioTabla, type FilaPrecioTabla, type PoliticasPrecioTabla, type ResultadoPrecioTabla } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'

interface ConfiguracionArticulo {
  precioEnTabla: boolean | null
  politicas: PoliticasPrecioTabla | null
  filas: (FilaPrecioTabla & { acabadoDependiente: boolean | null })[]
}
export type CatalogoPreciosTabla = ReadonlyMap<string, ConfiguracionArticulo>
export interface EntradaPrecioTablaArticulo {
  articuloCodigo: string; acabadoCodigo: string; tarifa: number
  anchoMm: number | null; largoMm: number | null
}
export type PrecioTablaArticulo = { precioEnTabla: false } |
  { precioEnTabla: true | null; resultado: ResultadoPrecioTabla }

/** Sin columnas o tabla, devuelve capacidad desconocida sin abortar la transacción. */
export async function leerCatalogoPreciosTabla(cliente: ClienteEscritura, codigos: readonly string[], tarifa: number): Promise<CatalogoPreciosTabla> {
  const catalogo = new Map<string, ConfiguracionArticulo>(codigos.map(c => [c, { precioEnTabla: null, politicas: null, filas: [] }]))
  if (!codigos.length) return catalogo
  const [capacidad] = await cliente.execute<{ configuracion: boolean; precios: boolean }>(sql`SELECT
    (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='articulos_despiece'
      AND column_name IN ('precio_en_tabla', 'politicas_precio_tabla'))=2 AS configuracion,
    to_regclass('public.articulos_precio_tabla_pvp') IS NOT NULL AS precios`)
  if (!capacidad?.configuracion) return catalogo
  const datos = await cliente.select({ articuloCodigo: schema.articulosDespiece.articuloCodigo,
    precioEnTabla: schema.articulosDespiece.precioEnTabla, politicas: schema.articulosDespiece.politicasPrecioTabla })
    .from(schema.articulosDespiece).where(inArray(schema.articulosDespiece.articuloCodigo, [...codigos]))
  for (const d of datos) catalogo.set(d.articuloCodigo, { precioEnTabla: d.precioEnTabla, politicas: d.politicas, filas: [] })
  if (!capacidad.precios) return catalogo
  const filas = await cliente.select().from(schema.articulosPrecioTablaPvp).where(and(
    inArray(schema.articulosPrecioTablaPvp.articuloCodigo, [...codigos]), eq(schema.articulosPrecioTablaPvp.tarifa, tarifa)))
  for (const f of filas) catalogo.get(f.articuloCodigo)?.filas.push({ articuloCodigo: f.articuloCodigo,
    acabadoCodigo: f.acabadoCodigo, tarifa: String(f.tarifa), anchoMm: Number(f.anchoMm), largoMm: Number(f.largoMm),
    precio: Number(f.precio), acabadoDependiente: f.acabadoDependiente })
  return catalogo
}

export function seleccionarDesdeCatalogo(catalogo: CatalogoPreciosTabla, entrada: EntradaPrecioTablaArticulo): ResultadoPrecioTabla {
  const datos = catalogo.get(entrada.articuloCodigo)
  const filas = (datos?.filas ?? []).filter(f => f.acabadoCodigo === entrada.acabadoCodigo && f.tarifa === String(entrada.tarifa))
  if (filas.some(f => f.acabadoDependiente !== false)) return {
    completo: false, precio: null, datos: null, fuente: 'ARTICULOS_PRECIO_TABLA_PVP',
    motivo: 'Restricciones de precio por medidas pendientes de verificar',
  }
  return seleccionarPrecioTabla({ ...entrada, tarifa: String(entrada.tarifa), politicas: datos?.precioEnTabla === true ? datos.politicas : null, filas })
}

/** Entrada pública compartida para artículo suelto y motor de estructuras. */
export async function leerPrecioTablaArticulo(cliente: ClienteEscritura, entrada: EntradaPrecioTablaArticulo): Promise<PrecioTablaArticulo> {
  const catalogo = await leerCatalogoPreciosTabla(cliente, [entrada.articuloCodigo], entrada.tarifa)
  const marca = catalogo.get(entrada.articuloCodigo)?.precioEnTabla ?? null
  return marca === false ? { precioEnTabla: false } : { precioEnTabla: marca, resultado: seleccionarDesdeCatalogo(catalogo, entrada) }
}
