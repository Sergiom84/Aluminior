/**
 * MEDICIÓN, sólo lectura. Identificar el componente Componente='BI', el único
 * cabo de "perfil real" del frente de perfil que quedó sin resolver tras T.25/T.26
 * (158 piezas Articulo≠0, ninguna resuelve por ConjuntosLin).
 *
 * Enlace pieza↔componente EXCLUSIVAMENTE por VDatosLinDetDis.Componente (1:1),
 * cruzado con VPresupuestosLin.Articulo por nLinea==det.nVLinea, igual que T.25/T.26.
 *
 * Responde 4 preguntas:
 *   1. ¿Qué es BI? Funcion en plantilla (EstructurasArticulos.DisComponente / DB
 *      estructura_componentes) + descripción del artículo genérico + estructuras/familia.
 *   2. ¿Por qué no resuelve por ConjuntosLin? ¿Existe en conjunto_resoluciones?
 *      ¿Resuelve por ConjuntosAsoc.ComponenteAsoc, variante BI.1/BI.2, o delegación?
 *   3. ¿El Articulo real de las 158 piezas es genérico (**… o concreto con precio?
 *   4. Reparto por serie y estructura.
 *
 * Regla 7: imprimir el dato aunque sea nulo. Sólo lectura, sin commit.
 */
import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { expandirCadena } from '../packages/core/src/series/resolver.ts'

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
  let campo = '', fila = [], q = false
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i]
    if (q) { if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++ } else q = false } else campo += c }
    else if (c === '"') q = true
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
const ea = leerCsv('EstructurasArticulos.csv')          // plantilla (DisComponente)
const conjAsoc = leerCsv('ConjuntosAsoc.csv')
const articulos = leerCsv('Articulos.csv')
const artByCod = new Map(articulos.map((a) => [a.Codigo, a]))

// ── DB ───────────────────────────────────────────────────────────────────
const deleg = await sql`select conjunto_codigo, delegado_codigo from conjunto_delegaciones`
const mapaDeleg = new Map()
for (const d of deleg) {
  if (!mapaDeleg.has(d.conjunto_codigo)) mapaDeleg.set(d.conjunto_codigo, [])
  mapaDeleg.get(d.conjunto_codigo).push(d.delegado_codigo)
}
const genericosDb = new Set(
  (await sql`select codigo from articulos where descripcion like '(**%'`).map((a) => a.codigo))
const ecBI = await sql`
  select estructura_codigo, articulo_codigo, componente_disenyo, funcion
  from estructura_componentes where componente_disenyo like 'BI%'`
const resolBI = await sql`
  select conjunto_codigo, componente, articulo_codigo
  from conjunto_resoluciones where componente like 'BI%'`
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

// ════════════════════════════════════════════════════════════════════════
// P1. ¿QUÉ ES BI?
// ════════════════════════════════════════════════════════════════════════
console.log('═══ P1. ¿Qué es BI? ═══')
const artBI = artByCod.get('BI')
console.log(`  Artículo 'BI' en catálogo: ` +
  (artBI ? `desc="${artBI.Descripcion}"  Familia=${artBI.Familia}` : 'NO EXISTE (regla 7)'))
const famBI = artBI ? leerCsv('Familias.csv').find((f) => f.Codigo === artBI.Familia) : null
console.log(`  Familia ${artBI?.Familia ?? '(null)'}: ${famBI ? `"${famBI.Nombre}"` : '(sin nombre)'}`)
const esGenBI = genericosDb.has('BI')
console.log(`  ¿'BI' es genérico (**…?  ${esGenBI ? 'SÍ' : 'NO — artículo concreto'}`)

console.log('\n  --- Plantilla: estructura_componentes (DB) componente_disenyo LIKE BI% ---')
console.log(`  filas: ${ecBI.length}`)
if (ecBI.length) {
  const fdb = {}; for (const r of ecBI) fdb[r.funcion || '(vacía)'] = (fdb[r.funcion || '(vacía)'] || 0) + 1
  console.log('  funcion (DB):', fdb)
} else console.log('  funcion (DB): (ninguna fila — BI ausente de estructura_componentes) (regla 7)')

console.log('\n  --- Plantilla: EstructurasArticulos.csv (histórico) DisComponente=BI ---')
const eaBI = ea.filter((r) => r.DisComponente === 'BI')
console.log(`  filas: ${eaBI.length}`)
const funcCsv = {}; for (const r of eaBI) funcCsv[r.Funcion || '(vacía)'] = (funcCsv[r.Funcion || '(vacía)'] || 0) + 1
console.log('  Funcion (CSV):', funcCsv)
const artPlantilla = {}; for (const r of eaBI) artPlantilla[r.Articulo] = (artPlantilla[r.Articulo] || 0) + 1
console.log('  Articulo estampado en plantilla:', artPlantilla)
const fab = {}, aso = {}; for (const r of eaBI) { fab[r.StFabricadoSN] = (fab[r.StFabricadoSN] || 0) + 1; aso[r.AsociadoA] = (aso[r.AsociadoA] || 0) + 1 }
console.log('  StFabricadoSN:', fab, ' AsociadoA:', aso)
const estrBI = {}; for (const r of eaBI) estrBI[r.Estructura] = (estrBI[r.Estructura] || 0) + 1
console.log(`  Estructuras de plantilla con BI (${Object.keys(estrBI).length}):`,
  Object.entries(estrBI).sort((a, b) => b[1] - a[1]))

// ════════════════════════════════════════════════════════════════════════
// P2. ¿POR QUÉ NO RESUELVE POR ConjuntosLin? ¿Otra vía?
// ════════════════════════════════════════════════════════════════════════
console.log('\n═══ P2. Vías de resolución de BI ═══')
console.log(`  (a) conjunto_resoluciones (ConjuntosLin) componente LIKE BI%: ${resolBI.length} filas`)
if (resolBI.length) for (const r of resolBI.slice(0, 20)) console.log(`      ${r.conjunto_codigo} ${r.componente} -> ${r.articulo_codigo}`)
else console.log('      (BI NO existe como componente en NINGÚN conjunto — nunca resuelve por ConjuntosLin) (regla 7)')

const asocBI = conjAsoc.filter((r) => r.ComponenteAsoc === 'BI')
const asocArtBI = conjAsoc.filter((r) => r.Articulo === 'BI' || r.ArticuloAsoc === 'BI')
console.log(`  (b) ConjuntosAsoc.ComponenteAsoc=BI: ${asocBI.length} filas`)
console.log(`      ConjuntosAsoc con Articulo=BI o ArticuloAsoc=BI: ${asocArtBI.length} filas`)
if (asocBI.length) for (const r of asocBI.slice(0, 10)) console.log(`      Conj=${r.Conjunto} -> ArticuloAsoc=${r.ArticuloAsoc}`)
else console.log('      (BI NO aparece como ComponenteAsoc — no resuelve por vía asociado) (regla 7)')

const variantes = resolBI.filter((r) => r.componente !== 'BI').map((r) => r.componente)
console.log(`  (c) variantes BI.1/BI.2 en conjunto_resoluciones: ${variantes.length ? variantes.join(', ') : '(ninguna) (regla 7)'}`)

// ════════════════════════════════════════════════════════════════════════
// P3 + P4. Las 158 piezas reales: enlace por det.Componente='BI'
// ════════════════════════════════════════════════════════════════════════
console.log('\n═══ P3/P4. Las piezas reales de instancia (Componente=BI, enlace 1:1) ═══')
const piezas = []
for (const p of lin) {
  if (p.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(p.nLinea)
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const d = detPorLinea.get(h.nLinea)
    if (!d || d.Componente !== 'BI') continue
    piezas.push({ serie, estructura: p.Articulo, articulo: h.Articulo, hoja: h })
  }
}
const conArt = piezas.filter((x) => !vacio(x.articulo))
const sinArt = piezas.filter((x) => vacio(x.articulo))
console.log(`  Piezas con Componente=BI (total): ${piezas.length}`)
console.log(`    con Articulo≠0 (perfil real): ${conArt.length}   [esperado 158] ${conArt.length === 158 ? '✓' : '(≠158)'}`)
console.log(`    con Articulo=0 (herraje):      ${sinArt.length}`)

// P3: ¿genérico o concreto?
console.log('\n  --- P3. Naturaleza del Articulo real de las piezas Articulo≠0 ---')
const distArt = new Map()
for (const x of conArt) distArt.set(x.articulo, (distArt.get(x.articulo) || 0) + 1)
let nGen = 0, nConc = 0
for (const x of conArt) (genericosDb.has(x.articulo) ? nGen++ : nConc++)
console.log(`    artículos distintos: ${distArt.size}`)
console.log(`    piezas con artículo GENÉRICO (**…: ${nGen}`)
console.log(`    piezas con artículo CONCRETO (con precio): ${nConc}`)
console.log('    reparto por artículo real (código · desc · ¿genérico? · nº piezas · precio muestra):')
for (const [cod, n] of [...distArt].sort((a, b) => b[1] - a[1])) {
  const a = artByCod.get(cod)
  const esGen = genericosDb.has(cod)
  const muestra = conArt.find((x) => x.articulo === cod)?.hoja
  const precio = muestra ? (muestra.Precio || muestra.PrecioKg || '—') : '—'
  console.log(`      ${(cod || '(vacío)').padEnd(14)} ${esGen ? 'GEN ' : 'conc'} ×${String(n).padStart(4)}  precio=${String(precio).padEnd(10)} "${a ? a.Descripcion : 'NO EN CATÁLOGO'}"`)
}

// P2-refuerzo: cobertura por ConjuntosLin sobre esas piezas
let sinCand = 0, acierta = 0, falla = 0
for (const x of conArt) {
  if (!x.serie) { sinCand++; continue }
  const esp = resolEnSerie(x.serie, 'BI')
  if (!esp) sinCand++
  else if (esp === x.articulo) acierta++
  else falla++
}
console.log(`\n  --- P2. Cobertura por ConjuntosLin de esas ${conArt.length} piezas ---`)
console.log(`    sinCandidato=${sinCand}  acierta=${acierta}  falla=${falla}` +
  `  → ${sinCand === conArt.length ? 'NINGUNA resuelve por ConjuntosLin (confirmado)' : 'ALGUNA resuelve'}`)

// P4: reparto por serie y estructura
console.log('\n  --- P4. Reparto de las piezas Articulo≠0 por SERIE ---')
const porSerie = new Map()
for (const x of conArt) porSerie.set(x.serie || '(sin serie)', (porSerie.get(x.serie || '(sin serie)') || 0) + 1)
for (const [s, n] of [...porSerie].sort((a, b) => b[1] - a[1])) console.log(`      ${(s || '(null)').padEnd(14)} ×${n}`)
console.log('  --- P4. Reparto por ESTRUCTURA ---')
const porEstruc = new Map()
for (const x of conArt) porEstruc.set(x.estructura || '(null)', (porEstruc.get(x.estructura || '(null)') || 0) + 1)
for (const [e, n] of [...porEstruc].sort((a, b) => b[1] - a[1])) console.log(`      ${(e || '(null)').padEnd(14)} ×${n}`)

await sql.end({ timeout: 5 })
