/**
 * MEDICIÓN: el filtro de rango de calcular.ts, ¿usa la referencia correcta?
 *
 * `calcularDespiece` decide si un componente condicional entra comparando su
 * MedidaMin/MedidaMax contra `Math.max(ancho, alto)` (calcular.ts:94).
 *
 * El anexo S.6 demostró que para los ASOCIADOS esa referencia es incorrecta:
 * la medida es la de la fórmula de la propia ranura, evaluada con las cotas
 * reales. Para los PERFILES nunca se comprobó — quedó anotado en T.5 punto 2
 * como "sin tocar". Esto lo mide.
 *
 * Método: sobre las líneas del histórico, para cada componente de perfil con
 * rango se compara qué política acierta si el ERP lo emitió o no.
 *
 *   A) max(ancho, alto)          — lo que hace hoy el motor
 *   B) la fórmula del componente — lo que S.6 estableció para asociados
 *   C) el ancho / D) el alto     — controles
 *
 * Solo lectura. Uso: npx tsx scripts/medir-filtro-rango-perfiles.mjs
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

const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])

// componentes de perfil CON rango, por estructura
const condicionales = new Map()
let totalConRango = 0
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  if (!FUNCIONES_PERFIL.has(col(f, 'Funcion'))) continue
  if (num(f, 'MedidaMax') <= 0 && num(f, 'MedidaMin') <= 0) continue
  totalConRango++
  const e = col(f, 'Estructura')
  if (!condicionales.has(e)) condicionales.set(e, [])
  condicionales.get(e).push(f)
}
console.log(`Componentes de perfil con rango en la plantilla: ${totalConRango}`)
console.log(`Estructuras afectadas: ${condicionales.size}\n`)

// Control: si sale 0, ¿es que no hay rangos, o que el filtro está mal?
{
  const porFuncion = new Map()
  let filasPlantilla = 0, conRangoTotal = 0
  for (const f of estArt) {
    if (col(f, 'TipoDoc')) continue
    filasPlantilla++
    if (num(f, 'MedidaMax') <= 0 && num(f, 'MedidaMin') <= 0) continue
    conRangoTotal++
    const fn = col(f, 'Funcion') || '(sin función)'
    porFuncion.set(fn, (porFuncion.get(fn) ?? 0) + 1)
  }
  console.log('--- control: filas de plantilla con MedidaMin/Max, por función ---')
  console.log(`  filas de plantilla: ${filasPlantilla}   con rango: ${conRangoTotal}`)
  for (const [fn, n] of [...porFuncion].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    const esPerfil = FUNCIONES_PERFIL.has(fn) ? ' <- función de PERFIL' : ''
    console.log(`    ${String(n).padStart(6)}  ${fn}${esPerfil}`)
  }
  console.log('')
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
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

const POLITICAS = {
  'A) max(ancho, alto) — actual': (ctx) => Math.max(ctx.L, ctx.A),
  'B) fórmula del componente': null, // se evalúa aparte
  'C) sólo el ancho (L)': (ctx) => ctx.L,
  'D) sólo el alto (A)': (ctx) => ctx.A,
}
const marcador = {}
for (const n of Object.keys(POLITICAS)) marcador[n] = { aciertos: 0, total: 0, fp: 0, fn: 0 }
let casos = 0, sinFormula = 0

for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const estructura = col(p, 'Articulo')
  const cond = condicionales.get(estructura)
  if (!cond) continue
  const ancho = num(p, 'Ancho'), largo = num(p, 'Largo')
  if (ancho <= 0 || largo <= 0) continue
  const k = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const ctx = { L: largo, A: ancho, ...(cotasDefecto.get(estructura) ?? {}), ...(cotasInstancia.get(k) ?? {}) }

  // cortes reales de la línea, por función
  const cortesReales = new Map()
  for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
    const fn = col(h, 'Funcion')
    if (!FUNCIONES_PERFIL.has(fn)) continue
    const c2 = num(h, 'LargoCorte') || num(h, 'Largo')
    if (c2 <= 0) continue
    if (!cortesReales.has(fn)) cortesReales.set(fn, [])
    cortesReales.get(fn).push(c2)
  }
  if (!cortesReales.size) continue

  for (const f of cond) {
    const formula = col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo')
    if (!formula) { sinFormula++; continue }
    let medidaPropia
    try { medidaPropia = evaluar(formula, ctx) } catch { sinFormula++; continue }
    // ¿el ERP emitió una pieza de esa función con ese largo?
    const emitido = (cortesReales.get(col(f, 'Funcion')) ?? [])
      .some((c2) => Math.abs(c2 - medidaPropia) <= TOL)
    casos++
    const min = num(f, 'MedidaMin'), max = num(f, 'MedidaMax')
    const dentro = (v) => (min <= 0 || v >= min) && (max <= 0 || v <= max)
    for (const [nombre, fn2] of Object.entries(POLITICAS)) {
      const v = fn2 ? fn2(ctx) : medidaPropia
      const predice = dentro(v)
      const m = marcador[nombre]
      m.total++
      if (predice === emitido) m.aciertos++
      else if (predice) m.fp++
      else m.fn++
    }
  }
}

console.log(`Casos evaluados (componente condicional × línea): ${casos}`)
console.log(`Descartados por no tener fórmula evaluable: ${sinFormula}\n`)
console.log('política                          aciertos            predice de más  predice de menos')
for (const [n, m] of Object.entries(marcador)) {
  if (!m.total) continue
  console.log(`  ${n.padEnd(32)} ${String(m.aciertos).padStart(6)}/${m.total} (${(100 * m.aciertos / m.total).toFixed(1)}%)  ${String(m.fp).padStart(9)}  ${String(m.fn).padStart(15)}`)
}
