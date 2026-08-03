/**
 * Frontera entre el fallo técnico y lo que ve el operador.
 *
 * Sólo cubre lo INESPERADO. Las condiciones operativas de estas acciones no se
 * lanzan: se devuelven como `{ ok: false }` con su propio texto —entrada
 * inválida, presupuesto inexistente, artículo sin precio, migración satélite
 * ausente— y no pasan por aquí. Auditado el 3/8/2026 sobre `crearPresupuesto` y
 * `anyadirLinea`: lo único que puede llegar al `catch` es un fallo de
 * PostgreSQL o un error de programación. `presupuestos.numero` no tiene índice
 * único, así que tampoco hay colisión de numeración que traducir.
 *
 * Si alguna vez hay que lanzar algo que el operador deba leer, el patrón es un
 * error tipado propio que `registrarFallo` reconozca; no ampliar este mensaje
 * ni dejar pasar el texto del motor.
 *
 * Un mensaje de PostgreSQL —`numeric field overflow`, el nombre de una
 * restricción, un fragmento de SQL— no le dice nada a quien presupuesta y
 * filtra hacia fuera detalles del esquema.
 */
export const MENSAJE_FALLO_GUARDADO =
  'No se pudo guardar. El detalle queda en el registro del servidor.'

export function registrarFallo(contexto: string, error: unknown): string {
  console.error(`[presupuestos] ${contexto}`, error)
  return MENSAJE_FALLO_GUARDADO
}
