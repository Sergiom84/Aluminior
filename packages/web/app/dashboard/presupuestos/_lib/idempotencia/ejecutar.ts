import { createHash } from 'node:crypto'
import { and, eq, sql } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { Tx } from '../numeracion/tipos.ts'
import { claveOperacionValida } from './clave.ts'

function canonico(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(',')}]`
  if (valor !== null && typeof valor === 'object') {
    return `{${Object.entries(valor).filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonico(v)}`).join(',')}}`
  }
  return JSON.stringify(valor) ?? 'null'
}

/** Se ejecuta dentro de la transacción de numeración, antes de reservar nada.
 * El lock funciona entre procesos; recibo y documento confirman o revierten juntos.
 * La clave ausente sólo permite compatibilidad con consumidores internos históricos.
 * Las acciones HTTP la exigen. La fecha calculada por el servidor no forma parte
 * de la intención: un reintento al día siguiente recupera el documento original.
 */
export async function ejecutarIdempotente<R extends { readonly ok: boolean }>(
  tx: Tx, clave: string | undefined, actor: string | null | undefined,
  intencion: unknown, ejecutar: () => Promise<R>,
): Promise<R> {
  if (clave === undefined) return ejecutar()
  if (!claveOperacionValida(clave) || !actor) throw new Error('Operación no válida')
  clave = clave.toLowerCase()
  const huella = createHash('sha256').update(canonico(intencion)).digest('hex')
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`presupuesto:${actor}:${clave}`}, 0))`)
  const tabla = schema.operacionesPresupuesto
  const [previa] = await tx.select().from(tabla).where(and(eq(tabla.actor, actor), eq(tabla.clave, clave)))
  if (previa) {
    if (previa.huella !== huella) throw new Error('La operación ya se confirmó con otros datos')
    return previa.resultado as R
  }
  const resultado = await ejecutar()
  if (resultado.ok) await tx.insert(tabla).values({ actor, clave, huella, resultado })
  return resultado
}
