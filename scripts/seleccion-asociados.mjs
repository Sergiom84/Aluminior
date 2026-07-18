/**
 * Semántica de SELECCIÓN de ConjuntosAsoc: para el documento 764 (serie
 * GMA350, estructura 2P), compara los asociados reales (con cantidades)
 * contra las filas candidatas de ConjuntosAsoc de la cadena, mostrando los
 * campos discriminantes: ComponenteAsoc, AperturaTH, nOpcion, Intervalo,
 * MedidaMin/Max, Cantidad, FormulaL.
 *
 * Solo lectura. Uso: node scripts/seleccion-asociados.mjs [nDoc] [nLinea]
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

const nDoc = process.argv[2] ?? '764'
const nLineaPadre = process.argv[3] ?? '273870'

const conjuntos = leer('Conjuntos.csv')
const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const vLin = leer('VPresupuestosLin.csv')
const articulos = leer('Articulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

const ficha = new Map(conjuntos.map((c) => [col(c, 'Codigo'), c]))
const COLS_DELEGA = Object.keys(conjuntos[0] ?? {}).filter((k) =>
  /^(TablaHojas\d?|TablaFijos\d?|TablaDobleH\d?|SubSerieDe|herr.+)$/.test(k),
)
function cadena(serie) {
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
  return [...vistos]
}

// Serie del padre (Conjunto1 de VDatosLinEstr)
const datosLin = leer('VDatosLinEstr.csv')
const dl = datosLin.find((f) => col(f, 'nVDoc') === nDoc && col(f, 'nVLinea') === nLineaPadre)
const serie = dl ? col(dl, 'Conjunto1') : null
console.log(`Doc ${nDoc}, línea ${nLineaPadre}: serie ${serie}`)
if (!serie) process.exit(1)
const cad = cadena(serie)
console.log(`Cadena: ${cad.join(', ')}`)

// Reales
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const reales = new Map()
for (const f of vLin) {
  if (col(f, 'nEstr') !== nLineaPadre) continue
  const art = col(f, 'Articulo'), fn = col(f, 'Funcion')
  if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
  const fam = famPorArt.get(art) ?? ''
  if (fam === '050' || fam === '051') continue
  const acc = reales.get(art) ?? { apariciones: 0, cdadTotal: 0 }
  acc.apariciones++
  acc.cdadTotal += Number(col(f, 'Cdad').replace(',', '.')) || 0
  reales.set(art, acc)
}
console.log(`\n=== Asociados REALES (${reales.size} artículos) ===`)
for (const [a, v] of reales) {
  console.log(`  ${a.padEnd(10)} x${String(v.cdadTotal).padEnd(5)} (${v.apariciones} líneas)  ${(descArt.get(a) ?? '').slice(0, 40)}`)
}

// Candidatas de ConjuntosAsoc para la cadena, marcando si el artículo es real
console.log(`\n=== Filas de ConjuntosAsoc de la cadena ===`)
console.log('  ✔=el artículo aparece en el documento')
const CAMPOS = ['Conjunto', 'Articulo', 'Cantidad', 'ComponenteAsoc', 'FamiliaAsoc', 'GrupoAsoc', 'ArticuloAsoc', 'AperturaTH', 'nOpcion', 'Intervalo', 'MedidaMin', 'MedidaMax', 'FormulaL', 'SoloUnaSN', 'AsocAModulo', 'AsociadoA']
const enCadena = conjuntosAsoc.filter((f) => cad.includes(col(f, 'Conjunto')))
console.log(`  total ${enCadena.length} filas\n`)
console.log('  ' + CAMPOS.map((c) => c.slice(0, 9).padEnd(10)).join(''))
for (const f of enCadena) {
  const marca = reales.has(col(f, 'Articulo')) ? '✔' : ' '
  console.log(`${marca} ` + CAMPOS.map((c) => col(f, c).slice(0, 9).padEnd(10)).join(''))
}
