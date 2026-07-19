/**
 * MEDICIÓN: asociados de SUBESTRUCTURAS anidadas (S.9.3).
 *
 * GM4090 se declara sólo en el conjunto GMBASTIDOR, que no aparece entre las
 * opciones de ninguna de las 18 líneas donde la goma es real. La hipótesis es
 * que llega desde un bastidor anidado: EstructurasArticulos.Subestructura
 * apunta a otra estructura, que a su vez tiene su propio conjunto y sus
 * propios asociados.
 *
 * Aquí se comprueba, sin construir nada:
 *  1. ¿Qué estructuras declaran subestructuras y cuáles?
 *  2. En las 18 líneas con GM4090, ¿la estructura de la línea tiene una
 *     subestructura cuyo conjunto sea GMBASTIDOR?
 *  3. ¿La cantidad real se explica por las filas comp='A'/'L' del bastidor
 *     aplicadas a cada aparición de la subestructura?
 *
 * Solo lectura. Uso: npx tsx scripts/medir-subestructuras.mjs
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

const estArt = leer('EstructurasArticulos.csv')
const articulos = leer('Articulos.csv')
const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

// --- 1. subestructuras declaradas ---
const subDePlantilla = new Map() // estructura -> Map(subestructura -> nº filas)
let filasConSub = 0
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const sub = col(f, 'Subestructura')
  if (!sub || sub === '0') continue
  filasConSub++
  const e = col(f, 'Estructura')
  if (!subDePlantilla.has(e)) subDePlantilla.set(e, new Map())
  const m = subDePlantilla.get(e)
  m.set(sub, (m.get(sub) ?? 0) + 1)
}
console.log(`Filas de plantilla con Subestructura: ${filasConSub}`)
console.log(`Estructuras que anidan subestructuras: ${subDePlantilla.size}`)
const subFrec = new Map()
for (const [, m] of subDePlantilla) for (const [sub, n] of m) subFrec.set(sub, (subFrec.get(sub) ?? 0) + n)
console.log('\n--- subestructuras más usadas ---')
for (const [sub, n] of [...subFrec].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${String(n).padStart(5)}  ${sub}`)
}

// --- 2. ¿qué conjunto resuelve el bastidor? ---
const conjuntosDe = new Map()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  if (!conjuntosDe.has(art)) conjuntosDe.set(art, new Set())
  conjuntosDe.get(art).add(cj)
}
const filasBastidor = conjuntosAsoc.filter((f) => col(f, 'Conjunto') === 'GMBASTIDOR')
console.log(`\nFilas de ConjuntosAsoc del conjunto GMBASTIDOR: ${filasBastidor.length}`)
for (const f of filasBastidor.slice(0, 12)) {
  console.log(`  art=${col(f, 'Articulo').padEnd(10)} comp=${col(f, 'ComponenteAsoc').padEnd(5)} cdad=${col(f, 'Cantidad').padEnd(4)} asocA=${col(f, 'AsociadoA') || '·'}`)
}

// --- 3. las líneas con GM4090 ---
const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const GOMA = 'GM4090'

// subestructuras materializadas en la instancia
const subInstancia = new Map() // tipo|doc|linea -> Map(sub -> cantidad)
for (const f of estArt) {
  const t = col(f, 'TipoDoc')
  if (!t) continue
  const sub = col(f, 'Subestructura')
  if (!sub || sub === '0') continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!subInstancia.has(k)) subInstancia.set(k, new Map())
  const m = subInstancia.get(k)
  m.set(sub, (m.get(sub) ?? 0) + (num(f, 'Cantidad') || 1))
}

console.log('\n--- las líneas donde GM4090 es real ---')
let n = 0, conSub = 0
const casos = []
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
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    let real = 0, largos = []
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      if (col(h, 'Articulo') !== GOMA) continue
      real += num(h, 'Cdad') || 0
      largos.push(num(h, 'LargoCorte') || num(h, 'Largo'))
    }
    if (real <= 0) continue
    n++
    const estructura = col(p, 'Articulo')
    const subsPlantilla = subDePlantilla.get(estructura) ?? new Map()
    const subsInst = subInstancia.get(k) ?? new Map()
    const bastidores = [...subsPlantilla.keys()].filter((s) => (conjuntosDe.get(GOMA) ?? new Set()).size && s.toUpperCase().includes('BAST'))
    if (subsPlantilla.size) conSub++
    casos.push({ k, estructura, real, largos, subsPlantilla, subsInst, bastidores })
  }
}
console.log(`Líneas con GM4090 real: ${n}   con subestructuras en su plantilla: ${conSub}`)
for (const c of casos.slice(0, 12)) {
  const sp = [...c.subsPlantilla].map(([s, x]) => `${s}×${x}`).join(' ') || '(ninguna)'
  const si = [...c.subsInst].map(([s, x]) => `${s}×${x}`).join(' ') || '(ninguna)'
  console.log(`  ${c.k.padEnd(18)} estr=${c.estructura.padEnd(12)} real=${String(c.real).padStart(3)}`)
  console.log(`      subs plantilla: ${sp}`)
  console.log(`      subs instancia: ${si}`)
  console.log(`      largos de goma: ${c.largos.slice(0, 8).join(', ')}`)
}
