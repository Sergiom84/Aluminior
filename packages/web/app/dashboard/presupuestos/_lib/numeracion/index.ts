/**
 * Punto de entrada de la numeración de presupuestos (T.71.2).
 *
 * `reservarNumeracion` + `ejecutarConNumeracion` son la única frontera que
 * `crearPresupuesto` y `copiarPresupuesto` deben usar para números y
 * revisiones. Las primitivas de lock/lectura salen también, documentadas
 * como piezas para pruebas de concurrencia: componen la misma reserva con
 * una pausa determinista entre el lock y la lectura, sin tocar el servicio.
 */
export {
  reservarNumeracion, ejercicioDeFecha,
  lockNumeroNuevo, lockRevision,
  maximoNumeroDelEjercicio, maximoRevision, existeNumeracion,
  MENSAJE_DESTINO_OCUPADO,
  type EntradaNumeracion, type ResultadoNumeracion,
} from './reservar.ts'
export { esColisionIdentidad, ejecutarConNumeracion } from './colision.ts'
