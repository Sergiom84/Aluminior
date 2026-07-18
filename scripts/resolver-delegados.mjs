/**
 * Hipótesis 1 (anexo I, fase 1): los genéricos que la serie no resuelve
 * directamente los resuelven sus conjuntos DELEGADOS.
 *
 * El registro de la serie en Conjuntos declara TablaHojas(1-5), TablaFijos(1-5),
 * TablaDobleH(1-5), SubSerieDe y decenas de herr* / mo*. El script anterior
 * (resolver-genericos.mjs) solo miraba conjuntos con CodSerie = serie, así que
 * nunca vio los delegados (GM08 no tiene CodSerie = GMA100).
 *
 * Este script:
 *   A. Búsqueda inversa: ¿qué conjuntos resuelven los genéricos 2, 3, 97, 105?
 *   B. Cadena de delegación transitiva desde cada serie, y cobertura de los
 *      14 genéricos del despiece de "1+1".
 *
 * Solo lectura de CSV. Uso: node scripts/resolver-delegados.mjs
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

const conjuntos = leer('Conjuntos.csv')
const conjuntosLin = leer('ConjuntosLin.csv')
const coste = leer('ArticulosCoste.csv')
const articulos = leer('Articulos.csv')

const conCoste = new Set(coste.map((c) => (c.Articulo ?? '').trim()))
const descArticulo = new Map(articulos.map((a) => [(a.Codigo ?? '').trim(), (a.Descripcion ?? '').trim()]))

// Índice: conjunto -> (componente -> articulo real)
const porConjunto = new Map()
for (const f of conjuntosLin) {
  const cj = (f.Conjunto ?? '').trim()
  const comp = (f.Componente ?? '').trim()
  const art = (f.Articulo ?? '').trim()
  if (!cj || !comp || !art || art === '0') continue
  if (!porConjunto.has(cj)) porConjunto.set(cj, new Map())
  porConjunto.get(cj).set(comp, art)
}

// Registro de cada conjunto en Conjuntos, por código
const fichaConjunto = new Map(conjuntos.map((c) => [(c.Codigo ?? '').trim(), c]))

// --- A. Búsqueda inversa: quién resuelve los genéricos problemáticos ---
const PROBLEMA = ['2', '3', '97', '105']
console.log('=== A. Conjuntos que resuelven los genéricos sin resolver ===')
for (const g of PROBLEMA) {
  const donde = []
  for (const [cj, mapa] of porConjunto) {
    if (mapa.has(g)) donde.push(`${cj} -> ${mapa.get(g)}`)
  }
  console.log(`\n  genérico ${g}: ${donde.length} conjunto(s)`)
  for (const d of donde.slice(0, 10)) console.log(`    ${d}`)
  if (donde.length > 10) console.log(`    ... y ${donde.length - 10} más`)
}

// --- B. Delegación transitiva desde la serie ---
// Columnas de Conjuntos cuyo valor es OTRO conjunto (delegación)
const COLS_DELEGA = Object.keys(conjuntos[0] ?? {}).filter((k) =>
  /^(TablaHojas\d?|TablaFijos\d?|TablaDobleH\d?|SubSerieDe|herr.+)$/.test(k),
)
console.log(`\n=== B. Delegación transitiva ===`)
console.log(`Columnas de delegación consideradas: ${COLS_DELEGA.length}`)

function expandir(codigo, vistos = new Set()) {
  if (!codigo || vistos.has(codigo)) return vistos
  vistos.add(codigo)
  const ficha = fichaConjunto.get(codigo)
  if (!ficha) return vistos
  for (const col of COLS_DELEGA) {
    const v = (ficha[col] ?? '').trim()
    if (v && v !== '0' && fichaConjunto.has(v)) expandir(v, vistos)
  }
  return vistos
}

const GENERICOS = ['1', '2', '3', '10', '15', '97', '105', '148', '73', '8', '47', '72', '85', '205']

// Las series son los conjuntos con CodSerie == su propio código o listados como serie.
// Reutilizamos el criterio del anexo I: serie = conjunto con el mismo nombre.
const SERIES_PRUEBA = ['GMA100']
console.log(`\nSerie de prueba: ${SERIES_PRUEBA[0]} — despiece de "1+1" (14 genéricos)`)

for (const serie of SERIES_PRUEBA) {
  const cadena = [...expandir(serie)]
  console.log(`\n  Cadena de delegación (${cadena.length}): ${cadena.join(', ')}`)
  console.log(`\n  ${'genérico'.padEnd(9)} ${'resuelto por'.padEnd(14)} ${'artículo'.padEnd(10)} coste  descripción`)
  let resueltos = 0, valorables = 0
  for (const g of GENERICOS) {
    let hallado = null
    for (const cj of cadena) {
      const art = porConjunto.get(cj)?.get(g)
      if (art) { hallado = { cj, art }; break }
    }
    if (hallado) {
      resueltos++
      const tiene = conCoste.has(hallado.art)
      if (tiene) valorables++
      console.log(`  ${g.padEnd(9)} ${hallado.cj.padEnd(14)} ${hallado.art.padEnd(10)} ${tiene ? ' sí ' : ' NO '}  ${(descArticulo.get(hallado.art) ?? '').slice(0, 40)}`)
    } else {
      console.log(`  ${g.padEnd(9)} ${'—'.padEnd(14)} ${'—'.padEnd(10)}  —`)
    }
  }
  console.log(`\n  Resueltos ${resueltos}/${GENERICOS.length}, con coste ${valorables}/${GENERICOS.length}`)
}
