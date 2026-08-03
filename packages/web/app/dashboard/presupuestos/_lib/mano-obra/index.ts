/**
 * Punto de entrada del módulo de mano de obra del presupuesto.
 *
 * La server action sólo necesita `prepararManoObra`: le da las horas tecleadas
 * y la tarifa, y recibe las filas a escribir con el veredicto de la guarda. Los
 * conceptos, el catálogo, la conversión a minutos, el desempate del coste y la
 * valoración quedan dentro; la escritura la hace `guardar-linea.ts` dentro de
 * su transacción.
 */
export {
  prepararManoObra,
  type EntradaPreparacion, type PreparacionManoObra,
} from './preparar-mano-obra.ts'
export {
  ACABADO_MANO_OBRA, conceptosConHoras,
  type ConceptoConHoras, type HorasTecleadas,
} from './conceptos.ts'
export {
  UNIDAD_MANO_OBRA, leerCatalogoManoObra,
  type ArticuloManoObra, type CatalogoManoObra,
} from './catalogo.ts'
export {
  resolverManoObra,
  type EntradaResolucion, type ResolucionManoObra, type SnapshotManoObra,
} from './resolver-mano-obra.ts'
export {
  comprobarPersistenciaManoObra, persistirManoObra, MENSAJE_MIGRACION_MANO_OBRA,
} from './persistir-mano-obra.ts'
