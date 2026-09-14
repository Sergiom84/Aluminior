import { eq } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import type { ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'
import { persistirManoObra, type SnapshotManoObra } from '../mano-obra/index.ts'
import { persistirResultadoCerramiento } from './resultado-persistido.ts'

/** No recibe piezas independientes: su autoridad es el snapshot versionado. */
export function despieceDeResultado(resultado: ResultadoCerramientoV1, lineaId: string) {
  return resultado.origenes.flatMap(o => o.piezas.map(p => {
    const { ordinal, unidad: _unidad, ...pieza } = p
    return { ...pieza, lineaId, origenTipo: o.origen.tipo, origenId: o.origen.id, origenOrdinal: ordinal }
  }))
}

/** La configuración debe estar actualizada y la transacción la aporta la línea. */
export async function escribirResultadosCerramiento(tx: ClienteEscritura, lineaId: string,
  resultado: ResultadoCerramientoV1, manoObra: readonly SnapshotManoObra[],
) {
  await persistirResultadoCerramiento(tx, lineaId, resultado)
  await tx.delete(schema.lineasDespiece).where(eq(schema.lineasDespiece.lineaId, lineaId))
  const piezas = despieceDeResultado(resultado, lineaId)
  if (piezas.length) await tx.insert(schema.lineasDespiece).values(piezas)
  await tx.delete(schema.lineasManoObra).where(eq(schema.lineasManoObra.lineaId, lineaId))
  await persistirManoObra(tx, lineaId, manoObra)
}
