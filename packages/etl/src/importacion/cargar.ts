import type { Sql } from 'postgres'
import { leerLotes, rutaTabla, type Fila } from '../csv.ts'
import { descartar, type Resultado } from './resultado.ts'

export type Cargar = (tablaOrigen: string, tablaDestino: string, mapear: (f: Fila, r: Resultado) => Record<string, unknown> | null) => Promise<Resultado>

export function crearCargador(sql: Sql, ORIGEN: string): Cargar {
  /**
   * Carga una tabla. `mapear` devuelve null para descartar la fila
   * (con motivo, para poder explicarlo al final).
   */
  async function cargar(
    tablaOrigen: string,
    tablaDestino: string,
    mapear: (f: Fila, r: Resultado) => Record<string, unknown> | null,
  ): Promise<Resultado> {
    const r: Resultado = {
      tabla: tablaDestino, leidas: 0, insertadas: 0, descartadas: 0, excluidas: 0,
      motivos: new Map(),
    }

    const ruta = rutaTabla(ORIGEN!, tablaOrigen)
    if (!ruta) {
      r.motivos.set('CSV no encontrado', 1)
      return r
    }

    for await (const lote of leerLotes(ruta, 500)) {
      r.leidas += lote.length
      const filas = lote.map((f) => mapear(f, r)).filter((x): x is Record<string, unknown> => x !== null)
      if (!filas.length) continue

      try {
        await sql`INSERT INTO ${sql(tablaDestino)} ${sql(filas)} ON CONFLICT DO NOTHING`
        r.insertadas += filas.length
      } catch (e) {
        // Reintento fila a fila para aislar la que falla en lugar de perder el lote
        for (const fila of filas) {
          try {
            await sql`INSERT INTO ${sql(tablaDestino)} ${sql(fila)} ON CONFLICT DO NOTHING`
            r.insertadas++
          } catch (err) {
            descartar(r, `rechazada por la BD: ${(err as Error).message.slice(0, 60)}`)
          }
        }
      }
    }

    return r
  }
  return cargar
}
