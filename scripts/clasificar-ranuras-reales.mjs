/**
 * Igual que clasificar-ranuras-perfil.mjs, pero SÓLO sobre las parejas
 * serie × estructura que existen de verdad en el histórico.
 *
 * Por qué: el producto cartesiano 57 × 370 mezcla parejas imposibles (una
 * serie de abatibles con una estructura de corredera), y en esas la causa
 * "sin candidato" es lo correcto, no un fallo. Medir sobre ellas fabrica un
 * frente que no existe — el error de la regla 8, tres veces cometido ya.
 *
 * Sólo lectura.
 */
import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { construirResoluciones, expandirCadena, resolverComponente }
  from '../packages/core/src/series/resolver.ts'

const DIR = new URL('../export_datos/EMP0016/', import.meta.url)
const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const url = env.match(/^DATABASE_URL=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '')
const sql = postgres(url)

function leerCsv(nombre) {
  const txt = readFileSync(new URL(nombre, DIR), 'utf8').replace(/^﻿/, '')
  const filas = []
  let campo = '', fila = [], enComillas = false
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i]
    if (enComillas) {
      if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++ } else enComillas = false }
      else campo += c
    } else if (c === '"') enComillas = true
    else if (c === ',') { fila.push(campo); campo = '' }
    else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = '' }
    else if (c !== '\r') campo += c
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila) }
  const cab = filas.shift()
  return filas.map((f) => Object.fromEntries(cab.map((h, i) => [h, f[i]])))
}

// Parejas reales: la serie sale de VDatosLinEstr.Conjunto1, la estructura de
// VPresupuestosLin.Articulo (enlace nVLinea → nLinea).
const estr = leerCsv('VDatosLinEstr.csv')
const seriePorLinea = new Map(estr.map((r) => [r.nVLinea, r.Conjunto1]))
const lin = leerCsv('VPresupuestosLin.csv')
const parejas = new Map()   // "serie|estructura" -> veces
for (const l of lin) {
  if (l.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(l.nLinea)
  if (!serie || !l.Articulo) continue
  const k = `${serie}|${l.Articulo}`
  parejas.set(k, (parejas.get(k) || 0) + 1)
}
console.log(`parejas serie × estructura REALES en el histórico: ${parejas.size}`)

const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const esAsociado = (fn) => !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))
const NO_RESUELVEN_POR_DISENYO = new Map([
  ['1', 'cristal / acristalamiento'], ['130', 'manilla'],
  ['39', 'mano de obra'], ['50', 'infHV'],
])

const deleg = await sql`select conjunto_codigo, delegado_codigo from conjunto_delegaciones`
const mapaDeleg = new Map()
for (const d of deleg) {
  if (!mapaDeleg.has(d.conjunto_codigo)) mapaDeleg.set(d.conjunto_codigo, [])
  mapaDeleg.get(d.conjunto_codigo).push(d.delegado_codigo)
}
const genericos = new Set(
  (await sql`select codigo from articulos where descripcion like '(**%'`).map((a) => a.codigo))
const descripcion = new Map(
  (await sql`select codigo, descripcion from articulos where descripcion like '(**%'`)
    .map((a) => [a.codigo, a.descripcion]))
const comps = await sql`
  select estructura_codigo, articulo_codigo, componente_disenyo, funcion
  from estructura_componentes`
const porEstr = new Map()
for (const c of comps) {
  if (!porEstr.has(c.estructura_codigo)) porEstr.set(c.estructura_codigo, [])
  porEstr.get(c.estructura_codigo).push(c)
}

const cacheRes = new Map()
async function resolucionesDe(serie) {
  if (cacheRes.has(serie)) return cacheRes.get(serie)
  const cadena = expandirCadena(serie, mapaDeleg)
  const filas = await sql`
    select conjunto_codigo, componente, articulo_codigo
    from conjunto_resoluciones where conjunto_codigo = any(${cadena})`
  const r = construirResoluciones(cadena, filas.map((f) => ({
    conjuntoCodigo: f.conjunto_codigo, componente: f.componente, articuloCodigo: f.articulo_codigo,
  })))
  cacheRes.set(serie, r)
  return r
}

const pesoCausa = new Map(), ranurasPorCausa = new Map()
const combo = { total: 0, conHoja: 0, limpias: 0, soloB: 0, conE: 0, sinPlantilla: 0 }
const lineasPorEstado = { limpias: 0, soloB: 0, conE: 0 }

for (const [k, veces] of parejas) {
  const [serie, estructura] = k.split('|')
  const cs = porEstr.get(estructura)
  combo.total++
  if (!cs) { combo.sinPlantilla++; continue }
  if (!cs.some((c) => FUNCIONES_HOJA.has(c.funcion))) continue
  combo.conHoja++
  const resoluciones = await resolucionesDe(serie)
  const conocidos = new Set(resoluciones.keys())
  const vistas = new Set()
  for (const c of cs) {
    if (esAsociado(c.funcion)) continue
    const comp = c.componente_disenyo
    let falla
    if (!comp) falla = genericos.has(c.articulo_codigo)
    else {
      const r = resolverComponente(comp, resoluciones, '2')
      falla = !r.articuloCodigo && genericos.has(c.articulo_codigo)
    }
    if (!falla) continue
    let causa
    if (!comp) causa = 'A. sin componente_disenyo'
    else if (NO_RESUELVEN_POR_DISENYO.has(comp)) causa = `B. no toca a la serie — ${NO_RESUELVEN_POR_DISENYO.get(comp)}`
    else if (conocidos.has(`${comp}.1`) && !conocidos.has(`${comp}.2`)) causa = 'C. sólo variante .1'
    else causa = 'E. sin candidato en la cadena'
    vistas.add(causa[0])
    pesoCausa.set(causa, (pesoCausa.get(causa) || 0) + veces)
    const clave = `${c.articulo_codigo}|${c.funcion}|${comp ?? 'null'}`
    if (!ranurasPorCausa.has(causa)) ranurasPorCausa.set(causa, new Map())
    const m = ranurasPorCausa.get(causa)
    m.set(clave, (m.get(clave) || 0) + veces)
  }
  if (vistas.size === 0) { combo.limpias++; lineasPorEstado.limpias += veces }
  else if (vistas.size === 1 && vistas.has('B')) { combo.soloB++; lineasPorEstado.soloB += veces }
  if (vistas.has('E')) { combo.conE++; lineasPorEstado.conE += veces }
}

console.log(`\n══ Parejas REALES ══`)
console.log(`  parejas totales                       : ${combo.total}`)
console.log(`  sin plantilla en el catálogo          : ${combo.sinPlantilla}`)
console.log(`  con pieza de hoja                     : ${combo.conHoja}`)
console.log(`  sin ranura de perfil pendiente        : ${combo.limpias}   (${lineasPorEstado.limpias} líneas)`)
console.log(`  bloqueadas SÓLO por el cristal (B)    : ${combo.soloB}   (${lineasPorEstado.soloB} líneas)`)
console.log(`  con alguna sin candidato (E)          : ${combo.conE}   (${lineasPorEstado.conE} líneas)`)

console.log('\n══ Peso por causa (líneas reales del histórico) ══')
const total = [...pesoCausa.values()].reduce((a, b) => a + b, 0)
for (const [causa, peso] of [...pesoCausa].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(peso).padStart(6)}  ${(peso / total * 100).toFixed(1).padStart(5)}%  ${causa}`)
}
for (const [causa, m] of [...ranurasPorCausa].sort((a, b) => b[1].size - a[1].size)) {
  console.log(`\n  ${causa} — ${m.size} ranuras distintas`)
  for (const [clave, peso] of [...m].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${clave.padEnd(18)} ×${String(peso).padStart(5)}  ${(descripcion.get(clave.split('|')[0]) ?? '').slice(0, 48)}`)
  }
}

await sql.end({ timeout: 5 })
