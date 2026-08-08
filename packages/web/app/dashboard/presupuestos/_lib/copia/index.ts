/**
 * Punto de entrada del módulo de copia de presupuesto.
 *
 * Una server action sólo debería necesitar: normalizar el mapa que llega del
 * formulario, componer las opciones y llamar a `copiarPresupuesto`. El plan,
 * la numeración y la escritura quedan dentro.
 */
export {
  normalizarMapa, sustituirCodigo, mapaVacio,
  AMBITOS_SUSTITUCION, LIMITES_PRODUCTOR, MAPA_VACIO,
  type AmbitoSustitucion, type LimitesSustitucion, type MapaSustitucion,
  type ParEntrada, type ParSustitucion, type DescartePar,
  type ResultadoMapa, type Sustitucion,
} from './mapa-sustitucion.ts'
export {
  lineaSeleccionada, seleccionDeLineas, seleccionSobrante, TODAS_LAS_LINEAS,
  type SeleccionLineas,
} from './seleccion-lineas.ts'
export {
  proponerDestino, validarDestino,
  type EstrategiaDestino, type NumeracionDocumento, type ResultadoDestino,
} from './destino-documento.ts'
export {
  planificarCopia, DETALLES_ESTRUCTURAS, OPCIONES_COPIA_IDENTICA,
  AVISO_DIBUJO_DERIVADO, ERROR_GENERAR_NUEVO,
  MOTIVO_DESCRIPCION_MANUAL, MOTIVO_DETALLE_DESFASADO, MOTIVO_PRECIO_INVALIDADO,
  type CambioLinea, type CodigosLinea, type DetalleEstructuras,
  type LineaOrigen, type OpcionesCopia, type PlanCopia, type TipoLinea,
} from './plan-copia.ts'
export { copiarPresupuesto, type EntradaCopia, type ResultadoCopia } from './copiar-presupuesto.ts'
export { copiarComoRevision, type ResultadoCopiarRevision } from './copiar-revision-identica.ts'
