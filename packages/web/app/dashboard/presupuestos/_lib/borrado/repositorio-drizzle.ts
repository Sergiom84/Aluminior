import { eq, sql } from 'drizzle-orm'
import { schema, type crearDb } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { PresupuestoBloqueado, RepositorioBorrado } from './borrar-presupuesto.ts'

type Db = ReturnType<typeof crearDb>
type FilaBloqueada = PresupuestoBloqueado & Record<string, unknown>

/** Adaptador PostgreSQL. Las tablas hijas caen por las claves ajenas ON DELETE CASCADE. */
export function repositorioBorradoDrizzle(cliente: ClienteEscritura): RepositorioBorrado {
  return {
    async bloquear(presupuestoId) {
      const filas = (await cliente.execute<FilaBloqueada>(sql`
        SELECT numero, revision, serie, estado FROM presupuestos
        WHERE id = ${presupuestoId}
        FOR UPDATE
      `)) as unknown as FilaBloqueada[]
      const fila = filas[0]
      return fila ? { numero: Number(fila.numero), revision: Number(fila.revision),
        serie: fila.serie, estado: fila.estado } : null
    },
    async borrar(presupuestoId) {
      const borradas = await cliente.delete(schema.presupuestos)
        .where(eq(schema.presupuestos.id, presupuestoId))
        .returning({ id: schema.presupuestos.id })
      return borradas.length === 1
    },
  }
}

/** Abre una transacción y entrega el repositorio ligado a ella. */
export function enTransaccionDrizzle(db: Db) {
  return <T>(trabajo: (repositorio: RepositorioBorrado) => Promise<T>): Promise<T> =>
    db.transaction((tx) => trabajo(repositorioBorradoDrizzle(tx)))
}
