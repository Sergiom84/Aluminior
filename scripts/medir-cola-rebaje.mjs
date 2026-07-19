/**
 * MEDICIÓN: ¿qué son las piezas que se salen de una regla de rebaje?
 *
 * T.12 dejó una decisión pendiente: con umbral del 90% hay 92 piezas que
 * salen con una medida incorrecta y sin aviso; subir el umbral las elimina
 * pero hunde la cobertura (100% -> 18,7% de piezas valoradas).
 *
 * Antes de aceptar ese compromiso conviene saber QUÉ son esas piezas. Dos
 * hipótesis con consecuencias opuestas:
 *
 *   H1. Son piezas mal emparejadas: su corte real corresponde en realidad a
 *       otra fórmula/otro papel de la misma estructura. Entonces no son un
 *       riesgo del rebaje sino un fallo del enlace, y arreglarlo sube la
 *       consistencia sin bajar la cobertura.
 *   H2. Son variación real del rebaje. Entonces el compromiso de T.12 es
 *       inevitable y hay que elegir umbral.
 *
 * Se contrasta comprobando si el delta atípico coincide con el rebaje de
 * OTRA regla del mismo perfil y eje.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-cola-rebaje.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { evaluar } from '../packages/core/src/despiece/formula.ts'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})
const col = (f, n) => (f[n] ?? '').trim()
const num = (f, n) => Number(col(f, n).replace(',', '.')) || 0
const TOL = 0.51

const estArt = leer('EstructurasArticulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
const vLin = leer('VPresupuestosLin.csv')
const detalles = leer('VDatosLinDetDis.csv')
const datosLin = leer('VDatosLinEstr.csv')
const articulos = leer('Articulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const detallePorLinea = new Map(detalles.map((f) => [col(f, 'nVLinea'), f]))
const plantillaHoja = new Map()
const formulasPorEstructuraEje = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const fn = col(f, 'Funcion')
  if (!FUNCIONES_HOJA.has(fn)) continue
  const idIt = col(f, 'DisIdIt')
  const formula = col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo')
  if (!formula) continue
  const e = col(f, 'Estructura')
  const ke = `${e}|${fn}`
  if (!formulasPorEstructuraEje.has(ke)) formulasPorEstructuraEje.set(ke, new Set())
  formulasPorEstructuraEje.get(ke).add(formula)
  if (!idIt || idIt === '0') continue
  const k = `${e}|${fn}|${idIt}`
  if (!plantillaHoja.has(k)) plantillaHoja.set(k, f)
}
const cotasDefecto = new Map(); const simboloPorId = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura'), s = col(f, 'Simbolo')
  if (!s) continue
  if (!cotasDefecto.has(e)) cotasDefecto.set(e, {})
  cotasDefecto.get(e)[s] = num(f, 'Cota')
  const id = col(f, 'Id'); if (id) simboloPorId.set(`${e}|${id}`, s)
}
const cotasInstancia = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const e = col(f, 'Estructura')
  const s = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  if (!s) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[s] = num(f, 'Cota')
}
const simboloDa = new Map(estructurasDa.map((f) => [`${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA')]))
for (const f of medidasDa) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const s = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!s) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[s] = num(f, 'Medida')
}
const seriePorLinea = new Map()
for (const f of datosLin) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  seriePorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

const obs = []
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const estructura = col(p, 'Articulo')
  const ancho = num(p, 'Ancho'), largo = num(p, 'Largo')
  if (ancho <= 0 || largo <= 0) continue
  const k = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const contexto = { L: largo, A: ancho, ...(cotasDefecto.get(estructura) ?? {}), ...(cotasInstancia.get(k) ?? {}) }
  for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
    const fn = col(h, 'Funcion')
    if (!FUNCIONES_HOJA.has(fn)) continue
    const perfil = col(h, 'Articulo')
    if (!perfil || perfil === '0') continue
    const corte = num(h, 'LargoCorte') || num(h, 'Largo')
    if (corte <= 0) continue
    const det = detallePorLinea.get(col(h, 'nLinea'))
    const idIt = det ? col(det, 'DisIdIt') : ''
    if (!idIt || idIt === '0') continue
    const fila = plantillaHoja.get(`${estructura}|${fn}|${idIt}`)
    if (!fila) continue
    const formula = col(fila, 'FormulaLargoCorte') || col(fila, 'FormulaLargo')
    let previsto
    try { previsto = evaluar(formula, contexto) } catch { continue }
    obs.push({ perfil, fn, formula, corte, previsto, estructura, contexto, k, serie: seriePorLinea.get(k) ?? '' })
  }
}

// grupos y sus reglas al 90%
const grupos = new Map()
for (const o of obs) {
  const c = `${o.perfil}|${o.fn}|${o.formula}|${o.serie}`
  if (!grupos.has(c)) grupos.set(c, [])
  grupos.get(c).push(o)
}
const reglaDe = new Map()
for (const [c, g] of grupos) {
  if (g.length < 3) continue
  const deltas = g.map((o) => o.previsto - o.corte)
  let mejor = null, mejorN = 0
  for (const d of deltas) {
    const n = deltas.filter((x) => Math.abs(x - d) <= TOL).length
    if (n > mejorN) { mejorN = n; mejor = d }
  }
  if (mejorN / deltas.length < 0.9) continue
  if (new Set(g.map((o) => Math.round(o.previsto))).size <= 1) continue
  reglaDe.set(c, mejor)
}

// las piezas que se salen de su regla
const atipicas = []
for (const [c, g] of grupos) {
  const r = reglaDe.get(c)
  if (r === undefined) continue
  for (const o of g) {
    if (Math.abs((o.previsto - o.corte) - r) > TOL) atipicas.push({ ...o, clave: c, regla: r })
  }
}
console.log(`Reglas al 90%: ${reglaDe.size}   piezas que se salen de su regla: ${atipicas.length}\n`)

// H1: ¿el corte real encaja con OTRA fórmula de la misma estructura y eje?
let explicadasPorOtraFormula = 0, explicadasPorOtraRegla = 0, sinExplicar = 0
const ejemplos = []
for (const a of atipicas) {
  const otras = [...(formulasPorEstructuraEje.get(`${a.estructura}|${a.fn}`) ?? [])].filter((f) => f !== a.formula)
  let encaja = null
  for (const f of otras) {
    let v
    try { v = evaluar(f, a.contexto) } catch { continue }
    if (Math.abs((v - a.corte) - a.regla) <= TOL) { encaja = f; break }
  }
  if (encaja) { explicadasPorOtraFormula++; continue }
  // ¿el delta coincide con el rebaje de otra regla del mismo perfil y eje?
  const d = a.previsto - a.corte
  const otraRegla = [...reglaDe.entries()].find(([c2, r2]) =>
    c2.startsWith(`${a.perfil}|${a.fn}|`) && c2 !== a.clave && Math.abs(d - r2) <= TOL)
  if (otraRegla) { explicadasPorOtraRegla++; continue }
  sinExplicar++
  if (ejemplos.length < 10) {
    ejemplos.push(`${a.perfil} ${a.fn} regla=${a.regla.toFixed(1)} delta=${d.toFixed(1)} previsto=${a.previsto.toFixed(0)} real=${a.corte.toFixed(0)} estr=${a.estructura} ${a.k}`)
  }
}
console.log('--- ¿qué son las piezas atípicas? ---')
const pct = (n) => `${n} (${(100 * n / atipicas.length).toFixed(1)}%)`
console.log(`  H1a: su corte encaja con OTRA fórmula de la misma estructura y eje: ${pct(explicadasPorOtraFormula)}`)
console.log(`  H1b: su delta coincide con el rebaje de OTRA regla del mismo perfil: ${pct(explicadasPorOtraRegla)}`)
console.log(`  H2:  sin explicar — variación real del rebaje:                      ${pct(sinExplicar)}`)
console.log('\n--- ejemplos sin explicar ---')
for (const e of ejemplos) console.log(`  ${e}`)

// MAGNITUD del error: "92 cortes malos" no significa lo mismo si son de 1 mm
// que si son de 34. En carpintería un milímetro puede ser tolerable y tres
// centímetros son una hoja que no entra.
const errores = atipicas.map((a) => Math.abs((a.previsto - a.corte) - a.regla)).sort((x, y) => x - y)
const TRAMOS = [1, 2, 5, 10, 25, 50, Infinity]
console.log('\n--- magnitud del error de las piezas atípicas ---')
let anterior = 0
for (const t of TRAMOS) {
  const n = errores.filter((e) => e > anterior && e <= t).length
  const etiqueta = t === Infinity ? `> ${anterior} mm` : `${anterior} < e <= ${t} mm`
  if (n) console.log(`  ${etiqueta.padEnd(20)} ${String(n).padStart(4)} piezas  (${(100 * n / errores.length).toFixed(1)}%)`)
  anterior = t
}
const acumulado = (lim) => errores.filter((e) => e <= lim).length
console.log(`\n  error <= 1 mm:  ${acumulado(1)}/${errores.length} (${(100 * acumulado(1) / errores.length).toFixed(1)}%)`)
console.log(`  error <= 5 mm:  ${acumulado(5)}/${errores.length} (${(100 * acumulado(5) / errores.length).toFixed(1)}%)`)
console.log(`  error > 10 mm:  ${errores.length - acumulado(10)}/${errores.length} (${(100 * (errores.length - acumulado(10)) / errores.length).toFixed(1)}%)  <-- las que de verdad importan`)
console.log(`  error máximo:   ${errores[errores.length - 1].toFixed(1)} mm`)
