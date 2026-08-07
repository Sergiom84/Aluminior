/**
 * Punto de entrada del módulo de estructuras del presupuesto.
 *
 * Herraje (T.69.1), coste del despiece (T.69.2), coste del acristalamiento
 * (T.69.3), resolución genérico -> perfil real (T.69.4), junquillos y juntas
 * (T.69.5) y la valoración del vidrio (T.70.1).
 *
 * Del bloque del vidrio sale primero la valoración —metraje, PVP, coste y pieza
 * persistible— porque era la única responsabilidad DUPLICADA entre sus dos
 * rutas. Siguen dentro de `acciones.ts` la validación del artículo, la
 * clasificación de ranuras, la geometría simple y mixta, y las consultas de
 * galce y alojamiento. Se separan una por una, verificando entre cada paso: es
 * la ruta de dinero con más lógica del proyecto y un movimiento grande no sería
 * revisable.
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
// Sólo el orquestador: `piezasDeRanura` es el reparto interno y sus pruebas lo
// importan de su fichero, que es donde tiene sentido conocerlo.
export { piezasAcristalamiento, type CristalAcris } from './junquillos.ts'
// Sólo el orquestador: `prepararValoracionVidrio` es la parte pura y sus
// pruebas la importan de su fichero. Quien valore vidrio debe leer catálogo.
export { resolverValoracionVidrio } from './valoracion-vidrio.ts'
export { emparejarVidrio, type ContextoVidrio } from './emparejamiento-vidrio.ts'
// Sólo la lectura del delta: el aviso de "sin galce medido" y la llamada a
// `medidasVidrio` siguen en `acciones.ts`, que decide qué hacer sin fila.
export { leerGalceVidrio } from './galce-vidrio.ts'
// El CRISTAL lo necesita también la vía del acristalamiento, que sigue en
// `acciones.ts`. La lista de herraje no sale: hoy sólo la usa la clasificación.
export { COMPONENTE_CRISTAL } from './componentes-disenyo.ts'
