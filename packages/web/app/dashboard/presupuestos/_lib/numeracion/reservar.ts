/**
 * Reserva de numeración de presupuestos (T.71.2).
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
 */

import { sql } from 'drizzle-orm'
import type { ClienteEscritura } from '../cliente-db.ts'

export const MENSAJE_DESTINO_OCUPADO = 'El destino ya está ocupado'

/**
 * `_pausaTrasLecturaMs` es un seam SOLO de pruebas: ensancha a propósito la
 * ventana entre leer el máximo y devolverlo, sin soltar el advisory lock
 * (que es de transacción y no se libera hasta el commit de quien llama). Deja
 * que una prueba de concurrencia fuerce la intercalación que el lock debe
 * impedir, en vez de depender de que dos `Promise.all` compitan por azar.
 * Ningún consumidor de producción lo usa.
 */
export type EntradaNumeracion =
  | {
    readonly modo: 'NUMERO_NUEVO'; readonly fecha: string; readonly serie: string
    readonly _pausaTrasLecturaMs?: number
  }
  | {
    readonly modo: 'REVISION_NUEVA'; readonly serie: string; readonly numero: number
    readonly _pausaTrasLecturaMs?: number
  }
  | { readonly modo: 'MANUAL'; readonly serie: string; readonly numero: number; readonly revision: number }

export type ResultadoNumeracion =
  | { readonly ok: true; readonly numero: number; readonly revision: number; readonly serie: string }
  | { readonly ok: false; readonly errores: readonly string[] }

/**
 * Ejercicio (2 dígitos) de la FECHA DEL DOCUMENTO. Nunca de `new Date()` aquí
 * dentro: un reloj interno escondido en el servicio es lo que la decisión #3
 * prohíbe. Quien llama decide qué fecha es "hoy" para su caso de uso.
 */
export function ejercicioDeFecha(fecha: string): number {
  return Number(fecha.slice(0, 4)) % 100
}

const pausa = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms))

/**
 * Lock lógico por tipo de documento y ejercicio: `presupuestos:numero:26`.
 *
 * Primitiva expuesta para que las pruebas de concurrencia puedan intercalar
 * una pausa determinista entre el lock y la lectura sin tocar el servicio.
 * En producción sólo la usa `reservarNumeracion`.
 */
export async function lockNumeroNuevo(cliente: ClienteEscritura, ejercicio: number): Promise<void> {
  await cliente.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`presupuestos:numero:${ejercicio}`})::bigint)`)
}

/** Lock lógico por serie y número: `presupuestos:revision:A:260011`. */
export async function lockRevision(
  cliente: ClienteEscritura, serie: string, numero: number,
): Promise<void> {
  await cliente.execute(
    sql`SELECT pg_advisory_xact_lock(hashtext(${`presupuestos:revision:${serie}:${numero}`})::bigint)`,
  )
}

/**
 * Máximo `numero` dentro del rango anual del ejercicio, o `null` si el
 * ejercicio no tiene ningún presupuesto todavía. Secuencia GLOBAL por
 * ejercicio (decisión #3): no filtra por serie.
 */
export async function maximoNumeroDelEjercicio(
  cliente: ClienteEscritura, ejercicio: number,
): Promise<number | null> {
  const minimo = ejercicio * 10000
  const maximo = (ejercicio + 1) * 10000
  const [fila] = (await cliente.execute<{ max: number | null }>(sql`
    SELECT MAX(numero) AS max FROM presupuestos
    WHERE numero >= ${minimo} AND numero < ${maximo}
  `)) as unknown as { max: number | null }[]
  return fila?.max === null || fila?.max === undefined ? null : Number(fila.max)
}

/** Máximo `revision` de ESE (serie, numero), o `null` si no existe ninguna fila. */
export async function maximoRevision(
  cliente: ClienteEscritura, serie: string, numero: number,
): Promise<number | null> {
  const [fila] = (await cliente.execute<{ max: number | null }>(sql`
    SELECT MAX(revision) AS max FROM presupuestos
    WHERE serie = ${serie} AND numero = ${numero}
  `)) as unknown as { max: number | null }[]
  return fila?.max === null || fila?.max === undefined ? null : Number(fila.max)
}

/** `true` si ya existe una fila con esa (serie, numero, revision) exactas. */
export async function existeNumeracion(
  cliente: ClienteEscritura, serie: string, numero: number, revision: number,
): Promise<boolean> {
  const [fila] = (await cliente.execute<{ uno: number }>(sql`
    SELECT 1 AS uno FROM presupuestos
    WHERE serie = ${serie} AND numero = ${numero} AND revision = ${revision}
    LIMIT 1
  `)) as unknown as { uno: number }[]
  return !!fila
}

/**
 * Reserva la numeración pedida DENTRO de la transacción de `cliente`.
 *
 * - `NUMERO_NUEVO`: lock por ejercicio, relee el máximo, devuelve máximo+1 o
 *   AASSSS con secuencia 0001 si el ejercicio está vacío.
 * - `REVISION_NUEVA`: lock por (serie, numero), relee el máximo de ESE par,
 *   devuelve máximo+1 (0 si el par no existiera, aunque en la práctica
 *   siempre existe al menos el documento origen de la copia).
 * - `MANUAL`: comprueba existencia dentro de la transacción. Si está
 *   ocupado, error explícito — nunca se elige otro número en su lugar
 *   (decisión #8). La UNIQUE decide ante cualquier carrera residual entre
 *   esta comprobación y el `INSERT` de quien llama.
 */
export async function reservarNumeracion(
  cliente: ClienteEscritura, entrada: EntradaNumeracion,
): Promise<ResultadoNumeracion> {
  if (entrada.modo === 'NUMERO_NUEVO') {
    const ejercicio = ejercicioDeFecha(entrada.fecha)
    await lockNumeroNuevo(cliente, ejercicio)
    const maximo = await maximoNumeroDelEjercicio(cliente, ejercicio)
    if (entrada._pausaTrasLecturaMs) await pausa(entrada._pausaTrasLecturaMs)
    const numero = maximo === null ? ejercicio * 10000 + 1 : maximo + 1
    return { ok: true, numero, revision: 0, serie: entrada.serie }
  }
  if (entrada.modo === 'REVISION_NUEVA') {
    await lockRevision(cliente, entrada.serie, entrada.numero)
    const maximo = await maximoRevision(cliente, entrada.serie, entrada.numero)
    if (entrada._pausaTrasLecturaMs) await pausa(entrada._pausaTrasLecturaMs)
    return { ok: true, numero: entrada.numero, revision: (maximo ?? -1) + 1, serie: entrada.serie }
  }
  // MANUAL
  if (await existeNumeracion(cliente, entrada.serie, entrada.numero, entrada.revision)) {
    return { ok: false, errores: [MENSAJE_DESTINO_OCUPADO] }
  }
  return { ok: true, numero: entrada.numero, revision: entrada.revision, serie: entrada.serie }
}
