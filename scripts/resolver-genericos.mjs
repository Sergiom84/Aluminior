/**
 * Verifica la cadena completa de resolución:
 *
 *   Serie -> Conjuntos (CodSerie) -> ConjuntosLin (Componente genérico) -> Artículo real
 *
 * Si la hipótesis es correcta, para una serie concreta debe poderse traducir
 * cada ranura genérica del despiece a un perfil que sí tenga precio o coste.
 *
 * Uso: node scripts/resolver-genericos.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})

const conjuntos = leer('Conjuntos.csv')
const conjuntosLin = leer('ConjuntosLin.csv')
const coste = leer('ArticulosCoste.csv')

// --- 1. ¿Cuántas filas de ConjuntosLin resuelven de verdad? ---
const conArticulo = conjuntosLin.filter((f) => (f.Articulo ?? '').trim())
console.log(`ConjuntosLin           : ${conjuntosLin.length} filas`)
console.log(`  con artículo real    : ${conArticulo.length} (${Math.round(100*conArticulo.length/conjuntosLin.length)}%)`)

// --- 2. Serie -> conjuntos ---
const porSerie = new Map()
for (const c of conjuntos) {
  const s = (c.CodSerie ?? '').trim()
  if (!s) continue
  if (!porSerie.has(s)) porSerie.set(s, [])
  porSerie.get(s).push((c.Codigo ?? '').trim())
}
console.log(`\nSeries con conjuntos   : ${porSerie.size}`)

// --- 3. Índice conjunto+componente -> artículo ---
const mapa = new Map()
for (const f of conArticulo) {
  mapa.set(`${(f.Conjunto ?? '').trim()}|${(f.Componente ?? '').trim()}`, (f.Articulo ?? '').trim())
}

// --- 4. Artículos con coste, para comprobar que lo resuelto sí se valora ---
const conCoste = new Set(coste.map((c) => (c.Articulo ?? '').trim()))
console.log(`Artículos con coste    : ${conCoste.size}`)

// --- 5. Prueba: despiece de 1+1 resuelto por cada serie ---
const GENERICOS = ['1', '2', '3', '10', '15', '97', '105', '148', '73', '8', '47', '72', '85', '205']

console.log('\n--- Resolución del despiece de "1+1" por serie ---')
console.log('  Serie          conjuntos  resueltos  con coste')

const resultados = []
for (const [serie, codigos] of porSerie) {
  let resueltos = 0, valorables = 0
  const vistos = new Set()
  for (const g of GENERICOS) {
    for (const cj of codigos) {
      const real = mapa.get(`${cj}|${g}`)
      if (real && !vistos.has(g)) {
        vistos.add(g); resueltos++
        if (conCoste.has(real)) valorables++
        break
      }
    }
  }
  if (resueltos > 0) resultados.push({ serie, conjuntos: codigos.length, resueltos, valorables })
}

resultados.sort((a, b) => b.resueltos - a.resueltos)
for (const r of resultados.slice(0, 12)) {
  console.log(
    `  ${r.serie.padEnd(14)} ${String(r.conjuntos).padStart(6)}  ${String(r.resueltos).padStart(9)}/${GENERICOS.length}  ${String(r.valorables).padStart(8)}`,
  )
}

// --- 6. Ejemplo concreto de traducción ---
const mejor = resultados[0]
if (mejor) {
  console.log(`\n--- Traducción con la serie "${mejor.serie}" ---`)
  const codigos = porSerie.get(mejor.serie)
  for (const g of GENERICOS.slice(0, 8)) {
    for (const cj of codigos) {
      const real = mapa.get(`${cj}|${g}`)
      if (real) {
        console.log(`  genérico ${g.padEnd(4)} -> ${real.padEnd(12)} (conjunto ${cj})${conCoste.has(real) ? '  [con coste]' : ''}`)
        break
      }
    }
  }
}
