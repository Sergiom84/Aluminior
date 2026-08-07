/**
 * Copia de presupuesto con sustitución masiva: lectura, plan y escritura.
 *
 * Este fichero sólo orquesta. La decisión de qué copiar está en
 * `plan-copia.ts`; la validación estructural del destino manual (positivo,
 * serie no vacía, no coincide con el origen ni con una revisión ya vista) en
 * `destino-documento.ts`, pura y sin acceso a la base; la AUTORIDAD real de
 * numeración —lock, relectura y comprobación de existencia dentro de la
 * transacción— vive en `_lib/numeracion/` (T.71.2). La lectura y la
 * escritura quedan en sus dos módulos, ambos sin reglas.
 */

import type { crearDb } from '@aluminior/db'
import { ejecutarConNumeracion, esColisionIdentidad, reservarNumeracion } from '../numeracion/index.ts'
import {
  validarDestino,
  type EstrategiaDestino, type NumeracionDocumento,
} from './destino-documento.ts'
import { escribirCopia } from './escribir-copia.ts'
import { leerDocumentoOrigen, lineaOrigenDe } from './leer-origen.ts'
import { planificarCopia, type OpcionesCopia } from './plan-copia.ts'

type Db = ReturnType<typeof crearDb>
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]

export interface EntradaCopia {
  readonly presupuestoId: string
  /** Numeración tecleada, o la estrategia con la que reservarla. */
  readonly destino: NumeracionDocumento | { readonly estrategia: EstrategiaDestino }
  readonly opciones: OpcionesCopia
  readonly creadoPor?: string | null
  /** Fecha del documento nuevo. Por defecto, hoy. Determina el ejercicio de
   * NUEVO_NUMERO — nunca se lee un reloj dentro de `_lib/numeracion/`. */
  readonly fecha?: string
}

export type ResultadoCopia =
  | {
      ok: true
      presupuestoId: string
      numero: number
      revision: number
      lineasCopiadas: number
      sustitucionesAplicadas: number
      avisos: readonly string[]
    }
  | { ok: false; errores: readonly string[] }

/** Reserva el destino dentro de la transacción: la única fuente de verdad. */
async function reservarDestino(
  tx: Tx,
  entrada: EntradaCopia,
  origen: NumeracionDocumento,
  revisionesUsadas: readonly number[],
  fecha: string,
): Promise<{ ok: true; destino: NumeracionDocumento } | { ok: false; errores: readonly string[] }> {
  if ('estrategia' in entrada.destino) {
    if (entrada.destino.estrategia === 'NUEVO_NUMERO') {
      const reserva = await reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha, serie: origen.serie })
      if (!reserva.ok) return reserva
      return { ok: true, destino: { numero: reserva.numero, revision: reserva.revision, serie: reserva.serie } }
    }
    const reserva = await reservarNumeracion(tx, {
      modo: 'REVISION_NUEVA', serie: origen.serie, numero: origen.numero,
    })
    if (!reserva.ok) return reserva
    return { ok: true, destino: { numero: reserva.numero, revision: reserva.revision, serie: reserva.serie } }
  }

  // Manual: la validación estructural es pura y NO es autoridad transaccional
  // (no confía en `revisionesUsadas`, que se leyó antes de abrir el lock).
  // Sólo descarta lo obviamente inválido para no llegar a tocar la base.
  const estructural = validarDestino(origen, entrada.destino, { revisionesUsadas })
  if (!estructural.ok) return estructural

  const reserva = await reservarNumeracion(tx, {
    modo: 'MANUAL',
    serie: estructural.destino.serie, numero: estructural.destino.numero, revision: estructural.destino.revision,
  })
  if (!reserva.ok) return reserva
  return { ok: true, destino: { numero: reserva.numero, revision: reserva.revision, serie: reserva.serie } }
}

export async function copiarPresupuesto(db: Db, entrada: EntradaCopia): Promise<ResultadoCopia> {
  const fecha = entrada.fecha ?? new Date().toISOString().slice(0, 10)
  const esManual = !('estrategia' in entrada.destino)

  const intento = async (tx: Tx): Promise<ResultadoCopia> => {
    const origen = await leerDocumentoOrigen(tx, entrada.presupuestoId)
    if (!origen) return { ok: false, errores: ['Presupuesto de origen no encontrado'] }

    const numeracionOrigen: NumeracionDocumento = {
      numero: origen.presupuesto.numero,
      revision: origen.presupuesto.revision,
      serie: origen.presupuesto.serie,
    }

    const reservado = await reservarDestino(tx, entrada, numeracionOrigen, origen.revisionesUsadas, fecha)
    if (!reservado.ok) return reservado

    const plan = planificarCopia(origen.lineas.map(lineaOrigenDe), entrada.opciones)
    if (!plan.ok) return plan

    const escrito = await escribirCopia(tx, {
      origen: origen.presupuesto,
      lineas: origen.lineas,
      plan: plan.plan,
      cabecera: {
        destino: reservado.destino,
        fecha,
        creadoPor: entrada.creadoPor ?? null,
      },
    })

    return {
      ok: true as const,
      presupuestoId: escrito.presupuestoId,
      numero: reservado.destino.numero,
      revision: reservado.destino.revision,
      lineasCopiadas: escrito.lineasCopiadas,
      sustitucionesAplicadas: plan.plan.sustitucionesAplicadas,
      avisos: [...origen.avisos, ...escrito.avisos],
    }
  }

  try {
    // Automático sólo para las estrategias calculadas (decisión #9): un
    // destino manual nunca se reintenta con otro número.
    return await ejecutarConNumeracion(db, intento, { automatico: !esManual })
  } catch (error) {
    if (esColisionIdentidad(error)) return { ok: false, errores: ['El destino ya está ocupado'] }
    throw error
  }
}
