import type { Sql } from 'postgres'
import { fecha, num, txt } from '../csv.ts'
import type { Cargar } from './cargar.ts'
import { descartar, excluir, type Resultado } from './resultado.ts'

export async function cargarCostes(sql: Sql, cargar: Cargar): Promise<Resultado[]> {
  const resultados: Resultado[] = []
  /**
   * Costes por artículo, proveedor y acabado.
   * La tabla original referencia también artículos de series no migradas de
   * InfoSeries: los que no están en nuestro catálogo se excluyen a propósito
   * (no pueden aparecer en un despiece de esta empresa).
   */
  {
    const codigosArticulo = new Set<string>(
      (await sql<{ codigo: string }[]>`SELECT codigo FROM articulos`).map((x) => x.codigo),
    )
    resultados.push(await cargar('ArticulosCoste', 'articulos_coste', (f, r) => {
      const articulo = txt(f.Articulo)
      if (!articulo) { descartar(r, 'sin artículo'); return null }
      if (!codigosArticulo.has(articulo)) { excluir(r, 'artículo fuera del catálogo de la empresa'); return null }
      const coste = num(f.Coste)
      if (coste === null) { descartar(r, 'sin coste'); return null }
      return {
        articulo_codigo: articulo,
        proveedor_codigo: txt(f.Proveedor) ?? '',
        acabado_codigo: txt(f.Acabado) ?? '',
        coste,
        actualizado_en: fecha(f.UltimaAct),
      }
    }))
  }
  return resultados
}
