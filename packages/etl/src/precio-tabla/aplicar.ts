import type { Sql } from 'postgres'
import { leerPreciosTabla } from './leer.ts'
import { TABLAS_PROTEGIDAS } from '../motor-catalogo/aplicar.ts'
import { jsonbSerializado } from '../importacion/jsonb.ts'

const PROTEGIDAS = [...TABLAS_PROTEGIDAS, 'articulos_coste', 'tarifas']
const firmas = async (tx: Sql) => Object.fromEntries(await Promise.all(PROTEGIDAS.map(async tabla => [tabla,
  (await tx`SELECT count(*)::int AS filas, md5(coalesce(string_agg(firma, '' ORDER BY firma), '')) AS firma
    FROM (SELECT md5(to_jsonb(fila)::text) AS firma FROM ${tx(tabla)} fila) contenido`)[0]!])))
class Simulacion extends Error {}
export interface InformePrecioTabla {
  aplicado: boolean; articulosFuente: number; articulosActualizados: number; precios: number
  protegidas: Record<string, unknown>
}

/** Carga dirigida atómica, sin documentos, clientes, tarifas planas ni márgenes. */
export async function cargarPreciosTabla(sql: Sql, origen: string, aplicar = false): Promise<InformePrecioTabla> {
  const catalogo = await leerPreciosTabla(origen)
  let informe: InformePrecioTabla | null = null
  try {
    await sql.begin('isolation level repeatable read', async t => {
      const tx = t as unknown as Sql
      await tx`SET LOCAL search_path TO public`
      const [capacidad] = await tx`SELECT to_regclass('public.articulos_precio_tabla_pvp') IS NOT NULL
        AND (SELECT count(*) FROM information_schema.columns WHERE table_schema='public'
          AND table_name='articulos_despiece' AND column_name IN ('precio_en_tabla','politicas_precio_tabla'))=2 AS ok`
      if (!capacidad!.ok) throw new Error('Falta migración 0031 de precio en tabla; no se escribe')
      const protegidas = await firmas(tx)
      const faltantes = await tx`SELECT p.articulo_codigo FROM jsonb_to_recordset(${jsonbSerializado(tx, JSON.stringify(catalogo.precios))})
        AS p(articulo_codigo text) LEFT JOIN articulos_despiece a USING (articulo_codigo) WHERE a.articulo_codigo IS NULL`
      if (faltantes.length) throw new Error('Faltan artículos de despiece para el PVP por dimensiones; carga cancelada')
      const actualizadas = await tx`UPDATE articulos_despiece a SET precio_en_tabla=d.precio_en_tabla,
        politicas_precio_tabla=d.politicas_precio_tabla
        FROM jsonb_to_recordset(${jsonbSerializado(tx, JSON.stringify(catalogo.articulos))})
          AS d(articulo_codigo text, precio_en_tabla boolean, politicas_precio_tabla jsonb)
        WHERE a.articulo_codigo=d.articulo_codigo`
      if (!actualizadas.count) throw new Error('No coincide ningún artículo de despiece; carga cancelada')
      await tx`DELETE FROM articulos_precio_tabla_pvp`
      await tx`INSERT INTO articulos_precio_tabla_pvp ${tx(catalogo.precios)}`
      const despues = await firmas(tx)
      if (JSON.stringify(protegidas) !== JSON.stringify(despues)) throw new Error('Contenido protegido modificado; carga revertida')
      informe = { aplicado: aplicar, articulosFuente: catalogo.articulos.length,
        articulosActualizados: actualizadas.count, precios: catalogo.precios.length, protegidas }
      if (!aplicar) throw new Simulacion()
    })
  } catch (error) { if (!(error instanceof Simulacion)) throw error }
  return informe!
}
