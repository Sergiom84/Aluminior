/**
 * MEDICIÓN, solo lectura. T.29 (candidato): tras la reclasificación de herraje
 * de T.24–T.28, ¿sigue en pie el BLOQUEO DOBLE de T.20.3, o los ASOCIADOS son
 * ya el único tapón para que una línea con hoja valore?
 *
 * Universo: parejas serie×estructura REALES del histórico con pieza de hoja
 * (HV/HH) — nunca cartesiano (regla 8). Es el mismo universo de verificar-t27
 * (87 parejas). Para cada pareja se clasifica qué le falta HOY para valorar,
 * espejo fiel de acciones.ts (`anotarSinResolver` + valoración), separando por
 * causa con el enlace limpio:
 *
 *   1. PERFIL sin resolver  → bucket `sinResolver` (perfil real, no herraje):
 *      ranura genérica, no resuelve por ConjuntosLin, NO es asociado por funcion
 *      ni está en COMPONENTES_HERRAJE (los 51 de T.27).
 *   2. PERFIL sin precio    → de los artículos de perfil YA resueltos (o piezas
 *      concretas de perfil de la plantilla), ¿tienen precio en articulos_pvp
 *      (valorar) / coste en articulos_coste? Se mide "sin NINGUNA fila de precio"
 *      = hueco estructural (independiente de tarifa/acabado). El caveat de
 *      tarifa concreta se anota.
 *   3. CRISTAL/vidrio       → la plantilla lleva componente '1' (elección de
 *      usuario, vía acristalamiento). Se pone APARTE, no cuenta como bloqueo de
 *      serie (igual que acciones.ts lo salta antes de clasificar).
 *   4. ASOCIADOS pendientes → bucket `sinResolverAsoc`: ranura genérica que no
 *      resuelve y es asociado por funcion (inf.../Acc...) o herraje de los 51.
 *
 * Pregunta central: ¿en cuántas parejas los ASOCIADOS son el ÚNICO bloqueo
 * (perfil resuelto y con precio), con el cristal puesto aparte?
 *
 * NO mide bloqueos de instancia (rebaje/medida faltante, vidrio no calculable):
 * dependen de ancho/alto/cotas/vidrioCodigo de cada línea, no de la pareja. Se
 * anota como caveat.
 *
 * Sólo lectura. No se implementa ni commitea nada.
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

const COMPONENTE_CRISTAL = '1'
const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const esAsociado = (fn) => !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))
// Copia EXACTA de la allowlist de acciones.ts (T.27).
const COMPONENTES_HERRAJE = new Set([
  '222', '223', '224', '225', '226', '227', '228', '229',
  'OBC', 'OBCR', 'OBM', 'OBP', 'OBPH',
  'PRC', 'PRPH', 'PRPV',
  'EKCC', 'EKEE', 'EKEF',
  '39', '50', '51', '52', '53', '55', '56', '57', '58', '58R', '59',
  '71', '130', '133', '134', 'EHC', 'EHH', 'EHF', 'EHFH', 'EMBF',
  'CHC', 'CHH', 'JA', 'JB', 'JD', 'JI',
  '30', '116', '135', '139', '143', '51MA',
])

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

// ── Parejas reales (idéntico a verificar-t27) ──────────────────────────────
const estr = leerCsv('VDatosLinEstr.csv')
const seriePorLinea = new Map()
for (const r of estr) if (r.TipoDoc === 'VPRES') seriePorLinea.set(r.nVLinea, r.Conjunto1)
const parejas = new Map()
for (const l of leerCsv('VPresupuestosLin.csv')) {
  if (l.EstructuraSN !== 'True') continue
  const serie = seriePorLinea.get(l.nLinea)
  if (!serie || !l.Articulo) continue
  const k = `${serie}|${l.Articulo}`
  parejas.set(k, (parejas.get(k) || 0) + 1)
}

// ── DB ─────────────────────────────────────────────────────────────────────
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
// Artículos con AL MENOS una fila de precio / coste (hueco estructural si 0).
const conPvp = new Set((await sql`select distinct articulo_codigo from articulos_pvp`).map((a) => a.articulo_codigo))
const conCoste = new Set((await sql`select distinct articulo_codigo from articulos_coste`).map((a) => a.articulo_codigo))

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

// ── Clasificación por pareja (espejo de acciones.ts) ───────────────────────
// VARIANTE = '2' (doble cristal, 100% del histórico; default de acciones.ts).
const VARIANTE = '2'
let conHoja = 0
const tabla = { perfilSinResolver: 0, perfilSinPrecioPvp: 0, perfilSinPrecioCoste: 0, cristal: 0, asociados: 0 }
let soloAsociados = 0
let nadaFalta = 0
const candidatas = []      // parejas "más cerca": sin perfil pendiente, con precio
const detalleSinPerfilPrecio = []
const perfilPendientesPorComp = new Map()   // comp -> parejas afectadas
const perfilSinPrecioArts = new Map()        // articulo -> parejas afectadas

for (const [k, veces] of parejas) {
  const [serie, estructura] = k.split('|')
  const cs = porEstr.get(estructura)
  if (!cs || !cs.some((c) => FUNCIONES_HOJA.has(c.funcion))) continue
  conHoja++
  const resoluciones = await resolucionesDe(serie)

  const sinResolver = new Set()      // perfil real sin resolver (articuloCodigo genérico)
  const sinResolverAsoc = new Set()  // asociados/herraje sin resolver
  const perfilResueltoArts = new Set() // artículos de perfil ya resueltos O concretos
  const perfilPendComps = new Set()
  let tieneCristal = false

  for (const c of cs) {
    const comp = c.componenteDisenyo ?? c.componente_disenyo
    if (comp === COMPONENTE_CRISTAL) { tieneCristal = true; continue }
    // ¿es asociado (frente vivo)? -> no cuenta como perfil ni para precio de perfil
    const esAsoc = esAsociado(c.funcion) || (comp != null && COMPONENTES_HERRAJE.has(comp))

    if (!comp) {
      // sin componente: si es genérico y no resuelve -> pendiente; si concreto -> pieza real
      if (genericos.has(c.articulo_codigo)) {
        if (esAsoc) sinResolverAsoc.add(c.articulo_codigo)
        else sinResolver.add(c.articulo_codigo)
      } else if (!esAsoc) {
        perfilResueltoArts.add(c.articulo_codigo)   // concreto de perfil
      }
      continue
    }
    const res = resolverComponente(comp, resoluciones, VARIANTE)
    if (res.articuloCodigo) {
      if (!esAsoc) perfilResueltoArts.add(res.articuloCodigo)   // perfil resuelto
      continue
    }
    // no resuelve
    if (genericos.has(c.articulo_codigo)) {
      if (esAsoc) sinResolverAsoc.add(c.articulo_codigo)
      else { sinResolver.add(c.articulo_codigo); perfilPendComps.add(comp) }
    } else if (!esAsoc) {
      // componente presente pero artículo de plantilla NO genérico y no resuelve:
      // pieza concreta de perfil (p.ej. BI). Ya "resuelta" en la plantilla.
      perfilResueltoArts.add(c.articulo_codigo)
    }
  }

  // precio de los artículos de perfil resueltos/concretos
  const perfilSinPvp = [...perfilResueltoArts].filter((a) => !conPvp.has(a))
  const perfilSinCoste = [...perfilResueltoArts].filter((a) => !conCoste.has(a))

  const tienePerfilSinResolver = sinResolver.size > 0
  const tienePerfilSinPvp = perfilSinPvp.length > 0
  const tieneAsociados = sinResolverAsoc.size > 0

  if (tienePerfilSinResolver) {
    tabla.perfilSinResolver++
    for (const comp of perfilPendComps)
      perfilPendientesPorComp.set(comp, (perfilPendientesPorComp.get(comp) || 0) + 1)
  }
  if (tienePerfilSinPvp) {
    tabla.perfilSinPrecioPvp++
    for (const a of perfilSinPvp) perfilSinPrecioArts.set(a, (perfilSinPrecioArts.get(a) || 0) + 1)
  }
  if (perfilSinCoste.length) tabla.perfilSinPrecioCoste++
  if (tieneCristal) tabla.cristal++
  if (tieneAsociados) tabla.asociados++

  // ¿asociados el ÚNICO bloqueo? (perfil resuelto y con precio pvp; cristal aparte)
  if (tieneAsociados && !tienePerfilSinResolver && !tienePerfilSinPvp) soloAsociados++
  // ¿nada falta en el lado perfil+asociados? (solo cristal, o nada)
  if (!tieneAsociados && !tienePerfilSinResolver && !tienePerfilSinPvp) {
    nadaFalta++
    candidatas.push({ k, veces, cristal: tieneCristal, nota: 'perfil OK + sin asociados pendientes' })
  }
  if (!tienePerfilSinResolver && !tienePerfilSinPvp) {
    detalleSinPerfilPrecio.push({ k, veces, asociados: sinResolverAsoc.size, cristal: tieneCristal })
  }
}

const N = conHoja
console.log(`═══ Universo: parejas serie×estructura reales con pieza de hoja (HV/HH) ═══`)
console.log(`  N = ${N}  (esperado 87, verificar-t27)`)

console.log(`\n═══ Tabla: de las ${N} parejas, cuántas tienen HOY cada bloqueo ═══`)
const pc = (x) => `${String(x).padStart(3)}  (${(x / N * 100).toFixed(1).padStart(5)}%)`
console.log(`  1. PERFIL sin resolver (perfil real, no herraje) : ${pc(tabla.perfilSinResolver)}`)
console.log(`  2. PERFIL sin precio en articulos_pvp           : ${pc(tabla.perfilSinPrecioPvp)}`)
console.log(`     PERFIL sin coste en articulos_coste          : ${pc(tabla.perfilSinPrecioCoste)}`)
console.log(`  3. CRISTAL presente (elección usuario, aparte)   : ${pc(tabla.cristal)}`)
console.log(`  4. ASOCIADOS pendientes (herraje/MO/escuadra)    : ${pc(tabla.asociados)}`)

console.log(`\n═══ PREGUNTA CENTRAL ═══`)
console.log(`  Parejas donde ASOCIADOS es el ÚNICO bloqueo (perfil resuelto + con precio pvp,`)
console.log(`  cristal aparte)                                  : ${pc(soloAsociados)}`)
console.log(`  Parejas sin NINGÚN bloqueo perfil ni asociado (solo cristal/nada): ${pc(nadaFalta)}`)

console.log(`\n═══ (1) PERFIL sin resolver: componentes concretos y parejas afectadas ═══`)
if (!perfilPendientesPorComp.size) console.log('  (ninguno)  0   (regla 7)')
for (const [comp, n] of [...perfilPendientesPorComp].sort((a, b) => b[1] - a[1]))
  console.log(`  comp ${comp.padEnd(6)} → ${n} parejas`)

console.log(`\n═══ (2) PERFIL sin precio pvp: artículos resueltos sin ninguna fila en articulos_pvp ═══`)
if (!perfilSinPrecioArts.size) console.log('  (ninguno)  0   (regla 7)')
for (const [a, n] of [...perfilSinPrecioArts].sort((x, y) => y[1] - x[1]).slice(0, 40))
  console.log(`  ${a.padEnd(14)} → ${n} parejas   ${genericos.has(a) ? '(⚠ genérico sin resolver)' : ''}`)

console.log(`\n═══ Parejas "más cerca de valorar" (sin perfil pendiente ni perfil sin precio) ═══`)
console.log(`  total: ${detalleSinPerfilPrecio.length}`)
for (const d of detalleSinPerfilPrecio.sort((a, b) => a.asociados - b.asociados).slice(0, 20)) {
  console.log(`  ${d.k.padEnd(28)} veces=${String(d.veces).padStart(4)}  ` +
    `asociados_pend=${d.asociados}  cristal=${d.cristal ? 'sí' : 'no'}`)
}

await sql.end({ timeout: 5 })
