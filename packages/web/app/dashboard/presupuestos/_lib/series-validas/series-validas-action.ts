'use server'

import { asc } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { usuarioActual } from '../usuario-actual.ts'
import { registrarFallo } from '../errores.ts'
import { leerSeriesValidas } from './leer-series-validas.ts'

export type ResultadoSeriesValidas = { ok: true; porEstructura: Record<string, string[]> } | { ok: false }

/**
 * Series que valoran cada estructura del diseño con el vidrio elegido. Solo
 * lee; si falla, el formulario conserva la lista completa y la validación de
 * siempre al añadir la línea.
 */
export async function seriesValidasParaDiseno(
  estructuras: string[], vidrio: string | null,
): Promise<ResultadoSeriesValidas> {
  try {
    if (!await usuarioActual()) return { ok: false }
    const db = crearDb()
    const todas = (await db.select({ codigo: schema.series.codigo }).from(schema.series)
      .orderBy(asc(schema.series.codigo))).map((fila) => fila.codigo)
    const limpias = [...new Set(estructuras.map((codigo) => String(codigo).trim()).filter(Boolean))].slice(0, 200)
    const porEstructura = await leerSeriesValidas(db, {
      estructuras: limpias, vidrio: vidrio?.trim() || null, series: todas,
    })
    return { ok: true, porEstructura }
  } catch (e) {
    registrarFallo('seriesValidasParaDiseno', e)
    return { ok: false }
  }
}
