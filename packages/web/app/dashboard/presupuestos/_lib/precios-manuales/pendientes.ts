/**
 * Piezas sin PVP de cada línea, leídas del resultado guardado, con la
 * descripción del artículo para que el operador sepa qué está valorando.
 */
import { inArray } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { pendientesDePrecio, type ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import { unidadesPosibles, type UnidadPrecioManual } from '@aluminior/core/precios'
import type { FilaValorable } from '@aluminior/core/precios'
import type { ClienteEscritura } from '../cliente-db.ts'

export interface PiezaPendientePrecio {
  articulo: string
  descripcion: string
  acabado: string
  /** Unidad del artículo en el catálogo: la única que admite guardar en la tarifa. */
  unidadCatalogo: string
  unidades: UnidadPrecioManual[]
  filas: FilaValorable[]
}

export interface LineaPendientePrecio {
  lineaId: string
  articuloLinea: string
  piezas: PiezaPendientePrecio[]
}

export async function leerPendientesPrecio(
  cliente: ClienteEscritura,
  lineas: readonly { id: string; articuloCodigo: string | null }[],
  resultados: ReadonlyMap<string, ResultadoCerramientoV1 | null>,
): Promise<LineaPendientePrecio[]> {
  const porLinea = lineas.flatMap((linea) => {
    const resultado = resultados.get(linea.id)
    const pendientes = resultado ? pendientesDePrecio(resultado) : []
    return pendientes.length ? [{ linea, pendientes }] : []
  })
  if (!porLinea.length) return []
  const codigos = [...new Set(porLinea.flatMap((l) => l.pendientes.map((p) => p.articulo)))]
  const articulos = await cliente.select({ codigo: schema.articulos.codigo, descripcion: schema.articulos.descripcion })
    .from(schema.articulos).where(inArray(schema.articulos.codigo, codigos))
  const descripcion = new Map(articulos.map((a) => [a.codigo, a.descripcion]))
  return porLinea.map(({ linea, pendientes }) => ({
    lineaId: linea.id,
    articuloLinea: linea.articuloCodigo ?? '',
    piezas: pendientes.map((p) => ({
      articulo: p.articulo, descripcion: descripcion.get(p.articulo) ?? p.articulo, acabado: p.acabado,
      unidadCatalogo: p.tipoMetraje, unidades: unidadesPosibles(p.filas), filas: p.filas,
    })),
  }))
}
