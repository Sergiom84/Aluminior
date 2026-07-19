/**
 * MEDICIÓN: ¿contra qué dimensión se comparan MedidaMin/MedidaMax de
 * ConjuntosAsoc?  (anexo R, semántica pendiente nº 1)
 *
 * Intervalo y TipoMedCV resultaron constantes ('0' y 'C'): no discriminan.
 * Hipótesis: la medida se compara contra una dimensión concreta de la línea
 * o de la HOJA (los compases por tramos cuelgan de ComponenteAsoc=OBC).
 *
 * Método: "grupos de tramos" — filas de ConjuntosAsoc con el mismo
 * Conjunto+ComponenteAsoc+nOpcion pero artículos distintos y rangos de
 * medida distintos. Cuando una línea del oráculo contiene EXACTAMENTE UNO
 * de esos artículos, el rango del elegido delata la dimensión: se mide qué
 * hipótesis cae dentro del rango del artículo presente.
 *
 * Dimensiones candidatas por línea:
 *   L    Largo del padre            A    Ancho del padre
 *   HHx  mayor corte de hoja horizontal (ancho de hoja)
 *   HVx  mayor corte de hoja vertical   (alto de hoja)
 *   HHn/HVn  menores equivalentes
 *
 * Solo lectura. Uso: node scripts/medir-medidas-asoc.mjs
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

const conjuntos = leer('Conjuntos.csv')
const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const datosLin = leer('VDatosLinEstr.csv')
const vLin = leer('VPresupuestosLin.csv')
const articulos = leer('Articulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

// --- cadena (idéntica a anexos J/K/R) ---
const ficha = new Map(conjuntos.map((c) => [col(c, 'Codigo'), c]))
const COLS_DELEGA = Object.keys(conjuntos[0] ?? {}).filter((k) =>
  /^(TablaHojas\d?|TablaFijos\d?|TablaDobleH\d?|SubSerieDe|herr.+)$/.test(k),
)
const cadenaCache = new Map()
function cadena(serie) {
  if (cadenaCache.has(serie)) return cadenaCache.get(serie)
  const vistos = new Set()
  const rec = (c) => {
    if (!c || vistos.has(c)) return
    vistos.add(c)
    const fc = ficha.get(c)
    if (!fc) return
    for (const k of COLS_DELEGA) {
      const v = col(fc, k)
      if (v && v !== '0' && ficha.has(v)) rec(v)
    }
  }
  rec(serie)
  const r = [...vistos]
  cadenaCache.set(serie, r)
  return r
}

// --- grupos de tramos ---
// clave: Conjunto|ComponenteAsoc|nOpcion → filas con rango
const grupos = new Map()
for (const f of conjuntosAsoc) {
  const art = col(f, 'Articulo')
  if (!art || art === '0') continue
  if (num(f, 'MedidaMax') <= 0) continue
  const k = `${col(f, 'Conjunto')}|${col(f, 'ComponenteAsoc')}|${col(f, 'nOpcion')}`
  if (!grupos.has(k)) grupos.set(k, [])
  grupos.get(k).push(f)
}
// solo grupos con ≥2 artículos distintos y rangos no idénticos
const gruposTramo = new Map()
for (const [k, filas] of grupos) {
  const arts = new Set(filas.map((f) => col(f, 'Articulo')))
  const rangos = new Set(filas.map((f) => `${col(f, 'MedidaMin')}-${col(f, 'MedidaMax')}`))
  if (arts.size >= 2 && rangos.size >= 2) gruposTramo.set(k, filas)
}
console.log(`Grupos de tramos (mismo conjunto+ranura+opción, rangos distintos): ${gruposTramo.size}`)

// --- oráculo ---
const seriePorLinea = new Map()
for (const f of datosLin) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
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

const HIPOTESIS = ['L', 'A', 'HHx', 'HHn', 'HVx', 'HVn']
const aciertos = Object.fromEntries(HIPOTESIS.map((h) => [h, 0]))
const aciertosPorGrupo = new Map() // grupo → {h: n}
let casos = 0

for (const p of padres) {
  const clave = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`
  const serie = seriePorLinea.get(clave)
  if (!serie) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const artsLinea = new Set(hijas.map((h) => col(h, 'Articulo')))

  // dimensiones candidatas
  const cortesHH = [], cortesHV = []
  for (const h of hijas) {
    const fn = col(h, 'Funcion')
    const lc = num(h, 'LargoCorte')
    if (!lc) continue
    if (fn === 'HH') cortesHH.push(lc)
    if (fn === 'HV') cortesHV.push(lc)
  }
  const dims = {
    L: num(p, 'Largo'), A: num(p, 'Ancho'),
    HHx: cortesHH.length ? Math.max(...cortesHH) : 0,
    HHn: cortesHH.length ? Math.min(...cortesHH) : 0,
    HVx: cortesHV.length ? Math.max(...cortesHV) : 0,
    HVn: cortesHV.length ? Math.min(...cortesHV) : 0,
  }

  const cad = new Set(cadena(serie))
  for (const [k, filas] of gruposTramo) {
    if (!cad.has(k.split('|')[0])) continue
    // ¿exactamente un artículo del grupo presente en la línea?
    const presentes = filas.filter((f) => artsLinea.has(col(f, 'Articulo')))
    const artsPresentes = new Set(presentes.map((f) => col(f, 'Articulo')))
    if (artsPresentes.size !== 1) continue
    const fila = presentes[0]
    const min = num(fila, 'MedidaMin'), max = num(fila, 'MedidaMax')
    casos++
    if (!aciertosPorGrupo.has(k)) aciertosPorGrupo.set(k, { n: 0, art: col(fila, 'Articulo') })
    const g = aciertosPorGrupo.get(k)
    g.n++
    for (const h of HIPOTESIS) {
      if (dims[h] >= min && dims[h] <= max) {
        aciertos[h]++
        g[h] = (g[h] ?? 0) + 1
      }
    }
  }
}

console.log(`Casos medidos (línea × grupo con un solo artículo presente): ${casos}\n`)
console.log('Hipótesis: dimensión dentro del rango del artículo elegido')
for (const h of HIPOTESIS) {
  console.log(`  ${h.padEnd(4)} ${String(aciertos[h]).padStart(6)} / ${casos}  (${(100 * aciertos[h] / casos).toFixed(1)}%)`)
}

// --- resumen por grupo: ¿alguna hipótesis explica el grupo al ≥90%? ---
const conMuestra = [...aciertosPorGrupo.entries()].filter(([, g]) => g.n >= 10)
let explicados = 0, casosExplicados = 0, casosTotales = 0
const porHipotesis = Object.fromEntries(HIPOTESIS.map((h) => [h, 0]))
const inexplicados = []
for (const [k, g] of conMuestra) {
  casosTotales += g.n
  let mejor = null, mejorTasa = 0
  for (const h of HIPOTESIS) {
    const tasa = (g[h] ?? 0) / g.n
    if (tasa > mejorTasa) { mejorTasa = tasa; mejor = h }
  }
  if (mejorTasa >= 0.9) {
    explicados++
    casosExplicados += g.n
    porHipotesis[mejor]++
  } else {
    inexplicados.push([k, g, mejor, mejorTasa])
  }
}
console.log(`\nGrupos con ≥10 casos: ${conMuestra.length} (${casosTotales} casos)`)
console.log(`  explicados al ≥90% por una dimensión: ${explicados} (${casosExplicados} casos)`)
console.log('  hipótesis ganadora:', JSON.stringify(porHipotesis))

console.log('\n--- Grupos NO explicados con más casos (top 15) ---')
inexplicados.sort((a, b) => b[1].n - a[1].n)
for (const [k, g, mejor, tasa] of inexplicados.slice(0, 15)) {
  console.log(`  ${k.slice(0, 32).padEnd(33)}${String(g.n).padStart(4)}  mejor ${mejor} ${(100 * tasa).toFixed(0)}%  ${(descArt.get(g.art) ?? '').slice(0, 35)}`)
}
