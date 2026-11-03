/** Acredita el catálogo de precios y deja huellas para detectar deriva local. */
import { readFileSync } from 'node:fs'
import type { Sql } from 'postgres'
import { TABLAS_MOTOR } from '@aluminior/etl/banco-contraste'
import { texto, numero, type Tablas } from './datos.ts'
const TABLAS = [...TABLAS_MOTOR, 'estructuras', 'estructura_diseno_nodos', 'estructura_cotas',
  'estructura_componentes', 'articulos', 'articulos_coste', 'articulos_pvp', 'conjuntos',
  'conjunto_resoluciones', 'conjunto_delegaciones', 'opciones_herraje', 'tacris_filas']
/** 2: `firmas` excluye `id` y `creado_en`. 1: hasheaba la fila completa. */
export const FIRMA_VERSION = 2

export async function verificarBase(sql: Sql, t: Tablas) {
  const pvp = await sql`SELECT articulo_codigo, acabado_codigo, tarifa, precio FROM articulos_pvp`
  const firma = (articulo: string, acabado: string, tarifa: number, precio: number) => JSON.stringify([articulo, acabado, tarifa, precio.toFixed(4)])
  const esperado = t.ArticulosPVP!.map(p => firma(texto(p.Articulo), texto(p.Acabado), numero(p.Tarifa)!, numero(p.PVP)!)).sort()
  const actual = pvp.map(p => firma(String(p.articulo_codigo), String(p.acabado_codigo), Number(p.tarifa), Number(p.precio))).sort()
  if (JSON.stringify(esperado) !== JSON.stringify(actual)) throw new Error('Los PVP locales no corresponden a la copia del banco')
  const migraciones = (await sql`SELECT count(*)::int AS n FROM drizzle.__drizzle_migrations`)[0]!.n
  const esperadas = JSON.parse(readFileSync('packages/db/migrations/meta/_journal.json', 'utf8')).entries.length
  if (migraciones !== esperadas) throw new Error(`Se esperan las ${esperadas} migraciones del journal`)
  // Fuera las columnas sin contenido de negocio: `id` es un uuid aleatorio por
  // carga y `creado_en` la marca de tiempo de la carga. Incluirlas hacía que
  // cualquier reconstrucción de la base efímera cambiara la firma con datos
  // idénticos, y el falso positivo se sorteaba borrando base-verificada.json.
  const firmas: Record<string, string> = {}
  for (const tabla of TABLAS) firmas[tabla] = String((await sql`SELECT md5(coalesce(string_agg(firma, '' ORDER BY firma), '')) AS firma
    FROM (SELECT md5((to_jsonb(fila) - 'id' - 'creado_en')::text) AS firma FROM ${sql(tabla)} fila) contenido`)[0]!.firma)
  // Súbela al cambiar la fórmula de `firmas`: así una recalibración da un
  // mensaje exacto en vez de parecer deriva del catálogo.
  return { firmaVersion: FIRMA_VERSION, migraciones, pvpVerificados: pvp.length, firmas }
}
