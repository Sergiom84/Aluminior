/**
 * Caso de uso: eliminar un presupuesto completo.
 *
 * Regla (decisión de la unidad B, 16/11/2026): sólo se elimina un presupuesto
 * en estado PENDIENTE. Es el único estado editable en toda la aplicación
 * (cabecera, líneas, gastos y precios rechazan ACEPTADO, RECHAZADO y ANULADO),
 * así que un documento que ya salió del borrador queda como histórico: si se
 * aceptó, es la base de lo que se fabrica; si se rechazó o anuló, es la
 * traza comercial de esa decisión.
 *
 * No hay otro bloqueo que comprobar: ninguna tabla fuera del propio documento
 * referencia `presupuestos` (los pedidos de compra no lo enlazan y no existe
 * producción). Las tablas hijas caen en cascada desde la base: `lineas` y
 * `presupuestos_gastos`, y desde `lineas` todas sus tablas satélite.
 * `operaciones_presupuesto` no tiene clave ajena a propósito: el recibo de un
 * alta confirmada sobrevive al borrado para que repetir la misma petición no
 * vuelva a crear el documento.
 *
 * El estado se lee con la fila bloqueada (FOR UPDATE) dentro de la misma
 * transacción que borra: nadie puede aceptarlo entre leerlo y borrarlo.
 */

export interface PresupuestoBloqueado {
  readonly numero: number
  readonly revision: number
  readonly serie: string
  readonly estado: string
}

/** Lo que el caso de uso necesita de la persistencia, ya dentro de una transacción. */
export interface RepositorioBorrado {
  bloquear(presupuestoId: string): Promise<PresupuestoBloqueado | null>
  borrar(presupuestoId: string): Promise<boolean>
}

export interface DependenciasBorrado {
  usuarioActual(): Promise<string | null>
  enTransaccion<T>(trabajo: (repositorio: RepositorioBorrado) => Promise<T>): Promise<T>
}

export type MotivoRechazoBorrado = 'ID_INVALIDO' | 'SIN_SESION' | 'NO_ENCONTRADO' | 'ESTADO_NO_BORRABLE'

export type ResultadoBorradoPresupuesto =
  | { readonly ok: true; readonly numero: number; readonly revision: number; readonly serie: string }
  | { readonly ok: false; readonly motivo: MotivoRechazoBorrado; readonly mensaje: string }

export const ESTADO_BORRABLE = 'PENDIENTE'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const rechazo = (motivo: MotivoRechazoBorrado, mensaje: string): ResultadoBorradoPresupuesto =>
  ({ ok: false, motivo, mensaje })

export async function borrarPresupuesto(
  dependencias: DependenciasBorrado,
  presupuestoId: string,
): Promise<ResultadoBorradoPresupuesto> {
  if (typeof presupuestoId !== 'string' || !UUID.test(presupuestoId)) {
    return rechazo('ID_INVALIDO', 'Presupuesto no válido')
  }
  if (!await dependencias.usuarioActual()) return rechazo('SIN_SESION', 'Sesión no válida')

  return dependencias.enTransaccion(async (repositorio) => {
    const presupuesto = await repositorio.bloquear(presupuestoId)
    if (!presupuesto) return rechazo('NO_ENCONTRADO', 'El presupuesto no existe o ya se ha eliminado')
    if (presupuesto.estado !== ESTADO_BORRABLE) {
      return rechazo('ESTADO_NO_BORRABLE',
        `Sólo se puede eliminar un presupuesto pendiente; este está ${presupuesto.estado}`)
    }
    if (!await repositorio.borrar(presupuestoId)) {
      return rechazo('NO_ENCONTRADO', 'El presupuesto no existe o ya se ha eliminado')
    }
    const { numero, revision, serie } = presupuesto
    return { ok: true, numero, revision, serie }
  })
}
