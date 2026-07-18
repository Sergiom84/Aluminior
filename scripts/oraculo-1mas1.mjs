/**
 * Oráculo: compara la PLANTILLA de la estructura "1+1" (ranuras genéricas)
 * con INSTANCIAS reales de documentos ya calculadas por el sistema original.
 * La instancia contiene el artículo real que sustituyó a cada ranura: es la
 * respuesta correcta contra la que medir cualquier mecanismo de resolución.
 *
 * Solo lectura. Uso: node scripts/oraculo-1mas1.mjs
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

const filas = leer('EstructurasArticulos.csv').filter((f) => (f.Estructura ?? '').trim() === '1+1')
const articulos = leer('Articulos.csv')
const desc = new Map(articulos.map((a) => [(a.Codigo ?? '').trim(), (a.Descripcion ?? '').trim()]))

const plantilla = filas.filter((f) => !(f.TipoDoc ?? '').trim())
const instancias = filas.filter((f) => (f.TipoDoc ?? '').trim())

console.log(`Filas de "1+1": ${filas.length} — plantilla ${plantilla.length}, instancias ${instancias.length}`)

// Documentos distintos
const docs = new Map()
for (const f of instancias) {
  const k = `${f.TipoDoc}|${f.nDoc}|${f.nLinEstr}`
  if (!docs.has(k)) docs.set(k, [])
  docs.get(k).push(f)
}
console.log(`Instancias de documento distintas: ${docs.size}`)

const col = (f, n) => (f[n] ?? '').trim()

console.log('\n=== PLANTILLA (ranuras) ===')
console.log(`${'Articulo'.padEnd(8)} ${'Funcion'.padEnd(10)} ${'DisComp'.padEnd(8)} ${'FormulaLargoCorte'.padEnd(20)} descripción`)
for (const f of plantilla) {
  console.log(`${col(f, 'Articulo').padEnd(8)} ${col(f, 'Funcion').padEnd(10)} ${col(f, 'DisComponente').padEnd(8)} ${col(f, 'FormulaLargoCorte').padEnd(20)} ${(desc.get(col(f, 'Articulo')) ?? '').slice(0, 45)}`)
}

// Una instancia completa, la primera
const [clave, lineas] = [...docs.entries()][0] ?? []
if (lineas) {
  console.log(`\n=== INSTANCIA ${clave} (TipoDoc|nDoc|nLinEstr) ===`)
  console.log(`${'Articulo'.padEnd(10)} ${'Funcion'.padEnd(10)} ${'DisComp'.padEnd(8)} ${'FormulaLargoCorte'.padEnd(20)} descripción`)
  for (const f of lineas) {
    console.log(`${col(f, 'Articulo').padEnd(10)} ${col(f, 'Funcion').padEnd(10)} ${col(f, 'DisComponente').padEnd(8)} ${col(f, 'FormulaLargoCorte').padEnd(20)} ${(desc.get(col(f, 'Articulo')) ?? '').slice(0, 45)}`)
  }
}

// ¿Cuántas instancias distintas y qué artículos usan para las funciones MV/MH/TM?
console.log('\n=== Artículos usados en instancias, por Función ===')
const porFuncion = new Map()
for (const f of instancias) {
  const fn = col(f, 'Funcion') || '(sin)'
  if (!porFuncion.has(fn)) porFuncion.set(fn, new Map())
  const arts = porFuncion.get(fn)
  const a = col(f, 'Articulo')
  arts.set(a, (arts.get(a) ?? 0) + 1)
}
for (const [fn, arts] of [...porFuncion.entries()].sort((a, b) => b[1].size - a[1].size)) {
  const top = [...arts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([a, n]) => `${a}(${n})`).join(' ')
  console.log(`  ${fn.padEnd(10)} ${arts.size} artículos distintos: ${top}`)
}
