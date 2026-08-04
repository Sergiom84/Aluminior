/**
 * Punto de entrada del módulo de estructuras del presupuesto.
 *
 * Herraje (T.69.1), coste del despiece (T.69.2) y coste del acristalamiento
 * (T.69.3). La resolución de perfiles y el cálculo geométrico del vidrio y los
 * junquillos siguen dentro de `acciones.ts` y se extraerán de uno en uno,
 * verificando entre cada paso: es la ruta de dinero con más lógica del proyecto
 * y un movimiento grande no sería revisable.
 *
 * Sale sólo lo que consume `acciones.ts`. Del coste del despiece, únicamente el
 * orquestador: la lectura, la agrupación y la preparación de piezas quedan
 * privadas, porque exponerlas invitaría a que alguien armara la secuencia por su
 * cuenta y se saltara un paso. Las pruebas del módulo las importan directamente
 * de su fichero, que es donde tiene sentido conocerlas.
 */
export { resolverCosteDespiece } from './coste-despiece.ts'
export { resolverCosteAcristalamiento } from './coste-acristalamiento.ts'
export {
  opcionesHerrajeDe, resolverOpcionesHerraje, type GrupoOpcionesHerraje,
} from './herraje.ts'
