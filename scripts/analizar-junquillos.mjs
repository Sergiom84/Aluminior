/**
 * JUNQUILLOS Y JUNTAS, fase de medición.
 *
 * Mecanismo hipotético: la serie declara TablaHojas/TablaFijos -> tabla
 * TAcristalamiento; TAcristalamientoLin da, por grosor, el Junquillo,
 * JuntaExt y JuntaInt.
 *
 * Preguntas:
 *  1. ¿Qué tabla TAcris usa cada serie? (Conjuntos.TablaHojas)
 *  2. ¿Qué "grosor" casa con el vidrio elegido? (GrosorPesoVid, DAgrosor,
 *     TamJunqGoma del artículo de vidrio…)
 *  3. En documentos reales: ¿los junquillos/juntas presentes coinciden con
 *     la fila de TAcristalamientoLin del grosor del vidrio usado?
 *  4. ¿Qué longitudes llevan los junquillos frente a las medidas del vidrio?
 *
 * Solo lectura. Uso: node scripts/analizar-junquillos.mjs
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
const tacris = leer('TAcristalamiento.csv')
const tacrisLin = leer('TAcristalamientoLin.csv')
const vLin = leer('VPresupuestosLin.csv')
const datosLin = leer('VDatosLinEstr.csv')
const articulos = leer('Articulos.csv')
const porArt = new Map(articulos.map((a) => [col(a, 'Codigo'), a]))

// 1. TablaHojas por serie (las series con documentos)
console.log('=== 1. TablaHojas/TablaFijos de las series con histórico ===')
const SERIES = ['ELEGANTPVC', 'GMA350', 'GMA100', 'GMC400', 'GMPC65', 'GMA65OPT']
const tablaHojasPorSerie = new Map()
for (const s of SERIES) {
  const c = conjuntos.find((x) => col(x, 'Codigo') === s)
  if (!c) continue
  tablaHojasPorSerie.set(s, col(c, 'TablaHojas'))
  console.log(`  ${s.padEnd(12)} TablaHojas=${col(c, 'TablaHojas') || '—'}  TablaFijos=${col(c, 'TablaFijos') || '—'}  GrosorCristal=${col(c, 'GrosorCristal') || '—'}`)
}

// 2. Filas de TAcristalamientoLin de esas tablas
console.log('\n=== 2. TAcristalamientoLin de esas tablas ===')
for (const [s, t] of tablaHojasPorSerie) {
  if (!t) continue
  const filas = tacrisLin.filter((f) => col(f, 'TAcris') === t)
  console.log(`  ${s} -> ${t}: ${filas.length} filas`)
  for (const f of filas.slice(0, 8)) {
    console.log(`     Pos=${col(f, 'Pos').padEnd(3)} Grosor=${col(f, 'Grosor').padEnd(6)} Junq=${col(f, 'Junquillo').padEnd(9)} JExt=${col(f, 'JuntaExt').padEnd(9)} JInt=${col(f, 'JuntaInt')}`)
  }
}

// 3. Campos de grosor de los vidrios más usados
console.log('\n=== 3. Campos de grosor de vidrios usados ===')
for (const v of ['V420AGS4', 'V484', 'V48CG4', 'V48GS4', 'PAN16', 'VL44I16AL44GS']) {
  const a = porArt.get(v)
  if (!a) continue
  console.log(`  ${v.padEnd(14)} GrosorPesoVid=${col(a, 'GrosorPesoVid').padEnd(4)} DAgrosor=${col(a, 'DAgrosor').padEnd(6)} TamJunqGoma=${col(a, 'TamJunqGoma').padEnd(6)} DAVid1=${col(a, 'DAVid1').padEnd(5)} DACam1=${col(a, 'DACam1').padEnd(5)} DAVid2=${col(a, 'DAVid2')}`)
}

// 4. Documento real: junquillos y sus longitudes frente al vidrio
console.log('\n=== 4. Junquillos/juntas y longitudes en líneas reales (ELEGANTPVC) ===')
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
let mostradas = 0
for (const p of padres) {
  if (mostradas >= 2) break
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  if (serie !== 'ELEGANTPVC') continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const vidrios = hijas.filter((h) => (col(porArt.get(col(h, 'Articulo')) ?? {}, 'Familia')) === '050')
  if (!vidrios.length) continue
  mostradas++
  console.log(`\n  Doc ${col(p, 'nDoc')} línea ${col(p, 'nLinea')} hueco ${col(p, 'Largo')}×${col(p, 'Ancho')}`)
  for (const h of hijas) {
    const art = col(h, 'Articulo')
    const a = porArt.get(art)
    if (!a) continue
    const fam = col(a, 'Familia')
    const desc = col(a, 'Descripcion')
    const esInteres = fam === '050' || /JUNQ|JUNTA|GOMA/i.test(desc)
    if (!esInteres) continue
    console.log(`    ${art.padEnd(12)} x${col(h, 'Cdad').padEnd(3)} L=${col(h, 'LargoCorte').padEnd(9)} ${desc.slice(0, 40)}`)
  }
}
