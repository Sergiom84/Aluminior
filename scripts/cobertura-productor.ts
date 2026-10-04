/** Solo lectura local; genera únicamente agregados, sin documentos ni importes individuales. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { parse } from 'csv-parse/sync'
import { construirContraste } from './lib/banco-contraste/extraer.ts'
import { verificarCatalogo } from './lib/banco-contraste/catalogo.ts'
import type { Caso, Medicion, Tablas } from './lib/banco-contraste/datos.ts'
import { medirCobertura } from './lib/cobertura-productor/medir.ts'
import { informeCobertura } from './lib/cobertura-productor/informe.ts'

const carpeta = resolve(process.argv[2] ?? 'export_datos/banco-contraste')
const destino = resolve(process.argv[3] ?? 'docs/paridad/COBERTURA-MODELO-SERIE-2026-10-03.md')
if (destino !== resolve('docs/paridad/COBERTURA-MODELO-SERIE-2026-10-03.md')) throw new Error('Destino de informe no permitido')
const huellas = new Map<string, string>()
const hash = (b: Buffer) => createHash('sha256').update(b).digest('hex')
function leer(nombre: string) {
  const ruta = join(carpeta, nombre), b = readFileSync(ruta)
  huellas.set(ruta, hash(b))
  return b.toString('utf8')
}
const banco = JSON.parse(leer('banco.json')) as { casos: Caso[]; elementos: Caso[]; evidencia: unknown }
const resultado = JSON.parse(leer('resultados.json')) as {
  mediciones: Medicion[]; resumen: { total: { lineas: number; igual: number; cercano: number; distinto: number; 'sin valorar': number; error: number } };
  revisionGit: string; ejecutado: string;
}
const manifiesto = JSON.parse(leer('manifiesto.json')) as { sha256: string; extraido: string; recuentos: Record<string, number> }
const tablas = JSON.parse(leer('tablas.json')) as Tablas
if (!isDeepStrictEqual(construirContraste(tablas), banco)) throw new Error('Banco no corresponde a tablas.json')
for (const [tabla, cantidad] of Object.entries(manifiesto.recuentos)) assert.equal(tablas[tabla]?.length, cantidad, 'Manifiesto no corresponde a tablas')
const p = JSON.parse(leer('catalogo/procedencia.json')) as { sha256: string; csvs: Record<string, string> }
for (const tabla of Object.keys(p.csvs)) leer(`catalogo/${tabla}.csv`)
verificarCatalogo(join(carpeta, 'catalogo'), manifiesto.sha256)
const csv = (tabla: string) => parse(readFileSync(join(carpeta, 'catalogo', `${tabla}.csv`)), { columns: true, bom: true }) as Record<string, string>[]
const codigos = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort()
const modelos = codigos(csv('Estructuras').map(f => f.Codigo!.trim()))
const series = codigos(csv('ConfigSeries').map(f => f.Serie!.trim()))
const elegibles = banco.casos.filter(c => !c.exclusiones.length && c.tipo !== 'GRUPO')
const inventario = { modelos, series,
  modelosSinElegibles: modelos.filter(m => !elegibles.some(c => c.modelo === m)),
  seriesSinElegibles: series.filter(s => !elegibles.some(c => c.serie === s)),
}
const cobertura = medirCobertura(banco.casos, resultado.mediciones)
const t = cobertura.total, anterior = resultado.resumen.total
assert.deepEqual([t.elegibles, t.precioIgual, t.cercano, t.distinto, t.sinValorar, t.error],
  [anterior.lineas, anterior.igual, anterior.cercano, anterior.distinto, anterior['sin valorar'], anterior.error], 'Resumen económico no reconciliado')
const informe = informeCobertura(cobertura, {
  'Copia de origen SHA-256 (manifiesto)': manifiesto.sha256,
  'Extracción conservada': manifiesto.extraido,
  'Ejecución conservada en resultados': resultado.ejecutado,
  'revisionGit conservada en resultados': resultado.revisionGit,
  ...Object.fromEntries(['banco.json', 'resultados.json', 'tablas.json', 'manifiesto.json', 'catalogo/procedencia.json']
    .map(n => [`SHA-256 ${n}`, huellas.get(join(carpeta, n))!])),
}, inventario)
for (const [ruta, antes] of huellas) assert.equal(hash(readFileSync(ruta)), antes, 'Fuente cambió durante el análisis')
writeFileSync(destino, informe)
console.log(JSON.stringify({ informe: destino, pares: cobertura.pares.length, ...t, inventario: {
  modelos: modelos.length, series: series.length, modelosSinElegibles: inventario.modelosSinElegibles.length,
  seriesSinElegibles: inventario.seriesSinElegibles.length,
} }, null, 2))
