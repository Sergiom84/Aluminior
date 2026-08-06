/**
 * Copia de presupuesto con sustitución masiva: lectura, plan y escritura.
 *
 * Este fichero sólo orquesta. La decisión está en `plan-copia.ts` y en
 * `destino-documento.ts`, ambos puros; la lectura y la escritura en sus dos
 * módulos, ambos sin reglas.
 */

import type { crearDb } from '@aluminior/db'
import {
  proponerDestino, validarDestino,
  type EstrategiaDestino, type NumeracionDocumento,
} from './destino-documento.ts'
import { escribirCopia } from './escribir-copia.ts'
import { leerDocumentoOrigen, lineaOrigenDe } from './leer-origen.ts'
import { planificarCopia, type OpcionesCopia } from './plan-copia.ts'

type Db = ReturnType<typeof crearDb>

export interface EntradaCopia {
  readonly presupuestoId: string
  /** Numeración tecleada, o la estrategia con la que proponerla. */
  readonly destino: NumeracionDocumento | { readonly estrategia: EstrategiaDestino }
  readonly opciones: OpcionesCopia
  readonly creadoPor?: string | null
  /** Fecha del documento nuevo. Por defecto, hoy. */
  readonly fecha?: string
  /** Siguiente número libre, sólo necesario con la estrategia NUEVO_NUMERO. */
  readonly siguienteNumero?: number
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

export async function copiarPresupuesto(db: Db, entrada: EntradaCopia): Promise<ResultadoCopia> {
  return db.transaction(async (tx) => {
    const origen = await leerDocumentoOrigen(tx, entrada.presupuestoId)
    if (!origen) return { ok: false, errores: ['Presupuesto de origen no encontrado'] }

    const numeracionOrigen: NumeracionDocumento = {
      numero: origen.presupuesto.numero,
      revision: origen.presupuesto.revision,
      serie: origen.presupuesto.serie,
    }
    const contexto = {
      revisionesUsadas: origen.revisionesUsadas,
      siguienteNumero: entrada.siguienteNumero,
    }
    const propuesta = 'estrategia' in entrada.destino
      ? proponerDestino(numeracionOrigen, entrada.destino.estrategia, contexto)
      : { ok: true as const, destino: entrada.destino }
    if (!propuesta.ok) return propuesta

    const comprobado = validarDestino(numeracionOrigen, propuesta.destino, contexto)
    if (!comprobado.ok) return comprobado

    const plan = planificarCopia(origen.lineas.map(lineaOrigenDe), entrada.opciones)
    if (!plan.ok) return plan

    const escrito = await escribirCopia(tx, {
      origen: origen.presupuesto,
      lineas: origen.lineas,
      plan: plan.plan,
      cabecera: {
        destino: comprobado.destino,
        fecha: entrada.fecha ?? new Date().toISOString().slice(0, 10),
        creadoPor: entrada.creadoPor ?? null,
      },
    })

    return {
      ok: true as const,
      presupuestoId: escrito.presupuestoId,
      numero: comprobado.destino.numero,
      revision: comprobado.destino.revision,
      lineasCopiadas: escrito.lineasCopiadas,
      sustitucionesAplicadas: plan.plan.sustitucionesAplicadas,
      avisos: [...origen.avisos, ...escrito.avisos],
    }
  })
}
