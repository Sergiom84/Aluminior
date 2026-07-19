/**
 * MEDICIÓN: ¿de dónde sale el rebaje de la hoja? (punto 1 de T.5)
 *
 * El anexo T dejó establecido que el motor acierta CUÁNTAS piezas de hoja
 * hay y falla CUÁNTO miden: emite la medida del hueco y la hoja va rebajada.
 * Agrupado por (serie, función) el rebaje sólo es estable en 23 de 40 casos,
 * y varía dentro de una misma serie (HH: 4, 5, 20, 24, 37,9).
 *
 * Hipótesis de T.5: el rebaje es un descuento del PERFIL concreto que
 * resuelve el genérico (el solape marco-hoja), no de la serie. Se descartó
 * ya que venga declarado en ConjuntosLin: esa tabla sólo tiene 4 columnas
 * (Conjunto, Componente, Familia, Articulo).
 *
 * Aquí se compara la estabilidad del rebaje agrupándolo por:
 *   a) serie + función           (lo que ya se sabe: 23/40)
 *   b) PERFIL REAL + función     (la hipótesis)
 *   c) perfil real + perfil de marco + función
 *
 * Sólo se miden líneas SIN ambigüedad: todas las piezas de esa función
 * comparten un único perfil, así que no hay emparejamiento que adivinar.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-rebaje-hoja.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { calcularDespiece } from '../packages/core/src/despiece/calcular.ts'

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
const datosLin = leer('VDatosLinEstr.csv')
const articulos = leer('Articulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])

const plantillaPorEstructura = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const fn = col(f, 'Funcion')
  if (!FUNCIONES_PERFIL.has(fn)) continue
  const e = col(f, 'Estructura')
  if (!plantillaPorEstructura.has(e)) plantillaPorEstructura.set(e, [])
  plantillaPorEstructura.get(e).push({
    articuloCodigo: col(f, 'Articulo') || '(genérico)',
    cantidad: col(f, 'Cantidad') || 1,
    formulaLargo: col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo') || null,
    tipoCorte: col(f, 'TipoCorte') || null,
    anguloIzquierdo: col(f, 'AnguloI') || null,
    anguloDerecho: col(f, 'AnguloD') || null,
    funcion: fn,
    medidaMinima: col(f, 'MedidaMin') || null,
    medidaMaxima: col(f, 'MedidaMax') || null,
  })
}

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

const porSerie = new Map(), porPerfil = new Map(), porPerfilMarco = new Map()
let obsTotales = 0, ambiguas = 0
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const estructura = col(p, 'Articulo')
  const plantilla = plantillaPorEstructura.get(estructura)
  if (!plantilla) continue
  const ancho = num(p, 'Ancho'), largo = num(p, 'Largo')
  if (ancho <= 0 || largo <= 0) continue
  const k = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const serie = seriePorLinea.get(k) ?? '?'

  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const cotas = { ...(cotasDefecto.get(estructura) ?? {}), ...(cotasInstancia.get(k) ?? {}) }
  const r = calcularDespiece(plantilla, { anchoMm: largo, altoMm: ancho }, cotas)

  const previstas = new Map()
  for (const pieza of r.piezas) {
    if (pieza.largoMm === null || !FUNCIONES_PERFIL.has(pieza.funcion ?? '')) continue
    if (!previstas.has(pieza.funcion)) previstas.set(pieza.funcion, [])
    for (let i = 0; i < Math.max(1, Math.round(pieza.cantidad)); i++) previstas.get(pieza.funcion).push(pieza.largoMm)
  }
  // perfiles de marco de la línea, para la variante (c)
  const marcos = new Set(hijas.filter((h) => ['MV', 'MH'].includes(col(h, 'Funcion')) && col(h, 'Articulo') !== '0').map((h) => col(h, 'Articulo')))
  const marco = marcos.size === 1 ? [...marcos][0] : null

  for (const fn of ['HV', 'HH']) {
    const piezas = hijas.filter((h) => col(h, 'Funcion') === fn && col(h, 'Articulo') !== '0')
    if (!piezas.length) continue
    const perfiles = new Set(piezas.map((h) => col(h, 'Articulo')))
    // sin ambigüedad: un solo perfil para esa función en la línea
    if (perfiles.size !== 1) { ambiguas++; continue }
    const perfil = [...perfiles][0]
    const reales = []
    for (const h of piezas) {
      const corte = num(h, 'LargoCorte') || num(h, 'Largo')
      if (corte <= 0) continue
      for (let i = 0; i < Math.max(1, Math.round(num(h, 'Cdad'))); i++) reales.push(corte)
    }
    const prev = [...(previstas.get(fn) ?? [])]
    if (!reales.length || reales.length !== prev.length) { ambiguas++; continue }
    reales.sort((a, b) => a - b); prev.sort((a, b) => a - b)
    for (let i = 0; i < reales.length; i++) {
      const d = Math.round((prev[i] - reales[i]) * 10) / 10
      obsTotales++
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
}

console.log(`Observaciones de rebaje (líneas sin ambigüedad): ${obsTotales}`)
console.log(`Descartadas por ambigüedad o recuento distinto:  ${ambiguas}\n`)

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
  console.log(`  grupos: ${mapa.size}   estables (>=3, >=90%): ${estables}   piezas cubiertas: ${cubiertos}/${total} (${(100 * cubiertos / total).toFixed(1)}%)`)
  return filas.sort((a, b) => b.t - a.t)
}

informe('a) por SERIE + función', porSerie)
const fp = informe('b) por PERFIL REAL + función  <-- hipótesis de T.5', porPerfil)
informe('c) por perfil + marco + función', porPerfilMarco)

console.log('\n--- detalle de (b), los grupos mayores ---')
for (const f of fp.slice(0, 16)) {
  console.log(`  ${f.ok ? '✔' : '✘'} ${f.clave.padEnd(18)} rebaje=${String(f.d).padStart(7)}  ${f.n}/${f.t}   ${(descArt.get(f.clave.split('|')[0]) ?? '').slice(0, 32)}`)
}
