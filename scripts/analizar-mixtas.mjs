/**
 * ESTRUCTURAS MIXTAS (hoja + fijo), fase de medición.
 *
 *  1. ¿Qué estructuras reales tienen hojas Y más vidrios que hojas?
 *  2. En la plantilla: ¿qué distingue la ranura de cristal de la hoja de la
 *     del fijo? (DisVidrio, DisTipoHoja, DisIdHoja, DisGrupo…)
 *  3. En el documento real: ¿de qué cortes salen las medidas del vidrio
 *     del fijo? (¿marco? ¿travesaño? ¿perfil FV/FH?)
 *
 * Solo lectura. Uso: node scripts/analizar-mixtas.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'
import { tsImport } from 'tsx/esm/api'

const { evaluar } = await tsImport('../packages/core/src/despiece/formula.ts', import.meta.url)

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})
const col = (f, n) => (f[n] ?? '').trim()
const num = (v) => Number(String(v).replace(',', '.')) || 0

const estArt = leer('EstructurasArticulos.csv')
const estDis = leer('EstructurasDiseño.csv')
const vLin = leer('VPresupuestosLin.csv')
const datosLin = leer('VDatosLinEstr.csv')
const articulos = leer('Articulos.csv')
const porArt = new Map(articulos.map((a) => [col(a, 'Codigo'), a]))
const plantillasVidrio = new Map()
for (const f of estArt) {
  if (col(f, 'TipoDoc') || col(f, 'DisComponente') !== '1') continue
  const estructura = col(f, 'Estructura')
  const lista = plantillasVidrio.get(estructura) ?? []
  lista.push(f)
  plantillasVidrio.set(estructura, lista)
}

const cotasPlantilla = new Map()
const cotasInstancia = new Map()
for (const f of estDis) {
  const simbolo = col(f, 'Simbolo')
  if (!simbolo) continue
  const destino = col(f, 'TipoDoc') ? cotasInstancia : cotasPlantilla
  const clave = col(f, 'TipoDoc')
    ? `${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
    : col(f, 'Estructura')
  if (!clave) continue
  const mapa = destino.get(clave) ?? {}
  mapa[simbolo] = num(col(f, 'Cota'))
  destino.set(clave, mapa)
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

// 1. Mixtas: con hojas y con vidrios de MÁS de una medida
const estMixtas = new Map()
for (const p of padres) {
  const e = col(p, 'Articulo')
  const slots = plantillasVidrio.get(e) ?? []
  const tieneFijo = slots.some((s) => col(s, 'DisTipoHoja') === '-1')
  const tieneHoja = slots.some((s) => col(s, 'DisTipoHoja') !== '-1')
  if (!tieneFijo || !tieneHoja) continue
  const hijas = hijasPorPadre.get(col(p, 'nLinea')) ?? []
  const hvs = hijas.filter((h) => col(h, 'Funcion') === 'HV')
  if (!hvs.length) continue
  const vidrios = hijas.filter((h) => {
    const a = porArt.get(col(h, 'Articulo'))
    return a && col(a, 'Familia') === '050' && col(a, 'TipoMetraje') === 'M2'
  })
  const medidas = new Set(vidrios.map((h) => `${col(h, 'Largo')}|${col(h, 'Ancho')}`))
  if (medidas.size < 2) continue
  estMixtas.set(e, (estMixtas.get(e) ?? 0) + 1)
}
console.log('Estructuras mixtas confirmadas por sus ranuras (hoja + fijo):')
for (const [e, n] of [...estMixtas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
  console.log(`  ${e.padEnd(10)} ${n}`)
}

// 2. Plantilla de la estructura mixta más frecuente (que no sea '0')
const eMix = [...estMixtas.entries()].filter(([e]) => e !== '0').sort((a, b) => b[1] - a[1])[0]?.[0]
const ejemplos = eMix
  ? padres.filter((p) => col(p, 'Articulo') === eMix).slice(0, 2)
  : []
if (eMix) {
  console.log(`\n=== Plantilla de ${eMix}: ranuras de cristal y hojas ===`)
  const CAMPOS = ['Articulo', 'Funcion', 'DisComponente', 'DisVidrio', 'DisTipoHoja', 'DisIdHoja', 'DisGrupo', 'DisIdIt', 'FormulaLargo', 'FormulaAncho', 'FormulaLargoCorte']
  console.log(CAMPOS.map((c) => c.slice(0, 11).padEnd(12)).join(''))
  for (const f of estArt) {
    if (col(f, 'TipoDoc')) continue
    if (col(f, 'Estructura') !== eMix) continue
    console.log(CAMPOS.map((c) => col(f, c).slice(0, 11).padEnd(12)).join(''))
  }
}

// 3. Documento real de esa estructura
for (const p of ejemplos.slice(0, 1)) {
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  console.log(`\n=== Doc ${col(p, 'nDoc')} estructura ${col(p, 'Articulo')} serie ${serie} hueco ${col(p, 'Largo')}×${col(p, 'Ancho')} ===`)
  for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
    const art = col(h, 'Articulo')
    const a = porArt.get(art)
    const fn = col(h, 'Funcion')
    const esVidrio = a && col(a, 'Familia') === '050'
    if (!fn && !esVidrio) continue
    console.log(`  ${art.padEnd(12)} fn=${fn.padEnd(10)} x${col(h, 'Cdad').padEnd(3)} L=${col(h, 'Largo').padEnd(9)} A=${col(h, 'Ancho').padEnd(9)} corte=${col(h, 'LargoCorte').padEnd(9)} ${(a ? col(a, 'Descripcion') : '').slice(0, 32)}`)
  }
}

// 4. HipÃ³tesis medible: cada ranura de cristal declara su mÃ³dulo con
// FormulaLargo/FormulaAncho. En una instancia real, la diferencia entre ese
// mÃ³dulo y el vidrio es el descuento de galce propio de la ranura. Medimos si
// el par de descuentos es constante por estructura + serie + DisIdIt antes de
// plantear su uso en valoraciÃ³n.
function mejorEmparejamiento(modulos, vidrios) {
  if (modulos.length !== vidrios.length || modulos.length === 0 || modulos.length > 8) return null
  let mejor = null
  const usados = new Set()
  const pares = []
  const buscar = (i, error) => {
    if (mejor && error >= mejor.error) return
    if (i === modulos.length) {
      mejor = { error, pares: [...pares] }
      return
    }
    for (let j = 0; j < vidrios.length; j++) {
      if (usados.has(j)) continue
      usados.add(j)
      pares.push([modulos[i], vidrios[j]])
      const e = Math.abs(modulos[i].l - vidrios[j].l) + Math.abs(modulos[i].a - vidrios[j].a)
      buscar(i + 1, error + e)
      pares.pop()
      usados.delete(j)
    }
  }
  buscar(0, 0)
  return mejor
}

const gruposDelta = new Map()
const casosMedibles = []
for (const p of padres) {
  const estructura = col(p, 'Articulo')
  if (!estMixtas.has(estructura) || estructura === '0') continue
  const serie = seriePorLinea.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`)
  const slots = plantillasVidrio.get(estructura) ?? []
  if (!serie || !slots.length) continue

  const contexto = {
    L: num(col(p, 'Largo')),
    A: num(col(p, 'Ancho')),
    ...(cotasPlantilla.get(estructura) ?? {}),
    ...(cotasInstancia.get(`${col(p, 'nDoc')}|${col(p, 'nLinea')}`) ?? {}),
  }
  const modulos = []
  try {
    for (const s of slots) {
      const fl = col(s, 'FormulaLargo')
      const fa = col(s, 'FormulaAncho')
      if (!fl || !fa) throw new Error('ranura sin dos fÃ³rmulas')
      modulos.push({
        slot: `${col(s, 'DisTipoHoja')}|${col(s, 'DisIdHoja')}|${col(s, 'DisGrupo')}|${col(s, 'DisIdIt')}`,
        l: evaluar(fl, contexto),
        a: evaluar(fa, contexto),
      })
    }
  } catch { continue }

  const vidrios = []
  for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
    const a = porArt.get(col(h, 'Articulo'))
    if (!a || col(a, 'Familia') !== '050' || col(a, 'TipoMetraje') !== 'M2') continue
    const cantidad = Math.max(1, Math.round(num(col(h, 'Cdad'))))
    for (let i = 0; i < cantidad; i++) vidrios.push({ l: num(col(h, 'Largo')), a: num(col(h, 'Ancho')) })
  }
  const emp = mejorEmparejamiento(modulos, vidrios)
  if (!emp) continue
  const caso = { estructura, serie, pares: emp.pares }
  casosMedibles.push(caso)
  for (const [m, v] of emp.pares) {
    const clave = `${estructura}|${serie}|${m.slot}`
    const delta = `${Math.round((m.l - v.l) * 10) / 10}|${Math.round((m.a - v.a) * 10) / 10}`
    const conteo = gruposDelta.get(clave) ?? new Map()
    conteo.set(delta, (conteo.get(delta) ?? 0) + 1)
    gruposDelta.set(clave, conteo)
  }
}

const reglasEstables = new Map()
let gruposInestables = 0
for (const [clave, conteo] of gruposDelta) {
  const total = [...conteo.values()].reduce((a, b) => a + b, 0)
  const [delta, n] = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]
  if (total >= 3 && n / total >= 0.9) reglasEstables.set(clave, delta.split('|').map(Number))
  else gruposInestables++
}

let reproducidos = 0
for (const caso of casosMedibles) {
  const completo = caso.pares.every(([m, v]) => {
    const regla = reglasEstables.get(`${caso.estructura}|${caso.serie}|${m.slot}`)
    return regla && Math.abs(m.l - regla[0] - v.l) <= 0.51 && Math.abs(m.a - regla[1] - v.a) <= 0.51
  })
  if (completo) reproducidos++
}

console.log('\n=== HipÃ³tesis ranura -> descuento medido ===')
console.log(`Casos mixtos emparejables por cantidad: ${casosMedibles.length}`)
console.log(`Reglas estables (n>=3, consistencia>=90%): ${reglasEstables.size}`)
console.log(`Grupos aÃºn inestables o con pocas muestras: ${gruposInestables}`)
console.log(`Casos reproducidos exactamente con reglas estables: ${reproducidos}/${casosMedibles.length}`)
for (const [clave, delta] of [...reglasEstables.entries()].slice(0, 12)) {
  console.log(`  ${clave} -> delta ${delta[0]} / ${delta[1]} mm`)
}
