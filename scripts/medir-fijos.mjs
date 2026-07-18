/**
 * Mide para FIJOS (líneas sin HV/HH, con vidrio M2 de medida única):
 *
 *  1. delta_fijo = corte del cerco (MV/MH) − medida del vidrio,
 *     por (serie, perfil de cerco). ¿Constante?
 *  2. ajustes del junquillo fijo = corte junquillo − medida del vidrio,
 *     por serie, usando el junquillo esperado por TablaFijos + grosor.
 *  3. regla de artículos: ¿el junquillo esperado por TablaFijos y el grosor
 *     (TamJunqGoma) está presente en la línea?
 *
 * Solo lectura. Uso: node scripts/medir-fijos.mjs
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
const num = (v) => Number(String(v).replace(',', '.')) || 0

const conjuntos = leer('Conjuntos.csv')
const tacrisLin = leer('TAcristalamientoLin.csv')
const vLin = leer('VPresupuestosLin.csv')
const datosLin = leer('VDatosLinEstr.csv')
const articulos = leer('Articulos.csv')
const porArt = new Map(articulos.map((a) => [col(a, 'Codigo'), a]))

const tablaFijos = new Map(conjuntos.map((c) => [col(c, 'Codigo'), col(c, 'TablaFijos')]))
const filasTacris = new Map()
for (const f of tacrisLin) {
  const t = col(f, 'TAcris')
  if (!filasTacris.has(t)) filasTacris.set(t, [])
  filasTacris.get(t).push({ grosor: num(col(f, 'Grosor')), junq: col(f, 'Junquillo'), jext: col(f, 'JuntaExt'), jint: col(f, 'JuntaInt') })
}
for (const l of filasTacris.values()) l.sort((a, b) => a.grosor - b.grosor)
const filaFijo = (serie, tam) => {
  for (const f of filasTacris.get(tablaFijos.get(serie) ?? '') ?? []) {
    if (f.grosor >= tam - 1e-9) return f
  }
  return null
}

const seriePorLinea = new Map()
for (const f of datosLin) {
  seriePorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}
const padres = vLin.filter((f) => col(f, 'EstructuraSN') === 'True')
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

const deltas = new Map()      // serie|perfilMarco -> Map(delta -> n)
const ajustes = new Map()     // serie -> {largo: Map, ancho: Map}
let lineas = 0, r1ok = 0, r1no = 0

for (const p of padres) {
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  if (!serie) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  let tieneHoja = false
  const mv = new Set(), mh = new Set(), artsMV = new Set()
  const vidrios = []
  const presentes = new Set()
  const cortesPorArt = new Map()
  for (const h of hijas) {
    const fn = col(h, 'Funcion'), art = col(h, 'Articulo')
    if (fn === 'HV' || fn === 'HH') tieneHoja = true
    if (fn === 'MV') { mv.add(num(col(h, 'LargoCorte'))); if (art !== '0') artsMV.add(art) }
    if (fn === 'MH') mh.add(num(col(h, 'LargoCorte')))
    if (art && art !== '0') {
      presentes.add(art)
      const lista = cortesPorArt.get(art) ?? []
      lista.push(num(col(h, 'LargoCorte')))
      cortesPorArt.set(art, lista)
    }
    const a = porArt.get(art)
    if (a && col(a, 'Familia') === '050' && col(a, 'TipoMetraje') === 'M2') {
      vidrios.push({ l: num(col(h, 'Largo')), a: num(col(h, 'Ancho')), art })
    }
  }
  if (tieneHoja || !vidrios.length) continue
  if (mv.size !== 1 || mh.size !== 1 || artsMV.size !== 1) continue
  const medidas = new Set(vidrios.map((v) => `${v.l}|${v.a}`))
  if (medidas.size !== 1) continue
  const v = vidrios[0]
  if (v.l <= 0 || v.a <= 0) continue
  lineas++

  // 1. delta contra cerco: exigir mismo delta en ambas dimensiones (±0,5)
  const dL = [...mv][0] - v.l
  const dA = [...mh][0] - v.a
  if (Math.abs(dL - dA) < 0.51 && dL >= 0 && dL < 200) {
    const k = `${serie}|${[...artsMV][0]}`
    const d = Math.round(dL * 10) / 10
    if (!deltas.has(k)) deltas.set(k, new Map())
    deltas.get(k).set(d, (deltas.get(k).get(d) ?? 0) + 1)
  }

  // 2/3. junquillo fijo esperado
  const tam = num(col(porArt.get(v.art) ?? {}, 'TamJunqGoma'))
  if (!tam) continue
  const fila = filaFijo(serie, tam)
  if (!fila || !fila.junq || fila.junq === '0') continue
  if (presentes.has(fila.junq)) {
    r1ok++
    let acc = ajustes.get(serie)
    if (!acc) ajustes.set(serie, (acc = { largo: new Map(), ancho: new Map() }))
    for (const corte of cortesPorArt.get(fila.junq) ?? []) {
      const jL = Math.round((corte - v.l) * 10) / 10
      const jA = Math.round((corte - v.a) * 10) / 10
      if (Math.abs(jL) > 100 && Math.abs(jA) > 100) continue
      const esL = Math.abs(jL) <= Math.abs(jA)
      const mapa = esL ? acc.largo : acc.ancho
      mapa.set(esL ? jL : jA, (mapa.get(esL ? jL : jA) ?? 0) + 1)
    }
  } else r1no++
}

console.log(`Líneas de solo-fijo usables: ${lineas}`)
console.log(`\n=== 1. delta_fijo por (serie, cerco) ===`)
for (const [k, m] of [...deltas.entries()].sort((a, b) => {
  const na = [...a[1].values()].reduce((x, y) => x + y, 0)
  const nb = [...b[1].values()].reduce((x, y) => x + y, 0)
  return nb - na
})) {
  const total = [...m.values()].reduce((a, b) => a + b, 0)
  const [val, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
  console.log(`  ${k.padEnd(26)} n=${String(total).padEnd(4)} moda ${val} mm (${(100 * n / total).toFixed(0)}%)`)
}
console.log(`\n=== 3. junquillo fijo esperado presente: ${r1ok} sí / ${r1no} no ===`)
console.log(`\n=== 2. ajustes junquillo fijo por serie ===`)
for (const [serie, acc] of ajustes) {
  const moda = (m) => {
    const total = [...m.values()].reduce((a, b) => a + b, 0)
    if (!total) return '—'
    const [val, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
    return `${val > 0 ? '+' : ''}${val}mm (${(100 * n / total).toFixed(0)}% de ${total})`
  }
  console.log(`  ${serie.padEnd(12)} largo ${moda(acc.largo).padEnd(22)} ancho ${moda(acc.ancho)}`)
}
