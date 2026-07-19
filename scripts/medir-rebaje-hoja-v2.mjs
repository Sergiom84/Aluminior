/**
 * MEDICIÓN v2 del rebaje de hoja: emparejamiento EXACTO por ítem de diseño.
 *
 * T.6 dejó el frente bloqueado por falta de muestra: 148 observaciones de
 * 2.082, con 1.934 descartadas por mezclar perfiles en una misma función, y
 * ninguna medida del eje HH. El filtro de no ambigüedad hacía fiable la
 * medición y a la vez la dejaba ciega.
 *
 * El desbloqueo no es estadístico sino estructural: `VDatosLinDetDis` enlaza
 * cada línea hija real con su ítem de diseño (`DisIdIt`), igual que usa
 * `packages/etl/src/medir-mixtas.ts` para emparejar vidrios. Con eso, cada
 * pieza real se empareja con su fila de plantilla por (función, DisIdIt):
 * emparejamiento exacto, sin ordenar ni adivinar, y sirve también cuando la
 * línea mezcla perfiles.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-rebaje-hoja-v2.mjs
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

// --- enlace pieza real -> ítem de diseño ---
const detallePorLinea = new Map(detalles.map((f) => [col(f, 'nVLinea'), f]))

// --- plantilla de hoja por (estructura, función, DisIdIt) ---
const plantillaHoja = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const fn = col(f, 'Funcion')
  if (!FUNCIONES_HOJA.has(fn)) continue
  const idIt = col(f, 'DisIdIt')
  if (!idIt || idIt === '0') continue
  const k = `${col(f, 'Estructura')}|${fn}|${idIt}`
  const formula = col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo')
  if (!formula) continue
  if (!plantillaHoja.has(k)) plantillaHoja.set(k, formula)
}

// --- cotas ---
const cotasDefecto = new Map()
const simboloPorId = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura'), simbolo = col(f, 'Simbolo')
  if (!simbolo) continue
  if (!cotasDefecto.has(e)) cotasDefecto.set(e, {})
  cotasDefecto.get(e)[simbolo] = num(f, 'Cota')
  const id = col(f, 'Id')
  if (id) simboloPorId.set(`${e}|${id}`, simbolo)
}
const cotasInstancia = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const e = col(f, 'Estructura')
  const simbolo = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  if (!simbolo) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Cota')
}
const simboloDa = new Map(estructurasDa.map((f) => [
  `${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA'),
]))
for (const f of medidasDa) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const simbolo = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!simbolo) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Medida')
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

const porPerfil = new Map(), porPerfilMarco = new Map(), porSerie = new Map()
let obs = 0, sinDetalle = 0, sinPlantilla = 0, sinFormula = 0
const porFuncion = new Map()
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const estructura = col(p, 'Articulo')
  const ancho = num(p, 'Ancho'), largo = num(p, 'Largo')
  if (ancho <= 0 || largo <= 0) continue
  const k = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const serie = seriePorLinea.get(k) ?? '?'
  const contexto = {
    L: largo, A: ancho,
    ...(cotasDefecto.get(estructura) ?? {}),
    ...(cotasInstancia.get(k) ?? {}),
  }
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const marcos = new Set(hijas.filter((h) => ['MV', 'MH'].includes(col(h, 'Funcion')) && col(h, 'Articulo') !== '0').map((h) => col(h, 'Articulo')))
  const marco = marcos.size === 1 ? [...marcos][0] : null

  for (const h of hijas) {
    const fn = col(h, 'Funcion')
    if (!FUNCIONES_HOJA.has(fn)) continue
    const perfil = col(h, 'Articulo')
    if (!perfil || perfil === '0') continue
    const corte = num(h, 'LargoCorte') || num(h, 'Largo')
    if (corte <= 0) continue
    // enlace exacto con el ítem de diseño
    const det = detallePorLinea.get(col(h, 'nLinea'))
    if (!det) { sinDetalle++; continue }
    const idIt = col(det, 'DisIdIt')
    if (!idIt || idIt === '0') { sinDetalle++; continue }
    const formula = plantillaHoja.get(`${estructura}|${fn}|${idIt}`)
    if (!formula) { sinPlantilla++; continue }
    let previsto
    try { previsto = evaluar(formula, contexto) } catch { sinFormula++; continue }
    const d = Math.round((previsto - corte) * 10) / 10
    obs++
    porFuncion.set(fn, (porFuncion.get(fn) ?? 0) + 1)
    const anota = (mapa, clave) => {
      if (!mapa.has(clave)) mapa.set(clave, new Map())
      const m = mapa.get(clave)
      m.set(d, (m.get(d) ?? 0) + 1)
    }
    anota(porSerie, `${serie}|${fn}`)
    anota(porPerfil, `${perfil}|${fn}`)
    if (marco) anota(porPerfilMarco, `${perfil}|${marco}|${fn}`)
  }
}

console.log('=== rebaje de hoja, emparejado por ítem de diseño ===\n')
console.log(`Observaciones: ${obs}   (T.6 tenía 148)`)
console.log(`  por función: ${[...porFuncion].map(([f, n]) => `${f}=${n}`).join('  ')}`)
console.log(`  descartes: sin enlace de detalle ${sinDetalle}, sin fila de plantilla ${sinPlantilla}, fórmula no evaluable ${sinFormula}\n`)

const informe = (nombre, mapa) => {
  let estables = 0, cubiertos = 0, total = 0
  const filas = []
  for (const [clave, m] of mapa) {
    const t = [...m.values()].reduce((a, b) => a + b, 0)
    const [d, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
    total += t
    const ok = t >= 3 && n / t >= 0.9
    if (ok) { estables++; cubiertos += t }
    filas.push({ clave, d, n, t, ok })
  }
  console.log(`${nombre}`)
  console.log(`  grupos: ${mapa.size}   estables: ${estables}   piezas cubiertas: ${cubiertos}/${total} (${(100 * cubiertos / total).toFixed(1)}%)`)
  return filas.sort((a, b) => b.t - a.t)
}
informe('a) por SERIE + función', porSerie)
const fp = informe('b) por PERFIL + función', porPerfil)
informe('c) por perfil + marco + función', porPerfilMarco)

console.log('\n--- (b) grupos mayores ---')
for (const f of fp.slice(0, 18)) {
  const [cod, fn] = f.clave.split('|')
  console.log(`  ${f.ok ? '✔' : '✘'} ${cod.padEnd(10)} ${fn}  rebaje=${String(f.d).padStart(7)}  ${f.n}/${f.t}   ${(descArt.get(cod) ?? '').slice(0, 30)}`)
}

// ¿La cola es ruido o un SEGUNDO valor? Si el rebaje se reparte entre dos
// modas limpias, el perfil no basta: falta una condición que distinga los
// dos casos (p. ej. pieza contra marco frente a pieza contra otra hoja).
console.log('\n--- forma de la distribución en los grupos mayores ---')
for (const f of fp.slice(0, 10)) {
  const m = porPerfil.get(f.clave)
  const modas = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
  const top2 = modas.slice(0, 2).reduce((a, [, n]) => a + n, 0)
  const forma = modas.length > 1 && top2 / f.t >= 0.9 ? 'BIMODAL' : (modas.length === 1 ? 'única' : 'dispersa')
  console.log(`  ${f.clave.padEnd(16)} ${String(forma).padEnd(9)} valores distintos=${String(m.size).padStart(3)}  ${modas.map(([d, n]) => `${d}×${n}`).join('  ')}`)
}
