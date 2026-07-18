/**
 * Lectura de los CSV exportados del sistema original.
 *
 * Particularidades del origen (Access exportado con PowerShell):
 *  - Decimales con coma: "1.005,58"
 *  - Booleanos como "True"/"False"
 *  - Fechas en formato es-ES: "24/07/2023 0:00:00"
 *  - Cadenas vacías en lugar de NULL
 *  - Nombres de fichero con caracteres sustituidos (Estructuras_Dise_o.csv)
 */

import { createReadStream, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse'

export type Fila = Record<string, string>

/** Localiza el CSV de una tabla tolerando la sustitución de caracteres del export. */
export function rutaTabla(carpeta: string, tabla: string): string | null {
  const directa = join(carpeta, `${tabla}.csv`)
  if (existsSync(directa)) return directa

  // 'EstructurasDiseño' -> 'EstructurasDise_o.csv'
  const patron = new RegExp('^' + tabla.replace(/[^\w]/g, '.') + '\\.csv$', 'i')
  const encontrado = readdirSync(carpeta).find((f) => patron.test(f))
  return encontrado ? join(carpeta, encontrado) : null
}

/** Lee un CSV en lotes, sin cargarlo entero en memoria. */
export async function* leerLotes(
  ruta: string,
  tam = 1000,
): AsyncGenerator<Fila[]> {
  const parser = createReadStream(ruta).pipe(
    parse({ columns: true, bom: true, skip_empty_lines: true, relax_quotes: true }),
  )

  let lote: Fila[] = []
  for await (const fila of parser) {
    lote.push(fila as Fila)
    if (lote.length >= tam) {
      yield lote
      lote = []
    }
  }
  if (lote.length) yield lote
}

// --- Conversores ---

/** Cadena vacía -> null. */
export function txt(v: string | undefined): string | null {
  if (v === undefined) return null
  const t = v.trim()
  return t === '' ? null : t
}

/** "1.005,58" -> "1005.58" (se devuelve string: numeric de Postgres, sin pérdida). */
export function num(v: string | undefined): string | null {
  const t = txt(v)
  if (t === null) return null
  const limpio = t.replace(/\./g, '').replace(',', '.')
  return Number.isFinite(Number(limpio)) ? limpio : null
}

/** Entero, tolerando decimales del origen. */
export function ent(v: string | undefined): number | null {
  const n = num(v)
  if (n === null) return null
  const i = Math.round(Number(n))
  return Number.isFinite(i) ? i : null
}

/** "True"/"False"/"-1"/"0" -> boolean. */
export function bool(v: string | undefined, pordefecto = false): boolean {
  const t = txt(v)
  if (t === null) return pordefecto
  return t === 'True' || t === 'true' || t === '-1' || t === '1' || t === 'Sí'
}

/** "24/07/2023 0:00:00" -> "2023-07-24". Devuelve null si no es una fecha válida. */
export function fecha(v: string | undefined): string | null {
  const t = txt(v)
  if (t === null) return null
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (!m) return null
  const [, d, mes, a] = m
  const iso = `${a}-${mes.padStart(2, '0')}-${d.padStart(2, '0')}`
  return Number.isNaN(Date.parse(iso)) ? null : iso
}
