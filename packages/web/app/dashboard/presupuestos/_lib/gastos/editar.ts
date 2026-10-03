import type { Db } from '@aluminior/db'
import { conPresupuestoBloqueado } from '../lineas/con-presupuesto-bloqueado.ts'
import { esquemaGastos } from './esquema.ts'
import { comisionSumada, escribirGastos, gastosDisponibles, GASTOS_SIN_COMISION, hayLineasConComision,
  leerGastos, mismaComision } from './gastos-documento.ts'

export const MENSAJE_COMISION_CON_LINEAS =
  'La comisión sumada no se puede cambiar con líneas de estructura o cerramiento valoradas'

/**
 * Cambiar la comisión sumada no revalora las líneas guardadas: se rechaza si
 * alguna ya la lleva. EMP0016 no tiene ningún documento con líneas a factores
 * distintos; si Productor recalcula al cambiarla está por observar.
 */
export async function actualizarGastos(db: Pick<Db, 'transaction'>, entrada: unknown) {
  const p = esquemaGastos.safeParse(entrada)
  if (!p.success) return { ok: false as const, errores: p.error.flatten().fieldErrors,
    mensaje: 'Revisa los gastos' }
  const { presupuestoId, ...gastos } = p.data
  return conPresupuestoBloqueado(db, presupuestoId, async (tx, cabecera) => {
    if (cabecera.estado !== 'PENDIENTE') return { ok: false as const, errores: {},
      mensaje: 'Sólo se puede editar un presupuesto pendiente' }
    if (!await gastosDisponibles(tx)) {
      const sinCambios = !gastos.sumarComision && gastos.comisionPorc === GASTOS_SIN_COMISION.comisionPorc
      if (!sinCambios) return { ok: false as const, errores: {},
        mensaje: 'Falta aplicar la migración de gastos en este entorno' }
      return { ok: true as const, mensaje: 'Gastos actualizados' }
    }
    const actual = await leerGastos(tx, presupuestoId)
    if (!mismaComision(comisionSumada(actual), comisionSumada(gastos)) && await hayLineasConComision(tx, presupuestoId))
      return { ok: false as const, errores: { comisionPorc: [MENSAJE_COMISION_CON_LINEAS] },
        mensaje: 'Revisa los gastos' }
    await escribirGastos(tx, presupuestoId, gastos)
    return { ok: true as const, mensaje: 'Gastos actualizados' }
  })
}
