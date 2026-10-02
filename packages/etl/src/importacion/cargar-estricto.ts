import type { Sql } from 'postgres'
import { leerLotes, rutaTabla } from '../csv.ts'
import type { Cargar } from './cargar.ts'
import type { Resultado } from './resultado.ts'

/** Cargas de sustitución: cualquier rechazo o clave duplicada revierte la transacción. */
export function crearCargadorEstricto(sql: Sql, origen: string): Cargar {
  return async (tablaOrigen, tablaDestino, mapear) => {
    const ruta = rutaTabla(origen, tablaOrigen)
    if (!ruta) throw new Error(`Falta ${tablaOrigen}; actualización revertida`)
    const r: Resultado = { tabla: tablaDestino, leidas: 0, insertadas: 0,
      descartadas: 0, excluidas: 0, motivos: new Map() }
    for await (const lote of leerLotes(ruta, 500)) {
      r.leidas += lote.length
      const filas = lote.map(f => mapear(f, r)).filter(f => f !== null)
      if (!filas.length) continue
      // No ignorar conflictos ni reintentar dentro de una transacción abortada.
      const insertadas = await sql`INSERT INTO ${sql(tablaDestino)} ${sql(filas)}`
      r.insertadas += insertadas.count
    }
    return r
  }
}
