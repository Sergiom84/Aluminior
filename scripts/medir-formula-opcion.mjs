/**
 * MEDICIÓN: `ConjuntosAsoc.FormulaOpcion`, una condición de opciones
 * COMPUESTA que el predictor no implementa.
 *
 * Buscando el discriminante de los 24 casos de S.9.1 apareció esta columna:
 * valores como "O926*O4". Las opciones 926/927 son las de hoja pasiva que
 * S.1 ya identificó, así que `O<n>` es "la opción n está marcada" y `*`
 * parece conjunción. Sería una condición ADICIONAL a `nOpcion`: una fila
 * puede pasar el filtro de `nOpcion` y aun así no aplicarse.
 *
 * v5 sólo comprueba `nOpcion`, de modo que cada fila con `FormulaOpcion`
 * que no se cumpla es un falso positivo garantizado.
 *
 * Aquí se mide: alcance de la columna, gramática real de sus valores, y
 * efecto de aplicarla contra el oráculo.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-formula-opcion.mjs
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
const num = (f, n) => Number(col(f, n).replace(',', '.')) || 0

const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const articulos = leer('Articulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

// --- 1. alcance y gramática ---
const conFormula = conjuntosAsoc.filter((f) => col(f, 'FormulaOpcion'))
console.log(`Filas con FormulaOpcion: ${conFormula.length} de ${conjuntosAsoc.length}`)
const frec = new Map()
for (const f of conFormula) {
  const v = col(f, 'FormulaOpcion')
  frec.set(v, (frec.get(v) ?? 0) + 1)
}
console.log(`Valores distintos: ${frec.size}`)
for (const [v, n] of [...frec].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
  console.log(`  ${String(n).padStart(5)}  ${JSON.stringify(v)}`)
}
// ¿qué caracteres aparecen? define la gramática que hay que soportar
const chars = new Set()
for (const v of frec.keys()) for (const c of v.replace(/O\d+/g, '')) chars.add(c)
console.log(`\nOperadores presentes (fuera de O<n>): ${JSON.stringify([...chars].join(''))}`)

// artículos afectados
const artsAfectados = new Map()
for (const f of conFormula) {
  const a = col(f, 'Articulo')
  artsAfectados.set(a, (artsAfectados.get(a) ?? 0) + 1)
}
console.log(`\nArtículos afectados: ${artsAfectados.size}`)
for (const [a, n] of [...artsAfectados].sort((x, y) => y[1] - x[1]).slice(0, 12)) {
  console.log(`  ${String(n).padStart(4)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 40)}`)
}

// --- 2. efecto contra el oráculo ---
const opcionesDoc = leer('VOpcionesHerraje.csv')
const estArt = leer('EstructurasArticulos.csv')
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]

const opcionesPorLinea = new Map()
for (const f of opcionesDoc) {
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcionesPorLinea.has(k)) opcionesPorLinea.set(k, new Map())
  const porConj = opcionesPorLinea.get(k)
  const cj = col(f, 'Conjunto')
  if (!porConj.has(cj)) porConj.set(cj, new Set())
  if (col(f, 'SelecSN') === 'True') porConj.get(cj).add(col(f, 'nOpcion'))
}
const ranurasInstancia = new Map()
for (const f of estArt) {
  const t = col(f, 'TipoDoc')
  if (!t) continue
  const dis = col(f, 'DisComponente')
  if (!dis || dis === '0') continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!ranurasInstancia.has(k)) ranurasInstancia.set(k, new Map())
  const m = ranurasInstancia.get(k)
  m.set(dis, (m.get(dis) ?? 0) + (num(f, 'Cantidad') || 1))
}

/**
 * Evalúa la fórmula de opciones. `O<n>` = 1 si la opción n está marcada en
 * el conjunto de la fila, 0 si no. `*` es producto (conjunción) y `+` suma
 * (disyunción). Si aparece algún operador no soportado devuelve null: no se
 * adivina, se declara desconocido.
 */
function evaluarOpcion(formula, marcadas) {
  if (!/^[O0-9*+ ]+$/.test(formula)) return null
  let total = 0
  for (const termino of formula.split('+')) {
    let prod = 1
    for (const factor of termino.split('*')) {
      const m = factor.trim().match(/^O(\d+)$/)
      if (!m) return null
      prod *= marcadas.has(m[1]) ? 1 : 0
    }
    total += prod
  }
  return total > 0
}

const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
let filasEvaluadas = 0, pasan = 0, noPasan = 0, sinGramatica = 0
let fpEvitados = 0, tpPerdidos = 0
const detalle = new Map()
for (const doc of DOCS) {
  const vLin = leer(doc.lin)
  const hijasPorPadre = new Map()
  for (const f of vLin) {
    const p = col(f, 'nEstr')
    if (!p || p === '0') continue
    if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
    hijasPorPadre.get(p).push(f)
  }
  for (const p of vLin) {
    if (col(p, 'EstructuraSN') !== 'True') continue
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    const opciones = opcionesPorLinea.get(k)
    const ranuras = ranurasInstancia.get(k)
    if (!opciones || !ranuras) continue
    const reales = new Set()
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
      const fam = famPorArt.get(art) ?? ''
      if (fam === '050' || fam === '051') continue
      reales.add(art)
    }
    if (!reales.size) continue
    for (const [cj, marcadas] of opciones) {
      for (const f of conjuntosAsoc) {
        if (col(f, 'Conjunto') !== cj) continue
        const formula = col(f, 'FormulaOpcion')
        if (!formula) continue
        // sólo cuenta si la fila ya pasaría el filtro actual de v5
        const nOp = col(f, 'nOpcion')
        if (nOp && nOp !== '0' && !marcadas.has(nOp)) continue
        const comp = col(f, 'ComponenteAsoc')
        if (comp && comp !== '!' && comp !== 'A' && comp !== 'L' && comp !== '59R' && !ranuras.has(comp)) continue
        filasEvaluadas++
        const r = evaluarOpcion(formula, marcadas)
        if (r === null) { sinGramatica++; continue }
        const art = col(f, 'Articulo')
        if (r) pasan++
        else {
          noPasan++
          // la fila se descartaría: ¿acierto o pérdida?
          if (reales.has(art)) tpPerdidos++
          else {
            fpEvitados++
            detalle.set(art, (detalle.get(art) ?? 0) + 1)
          }
        }
      }
    }
  }
}
console.log(`\n--- efecto de aplicar FormulaOpcion sobre el oráculo ---`)
console.log(`  filas con FormulaOpcion que hoy pasan el filtro de v5: ${filasEvaluadas}`)
console.log(`  la fórmula se cumple (siguen pasando):                 ${pasan}`)
console.log(`  la fórmula NO se cumple (se descartarían):             ${noPasan}`)
console.log(`  gramática no soportada (no se adivina):                ${sinGramatica}`)
console.log(`\n  de las descartadas: ${fpEvitados} son artículos AUSENTES del oráculo (falsos positivos evitados)`)
console.log(`                      ${tpPerdidos} son artículos PRESENTES en el oráculo (se perderían)`)
if (detalle.size) {
  console.log('\n  falsos positivos que se evitarían:')
  for (const [a, n] of [...detalle].sort((x, y) => y[1] - x[1]).slice(0, 10)) {
    console.log(`    ${String(n).padStart(4)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 40)}`)
  }
}
