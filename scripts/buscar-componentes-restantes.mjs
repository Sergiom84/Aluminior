/**
 * ¿Dónde se resuelven los DisComponente que la serie no resuelve por
 * ConjuntosLin? (58 escuadra, 39 mano de obra, 51/50 inf hoja, 52/56 infHAB,
 * 71 zona apertura, 1 cristal, 130 manilla, PRC compás)
 *
 * Busca cada componente en: ConjuntosLin (cualquier conjunto),
 * ConjuntosAsoc.ComponenteAsoc, ConfigSeriesAsoc.ComponenteAsoc.
 *
 * Solo lectura. Uso: node scripts/buscar-componentes-restantes.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})
const col = (f, n) => (f[n] ?? '').trim()

const RESTANTES = ['58', '39', '51', '50', '52', '56', '71', '1', '130', 'PRC']
const PREFIJO_GM = /^GM/ // conjuntos de la familia de la serie de prueba

const conjuntosLin = leer('ConjuntosLin.csv')
const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const configSeriesAsoc = leer('ConfigSeriesAsoc.csv')

console.log('=== ConjuntosLin: conjuntos GM* que resuelven cada componente ===')
for (const c of RESTANTES) {
  const filas = conjuntosLin.filter((f) =>
    col(f, 'Componente') === c && col(f, 'Articulo') && col(f, 'Articulo') !== '0' && PREFIJO_GM.test(col(f, 'Conjunto')))
  const muestra = filas.slice(0, 4).map((f) => `${col(f, 'Conjunto')}->${col(f, 'Articulo')}`).join('  ')
  console.log(`  ${c.padEnd(5)} ${String(filas.length).padStart(4)} filas   ${muestra}`)
}

console.log('\n=== ConjuntosAsoc: filas GM* con ComponenteAsoc en la lista ===')
for (const c of RESTANTES) {
  const filas = conjuntosAsoc.filter((f) => col(f, 'ComponenteAsoc') === c && PREFIJO_GM.test(col(f, 'Conjunto')))
  const muestra = filas.slice(0, 3).map((f) =>
    `${col(f, 'Conjunto')}->${col(f, 'Articulo')} (L:${col(f, 'FormulaL')})`).join('  ')
  console.log(`  ${c.padEnd(5)} ${String(filas.length).padStart(4)} filas   ${muestra}`)
}

console.log('\n=== ConfigSeriesAsoc: filas GM* con ComponenteAsoc en la lista ===')
for (const c of RESTANTES) {
  const filas = configSeriesAsoc.filter((f) => col(f, 'ComponenteAsoc') === c && PREFIJO_GM.test(col(f, 'Conjunto')))
  const muestra = filas.slice(0, 3).map((f) =>
    `${col(f, 'Conjunto')}[${col(f, 'TipoHoja')}]->${col(f, 'Articulo')}`).join('  ')
  console.log(`  ${c.padEnd(5)} ${String(filas.length).padStart(4)} filas   ${muestra}`)
}

// Vista general: qué pinta tienen las filas de ConjuntosAsoc para GMA100 y sus herr*
console.log('\n=== ConjuntosAsoc para GMA100 y GM0019-GM0023 (primeras 25) ===')
const interes = new Set(['GMA100', 'GM0019', 'GM0020', 'GM0021', 'GM0022', 'GM0023'])
const filas = conjuntosAsoc.filter((f) => interes.has(col(f, 'Conjunto')))
console.log(`  total: ${filas.length} filas`)
for (const f of filas.slice(0, 25)) {
  console.log(`  ${col(f, 'Conjunto').padEnd(8)} art:${col(f, 'Articulo').padEnd(10)} cant:${col(f, 'Cantidad').padEnd(3)} compAsoc:${col(f, 'ComponenteAsoc').padEnd(5)} famAsoc:${col(f, 'FamiliaAsoc').padEnd(4)} apertTH:${col(f, 'AperturaTH').padEnd(6)} L:${col(f, 'FormulaL').padEnd(12)} A:${col(f, 'FormulaA')}`)
}
