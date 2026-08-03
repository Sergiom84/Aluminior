/**
 * Punto de entrada del módulo de cerramientos del presupuesto.
 *
 * La server action de alta de línea sólo debe conocer esto: preparar el
 * cerramiento, comprobar que el entorno puede guardarlo y guardarlo. La
 * validación, la descripción y la escritura del satélite quedan dentro.
 */
export {
  prepararAltaCerramiento, guardarAltaCerramiento,
  AVISO_VALORACION_PENDIENTE, MENSAJE_MIGRACION_PENDIENTE,
  type AltaCerramiento, type DatosAltaCerramiento, type ResultadoAltaCerramiento,
} from './alta-cerramiento.ts'
export { comprobarPersistenciaCerramientos } from './persistir-cerramiento.ts'
