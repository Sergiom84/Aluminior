/**
 * MEDICIÓN: las condiciones de ConjuntosAsoc que siguen sin semántica.
 *
 *  - `AperturaTH` (punto 5 de S.7: "190 filas, última condición sin
 *    semántica")
 *  - `AsocAGrupoAsoc` / `GrupoAsoc`
 *
 * Para cada una: ¿cuántas filas del oráculo afecta, y de esas cuántas
 * corresponden a artículos AUSENTES (aplicarla evitaría falsos positivos) o
 * PRESENTES (aplicarla perdería aciertos)? Una condición que no toca
 * ninguna fila del oráculo no se implementa: sería código sin probar.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-condiciones-restantes.mjs
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

const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const opcionesDoc = leer('VOpcionesHerraje.csv')
const articulos = leer('Articulos.csv')
const estArt = leer('EstructurasArticulos.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

const CONDICIONES = ['AperturaTH', 'AsocAGrupoAsoc', 'GrupoAsoc', 'SoloUnaSN', 'PVCrefuerzoSN', 'SoloPerfPpalSN', 'InsertadoSN']
console.log('--- alcance en el catálogo completo ---')
for (const campo of CONDICIONES) {
  const frec = new Map()
  for (const f of conjuntosAsoc) {
    const v = col(f, campo)
    // 'False' no es una condición marcada: es el valor por defecto de las
    // columnas booleanas. Contarlo mete de ruido todo el catálogo.
    if (!v || v === '0' || v === 'False') continue
    frec.set(v, (frec.get(v) ?? 0) + 1)
  }
  const total = [...frec.values()].reduce((a, b) => a + b, 0)
  const vals = [...frec].sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([v, n]) => `${JSON.stringify(v)}×${n}`).join('  ')
  console.log(`  ${campo.padEnd(18)} ${String(total).padStart(6)} filas   ${vals}`)
}

// --- índices ---
const asocPorConjunto = new Map()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
}
const opcionesPorLinea = new Map()
for (const f of opcionesDoc) {
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcionesPorLinea.has(k)) opcionesPorLinea.set(k, new Map())
  const porConj = opcionesPorLinea.get(k)
  const cj = col(f, 'Conjunto')
  if (!porConj.has(cj)) porConj.set(cj, new Set())
  if (col(f, 'SelecSN') === 'True') porConj.get(cj).add(col(f, 'nOpcion'))
}
const ranurasInstancia = new Map()
for (const f of estArt) {
  const t = col(f, 'TipoDoc')
  if (!t) continue
  const dis = col(f, 'DisComponente')
  if (!dis || dis === '0') continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!ranurasInstancia.has(k)) ranurasInstancia.set(k, new Map())
  const m = ranurasInstancia.get(k)
  m.set(dis, (m.get(dis) ?? 0) + (num(f, 'Cantidad') || 1))
}

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const ESPECIALES = new Set(['A', 'L', '!', '59R'])

const stats = new Map(CONDICIONES.map((c) => [c, { filas: 0, ausentes: 0, presentes: 0, arts: new Map() }]))
let lineas = 0
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
    const opciones = opcionesPorLinea.get(k)
    const ranuras = ranurasInstancia.get(k)
    if (!opciones || !ranuras) continue
    const reales = new Set()
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
      const fam = famPorArt.get(art) ?? ''
      if (fam === '050' || fam === '051') continue
      reales.add(art)
    }
    if (!reales.size) continue
    lineas++
    for (const [cj, marcadas] of opciones) {
      for (const f of asocPorConjunto.get(cj) ?? []) {
        const nOp = col(f, 'nOpcion')
        if (nOp && nOp !== '0' && !marcadas.has(nOp)) continue
        const comp = col(f, 'ComponenteAsoc')
        if (comp && !ESPECIALES.has(comp) && !ranuras.has(comp)) continue
        const art = col(f, 'Articulo')
        for (const campo of CONDICIONES) {
          const v = col(f, campo)
          // 'False' no es una condición marcada: es el valor por defecto de las
    // columnas booleanas. Contarlo mete de ruido todo el catálogo.
    if (!v || v === '0' || v === 'False') continue
          const s = stats.get(campo)
          s.filas++
          if (reales.has(art)) s.presentes++
          else {
            s.ausentes++
            s.arts.set(art, (s.arts.get(art) ?? 0) + 1)
          }
        }
      }
    }
  }
}
console.log(`\n--- efecto sobre las ${lineas} líneas del oráculo ---`)
console.log('(filas que HOY pasan el filtro de v5 y llevan la condición marcada)')
for (const campo of CONDICIONES) {
  const s = stats.get(campo)
  console.log(`\n  ${campo}: ${s.filas} filas`)
  if (!s.filas) { console.log('    sin efecto medible sobre el oráculo'); continue }
  console.log(`    artículo AUSENTE del oráculo (aplicarla evitaría FP): ${s.ausentes}`)
  console.log(`    artículo PRESENTE (aplicarla perdería aciertos):      ${s.presentes}`)
  for (const [a, n] of [...s.arts].sort((x, y) => y[1] - x[1]).slice(0, 6)) {
    console.log(`      ${String(n).padStart(4)}  ${a.padEnd(12)} ${(descArt.get(a) ?? '').slice(0, 38)}`)
  }
}
