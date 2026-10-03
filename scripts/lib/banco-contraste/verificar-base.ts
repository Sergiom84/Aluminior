/** Acredita el catálogo de precios y deja huellas para detectar deriva local. */
import type { Sql } from 'postgres'
import { TABLAS_MOTOR } from '@aluminior/etl/banco-contraste'
import { texto, numero, type Tablas } from './datos.ts'
const TABLAS = [...TABLAS_MOTOR, 'estructuras', 'estructura_diseno_nodos', 'estructura_cotas',
  'estructura_componentes', 'articulos', 'articulos_coste', 'articulos_pvp', 'conjuntos',
  'conjunto_resoluciones', 'conjunto_delegaciones', 'opciones_herraje', 'tacris_filas']
export async function verificarBase(sql: Sql, t: Tablas) {
  const pvp = await sql`SELECT articulo_codigo, acabado_codigo, tarifa, precio FROM articulos_pvp`
  const firma = (articulo: string, acabado: string, tarifa: number, precio: number) => JSON.stringify([articulo, acabado, tarifa, precio.toFixed(4)])
  const esperado = t.ArticulosPVP!.map(p => firma(texto(p.Articulo), texto(p.Acabado), numero(p.Tarifa)!, numero(p.PVP)!)).sort()
  const actual = pvp.map(p => firma(String(p.articulo_codigo), String(p.acabado_codigo), Number(p.tarifa), Number(p.precio))).sort()
  if (JSON.stringify(esperado) !== JSON.stringify(actual)) throw new Error('Los PVP locales no corresponden a la copia del banco')
  const migraciones = (await sql`SELECT count(*)::int AS n FROM drizzle.__drizzle_migrations`)[0]!.n
  if (migraciones !== 27) throw new Error('Se esperan las 27 migraciones del motor medido')
  const firmas: Record<string, string> = {}
  for (const tabla of TABLAS) firmas[tabla] = String((await sql`SELECT md5(coalesce(string_agg(firma, '' ORDER BY firma), '')) AS firma
    FROM (SELECT md5(to_jsonb(fila)::text) AS firma FROM ${sql(tabla)} fila) contenido`)[0]!.firma)
  return { migraciones, pvpVerificados: pvp.length, firmas }
}
