import { multiplicarDecimal, normalizarAcabado, normalizarDecimal,
  resolverPvpCatalogo, type LineaValorada } from '@aluminior/core/precios'
import type { PartidaValoracionCerramiento } from '@aluminior/core/estructuras'
import type { FilaPvpArticulo } from './pvp-articulos.ts'

/** Conserva agrupación facturable y procedencia de precio, sin repartir entre cortes. */
export function partidasValoracion(
  lineas: readonly LineaValorada[],
  entrada: { tarifa: number; acabadoCodigo: string | null },
  grupoValoracion: PartidaValoracionCerramiento['grupoValoracion'],
  filas: readonly FilaPvpArticulo[],
): PartidaValoracionCerramiento[] {
  return lineas.map((linea, ordinal) => {
    const candidatas = filas.filter(f => f.articuloCodigo === linea.articuloCodigo)
    const precio = resolverPvpCatalogo(candidatas, entrada.acabadoCodigo)
    const exacto = entrada.acabadoCodigo !== null && candidatas.some(f =>
      normalizarAcabado(f.acabadoCodigo) === normalizarAcabado(entrada.acabadoCodigo!))
    const generico = !exacto || normalizarAcabado(entrada.acabadoCodigo ?? '') === 'UNI'
    // Sólo ruido de representación de hasta un ULP; no dígitos significativos.
    const canonica = linea.cantidadFacturable === null ? null : Number(linea.cantidadFacturable.toFixed(6))
    const representable = linea.cantidadFacturable === null || Math.abs(canonica! - linea.cantidadFacturable) <=
      Number.EPSILON * Math.max(Math.abs(linea.cantidadFacturable), Number.MIN_VALUE)
    const cantidad = linea.cantidadFacturable === null || !representable ? null
      : normalizarDecimal(linea.cantidadFacturable.toFixed(6), 6)
    const incidencia = representable ? linea.incidencia : 'Metraje no representable en snapshot v1 sin pérdida de precisión'
    const pvp = precio.estado === 'RESUELTO' ? precio.precio : null
    return {
      ordinal, grupoValoracion, articuloCodigo: linea.articuloCodigo,
      unidad: linea.tipoMetraje === '?' ? null : linea.tipoMetraje,
      cantidadFacturable: cantidad, precioUnitario: pvp,
      importeExacto: incidencia === null && cantidad !== null && pvp !== null
        ? multiplicarDecimal(cantidad, pvp, 10) : null,
      incidencia, tarifa: entrada.tarifa,
      criterioPrecio: precio.estado === 'RESUELTO' ? generico ? 'GENERICO' : 'EXACTO' : precio.estado,
      acabadoCodigo: precio.estado === 'RESUELTO' ? generico ? 'UNI' : entrada.acabadoCodigo : null,
    }
  })
}
