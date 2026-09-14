import { eq } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { esResultadoCerramiento, type ResultadoCerramientoV1 } from '@aluminior/core/estructuras'
import type { ClienteEscritura } from '../cliente-db.ts'

/** Lectura de snapshot: ausencia legítima en líneas antiguas; corrupción no es ausencia. */
export async function leerResultadoCerramiento(
  cliente: ClienteEscritura, lineaId: string,
): Promise<ResultadoCerramientoV1 | null> {
  const [fila] = await cliente.select().from(schema.lineasCerramientoResultados)
    .where(eq(schema.lineasCerramientoResultados.lineaId, lineaId)).limit(1)
  if (!fila) return null
  if (!esResultadoCerramiento(fila.resultado) || fila.version !== fila.resultado.version) {
    throw new Error('Snapshot económico de cerramiento no válido')
  }
  return fila.resultado
}

/** Se conectará a la transacción de guardar/editar en J05. No abre otra transacción. */
export async function persistirResultadoCerramiento(
  cliente: ClienteEscritura, lineaId: string, valor: unknown,
): Promise<void> {
  if (!esResultadoCerramiento(valor)) throw new Error('Snapshot económico de cerramiento no válido')
  const [configuracion] = await cliente.select().from(schema.lineasCerramiento)
    .where(eq(schema.lineasCerramiento.lineaId, lineaId)).limit(1)
  // Comparar semánticamente: jsonb puede reordenar claves del objeto.
  const actual = configuracion?.configuracion
  if (!actual || !esResultadoCerramiento({ ...valor, configuracion: actual }) ||
    JSON.stringify([actual.version, actual.modulos, actual.uniones], ordenarClaves) !==
    JSON.stringify([valor.configuracion.version, valor.configuracion.modulos,
      valor.configuracion.uniones], ordenarClaves)) {
    throw new Error('La configuración valorada no coincide con el cerramiento guardado')
  }
  await cliente.insert(schema.lineasCerramientoResultados)
    .values({ lineaId, version: valor.version, resultado: valor })
    .onConflictDoUpdate({ target: schema.lineasCerramientoResultados.lineaId,
      set: { version: valor.version, resultado: valor } })
}

function ordenarClaves(_clave: string, valor: unknown): unknown {
  if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
    return Object.fromEntries(Object.entries(valor).sort(([a], [b]) => a.localeCompare(b)))
  }
  return valor
}
