/** Investigación de catálogo, sin documentos, MDB ni conexiones a bases de datos.
 * Uso: node scripts/herraje-catalogo.mjs <carpeta CSV histórica>
 * Sólo emite recuentos y ejemplos de códigos de catálogo; no escribe archivos.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

const carpeta = process.argv[2]
if (!carpeta) throw new Error('Indique una carpeta CSV de catálogo autorizada')
const leer = nombre => parse(readFileSync(join(carpeta, `${nombre}.csv`)), {
  columns: true, bom: true, skip_empty_lines: true,
})
const texto = valor => (valor ?? '').trim()
const estructuras = leer('Estructuras')
const series = leer('ConfigSeries')
const accesorios = leer('ConfigSeriesHerraje')
const campos = ['Abat1H', 'Abat2H', 'Abat1OB', 'Abat2OB', 'Corr2H']
const conjuntos = new Set(leer('Conjuntos').map(f => texto(f.Codigo)))
const conOpciones = new Set(leer('ConjuntosOpcionesHerraje').map(f => texto(f.Conjunto)))

console.log(JSON.stringify({
  estructuras: estructuras.length,
  asignacionesEstructura: Object.fromEntries([1, 2, 3, 4].map(i => [
    `Conjunto${i}`, estructuras.filter(f => texto(f[`Conjunto${i}`])).length,
  ])),
  series: series.length,
  configuracionAccesorios: accesorios.length,
  filasConAccesorio: accesorios.filter(f => texto(f.Accesorio)).length,
  campos: Object.fromEntries(campos.map(campo => {
    const valores = series.map(f => texto(f[campo])).filter(Boolean)
    return [campo, {
      seriesConCodigo: valores.length,
      codigosDistintos: new Set(valores).size,
      referenciasSinConjunto: valores.filter(v => !conjuntos.has(v)).length,
      referenciasSinOpciones: valores.filter(v => !conOpciones.has(v)).length,
    }]
  })),
  ejemplos: series.filter(f => ['GMA65OPT', 'ELEGANTPVC'].includes(f.Serie))
    .map(f => Object.fromEntries(['Serie', ...campos].map(c => [c, texto(f[c])]))),
}, null, 2))
