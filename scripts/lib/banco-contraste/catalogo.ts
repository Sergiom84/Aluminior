/** Exportación canónica de las mismas tablas de catálogo, con huellas verificables. */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { hash } from './fuente.ts'
export const TABLAS_CATALOGO = ['Familias', 'Acabados', 'Articulos', 'AcaTonalidades', 'Subfamilias',
  'Estructuras', 'EstructurasDiseño', 'EstructurasArticulos', 'EstructurasSeriesAsoc', 'ConfigSeries',
  'Conjuntos', 'ConjuntosLin', 'ConjuntosOpcionesHerraje', 'TAcristalamientoLin', 'ArticulosCoste',
  'ArticulosPVP', 'ConjuntosDescuentos', 'ConjuntosAsoc', 'FamiliasGruposAsoc', 'SeriesAsocV2TiposHoja',
  'MOConceptos', 'ArticulosIncrPrecio']
export function exportarCatalogo(mdb: string, destino: string) {
  const antes = hash(readFileSync(mdb))
  execFileSync(process.execPath, ['export_datos/herramientas/exportar-csv.mjs', mdb, destino, ...TABLAS_CATALOGO], { stdio: 'inherit' })
  if (hash(readFileSync(mdb)) !== antes) throw new Error('La copia cambió durante la exportación')
  const csvs = Object.fromEntries(TABLAS_CATALOGO.map(t => [t, hash(readFileSync(join(destino, `${t}.csv`)))]))
  writeFileSync(join(destino, 'procedencia.json'), JSON.stringify({ mdb: resolve(mdb), sha256: antes, csvs }, null, 2))
}
export function verificarCatalogo(origen: string, fuenteHash: string) {
  const p = JSON.parse(readFileSync(join(origen, 'procedencia.json'), 'utf8')) as { sha256: string; csvs: Record<string, string> }
  if (p.sha256 !== fuenteHash) throw new Error('Banco y catálogo proceden de copias distintas')
  for (const t of TABLAS_CATALOGO) if (p.csvs[t] !== hash(readFileSync(join(origen, `${t}.csv`)))) throw new Error(`CSV alterado: ${t}`)
  return p.sha256
}
