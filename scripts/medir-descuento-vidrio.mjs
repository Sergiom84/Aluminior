/**
 * Mide el DESCUENTO DE GALCE del vidrio directamente del oráculo.
 *
 * Para líneas de documento con emparejamiento inequívoco (un único corte de
 * hoja vertical HV, un único corte horizontal HH, y vidrios M2), calcula:
 *
 *   deltaL = corte HV − Largo del vidrio
 *   deltaA = corte HH − Ancho del vidrio
 *
 * Si el delta es estable por serie (desviación pequeña), es la constante de
 * galce de esa serie: medida de los datos, no inventada.
 *
 * Solo lectura. Uso: node scripts/medir-descuento-vidrio.mjs
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

const vLin = leer('VPresupuestosLin.csv')
const datosLin = leer('VDatosLinEstr.csv')
const articulos = leer('Articulos.csv')
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const tipoMetraje = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'TipoMetraje')]))

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

// Por serie: lista de {deltaL, deltaA}
const porSerie = new Map()
let lineasUsables = 0

for (const p of padres) {
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  if (!serie) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []

  const cortesHV = new Set(), cortesHH = new Set()
  const artsHV = new Set()
  const vidrios = []
  for (const h of hijas) {
    const fn = col(h, 'Funcion'), art = col(h, 'Articulo')
    if (fn === 'HV') { cortesHV.add(num(col(h, 'LargoCorte'))); if (art && art !== '0') artsHV.add(art) }
    if (fn === 'HH') {
      // excluir vierteaguas y similares: sólo perfiles de hoja "de verdad"
      // (mismo artículo que el HV no se puede exigir; usamos todos los HH y
      // luego exigimos emparejamiento único)
      cortesHH.add(num(col(h, 'LargoCorte')))
    }
    if ((famPorArt.get(art) ?? '') === '050' && tipoMetraje.get(art) === 'M2') {
      vidrios.push({ largo: num(col(h, 'Largo')), ancho: num(col(h, 'Ancho')) })
    }
  }
  // Emparejamiento inequívoco: exactamente un corte HV distinto, un HH
  // distinto, y al menos un vidrio (todos con las mismas medidas).
  if (cortesHV.size !== 1 || cortesHH.size < 1 || vidrios.length === 0) continue
  const hv = [...cortesHV][0]
  const medidas = new Set(vidrios.map((v) => `${v.largo}|${v.ancho}`))
  if (medidas.size !== 1) continue
  const v = vidrios[0]
  if (v.largo <= 0 || v.ancho <= 0) continue

  // El vidrio va con la hoja: largo del vidrio ~ corte HV, ancho ~ corte HH.
  // Elegimos el HH que da un delta igual al de HV si existe; si no, el menor.
  const deltaL = hv - v.largo
  let deltaA = null
  for (const hh of cortesHH) {
    const d = hh - v.ancho
    if (Math.abs(d - deltaL) < 0.51) { deltaA = d; break }
  }
  if (deltaA === null) deltaA = Math.min(...[...cortesHH].map((hh) => hh - v.ancho))
  if (deltaL < 0 || deltaL > 200 || deltaA < -1 || deltaA > 200) continue

  lineasUsables++
  // Clave: serie + perfil de hoja (si es único) — la hipótesis refinada es
  // que el descuento es una propiedad del perfil de hoja dentro de la serie.
  const perfilHoja = artsHV.size === 1 ? [...artsHV][0] : '(varios)'
  const clave = `${serie} · ${perfilHoja}`
  if (!porSerie.has(clave)) porSerie.set(clave, [])
  porSerie.get(clave).push({ deltaL, deltaA })
}

console.log(`Líneas con emparejamiento inequívoco: ${lineasUsables}\n`)
console.log('Serie · perfil hoja          n     deltaL: moda (frec)      deltaA: moda (frec)')
const redondear = (x) => Math.round(x * 10) / 10
for (const [serie, deltas] of [...porSerie.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const moda = (vals) => {
    const c = new Map()
    for (const v of vals) c.set(redondear(v), (c.get(redondear(v)) ?? 0) + 1)
    const [val, n] = [...c.entries()].sort((a, b) => b[1] - a[1])[0]
    return `${val} mm (${n}/${vals.length} = ${(100 * n / vals.length).toFixed(0)}%)`
  }
  console.log(`${serie.padEnd(28)} ${String(deltas.length).padStart(4)}  ${moda(deltas.map((d) => d.deltaL)).padEnd(24)} ${moda(deltas.map((d) => d.deltaA))}`)
}
