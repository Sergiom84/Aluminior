/**
 * Reserva de numeración de presupuestos (T.71.2, endurecida en T.71.4).
 *
 * Única autoridad para decidir número o revisión. No lee `FormData`, no
 * autoriza usuarios, no revalida rutas, no copia líneas, no valora y no
 * conoce componentes React: sólo reserva una numeración dentro de la
 * transacción que le pasan, para que quien la llame inserte la cabecera en
 * esa misma transacción.
 *
 * Dos capas de garantía (decisión #7): `pg_advisory_xact_lock` serializa la
 * asignación automática; la restricción `presupuestos_identidad_uq` (T.71.1)
 * es la defensa final ante un proceso externo o un camino de código que no
 * pase por aquí.
 *
 * Las claves de lock son deterministas y van SIEMPRE parametrizadas —nunca
 * SQL construido concatenando texto—: `hashtext(...)` recibe el valor como
 * parámetro de la plantilla `sql`, igual que cualquier otro bind.
 *
 * Sólo acepta `Tx` (ver `tipos.ts`), nunca una conexión suelta: el advisory
 * lock es de transacción, y aceptar `Db` invitaría a llamarlo fuera de una.
 */

import { sql } from 'drizzle-orm'
import type { Tx } from './tipos.ts'

export const MENSAJE_DESTINO_OCUPADO = 'El destino ya está ocupado'

export type EntradaNumeracion =
  | { readonly modo: 'NUMERO_NUEVO'; readonly fecha: string; readonly serie: string }
  | { readonly modo: 'REVISION_NUEVA'; readonly serie: string; readonly numero: number }
  | { readonly modo: 'MANUAL'; readonly serie: string; readonly numero: number; readonly revision: number }

export type ResultadoNumeracion =
  | { readonly ok: true; readonly numero: number; readonly revision: number; readonly serie: string }
  | { readonly ok: false; readonly errores: readonly string[] }

const FORMATO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/

function esBisiesto(anyo: number): boolean {
  return (anyo % 4 === 0 && anyo % 100 !== 0) || anyo % 400 === 0
}

function diasEnMes(anyo: number, mes: number): number {
  const dias = [31, esBisiesto(anyo) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return dias[mes - 1]
}

export type FechaValidada =
  | { readonly ok: true; readonly ejercicio: number }
  | { readonly ok: false; readonly errores: readonly string[] }

/**
 * Ejercicio (2 dígitos) de la FECHA DEL DOCUMENTO. Nunca de `new Date()` aquí
 * dentro: un reloj interno escondido en el servicio es lo que la decisión #3
 * prohíbe. Quien llama decide qué fecha es "hoy" para su caso de uso.
 *
 * Valida formato Y calendario real: `slice(0, 4)` sobre cualquier texto podía
 * colar un año `NaN` o una fecha imposible (31 de febrero) hasta el SQL. Una
 * fecha inválida no reserva nada — ni lock ni lectura.
 */
export function validarFechaDocumento(fecha: string): FechaValidada {
  const m = FORMATO_FECHA.exec(fecha)
  if (!m) {
    return { ok: false, errores: [`Fecha de documento inválida: "${fecha}" no tiene el formato YYYY-MM-DD`] }
  }
  const anyo = Number(m[1])
  const mes = Number(m[2])
  const dia = Number(m[3])
  if (mes < 1 || mes > 12 || dia < 1 || dia > diasEnMes(anyo, mes)) {
    return { ok: false, errores: [`Fecha de documento inválida: "${fecha}" no existe`] }
  }
  return { ok: true, ejercicio: anyo % 100 }
}

/** Último número válido del patrón AASSSS para el ejercicio: AA9999. */
function limiteSuperiorEjercicio(ejercicio: number): number {
  return ejercicio * 10000 + 9999
}

const pausa = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms))

/**
 * Lock lógico por tipo de documento y ejercicio: `presupuestos:numero:26`.
 * En producción sólo la usa `reservarNumeracion`.
 */
export async function lockNumeroNuevo(cliente: Tx, ejercicio: number): Promise<void> {
  await cliente.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`presupuestos:numero:${ejercicio}`})::bigint)`)
}

/** Lock lógico por serie y número: `presupuestos:revision:A:260011`. */
export async function lockRevision(cliente: Tx, serie: string, numero: number): Promise<void> {
  await cliente.execute(
    sql`SELECT pg_advisory_xact_lock(hashtext(${`presupuestos:revision:${serie}:${numero}`})::bigint)`,
  )
}

/**
 * Máximo `numero` dentro del rango anual del ejercicio, o `null` si el
 * ejercicio no tiene ningún presupuesto todavía. Secuencia GLOBAL por
 * ejercicio (decisión #3): no filtra por serie.
 */
export async function maximoNumeroDelEjercicio(cliente: Tx, ejercicio: number): Promise<number | null> {
  const minimo = ejercicio * 10000
  const maximo = (ejercicio + 1) * 10000
  const [fila] = (await cliente.execute<{ max: number | null }>(sql`
    SELECT MAX(numero) AS max FROM presupuestos
    WHERE numero >= ${minimo} AND numero < ${maximo}
  `)) as unknown as { max: number | null }[]
  return fila?.max === null || fila?.max === undefined ? null : Number(fila.max)
}

/** Máximo `revision` de ESE (serie, numero), o `null` si no existe ninguna fila. */
export async function maximoRevision(cliente: Tx, serie: string, numero: number): Promise<number | null> {
  const [fila] = (await cliente.execute<{ max: number | null }>(sql`
    SELECT MAX(revision) AS max FROM presupuestos
    WHERE serie = ${serie} AND numero = ${numero}
  `)) as unknown as { max: number | null }[]
  return fila?.max === null || fila?.max === undefined ? null : Number(fila.max)
}

/** `true` si ya existe una fila con esa (serie, numero, revision) exactas. */
export async function existeNumeracion(
  cliente: Tx, serie: string, numero: number, revision: number,
): Promise<boolean> {
  const [fila] = (await cliente.execute<{ uno: number }>(sql`
    SELECT 1 AS uno FROM presupuestos
    WHERE serie = ${serie} AND numero = ${numero} AND revision = ${revision}
    LIMIT 1
  `)) as unknown as { uno: number }[]
  return !!fila
}

/**
 * Ganchos de PRUEBA. Nunca se exportan desde `index.ts` ni los usa ningún
 * consumidor de producción: `pausaTrasLecturaMs` ensancha a propósito la
 * ventana entre leer el máximo y devolverlo, sin soltar el advisory lock (que
 * es de transacción y no se libera hasta el commit de quien llama). Deja que
 * una prueba de concurrencia fuerce la intercalación que el lock debe
 * impedir, en vez de depender de que dos `Promise.all` compitan por azar.
 */
interface GanchosDePrueba {
  readonly pausaTrasLecturaMs?: number
}

async function reservarNumeracionConGanchos(
  cliente: Tx, entrada: EntradaNumeracion, ganchos: GanchosDePrueba,
): Promise<ResultadoNumeracion> {
  if (entrada.modo === 'NUMERO_NUEVO') {
    const validada = validarFechaDocumento(entrada.fecha)
    if (!validada.ok) return validada
    const { ejercicio } = validada
    await lockNumeroNuevo(cliente, ejercicio)
    const maximo = await maximoNumeroDelEjercicio(cliente, ejercicio)
    if (ganchos.pausaTrasLecturaMs) await pausa(ganchos.pausaTrasLecturaMs)
    const numero = maximo === null ? ejercicio * 10000 + 1 : maximo + 1
    if (numero > limiteSuperiorEjercicio(ejercicio)) {
      return {
        ok: false,
        errores: [`Secuencia del ejercicio ${ejercicio} agotada (máximo ${limiteSuperiorEjercicio(ejercicio)})`],
      }
    }
    return { ok: true, numero, revision: 0, serie: entrada.serie }
  }
  if (entrada.modo === 'REVISION_NUEVA') {
    await lockRevision(cliente, entrada.serie, entrada.numero)
    const maximo = await maximoRevision(cliente, entrada.serie, entrada.numero)
    if (ganchos.pausaTrasLecturaMs) await pausa(ganchos.pausaTrasLecturaMs)
    return { ok: true, numero: entrada.numero, revision: (maximo ?? -1) + 1, serie: entrada.serie }
  }
  // MANUAL
  if (await existeNumeracion(cliente, entrada.serie, entrada.numero, entrada.revision)) {
    return { ok: false, errores: [MENSAJE_DESTINO_OCUPADO] }
  }
  return { ok: true, numero: entrada.numero, revision: entrada.revision, serie: entrada.serie }
}

/**
 * Reserva la numeración pedida DENTRO de la transacción de `cliente`.
 *
 * - `NUMERO_NUEVO`: valida la fecha, lock por ejercicio, relee el máximo,
 *   devuelve máximo+1 o AASSSS con secuencia 0001 si el ejercicio está
 *   vacío. Si la fecha es inválida o la secuencia anual está agotada
 *   (AA9999 ya usado), error explícito — nunca cambia de ejercicio en
 *   silencio ni deja pasar un número fuera de rango.
 * - `REVISION_NUEVA`: lock por (serie, numero), relee el máximo de ESE par,
 *   devuelve máximo+1 (0 si el par no existiera, aunque en la práctica
 *   siempre existe al menos el documento origen de la copia).
 * - `MANUAL`: comprueba existencia dentro de la transacción. Si está
 *   ocupado, error explícito — nunca se elige otro número en su lugar
 *   (decisión #8). La UNIQUE decide ante cualquier carrera residual entre
 *   esta comprobación y el `INSERT` de quien llama.
 */
export async function reservarNumeracion(cliente: Tx, entrada: EntradaNumeracion): Promise<ResultadoNumeracion> {
  return reservarNumeracionConGanchos(cliente, entrada, {})
}

/**
 * SÓLO PRUEBAS. No se reexporta desde `index.ts`: ningún consumidor de
 * producción puede indicar cuánto tiempo se mantiene un advisory lock.
 * Úsase para forzar una intercalación determinista en pruebas de
 * concurrencia — ver `reservar.integracion.test.ts`.
 */
export async function reservarNumeracionParaPruebas(
  cliente: Tx, entrada: EntradaNumeracion, ganchos: GanchosDePrueba,
): Promise<ResultadoNumeracion> {
  return reservarNumeracionConGanchos(cliente, entrada, ganchos)
}
