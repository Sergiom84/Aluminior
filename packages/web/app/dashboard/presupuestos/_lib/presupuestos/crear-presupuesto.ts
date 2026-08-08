/**
 * Alta de presupuesto (T.71.4): caso de uso inyectable y probable en
 * aislamiento, separado de `acciones.ts`.
 *
 * Recibe `Db`, fecha explícita y datos ya validados; no parsea `FormData`, no
 * autoriza usuarios y no revalida rutas —eso sigue en la server action, que
 * sólo parsea, valida, resuelve el usuario, llama aquí y revalida—. Reserva
 * el número y escribe la cabecera en la MISMA transacción, a través de la
 * única frontera de numeración (`_lib/numeracion/`).
 */

import type { crearDb } from '@aluminior/db'
import { schema } from '@aluminior/db'
import {
  ejecutarConNumeracion, esColisionIdentidad, reservarNumeracion,
} from '../numeracion/index.ts'
import { reservarNumeracionParaPruebas } from '../numeracion/reservar.ts'

type Db = ReturnType<typeof crearDb>

export interface DatosAltaPresupuesto {
  readonly serie: string
  readonly fecha: string
  readonly clienteCodigo: string | null
  readonly potencialCodigo: string | null
  readonly nombreLibre: string | null
  readonly obraTexto: string | null
  readonly tarifa: number
  readonly formaPago: string | null
  readonly observaciones: string | null
  readonly creadoPor: string | null
}

export type ResultadoAltaPresupuesto =
  | { readonly ok: true; readonly id: string }
  | { readonly ok: false; readonly errores: readonly string[] }

/** Numeración inválida (fecha imposible, secuencia agotada): no es una
 * colisión de identidad, así que no debe reintentarse ni confundirse con una. */
class ErrorNumeracionInvalida extends Error {
  constructor(readonly errores: readonly string[]) {
    super(errores.join('; '))
  }
}

/** Sólo pruebas: ver `_lib/numeracion/reservar.ts`. Nunca la usa producción. */
interface GanchosDePrueba {
  readonly pausaTrasLecturaMs?: number
}

async function crearPresupuestoAltaConGanchos(
  db: Db, datos: DatosAltaPresupuesto, ganchos: GanchosDePrueba,
): Promise<ResultadoAltaPresupuesto> {
  try {
    const id = await ejecutarConNumeracion(db, async (tx) => {
      const entrada = { modo: 'NUMERO_NUEVO' as const, fecha: datos.fecha, serie: datos.serie }
      const numeracion = ganchos.pausaTrasLecturaMs
        ? await reservarNumeracionParaPruebas(tx, entrada, ganchos)
        : await reservarNumeracion(tx, entrada)
      if (!numeracion.ok) throw new ErrorNumeracionInvalida(numeracion.errores)

      const [fila] = await tx.insert(schema.presupuestos).values({
        numero: numeracion.numero,
        revision: numeracion.revision,
        serie: numeracion.serie,
        fecha: datos.fecha,
        clienteCodigo: datos.clienteCodigo,
        potencialCodigo: datos.potencialCodigo,
        nombreLibre: datos.nombreLibre,
        obraTexto: datos.obraTexto,
        tarifa: datos.tarifa,
        formaPago: datos.formaPago,
        observaciones: datos.observaciones,
        estado: 'PENDIENTE',
        creadoPor: datos.creadoPor,
      }).returning({ id: schema.presupuestos.id })
      return fila.id
    }, { automatico: true })

    return { ok: true, id }
  } catch (e) {
    if (esColisionIdentidad(e)) {
      return { ok: false, errores: ['No se pudo asignar el número: inténtalo de nuevo'] }
    }
    if (e instanceof ErrorNumeracionInvalida) return { ok: false, errores: e.errores }
    throw e
  }
}

export async function crearPresupuestoAlta(
  db: Db, datos: DatosAltaPresupuesto,
): Promise<ResultadoAltaPresupuesto> {
  return crearPresupuestoAltaConGanchos(db, datos, {})
}

/**
 * SÓLO PRUEBAS. No la usa `acciones.ts`: fuerza la intercalación determinista
 * de una prueba de concurrencia igual que `reservarNumeracionParaPruebas`.
 */
export async function crearPresupuestoAltaParaPruebas(
  db: Db, datos: DatosAltaPresupuesto, ganchos: { readonly pausaTrasLecturaMs: number },
): Promise<ResultadoAltaPresupuesto> {
  return crearPresupuestoAltaConGanchos(db, datos, ganchos)
}
