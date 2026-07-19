/**
 * MEDICIÓN: la goma GM4090 se empareja con el VIDRIO, no con la línea.
 *
 * Refutadas ya dos vías (S.9.3 y esta medición): GM4090 no llega por el
 * ConjuntosAsoc de la línea (su conjunto GMBASTIDOR nunca está entre las
 * opciones) ni por una subestructura anidada (la columna Subestructura está
 * vacía en las 15.263 filas de plantilla).
 *
 * Lo que sí muestran los datos: la goma sale en PAREJAS de largos —
 * (713,1105), (1315,2025), (1024,2090)×2 — con Cdad=2 cada fila, que es
 * exactamente lo que declara GMBASTIDOR: comp='A' cdad 2 (ANCHO) y comp='L'
 * cdad 2 (ALTO). Es decir: dos gomas por ancho y dos por alto DE CADA HUECO
 * ACRISTALADO. Pertenece a la fase de acristalamiento, como el junquillo.
 *
 * Se mide aquí, al modo de la junta perimetral (S.7.2): cada largo de goma
 * contra las dimensiones del vidrio de la misma línea. Si el delta es
 * estable (≥3 muestras, ≥90%), la regla queda establecida.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-goma-vidrio.mjs
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

const articulos = leer('Articulos.csv')
const datosLin = leer('VDatosLinEstr.csv')
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const metrajePorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'TipoMetraje')]))

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]
const GOMA = 'GM4090'

const seriePorLinea = new Map()
for (const f of datosLin) {
  seriePorLinea.set(`${col(f, 'TipoDoc')}|${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}

// delta agrupado por (serie, eje): eje = con qué dimensión del vidrio empareja
const deltas = new Map()
let filasGoma = 0, sinPareja = 0, lineas = 0, ambiguas = 0, inequivocas = 0
const cdadFrec = new Map()
const porNumVidrios = new Map() // nº vidrios -> Map(nº filas de goma -> n)
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
    const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
    const gomas = hijas.filter((h) => col(h, 'Articulo') === GOMA)
    if (!gomas.length) continue
    lineas++
    const serie = seriePorLinea.get(`${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`) ?? '?'
    // vidrios de la línea, con sus dos dimensiones
    const vidrios = []
    for (const h of hijas) {
      const art = col(h, 'Articulo')
      if (famPorArt.get(art) !== '050' || metrajePorArt.get(art) !== 'M2') continue
      const cant = Math.max(1, Math.round(num(h, 'Cdad')))
      for (let i = 0; i < cant; i++) vidrios.push({ l: num(h, 'Largo'), a: num(h, 'Ancho') })
    }
    const nv = vidrios.length
    if (!porNumVidrios.has(nv)) porNumVidrios.set(nv, new Map())
    const mm = porNumVidrios.get(nv)
    mm.set(gomas.length, (mm.get(gomas.length) ?? 0) + 1)

    for (const g of gomas) {
      filasGoma++
      cdadFrec.set(num(g, 'Cdad'), (cdadFrec.get(num(g, 'Cdad')) ?? 0) + 1)
    }

    // Emparejar "al más cercano" mezcla ejes y vidrios: es el mismo error de
    // medición que se documentó en S.7.2. Sólo se miden las líneas SIN
    // ambigüedad — un único vidrio y exactamente dos filas de goma, que por
    // fuerza son su ancho y su alto.
    if (vidrios.length !== 1 || gomas.length !== 2) { ambiguas++; continue }
    const v = vidrios[0]
    const largos = gomas.map((g) => num(g, 'LargoCorte') || num(g, 'Largo')).sort((a, b) => a - b)
    const dims = [v.l, v.a].sort((a, b) => a - b)
    if (largos[0] <= 0 || dims[0] <= 0) { sinPareja++; continue }
    inequivocas++
    for (let i = 0; i < 2; i++) {
      const eje = dims[i] === Math.max(v.l, v.a) ? 'mayor' : 'menor'
      const k = `${serie}|${eje}`
      if (!deltas.has(k)) deltas.set(k, new Map())
      const m = deltas.get(k)
      const delta = Math.round((largos[i] - dims[i]) * 10) / 10
      m.set(delta, (m.get(delta) ?? 0) + 1)
    }
  }
}
console.log(`Líneas con GM4090: ${lineas}   filas de goma: ${filasGoma}`)
console.log(`  líneas inequívocas (1 vidrio, 2 filas de goma): ${inequivocas}   ambiguas descartadas: ${ambiguas}   sin medidas: ${sinPareja}`)
console.log(`Cdad de las filas de goma: ${[...cdadFrec].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}×${n}`).join('  ')}`)

console.log('\n--- ¿nº de filas de goma por nº de vidrios de la línea? ---')
for (const [nv, m] of [...porNumVidrios].sort((a, b) => a[0] - b[0]).slice(0, 10)) {
  console.log(`  ${String(nv).padStart(3)} vidrios -> ${[...m].sort((a, b) => b[1] - a[1]).map(([g, n]) => `${g} filas ×${n}`).join('  ')}`)
}

console.log('\n--- delta goma - dimensión de vidrio, por (serie | eje) ---')
let estables = 0, cubiertos = 0, total = 0
for (const [k, m] of [...deltas.entries()].sort()) {
  const t = [...m.values()].reduce((a, b) => a + b, 0)
  const [delta, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
  total += t
  const ok = t >= 3 && n / t >= 0.9
  if (ok) { estables++; cubiertos += t }
  console.log(`  ${ok ? '✔' : '✘'} ${k.padEnd(22)} delta=${String(delta).padStart(7)}  ${n}/${t}`)
}
console.log(`\nReglas estables (≥3, ≥90%): ${estables} de ${deltas.size}  (${cubiertos}/${total} filas cubiertas)`)
