/**
 * Valida contra el oráculo las tres reglas de junquillos/juntas:
 *
 *  R1 (artículos): junquillo/juntaExt/juntaInt = fila de TAcristalamientoLin
 *     de la TablaHojas de la serie con menor Grosor >= TamJunqGoma del vidrio.
 *  R2 (juntas): longitudes = dimensiones del módulo (las del vidrio + galce,
 *     es decir, los cortes de hoja NO: son L y A del módulo; aquí se
 *     contrasta con el par de longitudes reales).
 *  R3 (junquillos): junqVert − vidrioL y junqHoriz − vidrioA son constantes
 *     por serie (a medir, como el galce).
 *
 * Solo lectura. Uso: node scripts/validar-junquillos.mjs
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

const tablaHojas = new Map(conjuntos.map((c) => [col(c, 'Codigo'), col(c, 'TablaHojas')]))

// filas TAcris por tabla, ordenadas por grosor
const filasTacris = new Map()
for (const f of tacrisLin) {
  const t = col(f, 'TAcris')
  if (!filasTacris.has(t)) filasTacris.set(t, [])
  filasTacris.get(t).push({ grosor: num(col(f, 'Grosor')), junq: col(f, 'Junquillo'), jext: col(f, 'JuntaExt'), jint: col(f, 'JuntaInt') })
}
for (const lista of filasTacris.values()) lista.sort((a, b) => a.grosor - b.grosor)

function filaParaGrosor(tabla, tamJunq) {
  const lista = filasTacris.get(tabla) ?? []
  for (const f of lista) if (f.grosor >= tamJunq - 1e-9) return f
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

let lineas = 0, r1ok = 0, r1parcial = 0, r1fallo = 0, sinTabla = 0
const fallosR1 = new Map()
const kVert = new Map(), kHoriz = new Map() // serie -> Map(delta -> n)

for (const p of padres) {
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  if (!serie) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []

  // vidrios M2 con medida única
  const vidrios = hijas.filter((h) => {
    const a = porArt.get(col(h, 'Articulo'))
    return a && col(a, 'Familia') === '050' && col(a, 'TipoMetraje') === 'M2'
  })
  if (!vidrios.length) continue
  const artsVid = new Set(vidrios.map((h) => col(h, 'Articulo')))
  if (artsVid.size !== 1) continue
  const vid = porArt.get([...artsVid][0])
  const tamJunq = num(col(vid, 'TamJunqGoma'))
  if (!tamJunq) continue
  const medidas = new Set(vidrios.map((h) => `${col(h, 'Largo')}|${col(h, 'Ancho')}`))
  if (medidas.size !== 1) continue
  const vidL = num(vidrios[0].Largo), vidA = num(vidrios[0].Ancho)

  const tabla = tablaHojas.get(serie)
  const fila = tabla ? filaParaGrosor(tabla, tamJunq) : null
  if (!fila) { sinTabla++; continue }
  lineas++

  const presentes = new Set(hijas.map((h) => col(h, 'Articulo')))
  const aciertos = [fila.junq, fila.jext, fila.jint].filter((a) => a && a !== '0' && presentes.has(a)).length
  if (aciertos === 3) r1ok++
  else if (aciertos > 0) {
    r1parcial++
    const falta = [['junq', fila.junq], ['jext', fila.jext], ['jint', fila.jint]]
      .filter(([, a]) => a && a !== '0' && !presentes.has(a)).map(([k, a]) => `${k}:${a}`).join(',')
    fallosR1.set(`${serie} tam${tamJunq} falta ${falta}`, (fallosR1.get(`${serie} tam${tamJunq} falta ${falta}`) ?? 0) + 1)
  } else {
    r1fallo++
    fallosR1.set(`${serie} tam${tamJunq} ninguno (${fila.junq}/${fila.jext}/${fila.jint})`, (fallosR1.get(`${serie} tam${tamJunq} ninguno (${fila.junq}/${fila.jext}/${fila.jint})`) ?? 0) + 1)
  }

  // R3: longitudes de junquillo frente a medidas del vidrio
  if (fila.junq && fila.junq !== '0') {
    const largosJunq = hijas.filter((h) => col(h, 'Articulo') === fila.junq).map((h) => num(col(h, 'LargoCorte')))
    for (const lj of largosJunq) {
      const dV = Math.round((lj - vidL) * 10) / 10
      const dA = Math.round((lj - vidA) * 10) / 10
      // asignar a la dimensión más próxima
      const esVert = Math.abs(dV) <= Math.abs(dA)
      const mapa = esVert ? kVert : kHoriz
      const d = esVert ? dV : dA
      if (Math.abs(d) > 100) continue
      if (!mapa.has(serie)) mapa.set(serie, new Map())
      mapa.get(serie).set(d, (mapa.get(serie).get(d) ?? 0) + 1)
    }
  }
}

console.log(`Líneas evaluables: ${lineas} (sin tabla/fila: ${sinTabla})`)
console.log(`\n=== R1: artículos por grosor (menor Grosor >= TamJunqGoma) ===`)
console.log(`  3 de 3 presentes : ${r1ok} (${(100 * r1ok / lineas).toFixed(1)}%)`)
console.log(`  parcial          : ${r1parcial} (${(100 * r1parcial / lineas).toFixed(1)}%)`)
console.log(`  ninguno          : ${r1fallo} (${(100 * r1fallo / lineas).toFixed(1)}%)`)
console.log('\n--- discrepancias más frecuentes ---')
for (const [k, n] of [...fallosR1.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${String(n).padStart(4)}  ${k}`)
}

const resumen = (mapa, titulo) => {
  console.log(`\n=== ${titulo} ===`)
  for (const [serie, conteo] of [...mapa.entries()].sort((a, b) => {
    const na = [...a[1].values()].reduce((x, y) => x + y, 0)
    const nb = [...b[1].values()].reduce((x, y) => x + y, 0)
    return nb - na
  }).slice(0, 10)) {
    const total = [...conteo.values()].reduce((a, b) => a + b, 0)
    const top = [...conteo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([d, n]) => `${d > 0 ? '+' : ''}${d}mm(${(100 * n / total).toFixed(0)}%)`).join(' ')
    console.log(`  ${serie.padEnd(12)} n=${String(total).padEnd(6)} ${top}`)
  }
}
resumen(kVert, 'R3: junquillo − vidrio (dimensión LARGO)')
resumen(kHoriz, 'R3: junquillo − vidrio (dimensión ANCHO)')
