/**
 * MEDICIÓN: ¿cuánto se desvía la medida evaluada de la ranura respecto del
 * tramo que el oráculo eligió realmente?
 *
 * Una "familia de tramos" son las filas de ConjuntosAsoc de un mismo
 * (Conjunto, ComponenteAsoc, nOpcion) que sólo se diferencian por
 * MedidaMin/MedidaMax: cremonas, pletinas de compás, tirantes. En cada
 * línea del oráculo donde la familia aporta EXACTAMENTE un artículo real,
 * su rango declara el intervalo en que cayó la medida verdadera. Comparando
 * ese intervalo con la medida que evaluamos se obtiene el desvío, con signo.
 *
 * Si el desvío es una constante estable por (serie, componente), es un
 * ajuste que se puede aprender con los umbrales de siempre (≥3, ≥90%).
 * Si es ruido, el problema es el contexto de cotas y hay que decirlo.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-desvio-tramos.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { evaluar } from '../packages/core/src/despiece/formula.ts'

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
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]

// --- familias de tramos: mismo (conjunto, comp, opción) con rangos ---
const asocPorConjunto = new Map()
const familias = new Map() // conjunto|comp|opcion -> filas con rango
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
  if (num(f, 'MedidaMax') <= 0) continue
  const k = `${cj}|${col(f, 'ComponenteAsoc')}|${col(f, 'nOpcion')}`
  if (!familias.has(k)) familias.set(k, [])
  familias.get(k).push(f)
}
// una familia sólo es informativa si tiene 2+ tramos distintos
for (const [k, filas] of [...familias]) {
  const arts = new Set(filas.map((f) => col(f, 'Articulo')))
  if (arts.size < 2) familias.delete(k)
}
console.log(`Familias de tramos (≥2 artículos por rango): ${familias.size}`)

// --- plantilla, cotas, instancias (idéntico a v5) ---
const ranurasPlantilla = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const comp = col(f, 'DisComponente')
  if (!comp || comp === '0') continue
  const e = col(f, 'Estructura')
  if (!ranurasPlantilla.has(e)) ranurasPlantilla.set(e, new Map())
  const m = ranurasPlantilla.get(e)
  if (!m.has(comp)) m.set(comp, [])
  m.get(comp).push({
    formula: col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo'),
    mano: col(f, 'DisManoID'),
  })
}
const cotasDefecto = new Map()
const simboloPorId = new Map()
for (const f of estDis) {
  if (col(f, 'TipoDoc')) continue
  const e = col(f, 'Estructura'), simbolo = col(f, 'Simbolo')
  if (!simbolo) continue
  if (!cotasDefecto.has(e)) cotasDefecto.set(e, {})
  cotasDefecto.get(e)[simbolo] = num(f, 'Cota')
  const id = col(f, 'Id')
  if (id) simboloPorId.set(`${e}|${id}`, simbolo)
}
const cotasInstancia = new Map()
for (const f of estDis) {
  const t = col(f, 'TipoDoc')
  if (!t) continue
  const e = col(f, 'Estructura')
  const simbolo = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  if (!simbolo) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Cota')
}
const simboloDa = new Map(estructurasDa.map((f) => [
  `${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA'),
]))
for (const f of medidasDa) {
  const simbolo = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!simbolo) continue
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Medida')
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

// --- recorrer el oráculo ---
const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const desvios = new Map() // conjunto|comp -> [{delta, ...}]
let casos = 0, sinFormula = 0, dentro = 0, fuera = 0
let defectoDentro = 0, defectoFuera = 0
const fuentes = new Map() // fuente -> {ok, total}
const registrarFuente = (nombre, ok, unico) => {
  const a = fuentes.get(nombre) ?? { ok: 0, unico: 0, total: 0 }
  a.total++; if (ok) a.ok++; if (unico) a.unico++
  fuentes.set(nombre, a)
}
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
    const reales = new Map()
    const cortesPorFuncion = new Map() // Funcion -> [largos de corte reales]
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0') continue
      if (FUNCIONES_PERFIL.has(fn)) {
        const corte = num(h, 'LargoCorte') || num(h, 'Largo')
        if (corte > 0) {
          if (!cortesPorFuncion.has(fn)) cortesPorFuncion.set(fn, [])
          cortesPorFuncion.get(fn).push(corte)
        }
        continue
      }
      const fam = famPorArt.get(art) ?? ''
      if (fam === '050' || fam === '051') continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    if (!reales.size) continue
    const estructura = col(p, 'Articulo')
    const contexto = {
      L: num(p, 'Largo'), A: num(p, 'Ancho'),
      ...(cotasDefecto.get(estructura) ?? {}),
      ...(cotasInstancia.get(k) ?? {}),
    }
    for (const [clave, filas] of familias) {
      const [cj, comp, opcion] = clave.split('|')
      if (!opciones.has(cj)) continue
      if (opcion && opcion !== '0' && !opciones.get(cj).has(opcion)) continue
      if (!ranuras.has(comp)) continue
      // artículos de la familia presentes en el oráculo de esta línea
      const presentes = filas.filter((f) => reales.has(col(f, 'Articulo')))
      const artsPresentes = new Set(presentes.map((f) => col(f, 'Articulo')))
      if (artsPresentes.size !== 1) continue // ambiguo: no informa
      const elegido = presentes[0]
      const min = num(elegido, 'MedidaMin'), max = num(elegido, 'MedidaMax')
      // medidas evaluadas de esa ranura
      const apariciones = ranurasPlantilla.get(estructura)?.get(comp) ?? []
      const medidas = []
      for (const { formula } of apariciones) {
        if (!formula) continue
        try { medidas.push(evaluar(formula, contexto)) } catch { /* sin medida */ }
      }
      casos++
      if (!medidas.length) { sinFormula++; continue }
      // ¿la fórmula depende de algún símbolo que la INSTANCIA no trae y que
      // se ha rellenado con la cota por defecto de la plantilla?
      const inst = cotasInstancia.get(k) ?? {}
      const simbolosUsados = new Set()
      for (const { formula } of apariciones) {
        for (const s of (formula ?? '').match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? []) simbolosUsados.add(s)
      }
      const porDefecto = [...simbolosUsados].filter((s) => s !== 'L' && s !== 'A' && !(s in inst))

      // ¿Qué fuente de medida acierta el tramo? La fórmula (actual) frente a
      // los CORTES REALES de perfil de la línea, que es como se resolvió la
      // junta perimetral (S.7.2).
      // Una fuente sólo sirve si señala el tramo correcto Y DESCARTA los
      // demás de la familia. "Algún corte cae dentro" es casi tautológico
      // cuando la línea tiene muchos cortes: se mide también la exclusión.
      const otrosTramos = filas.filter((f) => col(f, 'Articulo') !== col(elegido, 'Articulo'))
        .map((f) => [num(f, 'MedidaMin'), num(f, 'MedidaMax')])
      const cae = (vals, lo, hi) => vals.some((v) => v >= lo && v <= hi)
      const evaluarFuente = (nombre, vals) => {
        const ok = cae(vals, min, max)
        const otros = otrosTramos.filter(([lo, hi]) => cae(vals, lo, hi)).length
        registrarFuente(nombre, ok, ok && otros === 0)
      }
      evaluarFuente('formula', medidas)
      for (const fn of FUNCIONES_PERFIL) evaluarFuente(`corte:${fn}`, cortesPorFuncion.get(fn) ?? [])
      evaluarFuente('corte:cualquiera', [...cortesPorFuncion.values()].flat())
      // desvío mínimo hasta caer dentro del rango correcto
      let mejor = null
      for (const m of medidas) {
        const d = m < min ? min - m : (m > max ? max - m : 0)
        if (mejor === null || Math.abs(d) < Math.abs(mejor)) mejor = d
      }
      if (mejor === 0) { dentro++; if (porDefecto.length) defectoDentro++; continue }
      fuera++
      if (porDefecto.length) defectoFuera++
      const kk = `${cj}|${comp}`
      if (!desvios.has(kk)) desvios.set(kk, [])
      desvios.get(kk).push({
        delta: mejor, art: col(elegido, 'Articulo'), estructura, porDefecto,
        medidas: medidas.map((m) => Math.round(m)), rango: `${min}-${max}`,
      })
    }
  }
}
console.log(`\nCasos familia×línea evaluables: ${casos}`)
console.log(`  la medida evaluada YA cae en el tramo correcto: ${dentro}`)
console.log(`  cae fuera del tramo correcto:                   ${fuera}`)
console.log(`  la plantilla no trae fórmula para la ranura:    ${sinFormula}`)
console.log(`\nCotas rellenadas con el valor por defecto de la plantilla:`)
console.log(`  entre los que aciertan el tramo: ${defectoDentro}/${dentro}`)
console.log(`  entre los que fallan el tramo:   ${defectoFuera}/${fuera}`)

console.log('\n--- ¿qué fuente de medida acierta el tramo del oráculo? ---')
console.log('   (acierta = cae en el tramo bueno; único = y en NINGÚN otro de la familia)')
for (const [nombre, a] of [...fuentes].sort((x, y) => y[1].unico - x[1].unico)) {
  console.log(`  ${nombre.padEnd(20)} acierta ${String(a.ok).padStart(3)}/${a.total} (${(100 * a.ok / a.total).toFixed(1)}%)   único ${String(a.unico).padStart(3)}/${a.total} (${(100 * a.unico / a.total).toFixed(1)}%)`)
}

console.log('\n--- desvío por (conjunto | componente): ¿constante o ruido? ---')
const ordenadas = [...desvios.entries()].sort((a, b) => b[1].length - a[1].length)
for (const [kk, obs] of ordenadas.slice(0, 20)) {
  const modaMap = new Map()
  for (const o of obs) modaMap.set(o.delta, (modaMap.get(o.delta) ?? 0) + 1)
  const [moda, n] = [...modaMap].sort((a, b) => b[1] - a[1])[0]
  const estable = obs.length >= 3 && n / obs.length >= 0.9
  console.log(`  ${estable ? '✔' : '✘'} ${kk.padEnd(16)} n=${String(obs.length).padStart(4)}  moda=${String(moda).padStart(7)} (${n}/${obs.length})  distintos=${modaMap.size}`)
  if (!estable) {
    const ej = obs.slice(0, 3).map((o) => `${o.art}[${o.rango}] eval=${o.medidas.join('/')} d=${o.delta} porDefecto=${o.porDefecto.join(',') || '·'}`)
    for (const e of ej) console.log(`        ${e}`)
  }
}
