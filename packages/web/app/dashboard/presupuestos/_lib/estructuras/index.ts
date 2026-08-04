/**
 * Punto de entrada del módulo de estructuras del presupuesto.
 *
 * Herraje (T.69.1), coste del despiece (T.69.2), coste del acristalamiento
 * (T.69.3) y resolución genérico -> perfil real (T.69.4). El cálculo geométrico
 * del vidrio y los junquillos sigue dentro de `acciones.ts` y se extraerá
 * después, verificando entre cada paso: es la ruta de dinero con más lógica del
 * proyecto y un movimiento grande no sería revisable.
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
export { resolverPerfiles } from './resolucion-perfiles.ts'
// El CRISTAL lo necesita también la vía del acristalamiento, que sigue en
// `acciones.ts`. La lista de herraje no sale: hoy sólo la usa la clasificación.
export { COMPONENTE_CRISTAL } from './componentes-disenyo.ts'
