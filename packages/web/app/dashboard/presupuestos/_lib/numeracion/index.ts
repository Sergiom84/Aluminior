/**
 * Punto de entrada de la numeración de presupuestos (T.71.2, T.71.4).
 *
 * `reservarNumeracion` + `ejecutarConNumeracion` son la única frontera que
 * `crearPresupuesto` y `copiarPresupuesto` deben usar para números y
 * revisiones. Sólo aceptan `Tx` (una transacción abierta): el advisory lock
 * de `pg_advisory_xact_lock` es de transacción, y una conexión suelta lo
 * soltaría antes de que sirviera de nada — `tipos.ts` lo fuerza en
 * compilación.
 *
 * Lo que NO sale de aquí a propósito: `reservarNumeracionParaPruebas` (el
 * gancho de pausa para forzar concurrencia en pruebas) y `validarFechaDocumento`
 * (uso interno). Ningún consumidor de producción debe poder alargar un
 * advisory lock ni saltarse la validación de fecha.
 */
export {
  reservarNumeracion,
  MENSAJE_DESTINO_OCUPADO,
  type EntradaNumeracion, type ResultadoNumeracion,
} from './reservar.ts'
export { esColisionIdentidad, ejecutarConNumeracion } from './colision.ts'
