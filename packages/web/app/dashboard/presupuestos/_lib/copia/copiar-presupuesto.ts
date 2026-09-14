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

import { schema, type crearDb } from '@aluminior/db'
import { eq } from 'drizzle-orm'
import { bloquearPresupuesto } from '../lineas/bloquear-presupuesto.ts'
import { ejecutarConNumeracion, esColisionIdentidad, reservarNumeracion } from '../numeracion/index.ts'
import { reservarNumeracionParaPruebas } from '../numeracion/reservar.ts'
import {
  validarDestino,
  type EstrategiaDestino, type NumeracionDocumento,
} from './destino-documento.ts'
import { escribirCopia } from './escribir-copia.ts'
import { leerDocumentoOrigen, lineaOrigenDe } from './leer-origen.ts'
import { planificarCopia, type OpcionesCopia } from './plan-copia.ts'

type Db = Pick<ReturnType<typeof crearDb>, 'transaction'>
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

/** Sólo pruebas: ver `_lib/numeracion/reservar.ts`. Nunca la usa `copiarPresupuesto`. */
interface GanchosDePrueba {
  readonly pausaTrasLecturaMs?: number
}

/** Reserva el destino dentro de la transacción: la única fuente de verdad. */
async function reservarDestino(
  tx: Tx,
  entrada: EntradaCopia,
  origen: NumeracionDocumento,
  revisionesUsadas: readonly number[],
  fecha: string,
  ganchos: GanchosDePrueba,
): Promise<{ ok: true; destino: NumeracionDocumento } | { ok: false; errores: readonly string[] }> {
  if ('estrategia' in entrada.destino) {
    if (entrada.destino.estrategia === 'NUEVO_NUMERO') {
      const entradaNumeracion = { modo: 'NUMERO_NUEVO' as const, fecha, serie: origen.serie }
      const reserva = ganchos.pausaTrasLecturaMs
        ? await reservarNumeracionParaPruebas(tx, entradaNumeracion, ganchos)
        : await reservarNumeracion(tx, entradaNumeracion)
      if (!reserva.ok) return reserva
      return { ok: true, destino: { numero: reserva.numero, revision: reserva.revision, serie: reserva.serie } }
    }
    const entradaNumeracion = { modo: 'REVISION_NUEVA' as const, serie: origen.serie, numero: origen.numero }
    const reserva = ganchos.pausaTrasLecturaMs
      ? await reservarNumeracionParaPruebas(tx, entradaNumeracion, ganchos)
      : await reservarNumeracion(tx, entradaNumeracion)
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

async function copiarPresupuestoConGanchos(
  db: Db, entrada: EntradaCopia, ganchos: GanchosDePrueba,
): Promise<ResultadoCopia> {
  const fecha = entrada.fecha ?? new Date().toISOString().slice(0, 10)
  const esManual = !('estrategia' in entrada.destino)

  const intento = async (tx: Tx): Promise<ResultadoCopia> => {
    const [identidad] = await tx.select().from(schema.presupuestos)
      .where(eq(schema.presupuestos.id, entrada.presupuestoId)).limit(1)
    if (!identidad) return { ok: false, errores: ['Presupuesto de origen no encontrado'] }

    const numeracionOrigen: NumeracionDocumento = {
      numero: identidad.numero,
      revision: identidad.revision,
      serie: identidad.serie,
    }

    const reservado = await reservarDestino(tx, entrada, numeracionOrigen, [], fecha, ganchos)
    if (!reservado.ok) return reservado

    if (!await bloquearPresupuesto(tx, entrada.presupuestoId))
      return { ok: false, errores: ['Presupuesto de origen no encontrado'] }
    const origen = await leerDocumentoOrigen(tx, entrada.presupuestoId)
    if (!origen) return { ok: false, errores: ['Presupuesto de origen no encontrado'] }
    if (origen.presupuesto.numero !== identidad.numero || origen.presupuesto.serie !== identidad.serie)
      throw new Error('La identidad del presupuesto cambió durante la copia')

    const plan = planificarCopia(origen.lineas.map(lineaOrigenDe), entrada.opciones)
    if (!plan.ok) return plan
    if (plan.plan.lineas.some(c => c.sustituciones.length > 0 &&
      origen.lineas.some(l => l.linea.id === c.lineaId && l.linea.tipo === 'CERRAMIENTO')))
      return { ok: false, errores: ['La sustitución de materiales de cerramientos requiere revaloración y no está disponible'] }

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

export async function copiarPresupuesto(db: Db, entrada: EntradaCopia): Promise<ResultadoCopia> {
  return copiarPresupuestoConGanchos(db, entrada, {})
}

/**
 * SÓLO PRUEBAS. No la usa ningún consumidor de producción: fuerza la
 * intercalación determinista de una prueba de concurrencia, igual que
 * `reservarNumeracionParaPruebas`.
 */
export async function copiarPresupuestoParaPruebas(
  db: Db, entrada: EntradaCopia, ganchos: { readonly pausaTrasLecturaMs: number },
): Promise<ResultadoCopia> {
  return copiarPresupuestoConGanchos(db, entrada, ganchos)
}
