/**
 * Inspecciona las líneas de un presupuesto real para localizar dónde vive el
 * despiece RESUELTO (artículos reales con medidas de corte).
 *
 * Solo lectura. Uso: node scripts/inspeccionar-doc.mjs [nDoc]
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const col = (f, n) => (f[n] ?? '').trim()

const lin = parse(readFileSync(join(ORIGEN, 'VPresupuestosLin.csv')), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})
console.log(`VPresupuestosLin: ${lin.length} filas`)

// Documentos con líneas de estructura
const nDocArg = process.argv[2]
let nDoc = nDocArg
if (!nDoc) {
  // el primero que tenga EstructuraSN=True y líneas de despiece generado
  const candidatos = new Map()
  for (const f of lin) {
    if (col(f, 'DespieceArticuloGeneradoSN') === 'True') {
      candidatos.set(col(f, 'nDoc'), (candidatos.get(col(f, 'nDoc')) ?? 0) + 1)
    }
  }
  console.log(`Docs con despiece generado: ${candidatos.size}`)
  nDoc = [...candidatos.keys()][0]
}
if (!nDoc) {
  // no hay DespieceArticuloGeneradoSN: contar marcas alternativas
  let estrSN = 0, hojaCorte = 0, conLargoCorte = 0
  for (const f of lin) {
    if (col(f, 'EstructuraSN') === 'True') estrSN++
    if (col(f, 'HojaCorteSN') === 'True') hojaCorte++
    if (col(f, 'LargoCorte') && col(f, 'LargoCorte') !== '0') conLargoCorte++
  }
  console.log(`EstructuraSN=True: ${estrSN}  HojaCorteSN=True: ${hojaCorte}  LargoCorte>0: ${conLargoCorte}`)
  // coger el primer doc con EstructuraSN
  const f = lin.find((f) => col(f, 'EstructuraSN') === 'True')
  nDoc = f ? col(f, 'nDoc') : null
}
if (!nDoc) { console.log('No se encontró documento de ejemplo'); process.exit(0) }

console.log(`\n=== Documento nDoc=${nDoc} ===`)
const filas = lin.filter((f) => col(f, 'nDoc') === String(nDoc))
console.log(`${filas.length} líneas\n`)
const CAMPOS = ['nLinea', 'nOrden', 'nEstr', 'EstructuraSN', 'Articulo', 'Funcion', 'Cdad', 'Largo', 'Ancho', 'LargoCorte', 'TipoCorte', 'Coste', 'Precio', 'DespieceArticuloGeneradoSN', 'nLinAsoc', 'Descripcion']
console.log(CAMPOS.join(' | '))
for (const f of filas.slice(0, 60)) {
  console.log(CAMPOS.map((c) => col(f, c).slice(0, c === 'Descripcion' ? 38 : 12)).join(' | '))
}
