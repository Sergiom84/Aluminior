/**
 * ¿Qué dato del documento selecciona la variante .1 (cristal sencillo) /
 * .2 (doble cristal) de los componentes de corredera?
 *
 * Para cada línea de estructura C2/C3/C4 con serie GMC400: variante real
 * usada (GM445/446/447 = .1, GM449/450/451 = .2) frente a los campos de
 * VDatosLinEstr (nTAcris, DAcamara, Vidrio2...) y al vidrio de la línea.
 *
 * Solo lectura. Uso: node scripts/selector-variante.mjs
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

const datosLin = leer('VDatosLinEstr.csv')
const vLin = leer('VPresupuestosLin.csv')

const datosPorLinea = new Map()
for (const f of datosLin) datosPorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, f)

const V1 = new Set(['GM445', 'GM446', 'GM447', 'GM448'])
const V2 = new Set(['GM449', 'GM450', 'GM451', 'GM452'])

const padres = vLin.filter((f) => col(f, 'EstructuraSN') === 'True')
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

console.log('doc | linea | estr | variante | nTAcris | DAcamara | Vidrio2 | GrosorVidrioLin(art vidrio en hijas)')
const combinaciones = new Map()
for (const p of padres) {
  const d = datosPorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  if (!d || col(d, 'Conjunto1') !== 'GMC400') continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  let v1 = 0, v2 = 0
  const vidrios = new Set()
  for (const h of hijas) {
    const a = col(h, 'Articulo')
    if (V1.has(a)) v1++
    if (V2.has(a)) v2++
    if (col(h, 'Familia') === '050') vidrios.add(a)
  }
  if (!v1 && !v2) continue
  const variante = v2 && !v1 ? '.2' : v1 && !v2 ? '.1' : 'MIXTA'
  const k = `${variante} | nTAcris=${col(d, 'nTAcris')} | DAcamara=${col(d, 'DAcamara')} | Vidrio2=${col(d, 'Vidrio2') || '-'}`
  combinaciones.set(k, (combinaciones.get(k) ?? 0) + 1)
  if (combinaciones.get(k) <= 2) {
    console.log(`${col(p, 'nDoc')} | ${col(p, 'nLinea')} | ${col(p, 'Articulo')} | ${variante} | ${col(d, 'nTAcris')} | ${col(d, 'DAcamara')} | ${col(d, 'Vidrio2') || '-'} | ${[...vidrios].slice(0, 3).join(',')}`)
  }
}
console.log('\n=== Combinaciones variante <-> campos ===')
for (const [k, n] of [...combinaciones.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${k}`)
}
