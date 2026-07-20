/**
 * MEDICIÓN, sólo lectura. Pregunta: ¿qué regla en TIEMPO DE RESOLUCIÓN
 * (datos de plantilla/catálogo, nunca del histórico) marca un
 * `componente_disenyo` como HERRAJE/asociado sin falsos positivos?
 *
 * Verdad de campo (oráculo): HERRAJE = componente cuyas piezas de instancia son
 * TODAS Articulo=0; PERFIL = componente con alguna pieza Articulo!=0.
 * Enlace: VPresupuestosLin(padre EstructuraSN)→hijas por nEstr→
 * VDatosLinDetDis por nVLinea==nLinea (1:1) → .Componente ; Articulo de la hija.
 *
 * Regla A: pertenencia a ConjuntosAsoc.ComponenteAsoc.
 * Regla B: señales estructurales de plantilla (EstructurasArticulos /
 *          estructura_componentes): Funcion, StFabricadoSN, AsociadoA,
 *          AsociadoAId, NoComputarCosteSN, Seccion, articulo genérico, etc.
 *
 * Matriz de confusión por regla; el número CRÍTICO es perfil-marcado-herraje
 * (falso positivo = hueco de perfil oculto). Regla 7: se imprime aunque sea nulo.
 */
import postgres from 'postgres'
import { readFileSync } from 'node:fs'

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const leerEnv = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'))
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null
}
const sql = postgres(leerEnv('DATABASE_URL'))
const RUTA = leerEnv('RUTA_CSV_ORIGEN')
const DIR = new URL(`file:///${RUTA.replace(/\\/g, '/').replace(/\/?$/, '/')}`)
const vacio = (v) => v === undefined || v === null || v === '' || v === '0'
const BOM = String.fromCharCode(0xFEFF)

function leerCsv(nombre) {
  let txt = readFileSync(new URL(nombre, DIR), 'utf8')
  if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1)
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

// ═══ 1. VERDAD DE CAMPO ════════════════════════════════════════════════════
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

// comp -> {con: piezas con Articulo!=0, sin: piezas con Articulo=0}
const artPorComp = new Map()
for (const p of lin) {
  if (p.EstructuraSN !== 'True') continue
  for (const h of hijasPorPadre.get(p.nLinea) ?? []) {
    const d = detPorLinea.get(h.nLinea)
    if (!d || !d.Componente) continue
    const comp = d.Componente
    const e = artPorComp.get(comp) ?? { con: 0, sin: 0 }
    if (vacio(h.Articulo)) e.sin++
    else e.con++
    artPorComp.set(comp, e)
  }
}

const HERRAJE = new Set(), PERFIL = new Set()
for (const [comp, e] of artPorComp) {
  if (e.con === 0) HERRAJE.add(comp)   // todas las piezas Articulo=0
  else PERFIL.add(comp)                // alguna pieza real
}

console.log('═══ 1. VERDAD DE CAMPO (oráculo, instancia VDatosLinDetDis↔VPresupuestosLin) ═══')
console.log(`  componentes distintos en instancia: ${artPorComp.size}`)
console.log(`  HERRAJE (todas Art=0): ${HERRAJE.size}   ·   PERFIL (alguna Art!=0): ${PERFIL.size}`)
const herrajeOrden = [...HERRAJE].sort()
console.log('\n  LISTA HERRAJE (comp · piezas Art=0):')
for (const c of herrajeOrden) console.log(`    ${c.padEnd(8)} sin=${artPorComp.get(c).sin}`)
console.log('\n  LISTA PERFIL (comp · con/sin):')
for (const c of [...PERFIL].sort()) {
  const e = artPorComp.get(c)
  console.log(`    ${c.padEnd(8)} con=${e.con} sin=${e.sin}`)
}

// ═══ 2. REGLA A — ConjuntosAsoc.ComponenteAsoc ═════════════════════════════
const asoc = leerCsv('ConjuntosAsoc.csv')
const compAsoc = new Set(asoc.map((r) => r.ComponenteAsoc).filter((v) => v && v !== '0'))
console.log('\n═══ 2. REGLA A — pertenencia a ConjuntosAsoc.ComponenteAsoc ═══')
console.log(`  ComponenteAsoc distintos en ConjuntosAsoc.csv: ${compAsoc.size}`)

function confusion(nombre, esHerrajePred) {
  let hIn = 0, hOut = 0, pIn = 0, pOut = 0
  const hOutL = [], pInL = []
  for (const c of HERRAJE) { if (esHerrajePred(c)) hIn++; else { hOut++; hOutL.push(c) } }
  for (const c of PERFIL) { if (esHerrajePred(c)) { pIn++; pInL.push(c) } else pOut++ }
  console.log(`\n  ── ${nombre}`)
  console.log(`     herraje→herraje (TP):        ${hIn}/${HERRAJE.size}`)
  console.log(`     herraje→perfil  (FN, hueco): ${hOut}   ${hOut ? '[' + hOutL.sort().join(' ') + ']' : ''}`)
  console.log(`     perfil→herraje  (FP CRÍTICO): ${pIn}   ${pIn ? '[' + pInL.sort().join(' ') + ']' : ''}`)
  console.log(`     perfil→perfil   (TN):        ${pOut}/${PERFIL.size}`)
  console.log(`     ⇒ ${pIn === 0 ? 'SIN falsos positivos' : 'TIENE FALSOS POSITIVOS (inaceptable)'}` +
    ` · ${hOut === 0 ? 'captura todo el herraje' : hOut + ' falsos negativos'}`)
  return { hIn, hOut, pIn, pOut }
}
confusion('A: comp ∈ ConjuntosAsoc.ComponenteAsoc', (c) => compAsoc.has(c))

// ═══ 3. REGLA B — señales estructurales de plantilla ═══════════════════════
// (B1) DB estructura_componentes: funcion + articulo genérico
const compsDb = await sql`
  select estructura_codigo, articulo_codigo, componente_disenyo, funcion from estructura_componentes`
const genericos = new Set(
  (await sql`select codigo from articulos where descripcion like '(**%'`).map((a) => a.codigo))
// agregado por componente_disenyo: set de funciones, ¿alguna vez artículo genérico?, ¿siempre?
const dbPorComp = new Map()
for (const c of compsDb) {
  const comp = c.componente_disenyo
  if (!comp) continue
  const e = dbPorComp.get(comp) ?? { fn: new Set(), gen: 0, noGen: 0, n: 0 }
  e.fn.add(c.funcion || '(null)')
  if (genericos.has(c.articulo_codigo)) e.gen++; else e.noGen++
  e.n++
  dbPorComp.set(comp, e)
}

// (B2) EstructurasArticulos.csv: campos estructurales por DisComponente
const estArt = leerCsv('EstructurasArticulos.csv')
const CAMPOS_B = ['Funcion', 'StFabricadoSN', 'AsociadoA', 'AsociadoAId', 'NoComputarCosteSN', 'Seccion', 'DisTipoHoja']
const plantPorComp = new Map()  // comp -> {campo -> Set(valores)}
for (const f of estArt) {
  if (f.TipoDoc) continue           // sólo filas de plantilla (no docs)
  const comp = f.DisComponente
  if (!comp) continue
  let e = plantPorComp.get(comp)
  if (!e) { e = {}; for (const k of CAMPOS_B) e[k] = new Map(); plantPorComp.set(comp, e) }
  for (const k of CAMPOS_B) {
    const v = f[k] === undefined || f[k] === '' ? '(nulo)' : f[k]
    e[k].set(v, (e[k].get(v) || 0) + 1)
  }
}

console.log('\n═══ 3. REGLA B — señales estructurales de plantilla ═══')
console.log(`  estructura_componentes: comps con DisComponente = ${dbPorComp.size}`)
console.log(`  EstructurasArticulos.csv: comps con DisComponente = ${plantPorComp.size}`)

// B1a: regla "funcion HV/HH ⇒ perfil, resto ⇒ herraje" (heurística actual invertida)
// El defecto actual: enruta a ASOCIADO sólo si funcion empieza inf/Acc.
// Medimos la regla actual de la app como predictor de herraje:
const esAsociadoActual = (fn) => !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))
confusion('B1: regla ACTUAL app (funcion empieza inf/Acc ⇒ herraje)', (c) => {
  const e = dbPorComp.get(c)
  if (!e) return false
  return [...e.fn].some(esAsociadoActual) && ![...e.fn].some((fn) => !esAsociadoActual(fn))
})

// B1b: articulo genérico SIEMPRE en plantilla (herraje no resuelve a artículo real)
confusion('B1b: DB articulo SIEMPRE genérico (noGen==0) ⇒ herraje', (c) => {
  const e = dbPorComp.get(c)
  return e ? e.noGen === 0 && e.gen > 0 : false
})

// B2: cada campo estructural como predictor. Un valor "marca herraje" si en la
// verdad de campo domina herraje; medimos pureza. Aquí lo hacemos por "el comp
// tiene el flag activado en TODAS sus filas de plantilla".
function reglaFlagPositivo(campo, positivos) {
  return (c) => {
    const e = plantPorComp.get(c)
    if (!e) return false
    const vals = [...e[campo].keys()]
    // herraje si TODOS los valores del comp están en el conjunto "positivos"
    return vals.length > 0 && vals.every((v) => positivos.has(v))
  }
}
console.log('\n  ── B2: valores de cada campo estructural sobre HERRAJE vs PERFIL')
for (const campo of CAMPOS_B) {
  const hVals = new Map(), pVals = new Map()
  for (const c of HERRAJE) { const e = plantPorComp.get(c); if (!e) continue; for (const [v, n] of e[campo]) hVals.set(v, (hVals.get(v) || 0) + 1) }
  for (const c of PERFIL) { const e = plantPorComp.get(c); if (!e) continue; for (const [v, n] of e[campo]) pVals.set(v, (pVals.get(v) || 0) + 1) }
  console.log(`     ${campo}:`)
  console.log(`        en HERRAJE: ${[...hVals].sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v}=${n}`).join('  ') || '(ninguno)'}`)
  console.log(`        en PERFIL : ${[...pVals].sort((a, b) => b[1] - a[1]).map(([v, n]) => `${v}=${n}`).join('  ') || '(ninguno)'}`)
}

// B2 confusion para StFabricadoSN / AsociadoA como marcadores directos
confusion('B2a: StFabricadoSN alguna vez = False en todas filas ⇒ herraje',
  reglaFlagPositivo('StFabricadoSN', new Set(['False'])))
confusion('B2b: AsociadoA != (nulo) en TODAS las filas ⇒ herraje',
  (c) => { const e = plantPorComp.get(c); if (!e) return false; const vals = [...e.AsociadoA.keys()]; return vals.length > 0 && vals.every((v) => v !== '(nulo)') })

await sql.end({ timeout: 5 })
