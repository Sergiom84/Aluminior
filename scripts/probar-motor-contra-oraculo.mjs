/**
 * PRUEBA REAL: ejecutar el MOTOR DE PRODUCCIÓN contra el histórico.
 *
 * Hasta ahora todo se ha medido con scripts de análisis. Esto es distinto:
 * llama a `calcularDespiece` de packages/core —el código que valora de
 * verdad— sobre líneas reales del histórico y compara pieza a pieza con lo
 * que el ERP original cortó.
 *
 * Compara el MULTICONJUNTO de largos de corte por función (MV, MH, HV, HH,
 * TM…), que es lo que el motor determina sin depender de la resolución
 * genérico→perfil. Tolerancia 0,51 mm, la misma que usa medir-mixtas.
 *
 * Motivo concreto de la prueba: calcular.ts compara el rango
 * MedidaMinima/Maxima contra `Math.max(ancho, alto)`. El anexo S.6 demostró
 * que para los asociados esa referencia es incorrecta (hay que usar la
 * fórmula de la propia ranura). Esta prueba mide si también lo es para los
 * perfiles, en vez de suponerlo.
 *
 * Solo lectura sobre los CSV. Uso: npx tsx scripts/probar-motor-contra-oraculo.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { calcularDespiece } from '../packages/core/src/despiece/calcular.ts'

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
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
const vLin = leer('VPresupuestosLin.csv')

const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const TOLERANCIA = 0.51

// --- plantilla de perfiles por estructura ---
const plantillaPorEstructura = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  const fn = col(f, 'Funcion')
  if (!FUNCIONES_PERFIL.has(fn)) continue
  const e = col(f, 'Estructura')
  if (!plantillaPorEstructura.has(e)) plantillaPorEstructura.set(e, [])
  plantillaPorEstructura.get(e).push({
    articuloCodigo: col(f, 'Articulo') || '(genérico)',
    cantidad: col(f, 'Cantidad') || 1,
    formulaLargo: col(f, 'FormulaLargoCorte') || col(f, 'FormulaLargo') || null,
    tipoCorte: col(f, 'TipoCorte') || null,
    anguloIzquierdo: col(f, 'AnguloI') || null,
    anguloDerecho: col(f, 'AnguloD') || null,
    funcion: fn,
    medidaMinima: col(f, 'MedidaMin') || null,
    medidaMaxima: col(f, 'MedidaMax') || null,
    idItemDisenyo: Number(col(f, 'DisIdIt')) || null,
    grupoDisenyo: col(f, 'DisGrupo') || null,
  })
}

// --- cotas ---
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
  if (t !== 'VPRES') continue
  const e = col(f, 'Estructura')
  const simbolo = col(f, 'Simbolo') || simboloPorId.get(`${e}|${col(f, 'Id')}`) || ''
  if (!simbolo) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Cota')
}
const simboloDa = new Map(estructurasDa.map((f) => [
  `${col(f, 'Estructura')}|${col(f, 'nDA')}`, col(f, 'SimboloDA'),
]))
for (const f of medidasDa) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  const simbolo = simboloDa.get(`${col(f, 'Estructura')}|${col(f, 'nDA')}`)
  if (!simbolo) continue
  const k = `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!cotasInstancia.has(k)) cotasInstancia.set(k, {})
  cotasInstancia.get(k)[simbolo] = num(f, 'Medida')
}

// --- líneas reales ---
const hijasPorPadre = new Map()
for (const f of vLin) {
  const p = col(f, 'nEstr')
  if (!p || p === '0') continue
  if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
  hijasPorPadre.get(p).push(f)
}

let lineas = 0, sinPlantilla = 0
let piezasReales = 0, piezasCasadas = 0, incalculables = 0
const fallosPorFuncion = new Map()
const faltantesGlobal = new Map()
const lineasExactas = []
const rebajes = new Map()
const datosLin = leer('VDatosLinEstr.csv')
const seriePorLinea = new Map()
for (const f of datosLin) {
  if (col(f, 'TipoDoc') !== 'VPRES') continue
  seriePorLinea.set(`${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}
const sinHoja = { lineas: 0, reales: 0, casadas: 0, exactas: 0 }
const conHoja = { lineas: 0, reales: 0, casadas: 0, exactas: 0 }
for (const p of vLin) {
  if (col(p, 'EstructuraSN') !== 'True') continue
  const estructura = col(p, 'Articulo')
  const plantilla = plantillaPorEstructura.get(estructura)
  if (!plantilla) { sinPlantilla++; continue }
  const ancho = num(p, 'Ancho'), largo = num(p, 'Largo')
  if (ancho <= 0 || largo <= 0) continue
  const k = `${col(p, 'nDoc')}|${col(p, 'nLinea')}`

  // cortes reales por función
  const reales = new Map()
  for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
    const fn = col(h, 'Funcion')
    if (!FUNCIONES_PERFIL.has(fn)) continue
    const corte = num(h, 'LargoCorte') || num(h, 'Largo')
    if (corte <= 0) continue
    const cant = Math.max(1, Math.round(num(h, 'Cdad')))
    if (!reales.has(fn)) reales.set(fn, [])
    for (let i = 0; i < cant; i++) reales.get(fn).push(corte)
  }
  if (!reales.size) continue
  lineas++

  // El motor de producción, tal cual
  const cotas = { ...(cotasDefecto.get(estructura) ?? {}), ...(cotasInstancia.get(k) ?? {}) }
  const r = calcularDespiece(plantilla, { anchoMm: largo, altoMm: ancho }, cotas)
  incalculables += r.incalculables
  for (const v of r.variablesFaltantes) faltantesGlobal.set(v, (faltantesGlobal.get(v) ?? 0) + 1)

  const previstas = new Map()
  for (const pieza of r.piezas) {
    if (pieza.largoMm === null || !FUNCIONES_PERFIL.has(pieza.funcion ?? '')) continue
    if (!previstas.has(pieza.funcion)) previstas.set(pieza.funcion, [])
    for (let i = 0; i < Math.max(1, Math.round(pieza.cantidad)); i++) {
      previstas.get(pieza.funcion).push(pieza.largoMm)
    }
  }

  // Depuración de una línea concreta: DEPURAR_LINEA=<nDoc|nLinea>
  if (process.env.DEPURAR_LINEA === k) {
    console.log(`\n[DEPURAR] ${k}  estructura=${estructura}  L=${largo} A=${ancho}`)
    console.log(`  cotas: ${JSON.stringify(cotas)}`)
    for (const fn of ['MV', 'MH', 'HV', 'HH', 'TM']) {
      const r0 = (reales.get(fn) ?? []).map((x) => Math.round(x))
      const p0 = (previstas.get(fn) ?? []).map((x) => Math.round(x))
      if (!r0.length && !p0.length) continue
      console.log(`  ${fn}  real (${r0.length}): ${r0.join(', ')}`)
      console.log(`  ${fn}  motor(${p0.length}): ${p0.join(', ')}`)
    }
  }

  // ¿El desajuste de la hoja es un REBAJE estable? Se compara la moda del
  // corte real contra la del corte del motor, por (serie, función). Si es
  // estable con los umbrales de siempre, es un descuento que falta.
  const serie = seriePorLinea.get(k) ?? '?'
  for (const fn of ['HV', 'HH']) {
    const r0 = reales.get(fn) ?? [], p0 = previstas.get(fn) ?? []
    if (!r0.length || r0.length !== p0.length) continue
    const a = [...r0].sort((x, y) => x - y), b = [...p0].sort((x, y) => x - y)
    for (let i = 0; i < a.length; i++) {
      const kk = `${serie}|${fn}`
      if (!rebajes.has(kk)) rebajes.set(kk, new Map())
      const m = rebajes.get(kk)
      const d = Math.round((b[i] - a[i]) * 10) / 10
      m.set(d, (m.get(d) ?? 0) + 1)
    }
  }

  // emparejar por función, con tolerancia
  let casadasLinea = 0, realesLinea = 0
  for (const [fn, lista] of reales) {
    realesLinea += lista.length
    const disponibles = [...(previstas.get(fn) ?? [])]
    for (const corte of lista) {
      const i = disponibles.findIndex((x) => Math.abs(x - corte) <= TOLERANCIA)
      if (i >= 0) { disponibles.splice(i, 1); casadasLinea++ }
      else fallosPorFuncion.set(fn, (fallosPorFuncion.get(fn) ?? 0) + 1)
    }
  }
  piezasReales += realesLinea
  piezasCasadas += casadasLinea
  if (casadasLinea === realesLinea) lineasExactas.push(k)

  // Control del arnés: separar las líneas SIN hoja (sólo marco y travesaños)
  // de las que llevan hoja. Si las primeras casan y las segundas no, el
  // problema está en la descomposición de hojas, no en esta prueba.
  const tieneHoja = reales.has('HV') || reales.has('HH')
  const g = tieneHoja ? conHoja : sinHoja
  g.lineas++
  g.reales += realesLinea
  g.casadas += casadasLinea
  if (casadasLinea === realesLinea) g.exactas++
}

console.log('=== PRUEBA REAL DEL MOTOR (calcularDespiece) CONTRA EL HISTÓRICO ===\n')
console.log(`Líneas de presupuesto evaluadas:      ${lineas}`)
console.log(`Estructuras sin plantilla de perfil:  ${sinPlantilla}`)
console.log(`\nPiezas reales:    ${piezasReales}`)
console.log(`Piezas casadas:   ${piezasCasadas}  (${(100 * piezasCasadas / piezasReales).toFixed(2)}%)`)
console.log(`Líneas con TODAS las piezas casadas: ${lineasExactas.length}/${lineas}  (${(100 * lineasExactas.length / lineas).toFixed(1)}%)`)
console.log(`Piezas que el motor no supo calcular: ${incalculables}`)

const informe = (nombre, g) => {
  if (!g.lineas) return
  console.log(`  ${nombre.padEnd(34)} ${String(g.lineas).padStart(5)} líneas   piezas ${g.casadas}/${g.reales} (${(100 * g.casadas / g.reales).toFixed(1)}%)   exactas ${g.exactas}/${g.lineas} (${(100 * g.exactas / g.lineas).toFixed(1)}%)`)
}
console.log('\n--- control del arnés: con hoja frente a sin hoja ---')
informe('líneas SIN hoja (marco/travesaño)', sinHoja)
informe('líneas CON hoja (HV/HH)', conHoja)

console.log('\n--- ¿el desajuste de hoja es un rebaje estable? (serie | función) ---')
let estables = 0, cubiertos = 0, totalReb = 0
const filas = []
for (const [kk, m] of rebajes) {
  const t = [...m.values()].reduce((a, b) => a + b, 0)
  const [d, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
  totalReb += t
  const ok = t >= 3 && n / t >= 0.9
  if (ok) { estables++; cubiertos += t }
  filas.push({ kk, d, n, t, ok })
}
for (const f of filas.sort((a, b) => b.t - a.t).slice(0, 14)) {
  console.log(`  ${f.ok ? '✔' : '✘'} ${f.kk.padEnd(20)} rebaje=${String(f.d).padStart(7)}  ${f.n}/${f.t}`)
}
console.log(`  Reglas estables (>=3, >=90%): ${estables}/${rebajes.size}   piezas cubiertas: ${cubiertos}/${totalReb}`)

if (fallosPorFuncion.size) {
  console.log('\n--- piezas reales sin pareja, por función ---')
  for (const [fn, n] of [...fallosPorFuncion].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${fn.padEnd(4)} ${n}`)
  }
}
if (faltantesGlobal.size) {
  console.log('\n--- variables que faltaron (el motor avisa, no inventa) ---')
  for (const [v, n] of [...faltantesGlobal].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`  ${v.padEnd(10)} en ${n} líneas`)
  }
}
