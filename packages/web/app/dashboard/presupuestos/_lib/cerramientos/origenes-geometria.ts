/**
 * Orden y materiales efectivos de los orígenes de un cerramiento: primero los
 * módulos y después las uniones, cada uno con la serie que le corresponde.
 *
 * La unión no hereda el vidrio general porque no lleva vidrio propio; su serie
 * sí puede ser distinta de la del primer módulo, como en los GRUPO históricos
 * que unen dos series (docs/paridad/EVIDENCIA-E2-UNION-SERIE-2026-10-19.md).
 */
import { materialesEfectivos, serieEfectivaUnion, type ConfiguracionCerramiento, type MaterialEfectivo,
  type MaterialesGenerales } from '@aluminior/core/estructuras'

export interface OrigenGeometria {
  tipo: 'MODULO' | 'UNION'
  id: string
  codigo: string
  anchoMm: number
  altoMm: number
  materiales: { serieCodigo: MaterialEfectivo; vidrioCodigo: MaterialEfectivo }
}

export function origenesGeometriaCerramiento(
  configuracion: ConfiguracionCerramiento,
  generales: MaterialesGenerales,
): OrigenGeometria[] {
  return [
    ...configuracion.modulos.map((modulo): OrigenGeometria => ({
      tipo: 'MODULO', id: modulo.id, codigo: modulo.estructuraCodigo,
      anchoMm: modulo.anchoMm, altoMm: modulo.altoMm,
      materiales: materialesEfectivos(modulo, generales),
    })),
    ...configuracion.uniones.map((union): OrigenGeometria => {
      const propia = union.materiales?.serieCodigo?.trim()
      const valor = serieEfectivaUnion(configuracion, union, generales)
      return {
        tipo: 'UNION', id: union.id, codigo: union.codigo,
        anchoMm: union.grosorMm, altoMm: union.longitudMm,
        materiales: {
          serieCodigo: { valor, origen: propia ? 'elemento' : 'general' },
          vidrioCodigo: { valor: null, origen: 'elemento' },
        },
      }
    }),
  ]
}
