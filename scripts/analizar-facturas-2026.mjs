/** Lee solo la extracción técnica verificada y guarda IDs únicamente en output/. */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { analizarCoberturaFacturas } from './lib/cobertura-facturas-2026.mjs'

const carpeta = process.argv[2]
if (!carpeta) throw new Error('Uso: node scripts/analizar-facturas-2026.mjs output/facturas-2026')
const ruta = resolve(carpeta)
const rutaOutput = resolve('output')
if (!ruta.startsWith(rutaOutput + '\\') && !ruta.startsWith(rutaOutput + '/')) {
  throw new Error('La extracción debe estar en output/')
}
const manifiesto = JSON.parse(readFileSync(join(ruta, 'manifiesto.json'), 'utf8'))
const fuentes = Object.fromEntries(Object.entries(manifiesto.recuentos).map(([nombre, recuento]) => {
  const filas = parse(readFileSync(join(ruta, `${nombre}.csv`)),
    { columns: true, bom: true, skip_empty_lines: true })
  if (filas.length !== recuento) throw new Error(`Recuento distinto en ${nombre}`)
  return [nombre, filas]
}))
const resultado = analizarCoberturaFacturas(fuentes)
writeFileSync(join(ruta, 'cobertura.json'), JSON.stringify({ fuenteSha256: manifiesto.fuenteSha256,
  ...resultado }, null, 2))
console.log(JSON.stringify({ fuenteSha256: manifiesto.fuenteSha256,
  ...resultado.resumen }, null, 2))
