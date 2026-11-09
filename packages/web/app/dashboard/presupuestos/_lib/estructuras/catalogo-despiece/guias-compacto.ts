/**
 * Guías de persiana: conjuntos de la familia 051 (GMG001-GMG014,
 * PSG001-PSG011) y su perfil, el componente `GP` (`ConjuntosLin` de EMP0016).
 */
import { and, asc, eq, inArray, or, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../../cliente-db.ts'

const FAMILIA_GUIAS = '051'
const COMPONENTE_PERFIL = 'GP'

export interface GuiaCatalogo {
  codigo: string
  descripcion: string
  /** El perfil no tiene PVP en la tarifa del documento: la línea quedará sin valorar. */
  sinPrecio: boolean
}

/** Opciones del selector: el conjunto con la descripción de su perfil y si tiene precio en la tarifa. */
export async function listarGuiasCompacto(cliente: ClienteEscritura, tarifa: number): Promise<GuiaCatalogo[]> {
  const r = schema.conjuntoResoluciones, a = schema.articulos, p = schema.articulosPvp
  const conPrecio = sql<boolean>`exists (select 1 from ${p} where ${p.articuloCodigo} = ${r.articuloCodigo} and ${p.tarifa} = ${tarifa})`
  const filas = await cliente.select({ codigo: r.conjuntoCodigo, articulo: r.articuloCodigo, descripcion: a.descripcion, conPrecio })
    .from(r).leftJoin(a, eq(a.codigo, r.articuloCodigo))
    .where(and(eq(r.familia, FAMILIA_GUIAS), eq(r.componente, COMPONENTE_PERFIL)))
    .orderBy(asc(r.conjuntoCodigo))
  return filas.filter((f) => f.articulo && f.articulo !== '0')
    .map((f) => ({ codigo: f.codigo, descripcion: f.descripcion ?? f.articulo, sinPrecio: !f.conPrecio }))
}

/**
 * Perfil de cada guía pedida. Una línea guardada antes de 10/11/2026 puede
 * llevar el código del perfil (`PSG100`) en vez del conjunto: también resuelve.
 */
export async function leerPerfilesGuia(
  cliente: ClienteEscritura, codigos: readonly string[],
): Promise<ReadonlyMap<string, string>> {
  const pedidos = [...new Set(codigos.map((c) => c.trim().toUpperCase()).filter(Boolean))]
  if (!pedidos.length) return new Map()
  const r = schema.conjuntoResoluciones
  const filas = await cliente.select({ conjunto: r.conjuntoCodigo, articulo: r.articuloCodigo }).from(r)
    .where(and(eq(r.familia, FAMILIA_GUIAS), eq(r.componente, COMPONENTE_PERFIL),
      or(inArray(r.conjuntoCodigo, pedidos), inArray(r.articuloCodigo, pedidos))))
  const perfiles = new Map<string, string>()
  for (const f of filas) {
    if (!f.articulo || f.articulo === '0') continue
    perfiles.set(f.conjunto.toUpperCase(), f.articulo)
    perfiles.set(f.articulo.toUpperCase(), f.articulo)
  }
  return perfiles
}
