/**
 * MEDICIÓN, no construcción. T.26: rehacer la tabla de causas de T.21.2 entera
 * con el enlace limpio, después de que T.24/T.25 demostraran que su partida
 * mayor (el 42,3% "oscilobatiente") era herraje mal contado como perfil.
 *
 * Puente de unidades (importante): las 7.000 "apariciones" de T.21.2 son
 * RANURAS DE PLANTILLA (componente_disenyo) que fallan la resolución,
 * ponderadas por `veces` = nº de veces que cada pareja serie×estructura aparece
 * en el histórico. NO son piezas de instancia. Por eso el cuadre a 7.000 se
 * garantiza reproduciendo el bucle exacto de T.21.2 (clasificar-ranuras-reales)
 * y reclasificando cada ranura por la CLASE EMPÍRICA de su componente, medida
 * sobre la instancia (VDatosLinDetDis.Componente, enlace 1:1) — igual que cuadró
 * el 2.959 en T.25.1. `resolverComponente` es exacto + variante .2, un
 * superconjunto del lookup directo, así que no inventa fallos.
 *
 * Ajustes del encargo:
 *   1. Cuadre obligatorio: la nueva tabla suma 7.000, no clasificables aparte.
 *   2. Salida: tabla vieja y nueva; herraje / cristal-juntas (otra vía) /
 *      resuelve-ya-100% / perfil-real-sin-resolver / no-clasificable. Correderas
 *      (222–229, 22) y BI medidas como el oscilobatiente en T.25: cobertura real
 *      por la cadena y fallos uno a uno.
 *   4. Nulos impresos (regla 7).
 *
 * Sólo lectura.
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

// ── CSV ──────────────────────────────────────────────────────────────────
const estr = leerCsv('VDatosLinEstr.csv')
const seriePorLinea = new Map()
for (const r of estr) if (r.TipoDoc === 'VPRES') seriePorLinea.set(r.nVLinea, r.Conjunto1)
const lin = leerCsv('VPresupuestosLin.csv')
const detalles = leerCsv('VDatosLinDetDis.csv')
const detPorLinea = new Map(detalles.map((f) => [f.nVLinea, f]))
const hijasPorPadre = new Map()
for (const f of lin) {
  if (!f.nEstr || f.nEstr === '0') continue
  if (!hijasPorPadre.has(f.nEstr)) hijasPorPadre.set(f.nEstr, [])
  hijasPorPadre.get(f.nEstr).push(f)
}

// ── DB ───────────────────────────────────────────────────────────────────
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
const cadenaDe = (s) => cacheCadena.get(s) ?? (cacheCadena.set(s, expandirCadena(s, mapaDeleg)), cacheCadena.get(s))
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
  const filas = []
  for (const conjunto of cadenaDe(serie))
    for (const [componente, articulo] of porConjuntoLin.get(conjunto) ?? [])
      filas.push({ conjuntoCodigo: conjunto, componente, articuloCodigo: articulo })
  const r = construirResoluciones(cadenaDe(serie), filas)
  cacheRes.set(serie, r)
  return r
}

// ── Clase empírica de un componente (sobre la INSTANCIA) ──────────────────
// artPorComp: ¿lleva artículo alguna vez? · covPorComp: cobertura por la cadena
const artPorComp = new Map()   // comp -> {con, sin}
const covPorComp = new Map()   // comp -> {total, acierta, falla, sinCand, fallos:[]}
for (const p of lin) {
  if (p.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(p.nLinea)
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const d = detPorLinea.get(h.nLinea)
    if (!d || !d.Componente) continue
    const comp = d.Componente
    const e = artPorComp.get(comp) ?? { con: 0, sin: 0 }
    if (vacio(h.Articulo)) { e.sin++; artPorComp.set(comp, e); continue }
    e.con++; artPorComp.set(comp, e)
    if (!serie) continue
    const cc = covPorComp.get(comp) ?? { total: 0, acierta: 0, falla: 0, sinCand: 0, fallos: [] }
    cc.total++
    const esperado = resolEnSerie(serie, comp)
    if (!esperado) cc.sinCand++
    else if (esperado === h.Articulo) cc.acierta++
    else { cc.falla++; cc.fallos.push({ serie, esperado, real: h.Articulo, est: p.Articulo }) }
    covPorComp.set(comp, cc)
  }
}
const esCristal = (c) => c === '1'
const esJunta = (c) => /^J/.test(c)   // JH, JV
function claseNueva(comp) {
  if (!comp) return 'A. sin componente_disenyo'
  if (esCristal(comp)) return 'cristal — otra vía (T.22)'
  if (esJunta(comp)) return 'juntas — otra vía (anexo M)'
  const inst = artPorComp.get(comp)
  if (!inst || inst.con === 0) {
    if (!inst) return 'no clasificable (nunca en instancia)'
    return 'herraje (Art=0) — asociados (anexo S)'
  }
  const cov = covPorComp.get(comp)
  if (cov && cov.total > 0 && cov.falla === 0 && cov.sinCand === 0) return 'resuelve YA 100% por ConjuntosLin'
  return 'PERFIL REAL sin resolver'
}

// ── Parejas reales ────────────────────────────────────────────────────────
const parejas = new Map()
for (const l of lin) {
  if (l.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(l.nLinea)
  if (!serie || !l.Articulo) continue
  const k = `${serie}|${l.Articulo}`
  parejas.set(k, (parejas.get(k) || 0) + 1)
}

// ── A. Reproducción de T.21.2 + reclasificación ───────────────────────────
const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const esAsociado = (fn) => !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))
const NO_RESUELVEN = new Map([['1', 'cristal'], ['130', 'manilla'], ['39', 'mano de obra'], ['50', 'infHV']])
const causaVieja = new Map()   // E/B/A/C -> veces
const claseNuevaTotal = new Map()
const porComp = new Map()       // comp -> veces (T.21.2)
let total = 0
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
    else { const r = resolverComponente(comp, resoluciones, '2'); falla = !r.articuloCodigo && genericos.has(c.articulo_codigo) }
    if (!falla) continue
    total += veces
    let causa
    if (!comp) causa = 'A. sin componente_disenyo'
    else if (NO_RESUELVEN.has(comp)) causa = `B. no toca a la serie (${NO_RESUELVEN.get(comp)})`
    else causa = 'E. sin candidato en la cadena'
    causaVieja.set(causa, (causaVieja.get(causa) || 0) + veces)
    const cn = claseNueva(comp)
    claseNuevaTotal.set(cn, (claseNuevaTotal.get(cn) || 0) + veces)
    const key = comp || '(null)'
    porComp.set(key, (porComp.get(key) || 0) + veces)
  }
}

console.log('═══ A. Tabla VIEJA de T.21.2 reproducida ═══')
console.log(`  total del frente: ${total}  [esperado 7.000] ${total === 7000 ? '✓ cuadra' : '✗ FUGA'}`)
for (const [causa, v] of [...causaVieja].sort((a, b) => b[1] - a[1]))
  console.log(`    ${String(v).padStart(5)}  ${(v / total * 100).toFixed(1).padStart(5)}%  ${causa}`)

console.log('\n═══ B. Tabla NUEVA (enlace limpio), misma base de 7.000 ═══')
let suma = 0
for (const [clase, v] of [...claseNuevaTotal].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(v).padStart(5)}  ${(v / total * 100).toFixed(1).padStart(5)}%  ${clase}`)
  suma += v
}
console.log(`    ${'—'.repeat(5)}  ${suma === total ? 'suma ' + suma + ' ✓ cuadra' : '⚠ suma ' + suma + ' ≠ ' + total}`)

console.log('\n  Por componente (veces T.21.2 · clase · cobertura instancia):')
for (const [comp, v] of [...porComp].sort((a, b) => b[1] - a[1])) {
  const cov = covPorComp.get(comp)
  const covTxt = cov ? `inst ${cov.total}: ok ${cov.acierta} falla ${cov.falla} sinCand ${cov.sinCand}` : 'sin instancia'
  console.log(`    ${comp.padEnd(6)} ×${String(v).padStart(5)}  ${claseNueva(comp).padEnd(38)} ${covTxt}`)
}

// ── C. Detalle de correderas (222–229, 22) y BI: cobertura + fallos ───────
console.log('\n═══ C. Perfil real candidato: correderas (222–229, 22) y BI ═══')
const FOCO = ['222', '223', '224', '225', '226', '227', '228', '229', '22', 'BI']
for (const comp of FOCO) {
  const cov = covPorComp.get(comp)
  if (!cov) { console.log(`  ${comp.padEnd(5)} — sin piezas de instancia (no aparece con Articulo≠0)`); continue }
  const p = (x) => cov.total ? (x / cov.total * 100).toFixed(1) : '—'
  console.log(`  ${comp.padEnd(5)} inst=${cov.total} · acierta=${cov.acierta} (${p(cov.acierta)}%) · ` +
    `falla=${cov.falla} · sinCand=${cov.sinCand} · clase=${claseNueva(comp)}`)
  const agg = new Map()
  for (const f of cov.fallos) {
    const kk = `${f.serie}|${comp}|${f.esperado}|${f.real}`
    agg.set(kk, (agg.get(kk) || 0) + 1)
  }
  for (const [kk, n] of [...agg].sort((a, b) => b[1] - a[1])) {
    const [serie, cc, esperado, real] = kk.split('|')
    console.log(`      FALLO ${serie.padEnd(10)} ${cc.padEnd(5)} esperado=${esperado.padEnd(10)} real=${real.padEnd(10)} ×${n}`)
  }
  if (cov.sinCand > 0 && cov.falla === 0)
    console.log(`      (sin candidato en la cadena: ${cov.sinCand} piezas — la serie no resuelve ${comp} por ConjuntosLin)`)
}

// ── D. Análogo de T.25 para correderas: ¿resuelve el PERFIL de sus
//      estructuras? (como el oscilobatiente, la corredera 222–229 es herraje;
//      la hoja real lleva otro Componente) ──────────────────────────────────
console.log('\n═══ D. Perfil real de estructuras de corredera (criterio de T.25) ═══')
const CORREDERA = new Set(['222', '223', '224', '225', '226', '227', '228', '229', '22'])
const HERRAJE_COMP = new Set([...CORREDERA, 'OBC', 'OBM', 'OBCR', 'OBP', 'OBPH', 'PRC', 'PRPV', 'PRPH',
  'EKCC', 'EKEF', 'EKEE'])
const estCorr = new Set()
for (const [est, cs] of porEstr) if (cs.some((c) => CORREDERA.has(c.componente_disenyo))) estCorr.add(est)
console.log(`  estructuras de corredera (plantilla con 222–229/22): ${estCorr.size}`)
const distC = new Map(), cobC = new Map(), fallosC = []
let piezasC = 0
for (const p of lin) {
  if (p.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(p.nLinea)
  if (!serie || !estCorr.has(p.Articulo)) continue
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const d = detPorLinea.get(h.nLinea)
    if (!d || !d.Componente) continue
    const comp = d.Componente
    if (HERRAJE_COMP.has(comp) || esCristal(comp) || esJunta(comp)) continue
    if (vacio(h.Articulo)) continue
    piezasC++
    distC.set(comp, (distC.get(comp) || 0) + 1)
    const esperado = resolEnSerie(serie, comp)
    const cc = cobC.get(comp) ?? { total: 0, acierta: 0, falla: 0, sinCand: 0 }
    cc.total++
    if (!esperado) cc.sinCand++
    else if (esperado === h.Articulo) cc.acierta++
    else { cc.falla++; fallosC.push({ serie, comp, esperado, real: h.Articulo }) }
    cobC.set(comp, cc)
  }
}
console.log(`  piezas de perfil (excluido herraje/cristal/junta): ${piezasC}`)
console.log('  distribución de componentes reales:')
for (const [c, n] of [...distC].sort((a, b) => b[1] - a[1])) console.log(`    ${c.padEnd(6)} ${n}`)
if (!distC.size) console.log('    otro/ninguno  0   (regla 7)')
console.log('  cobertura por componente:')
for (const [comp, c] of [...cobC].sort((a, b) => b[1].total - a[1].total)) {
  const p = (x) => c.total ? (x / c.total * 100).toFixed(1) : '—'
  console.log(`    ${comp.padEnd(6)} total=${c.total} acierta=${c.acierta} (${p(c.acierta)}%) falla=${c.falla} sinCand=${c.sinCand}`)
}
console.log(`  fallos (esperado≠real): ${fallosC.length}`)
const aggC = new Map()
for (const f of fallosC) { const kk = `${f.serie}|${f.comp}|${f.esperado}|${f.real}`; aggC.set(kk, (aggC.get(kk) || 0) + 1) }
for (const [kk, n] of [...aggC].sort((a, b) => b[1] - a[1])) {
  const [serie, comp, esperado, real] = kk.split('|')
  console.log(`    FALLO ${serie.padEnd(10)} ${comp.padEnd(5)} esperado=${esperado.padEnd(10)} real=${real.padEnd(10)} ×${n}`)
}
if (!fallosC.length) console.log('    (ninguno)')

await sql.end({ timeout: 5 })
