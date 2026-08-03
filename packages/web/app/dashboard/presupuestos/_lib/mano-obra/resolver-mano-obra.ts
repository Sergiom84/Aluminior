/**
 * De horas tecleadas a filas listas para escribir. Función PURA.
 *
 * Aquí se junta todo lo que decide la valoración de mano de obra: el artículo
 * de cada concepto, la conversión a minutos, el desempate del coste y la
 * valoración en decimal exacto. No hay E/S: el catálogo llega ya leído, para
 * que cada caso —precio ausente, cero, negativo, desbordado; coste ausente,
 * ambiguo, negativo, desbordado— se pueda probar sin base de datos.
 *
 * El texto decimal entra y sale sin pasar por `number` en ningún punto, que es
 * la garantía de `SPEC-MANO-DE-OBRA.md` §3.1.1.
 */

import type { schema } from '@aluminior/db'
import {
  articuloDeConcepto, minutosDeHoras, normalizarDecimal, resolverCosteCatalogo,
  valorarManoObra,
  type ConceptoManoObra, type Decimal, type ManoObraEnGuarda,
} from '@aluminior/core/precios'

/** Escala de `lineas_mano_obra.horas`: `numeric(6,2)`. */
export const ESCALA_HORAS = 2
import { ACABADO_MANO_OBRA, type ConceptoConHoras } from './conceptos.ts'
import { UNIDAD_MANO_OBRA, type CatalogoManoObra } from './catalogo.ts'

/** Una fila de `lineas_mano_obra` sin la línea, que aún no existe. */
export type SnapshotManoObra =
  Omit<typeof schema.lineasManoObra.$inferInsert, 'lineaId'>

export interface ResolucionManoObra {
  /** Lo que se escribirá. Cero, una o dos filas. */
  filas: SnapshotManoObra[]
  /** Lo que la guarda «todo o sin valorar» necesita saber. */
  guarda: ManoObraEnGuarda[]
}

export interface EntradaResolucion {
  conceptos: readonly ConceptoConHoras[]
  catalogo: CatalogoManoObra
  tarifa: number
}

export function resolverManoObra(entrada: EntradaResolucion): ResolucionManoObra {
  const filas: SnapshotManoObra[] = []
  const guarda: ManoObraEnGuarda[] = []

  for (const { concepto, horas } of entrada.conceptos) {
    const fila = resolverConcepto(concepto, horas, entrada.catalogo, entrada.tarifa)
    filas.push(fila)
    guarda.push({
      concepto,
      motivoCodigo: fila.motivoCodigo as ManoObraEnGuarda['motivoCodigo'],
      motivoCosteCodigo: fila.motivoCosteCodigo as ManoObraEnGuarda['motivoCosteCodigo'],
    })
  }
  return { filas, guarda }
}

function resolverConcepto(
  concepto: ConceptoManoObra,
  horasBrutas: Decimal,
  catalogo: CatalogoManoObra,
  tarifa: number,
): SnapshotManoObra {
  const articuloCodigo = articuloDeConcepto(concepto)
  const articulo = catalogo.get(articuloCodigo)

  // Las horas se llevan a la escala de SU columna ANTES de convertir. El
  // esquema exige `minutos = ROUND(horas * 60, 2)`, y PostgreSQL redondearía
  // `horas` al guardarla: convertir el valor sin redondear daría unos minutos
  // que ya no se corresponden con las horas escritas, y la fila no entraría.
  // El formulario ya valida dos decimales; esto hace que el invariante no
  // dependa de que el único llamador se acuerde.
  const horas = normalizarDecimal(horasBrutas, ESCALA_HORAS)
  const minutos = minutosDeHoras(horas)

  const coste = resolverCosteCatalogo(articulo?.costes ?? [], ACABADO_MANO_OBRA)
  const valoracion = valorarManoObra({
    minutos,
    // Sin artículo en el catálogo no hay precio: se trata como `SIN_PVP`, que
    // es exactamente lo que ocurre. El snapshot conserva el código aplicado
    // para poder investigar por qué ese artículo no existe.
    precioMinuto: articulo?.precio ?? null,
    costeMinuto: coste.estado === 'RESUELTO' ? coste.coste : null,
    costeAmbiguo: coste.estado === 'AMBIGUO',
  })

  return {
    concepto,
    origen: 'MANUAL',
    horas,
    minutos,
    articuloCodigo,
    // Congelada: el catálogo puede cambiar o perder el artículo. Si hoy ya no
    // está, se guarda el código para no inventar una descripción.
    articuloDescripcion: articulo?.descripcion ?? articuloCodigo,
    unidad: UNIDAD_MANO_OBRA,
    acabadoCodigo: ACABADO_MANO_OBRA,
    tarifa,
    precioMinuto: valoracion.precioMinuto,
    importe: valoracion.importe,
    costeMinuto: valoracion.costeMinuto,
    costeTotal: valoracion.costeTotal,
    valoracionCompleta: valoracion.valoracionCompleta,
    motivoCodigo: valoracion.motivoCodigo,
    motivoCosteCodigo: valoracion.motivoCosteCodigo,
  }
}
