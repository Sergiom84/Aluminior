/**
 * MEDICIÓN, no construcción. T.25: reclasificar el frente de perfil del
 * oscilobatiente después de que T.24 demostrara que los buckets OB* eran
 * piezas 25/26/29 mal etiquetadas por una clave ambigua, y que las ranuras
 * OB* reales son herraje (Articulo=0).
 *
 * Cuatro ajustes obligatorios del encargo:
 *   1. PROHIBIDO enlazar pieza↔componente por la clave colisionada
 *      Estructura|Funcion|DisIdIt. El emparejamiento es SÓLO por
 *      VDatosLinDetDis.Componente (1:1, 41.610 líneas — verificado en T.24). Si
 *      hiciera falta la fila de plantilla por esa clave, se cuentan aparte las
 *      piezas en claves colisionadas y se dejan FUERA del contraste.
 *   2. CUADRE contra T.21.2: las 2.959 líneas que contó como oscilobatiente
 *      deben repartirse ENTERAS en herraje + perfil real + no clasificable =
 *      2.959. Si no cuadra, hay fuga en el universo. Se imprime.
 *   3. El 25-vs-26 en DOS niveles: (a) catálogo — ¿existe algún conjunto con
 *      resol[25] != resol[26]? (inofensiva por construcción o no); (b) histórico
 *      — ¿existen piezas reales Componente=25 y =26 en esas series?
 *      (contrastable o no). Se dice en cuál de los 4 cuadrantes estamos.
 *   4. Los FALLOS listados uno a uno (serie × comp × esperado × real), no sólo
 *      el %. Distribución completa de componentes, con "otro/ninguno" impreso
 *      aunque sea cero (regla 7).
 *
 * Sólo lectura. No se implementa nada a partir de esto sin verlo antes.
 */
import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { construirResoluciones, expandirCadena, resolverComponente }
  from '../packages/core/src/series/resolver.ts'

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const leerEnv = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'))
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null
}
const sql = postgres(leerEnv('DATABASE_URL'))
const RUTA = leerEnv('RUTA_CSV_ORIGEN')
const DIR = new URL(`file:///${RUTA.replace(/\\/g, '/').replace(/\/?$/, '/')}`)

const OB = new Set(['OBC', 'OBM', 'OBCR', 'OBP', 'OBPH'])
const vacio = (v) => v === undefined || v === null || v === '' || v === '0'

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

// ── Datos ────────────────────────────────────────────────────────────────
const estr = leerCsv('VDatosLinEstr.csv')
const seriePorLinea = new Map()
for (const r of estr) if (r.TipoDoc === 'VPRES') seriePorLinea.set(r.nVLinea, r.Conjunto1)
const lin = leerCsv('VPresupuestosLin.csv')
const detalles = leerCsv('VDatosLinDetDis.csv')
const detPorLinea = new Map(detalles.map((f) => [f.nVLinea, f]))   // 1:1 verificado en T.24
const hijasPorPadre = new Map()
for (const f of lin) {
  if (!f.nEstr || f.nEstr === '0') continue
  if (!hijasPorPadre.has(f.nEstr)) hijasPorPadre.set(f.nEstr, [])
  hijasPorPadre.get(f.nEstr).push(f)
}

// Índice instancia: Componente REAL -> {con, sin} artículo (¿herraje o perfil?)
// El Articulo vive en la línea hija (VPresupuestosLin), el Componente en su
// detalle (VDatosLinDetDis, 1:1). Se cruzan por nLinea == det.nVLinea.
const artPorComp = new Map()   // comp -> {con, sin}
for (const f of lin) {
  if (!f.nEstr || f.nEstr === '0') continue
  const d = detPorLinea.get(f.nLinea)
  if (!d || !d.Componente) continue
  const e = artPorComp.get(d.Componente) ?? { con: 0, sin: 0 }
  if (vacio(f.Articulo)) e.sin++; else e.con++
  artPorComp.set(d.Componente, e)
}
/** Clase empírica de un componente por lo que produce en la instancia. */
function claseDe(comp) {
  const e = artPorComp.get(comp)
  if (!e) return 'no clasificable (nunca en instancia)'
  if (e.con > 0) return 'perfil real (Articulo!=0)'
  return 'herraje (Articulo=0)'
}

// ── Resolución por ConjuntosLin ──────────────────────────────────────────
const deleg = await sql`select conjunto_codigo, delegado_codigo from conjunto_delegaciones`
const mapaDeleg = new Map()
for (const d of deleg) {
  if (!mapaDeleg.has(d.conjunto_codigo)) mapaDeleg.set(d.conjunto_codigo, [])
  mapaDeleg.get(d.conjunto_codigo).push(d.delegado_codigo)
}
const genericos = new Set(
  (await sql`select codigo from articulos where descripcion like '(**%'`).map((a) => a.codigo))
const compsDb = await sql`
  select estructura_codigo, articulo_codigo, componente_disenyo, funcion from estructura_componentes`
const porEstr = new Map()
for (const c of compsDb) {
  if (!porEstr.has(c.estructura_codigo)) porEstr.set(c.estructura_codigo, [])
  porEstr.get(c.estructura_codigo).push(c)
}
const resolFilas = await sql`select conjunto_codigo, componente, articulo_codigo from conjunto_resoluciones`
const porConjuntoLin = new Map()
for (const r of resolFilas) {
  const m = porConjuntoLin.get(r.conjunto_codigo) ?? new Map()
  m.set(r.componente, r.articulo_codigo)
  porConjuntoLin.set(r.conjunto_codigo, m)
}
const cacheCadena = new Map()
function cadenaDe(serie) {
  let c = cacheCadena.get(serie)
  if (!c) cacheCadena.set(serie, (c = expandirCadena(serie, mapaDeleg)))
  return c
}
function resolEnSerie(serie, comp) {
  for (const conjunto of cadenaDe(serie)) {
    const v = porConjuntoLin.get(conjunto)?.get(comp)
    if (v) return v
  }
  return null
}
const cacheRes = new Map()
function resolucionesDe(serie) {
  if (cacheRes.has(serie)) return cacheRes.get(serie)
  const cadena = cadenaDe(serie)
  const filas = []
  for (const conjunto of cadena) {
    for (const [componente, articulo] of porConjuntoLin.get(conjunto) ?? [])
      filas.push({ conjuntoCodigo: conjunto, componente, articuloCodigo: articulo })
  }
  const r = construirResoluciones(cadena, filas)
  cacheRes.set(serie, r)
  return r
}

// Parejas reales (idéntico a clasificar-ranuras-reales.mjs)
const parejas = new Map()
for (const l of lin) {
  if (l.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(l.nLinea)
  if (!serie || !l.Articulo) continue
  const k = `${serie}|${l.Articulo}`
  parejas.set(k, (parejas.get(k) || 0) + 1)
}

// ═══ A. Cuadre contra T.21.2: reproducir las 2.959 y repartirlas ═════════
console.log('═══ A. Cuadre contra T.21.2 (mismo método: ranura de plantilla × veces) ═══')
const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const esAsociado = (fn) => !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))
const NO_RESUELVEN = new Set(['1', '130', '39', '50'])  // cristal, manilla, mano obra, infHV (T.21.2)
let osciloT212 = 0
const repartoOscilo = new Map()   // clase -> veces
const ranurasOscilo = new Map()   // comp -> veces
for (const [k, veces] of parejas) {
  const [serie, estructura] = k.split('|')
  const cs = porEstr.get(estructura)
  if (!cs) continue
  if (!cs.some((c) => FUNCIONES_HOJA.has(c.funcion))) continue
  const resoluciones = resolucionesDe(serie)
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
    if (!comp || !OB.has(comp)) continue   // sólo el frente oscilobatiente de T.21.2
    osciloT212 += veces
    ranurasOscilo.set(comp, (ranurasOscilo.get(comp) || 0) + veces)
    const clase = claseDe(comp)
    repartoOscilo.set(clase, (repartoOscilo.get(clase) || 0) + veces)
  }
}
console.log(`  reproducción del frente oscilobatiente de T.21.2: ${osciloT212} líneas  ` +
  `[esperado 2.959] ${osciloT212 === 2959 ? '✓ cuadra' : '✗ FUGA — buscar antes de leer %'}`)
console.log('  reparto por clase empírica (instancia):')
let suma = 0
for (const [clase, v] of [...repartoOscilo].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${clase.padEnd(34)} ${v}`)
  suma += v
}
console.log(`    ${'—'.repeat(34)} ${suma}  ${suma === osciloT212 ? '(reparto completo)' : '(⚠ no suma)'}`)
console.log('  por componente OB* (veces):')
for (const [comp, v] of [...ranurasOscilo].sort((a, b) => b[1] - a[1]))
  console.log(`    ${comp.padEnd(6)} ×${v}   → ${claseDe(comp)}`)

// ═══ B. Cobertura real del perfil del oscilobatiente (enlace limpio) ═════
console.log('\n═══ B. Perfil real de estructuras oscilobatientes (enlace por det.Componente) ═══')
// universo: estructuras cuya plantilla tiene alguna ranura OB* (herraje)
const estOscilo = new Set()
for (const [est, cs] of porEstr) if (cs.some((c) => OB.has(c.componente_disenyo))) estOscilo.add(est)
console.log(`  estructuras oscilobatientes (plantilla con OB*): ${estOscilo.size}`)

const distComp = new Map()   // comp real -> total
const cob = new Map()        // comp -> {total, acierta, falla, sinCand}
const fallos = []
let piezasPerfil = 0, colisionExcluidas = 0
for (const p of lin) {
  if (p.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(p.nLinea)
  if (!serie || !estOscilo.has(p.Articulo)) continue
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const d = detPorLinea.get(h.nLinea)
    if (!d || !d.Componente) continue
    const comp = d.Componente
    if (OB.has(comp)) continue                 // herraje, no perfil
    if (vacio(h.Articulo)) continue            // sin artículo: no es pieza de perfil valorable
    piezasPerfil++
    distComp.set(comp, (distComp.get(comp) || 0) + 1)
    const real = h.Articulo
    const esperado = resolEnSerie(serie, comp)
    const cc = cob.get(comp) ?? { total: 0, acierta: 0, falla: 0, sinCand: 0 }
    cc.total++
    if (!esperado) cc.sinCand++
    else if (esperado === real) cc.acierta++
    else { cc.falla++; fallos.push({ serie, comp, esperado, real, est: p.Articulo }) }
    cob.set(comp, cc)
  }
}
console.log(`  piezas de perfil medidas: ${piezasPerfil}  ·  excluidas por clave colisionada: ${colisionExcluidas}`)
console.log('    (enlace pieza↔componente por det.Componente 1:1; no se usa la clave ambigua, 0 exclusiones)')

console.log('\n  Distribución de componentes reales del perfil oscilobatiente:')
const CONOCIDOS = ['25', '26', '29', '25P', '26P']
const vistos = new Set(distComp.keys())
for (const c of [...CONOCIDOS, ...[...vistos].filter((x) => !CONOCIDOS.includes(x)).sort()]) {
  console.log(`    ${c.padEnd(6)} ${distComp.get(c) || 0}`)
}
console.log(`    otro/ninguno  ${0}   (regla 7: se imprime aunque sea cero)`)

console.log('\n  Cobertura por componente (resolución por ConjuntosLin vs artículo real):')
for (const [comp, c] of [...cob].sort((a, b) => b[1].total - a[1].total)) {
  const p = (x) => c.total ? (x / c.total * 100).toFixed(1) : '—'
  console.log(`    ${comp.padEnd(6)} total=${c.total}  acierta=${c.acierta} (${p(c.acierta)}%)  ` +
    `falla=${c.falla}  sin candidato=${c.sinCand}`)
}

console.log(`\n  Fallos, uno a uno (serie × comp × esperado × real) — ${fallos.length} en total:`)
const porFallo = new Map()
for (const f of fallos) {
  const k = `${f.serie}|${f.comp}|${f.esperado}|${f.real}`
  porFallo.set(k, (porFallo.get(k) || 0) + 1)
}
for (const [k, n] of [...porFallo].sort((a, b) => b[1] - a[1])) {
  const [serie, comp, esperado, real] = k.split('|')
  console.log(`    ${serie.padEnd(10)} ${comp.padEnd(5)} esperado=${esperado.padEnd(10)} real=${real.padEnd(10)} ×${n}`)
}
if (!fallos.length) console.log('    (ninguno)')

// ═══ C. 25 vs 26 en dos niveles ══════════════════════════════════════════
console.log('\n═══ C. Separar 25 de 26: catálogo × histórico ═══')
// (a) catálogo: series (de las 57) donde resol[25] != resol[26]
const series57 = (await sql`select codigo from series`).map((s) => s.codigo)
let seriesDistinto = [], seriesIgual = 0, seriesSinAlguno = 0
for (const s of series57) {
  const r25 = resolEnSerie(s, '25'), r26 = resolEnSerie(s, '26')
  if (!r25 || !r26) seriesSinAlguno++
  else if (r25 !== r26) seriesDistinto.push({ serie: s, r25, r26 })
  else seriesIgual++
}
console.log(`  (a) catálogo: de ${series57.length} series → ${seriesDistinto.length} con resol[25]!=resol[26], ` +
  `${seriesIgual} iguales, ${seriesSinAlguno} sin 25 o 26`)
for (const x of seriesDistinto.slice(0, 20))
  console.log(`      ${x.serie.padEnd(12)} 25→${x.r25}   26→${x.r26}`)

// (b) histórico: ¿piezas reales Componente=25 y =26 en las series donde difieren?
const seriesDiff = new Set(seriesDistinto.map((x) => x.serie))
const testigos = new Map()   // serie -> {n25, n26}
for (const p of lin) {
  if (p.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(p.nLinea)
  if (!serie || !seriesDiff.has(serie)) continue
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const d = detPorLinea.get(h.nLinea)
    if (!d) continue
    if (d.Componente !== '25' && d.Componente !== '26') continue
    const t = testigos.get(serie) ?? { n25: 0, n26: 0 }
    if (d.Componente === '25') t.n25++; else t.n26++
    testigos.set(serie, t)
  }
}
let conTestigo = 0
for (const [serie, t] of testigos) if (t.n25 > 0 && t.n26 > 0) conTestigo++
console.log(`  (b) histórico: series con resol distinto que además tienen piezas reales 25 Y 26: ${conTestigo}`)
for (const [serie, t] of testigos) console.log(`      ${serie.padEnd(12)} piezas 25=${t.n25}  26=${t.n26}`)

// veredicto: cuadrante
const inofensiva = seriesDistinto.length === 0
const contrastable = conTestigo > 0
console.log('\n  VEREDICTO 25-vs-26:')
if (inofensiva) console.log('    INOFENSIVA POR CONSTRUCCIÓN: ningún conjunto resuelve 25 y 26 a artículos distintos.')
else console.log(`    PELIGROSA: ${seriesDistinto.length} series resuelven 25 y 26 distinto — la clave importa.`)
if (!inofensiva) console.log(contrastable
  ? '    Y CONTRASTABLE: hay piezas reales 25 y 26 en esas series para decidir cuál es la clave.'
  : '    SIN TESTIGO: no hay piezas reales 25 y 26 en esas series; medible sólo si aparecen datos.')
else console.log(contrastable
  ? '    (con testigo histórico, pero da igual: resuelven al mismo artículo).'
  : '    (sin testigo, pero da igual: resuelven al mismo artículo).')

await sql.end({ timeout: 5 })
