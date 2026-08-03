/**
 * Punto de entrada del módulo de estructuras del presupuesto.
 *
 * De momento sólo el herraje (T.69.1). La resolución de perfiles, el coste del
 * despiece, el vidrio y los junquillos siguen dentro de `acciones.ts` y se
 * extraerán de uno en uno, verificando entre cada paso: es la ruta de dinero con
 * más lógica del proyecto y un movimiento grande no sería revisable.
 */
export {
  opcionesHerrajeDe, resolverOpcionesHerraje,
  type EntradaOpcionesElegidas, type GrupoOpcionesHerraje,
} from './herraje.ts'
