/**
 * PRUEBA REAL: el motor CON las reglas de rebaje, contra el histórico.
 *
 * El anexo T midió que sin rebaje el motor reproduce 0 de 1.003 líneas con
 * hoja. T.10 cerró la regla `rebaje = f(perfil, eje, fórmula, serie)` con
 * 64 reglas robustas y 93,0% de cobertura. Esto comprueba que el motor, ya
 * modificado, aplica bien esas reglas y que la GUARDA hace lo que debe:
 * dejar sin medida —no con la medida del hueco— las piezas sin regla.
 *
 * Las reglas se derivan aquí del histórico, igual que en T.10. El perfil
 * real se toma del enlace de diseño del oráculo; en producción lo aporta la
 * resolución genérico→perfil (96,5%, anexo J), y esa parte no se prueba
 * aquí: se prueba el rebaje.
 *
 * Solo lectura. Uso: npx tsx scripts/probar-motor-con-rebaje.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { calcularDespiece } from '../packages/core/src/despiece/calcular.ts'
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

const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const detallePorLinea = new Map(detalles.map((f) => [col(f, 'nVLinea'), f]))

// plantilla de hoja por (estructura, función, DisIdIt)
const plantillaHoja = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const fn = col(f, 'Funcion')
  if (!FUNCIONES_HOJA.has(fn)) continue
  const idIt = col(f, 'DisIdIt')
  if (!idIt || idIt === '0') continue
  if (!(col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo'))) continue
  const k = `${col(f, 'Estructura')}|${fn}|${idIt}`
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

// --- recorrer líneas: observaciones y datos por línea ---
const lineas = []
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const estructura = col(p, 'Articulo')
  const ancho = num(p, 'Ancho'), largo = num(p, 'Largo')
  if (ancho <= 0 || largo <= 0) continue
  const k = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const cotas = { ...(cotasDefecto.get(estructura) ?? {}), ...(cotasInstancia.get(k) ?? {}) }
  const contexto = { L: largo, A: ancho, ...cotas }
  const piezas = []
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
    piezas.push({ perfil, fn, formula, corte, previsto, fila })
  }
  if (piezas.length) {
    lineas.push({ k, estructura, largo, ancho, cotas, serie: seriePorLinea.get(k) ?? '', piezas })
  }
}

// --- derivar las reglas (igual que T.10) ---
const grupos = new Map()
for (const l of lineas) {
  for (const pz of l.piezas) {
    const c = `${pz.perfil}|${pz.fn}|${pz.formula}|${l.serie}`
    if (!grupos.has(c)) grupos.set(c, [])
    grupos.get(c).push({ delta: pz.previsto - pz.corte, previsto: pz.previsto })
  }
}
/**
 * El umbral de ≥90% vale para DECIDIR que una regla existe, pero no para
 * cortar con ella: en un grupo con 90% de consistencia, una de cada diez
 * piezas sale con una medida equivocada y sin aviso. Aquí se construyen las
 * reglas con umbral configurable para poder medir ese coste.
 */
function derivarReglas(umbral) {
  const reglas = new Map()
  for (const [c, obs] of grupos) {
    if (obs.length < 3) continue
    const deltas = obs.map((o) => o.delta)
    let mejor = null, mejorN = 0
    for (const d of deltas) {
      const n = deltas.filter((x) => Math.abs(x - d) <= TOL).length
      if (n > mejorN) { mejorN = n; mejor = d }
    }
    if (mejorN / deltas.length < umbral) continue
    // sólo reglas robustas: el grupo debe abarcar medidas distintas
    if (new Set(obs.map((o) => Math.round(o.previsto))).size <= 1) continue
    reglas.set(c, Math.round(mejor * 10) / 10)
  }
  return reglas
}
let reglas = derivarReglas(0.9)
console.log(`Reglas de rebaje derivadas (robustas, umbral 90%): ${reglas.size}\n`)

// --- ejecutar el MOTOR con y sin reglas ---
const ejecutar = (usarReglas) => {
  let piezas = 0, correctas = 0, sinMedida = 0, lineasOk = 0, lineasTotal = 0
  for (const l of lineas) {
    const plantilla = l.piezas.map((pz) => ({
      articuloCodigo: pz.perfil,
      cantidad: 1,
      formulaLargo: pz.formula,
      tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null,
      funcion: pz.fn,
    }))
    const r = calcularDespiece(plantilla, { anchoMm: l.largo, altoMm: l.ancho }, l.cotas,
      usarReglas
        ? { serie: l.serie, rebajeDeHoja: (c) => reglas.get(`${c.articuloCodigo}|${c.funcion}|${c.formula}|${c.serie}`) ?? null }
        : {})
    lineasTotal++
    let ok = true
    for (let i = 0; i < l.piezas.length; i++) {
      piezas++
      const m = r.piezas[i].largoMm
      if (m === null) { sinMedida++; ok = false; continue }
      if (Math.abs(m - l.piezas[i].corte) <= TOL) correctas++
      else ok = false
    }
    if (ok) lineasOk++
  }
  return { piezas, correctas, sinMedida, lineasOk, lineasTotal }
}

const antes = ejecutar(false)
const despues = ejecutar(true)

console.log('=== MOTOR CONTRA EL HISTÓRICO (sólo piezas de hoja) ===\n')
const fila = (n, r) => {
  console.log(`  ${n.padEnd(22)} piezas correctas ${String(r.correctas).padStart(5)}/${r.piezas} (${(100 * r.correctas / r.piezas).toFixed(1)}%)   sin medida ${String(r.sinMedida).padStart(5)}   líneas exactas ${r.lineasOk}/${r.lineasTotal} (${(100 * r.lineasOk / r.lineasTotal).toFixed(1)}%)`)
}
fila('SIN reglas (anexo T)', antes)
fila('CON reglas (T.10)', despues)

console.log('\n--- comprobación de la GUARDA ---')
console.log(`  piezas sin regla que quedan SIN MEDIDA: ${despues.sinMedida}`)
console.log(`  (deben quedar sin medida, nunca con la medida del hueco)`)
const cortesMalos = despues.piezas - despues.correctas - despues.sinMedida
console.log(`  piezas con medida PERO incorrecta:      ${cortesMalos}`)
if (cortesMalos > 0) {
  console.log(`  ATENCIÓN: ${cortesMalos} piezas saldrían con un corte equivocado sin avisar.`)
}

// --- ¿cuánto cuesta exigir consistencia TOTAL en vez del 90%? ---
console.log('\n=== umbral de la regla: cobertura frente a cortes equivocados ===')
console.log('  umbral  reglas  piezas correctas   sin medida   cortes MALOS   líneas exactas')
for (const u of [0.9, 0.95, 0.99, 1.0]) {
  reglas = derivarReglas(u)
  const r = ejecutar(true)
  const malos = r.piezas - r.correctas - r.sinMedida
  console.log(`  ${String(Math.round(u * 100)).padStart(5)}%  ${String(reglas.size).padStart(6)}  ${String(r.correctas).padStart(5)}/${r.piezas} (${(100 * r.correctas / r.piezas).toFixed(1)}%)  ${String(r.sinMedida).padStart(9)}  ${String(malos).padStart(12)}   ${r.lineasOk}/${r.lineasTotal} (${(100 * r.lineasOk / r.lineasTotal).toFixed(1)}%)`)
}
