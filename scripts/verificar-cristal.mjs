/**
 * Verifica el cambio de T.22 midiendo, no mirando.
 *
 * Reproduce la clasificación de `sinResolver` de acciones.ts ANTES y DESPUÉS
 * de excluir el componente 1 (cristal), sobre las 140 parejas serie ×
 * estructura REALES del histórico, y compara causa a causa.
 *
 * Lo que debe salir: desaparece la causa B y SÓLO la causa B. Si cambiara
 * cualquier otra, el cambio se estaría tragando un fallo legítimo.
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

const COMPONENTE_CRISTAL = '1'
const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const esAsociado = (fn) => !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))
const NO_RESUELVEN_POR_DISENYO = new Map([
  ['1', 'cristal / acristalamiento'], ['130', 'manilla'],
  ['39', 'mano de obra'], ['50', 'infHV'],
])

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

const estr = leerCsv('VDatosLinEstr.csv')
const seriePorLinea = new Map(estr.map((r) => [r.nVLinea, r.Conjunto1]))
const parejas = new Map()
for (const l of leerCsv('VPresupuestosLin.csv')) {
  if (l.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(l.nLinea)
  if (!serie || !l.Articulo) continue
  const k = `${serie}|${l.Articulo}`
  parejas.set(k, (parejas.get(k) || 0) + 1)
}

const deleg = await sql`select conjunto_codigo, delegado_codigo from conjunto_delegaciones`
const mapaDeleg = new Map()
for (const d of deleg) {
  if (!mapaDeleg.has(d.conjunto_codigo)) mapaDeleg.set(d.conjunto_codigo, [])
  mapaDeleg.get(d.conjunto_codigo).push(d.delegado_codigo)
}
const genericos = new Set(
  (await sql`select codigo from articulos where descripcion like '(**%'`).map((a) => a.codigo))
const comps = await sql`
  select estructura_codigo, articulo_codigo, componente_disenyo, funcion
  from estructura_componentes`
const porEstr = new Map()
for (const c of comps) {
  if (!porEstr.has(c.estructura_codigo)) porEstr.set(c.estructura_codigo, [])
  porEstr.get(c.estructura_codigo).push(c)
}
const cache = new Map()
async function resolucionesDe(serie) {
  if (cache.has(serie)) return cache.get(serie)
  const cadena = expandirCadena(serie, mapaDeleg)
  const filas = await sql`
    select conjunto_codigo, componente, articulo_codigo
    from conjunto_resoluciones where conjunto_codigo = any(${cadena})`
  const r = construirResoluciones(cadena, filas.map((f) => ({
    conjuntoCodigo: f.conjunto_codigo, componente: f.componente, articuloCodigo: f.articulo_codigo,
  })))
  cache.set(serie, r)
  return r
}

/** `excluirCristal=false` reproduce el comportamiento ANTERIOR. */
function clasificar(cs, resoluciones, conocidos, excluirCristal) {
  const causas = []
  for (const c of cs) {
    if (esAsociado(c.funcion)) continue
    const comp = c.componente_disenyo
    if (excluirCristal && comp === COMPONENTE_CRISTAL) continue
    let falla
    if (!comp) falla = genericos.has(c.articulo_codigo)
    else {
      const r = resolverComponente(comp, resoluciones, '2')
      falla = !r.articuloCodigo && genericos.has(c.articulo_codigo)
    }
    if (!falla) continue
    if (!comp) causas.push('A. sin componente_disenyo')
    else if (NO_RESUELVEN_POR_DISENYO.has(comp)) causas.push(`B. no toca a la serie — ${NO_RESUELVEN_POR_DISENYO.get(comp)}`)
    else if (conocidos.has(`${comp}.1`) && !conocidos.has(`${comp}.2`)) causas.push('C. sólo variante .1')
    else causas.push('E. sin candidato en la cadena')
  }
  return causas
}

const antes = new Map(), despues = new Map()
const libresAhora = []
let conHoja = 0
for (const [k, veces] of parejas) {
  const [serie, estructura] = k.split('|')
  const cs = porEstr.get(estructura)
  if (!cs || !cs.some((c) => FUNCIONES_HOJA.has(c.funcion))) continue
  conHoja++
  const resoluciones = await resolucionesDe(serie)
  const conocidos = new Set(resoluciones.keys())
  for (const c of clasificar(cs, resoluciones, conocidos, false)) antes.set(c, (antes.get(c) || 0) + veces)
  const post = clasificar(cs, resoluciones, conocidos, true)
  for (const c of post) despues.set(c, (despues.get(c) || 0) + veces)
  if (post.length === 0) {
    const asoc = cs.filter((c) => esAsociado(c.funcion) && genericos.has(c.articulo_codigo))
    libresAhora.push({ k, veces, asociados: asoc.length, funciones: [...new Set(asoc.map((a) => a.funcion))] })
  }
}

console.log(`parejas reales con pieza de hoja: ${conHoja}\n`)
console.log('══ Recuento por causa, ANTES → DESPUÉS (líneas del histórico) ══')
const todas = new Set([...antes.keys(), ...despues.keys()])
let alarma = false
for (const causa of [...todas].sort()) {
  const a = antes.get(causa) || 0, d = despues.get(causa) || 0
  const marca = a === d ? '   =' : (causa.startsWith('B.') ? ' ✔ ' : ' ⚠ ')
  if (a !== d && !causa.startsWith('B.')) alarma = true
  console.log(`  ${marca} ${causa.padEnd(46)} ${String(a).padStart(5)} → ${String(d).padStart(5)}`)
}
console.log(alarma
  ? '\n  ⚠ ALARMA: ha cambiado una causa que NO es la B. El cambio se traga algo.'
  : '\n  ✔ Sólo cambia la causa B. Las demás, intactas.')

console.log(`\n══ Parejas que quedan sin bloqueo de PERFIL: ${libresAhora.length} ══`)
for (const l of libresAhora) {
  console.log(`  ${l.k.padEnd(28)} ${String(l.veces).padStart(3)} líneas · ` +
    `${l.asociados} ranuras de asociado pendientes [${l.funciones.join(' ')}]`)
}
const sinAsociados = libresAhora.filter((l) => l.asociados === 0).length
console.log(`\n  de ellas, sin NINGÚN bloqueo restante: ${sinAsociados}`)
console.log('  (T.20.3 predice 0: toda pareja con hoja tiene asociados pendientes)')

await sql.end({ timeout: 5 })
