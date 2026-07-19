/**
 * MEDICIÓN: ¿la goma GM4090 sigue el perímetro del HUECO o la dimensión del
 * VIDRIO?
 *
 * S.9.5 dejó establecido que la goma va por hueco acristalado (2 filas por
 * vidrio, Cdad=2, una por eje) pero que el delta contra las dimensiones del
 * VIDRIO no alcanza los umbrales: el eje L ronda 79-100% y el eje A 57-67%,
 * con deltas distintos por eje (~64-76 frente a ~51-61).
 *
 * La hipótesis física es que la goma recorre el hueco, que es MAYOR que el
 * vidrio por el alojamiento (anexo Q). Se mide aquí contra las dimensiones
 * del módulo — las ranuras de hoja (DisComponente='1') con sus
 * FormulaLargo/FormulaAncho evaluadas con las cotas reales de la línea, que
 * es la misma maquinaria de packages/etl/src/medir-mixtas.ts.
 *
 * Si el delta contra el hueco es más estable que contra el vidrio, la regla
 * es esa. Si no lo es, se anota y no se codifica nada.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-goma-hueco.mjs
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

const articulos = leer('Articulos.csv')
const datosLin = leer('VDatosLinEstr.csv')
const estArt = leer('EstructurasArticulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const estructurasDa = leer('EstructurasDA.csv')
const medidasDa = leer('VMedidasDA.csv')
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

// --- módulos (ranuras de hoja) por estructura ---
const slotsPorEstructura = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc')) continue
  if (col(f, 'DisComponente') !== '1') continue
  const e = col(f, 'Estructura')
  if (!slotsPorEstructura.has(e)) slotsPorEstructura.set(e, [])
  slotsPorEstructura.get(e).push(f)
}

// --- cotas (igual que v5) ---
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

// --- medir ---
const deltasHueco = new Map()
const deltasVidrio = new Map()
let lineas = 0, emparejablesH = 0, emparejablesV = 0, sinModulo = 0
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
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    const serie = seriePorLinea.get(k) ?? '?'
    const estructura = col(p, 'Articulo')
    const contexto = {
      L: num(p, 'Largo'), A: num(p, 'Ancho'),
      ...(cotasDefecto.get(estructura) ?? {}),
      ...(cotasInstancia.get(k) ?? {}),
    }
    const largos = gomas
      .map((g) => num(g, 'LargoCorte') || num(g, 'Largo'))
      .filter((x) => x > 0)
      .sort((a, b) => a - b)
    if (!largos.length) continue

    // objetivos HUECO: las dos dimensiones de cada módulo
    const objH = []
    let fallo = false
    for (const s of slotsPorEstructura.get(estructura) ?? []) {
      const fl = col(s, 'FormulaLargo'), fa = col(s, 'FormulaAncho')
      if (!fl || !fa) { fallo = true; break }
      try {
        objH.push({ dim: evaluar(fl, contexto), eje: 'L' })
        objH.push({ dim: evaluar(fa, contexto), eje: 'A' })
      } catch { fallo = true; break }
    }
    if (fallo || !objH.length) sinModulo++
    else if (objH.length === largos.length) {
      emparejablesH++
      objH.sort((a, b) => a.dim - b.dim)
      for (let i = 0; i < largos.length; i++) {
        const kk = `${serie}|${objH[i].eje}`
        if (!deltasHueco.has(kk)) deltasHueco.set(kk, new Map())
        const m = deltasHueco.get(kk)
        const d = Math.round((largos[i] - objH[i].dim) * 10) / 10
        m.set(d, (m.get(d) ?? 0) + 1)
      }
    }

    // objetivos VIDRIO, para comparar en el MISMO conjunto de líneas
    const objV = []
    for (const h of hijas) {
      const art = col(h, 'Articulo')
      if (famPorArt.get(art) !== '050' || metrajePorArt.get(art) !== 'M2') continue
      const cant = Math.max(1, Math.round(num(h, 'Cdad')))
      for (let i = 0; i < cant; i++) {
        if (num(h, 'Largo') > 0) objV.push({ dim: num(h, 'Largo'), eje: 'L' })
        if (num(h, 'Ancho') > 0) objV.push({ dim: num(h, 'Ancho'), eje: 'A' })
      }
    }
    if (objV.length === largos.length) {
      emparejablesV++
      objV.sort((a, b) => a.dim - b.dim)
      for (let i = 0; i < largos.length; i++) {
        const kk = `${serie}|${objV[i].eje}`
        if (!deltasVidrio.has(kk)) deltasVidrio.set(kk, new Map())
        const m = deltasVidrio.get(kk)
        const d = Math.round((largos[i] - objV[i].dim) * 10) / 10
        m.set(d, (m.get(d) ?? 0) + 1)
      }
    }
  }
}
console.log(`Líneas con GM4090: ${lineas}`)
console.log(`  emparejables contra HUECO (módulos):  ${emparejablesH}   sin módulo evaluable: ${sinModulo}`)
console.log(`  emparejables contra VIDRIO:           ${emparejablesV}`)

const informe = (nombre, deltas) => {
  console.log(`\n--- delta contra ${nombre} ---`)
  let estables = 0, cubiertos = 0, total = 0
  for (const [k, m] of [...deltas.entries()].sort()) {
    const t = [...m.values()].reduce((a, b) => a + b, 0)
    const [delta, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
    total += t
    const ok = t >= 3 && n / t >= 0.9
    if (ok) { estables++; cubiertos += t }
    console.log(`  ${ok ? '✔' : '✘'} ${k.padEnd(22)} delta=${String(delta).padStart(8)}  ${n}/${t}`)
  }
  console.log(`  Reglas estables: ${estables}/${deltas.size}   filas cubiertas: ${cubiertos}/${total}`)
}
informe('HUECO (módulo)', deltasHueco)
informe('VIDRIO', deltasVidrio)
