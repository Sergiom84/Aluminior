/** Solo lectura de tres CSV históricos; salida técnica minimizada en output/ ignorado. */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { parse } from 'csv-parse/sync'
import { construirBanco } from './lib/banco-precios.mjs'

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)))
const origen = process.argv[2]
if (!origen) throw new Error('Uso: node scripts/banco-precios.mjs <carpeta CSV autorizada>')
const catalogo = JSON.parse(readFileSync(join(raiz, 'output/escaparate/catalogo.json'), 'utf8'))
const candidatas = catalogo.resultados.filter(c => c.estado === 'dibujable')
const fuentes = []
const leer = tabla => {
  const contenido = readFileSync(join(resolve(origen), `${tabla}.csv`))
  fuentes.push({ tabla, sha256: createHash('sha256').update(contenido).digest('hex') })
  return parse(contenido, { columns: true, bom: true })
}
const banco = construirBanco(candidatas, leer('VPresupuestosLin'), leer('VDatosLinEstr'), leer('VOpcionesHerraje'))
const destino = join(raiz, 'output/banco-precios')
mkdirSync(destino, { recursive: true })
writeFileSync(join(destino, 'casos.json'), JSON.stringify({ fuentes, ...banco }, null, 2))
writeFileSync(join(destino, 'resumen.json'), JSON.stringify(banco.resumen, null, 2))
console.log(JSON.stringify(banco.resumen, null, 2))
