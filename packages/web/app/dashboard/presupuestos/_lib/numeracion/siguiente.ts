/**
 * Número que recibiría el próximo presupuesto, SIN reservarlo: lectura sin lock
 * para mostrarlo en el alta. El número definitivo lo fija `reservarNumeracion`
 * dentro de la transacción de creación; si otro usuario crea uno entre medias,
 * el definitivo puede ser el siguiente.
 */
import { sql } from 'drizzle-orm'
import type { crearDb } from '@aluminior/db'
import { validarFechaDocumento } from './reservar.ts'

type Db = ReturnType<typeof crearDb>

export async function siguienteNumeroPrevisto(db: Db, fecha: string): Promise<number | null> {
  const validada = validarFechaDocumento(fecha)
  if (!validada.ok) return null
  const { ejercicio } = validada
  const [fila] = (await db.execute<{ max: number | null }>(sql`
    SELECT MAX(numero) AS max FROM presupuestos
    WHERE numero >= ${ejercicio * 10000} AND numero < ${(ejercicio + 1) * 10000}
  `)) as unknown as { max: number | null }[]
  const numero = fila?.max == null ? ejercicio * 10000 + 1 : Number(fila.max) + 1
  return numero > ejercicio * 10000 + 9999 ? null : numero
}
