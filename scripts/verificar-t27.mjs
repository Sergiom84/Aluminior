/**
 * Verifica el cambio de T.27 midiendo, no mirando (análogo a verificar-cristal.mjs
 * de T.22). Reproduce la clasificación de ranuras genéricas sin resolver de
 * acciones.ts (`anotarSinResolver`) ANTES y DESPUÉS de añadir la allowlist
 * COMPONENTES_HERRAJE a la heurística `esAsociado(funcion)`, sobre las parejas
 * serie×estructura REALES del histórico.
 *
 * Lo que debe salir: SOLO herraje (los 51 códigos medidos) se mueve del bucket
 * de PERFIL al de ASOCIADO. ALARMA explícita si CUALQUIER componente_disenyo
 * fuera de los 51 cambia de bucket (eso enmascararía un hueco de perfil real) o
 * si algo se mueve asociado→perfil (la regla es aditiva: imposible por diseño).
 *
 * Espejo fiel de acciones.ts: el cristal '1' se salta ANTES de clasificar (no
 * entra en ningún bucket); solo cuentan las ranuras genéricas.
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

const COMPONENTE_CRISTAL = '1'
const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const esAsociado = (fn) => !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))
// Copia EXACTA de la allowlist de acciones.ts (T.27). Si divergen, este script
// deja de verificar el código real: mantener en sincronía.
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
console.log(`allowlist COMPONENTES_HERRAJE: ${COMPONENTES_HERRAJE.size} códigos (esperado 51) ` +
  `${COMPONENTES_HERRAJE.size === 51 ? '✓' : '✗ REVISAR'}`)

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

/**
 * Espejo fiel de acciones.ts. Devuelve, por ranura genérica sin resolver, su
 * bucket ('perfil' | 'asoc') según `usarHerraje` (DESPUÉS=true reproduce T.27).
 * Emula la semántica de Set por articuloCodigo del código real.
 */
function clasificar(cs, resoluciones, usarHerraje) {
  const perfil = new Set(), asoc = new Set()
  const compDeBucket = new Map()   // articuloCodigo -> {comp, funcion, bucket}
  for (const c of cs) {
    const comp = c.componente_disenyo
    // Espejo: cristal se salta antes de clasificar (no entra en ningún bucket).
    if (comp === COMPONENTE_CRISTAL) continue
    let falla
    if (!comp) falla = genericos.has(c.articulo_codigo)
    else {
      const r = resolverComponente(comp, resoluciones, '2')
      falla = !r.articuloCodigo && genericos.has(c.articulo_codigo)
    }
    if (!falla) continue
    const aAsoc = esAsociado(c.funcion) ||
      (usarHerraje && comp !== null && comp !== undefined && COMPONENTES_HERRAJE.has(comp))
    if (aAsoc) asoc.add(c.articulo_codigo)
    else perfil.add(c.articulo_codigo)
    compDeBucket.set(c.articulo_codigo, { comp: comp ?? '(null)', funcion: c.funcion, bucket: aAsoc ? 'asoc' : 'perfil' })
  }
  return { perfil, asoc, compDeBucket }
}

let conHoja = 0
let perfilAntes = 0, asocAntes = 0, perfilDespues = 0, asocDespues = 0
const movidos = new Map()      // comp -> veces movidas perfil→asoc
const alarmas = []             // movimientos ilegales
for (const [k, veces] of parejas) {
  const [serie, estructura] = k.split('|')
  const cs = porEstr.get(estructura)
  if (!cs || !cs.some((c) => FUNCIONES_HOJA.has(c.funcion))) continue
  conHoja++
  const resoluciones = await resolucionesDe(serie)
  const a = clasificar(cs, resoluciones, false)
  const d = clasificar(cs, resoluciones, true)
  perfilAntes += a.perfil.size * veces
  asocAntes += a.asoc.size * veces
  perfilDespues += d.perfil.size * veces
  asocDespues += d.asoc.size * veces
  // Diff a nivel de articuloCodigo: ¿qué cambió de bucket?
  const arts = new Set([...a.compDeBucket.keys(), ...d.compDeBucket.keys()])
  for (const art of arts) {
    const ba = a.compDeBucket.get(art)?.bucket
    const bd = d.compDeBucket.get(art)?.bucket
    if (ba === bd) continue
    const info = d.compDeBucket.get(art) ?? a.compDeBucket.get(art)
    if (ba === 'perfil' && bd === 'asoc') {
      movidos.set(info.comp, (movidos.get(info.comp) || 0) + veces)
      if (!COMPONENTES_HERRAJE.has(info.comp)) {
        alarmas.push(`FP: '${info.comp}' (funcion=${info.funcion}) perfil→asoc pero NO está en los 51 · ${k} ×${veces}`)
      }
    } else {
      // cualquier otro movimiento (p.ej. asoc→perfil) es imposible si es aditivo
      alarmas.push(`MOV ILEGAL: '${info.comp}' ${ba}→${bd} · ${k} ×${veces}`)
    }
  }
}

console.log(`\nparejas reales con pieza de hoja (HV/HH): ${conHoja}`)
console.log('\n══ Recuento de ranuras genéricas por bucket, ANTES → DESPUÉS (ponderado por veces) ══')
console.log(`  bucket PERFIL   : ${perfilAntes} → ${perfilDespues}   (${perfilDespues - perfilAntes >= 0 ? '+' : ''}${perfilDespues - perfilAntes})`)
console.log(`  bucket ASOCIADO : ${asocAntes} → ${asocDespues}   (+${asocDespues - asocAntes})`)
console.log(`  suma total      : ${perfilAntes + asocAntes} → ${perfilDespues + asocDespues}   ` +
  `${perfilAntes + asocAntes === perfilDespues + asocDespues ? '✓ conservada (solo reetiqueta)' : '✗ NO conservada'}`)

console.log('\n══ Componentes movidos de PERFIL → ASOCIADO (ponderado por veces) ══')
for (const [comp, v] of [...movidos].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${comp.padEnd(8)} ×${String(v).padStart(5)}   ${COMPONENTES_HERRAJE.has(comp) ? 'herraje ✓' : '⚠ NO en los 51'}`)
}
if (!movidos.size) console.log('  (ninguno)')

console.log('\n══ Veredicto ══')
if (alarmas.length) {
  console.log(`  ⚠ ALARMA: ${alarmas.length} movimiento(s) ilegal(es). PARAR y reportar:`)
  for (const a of alarmas.slice(0, 40)) console.log(`    ${a}`)
} else {
  console.log('  ✔ SIN ALARMA: solo herraje de los 51 se mueve perfil→asoc; suma total conservada;')
  console.log('    ningún código de perfil real cambia de bucket. El cambio solo reetiqueta el aviso.')
}

await sql.end({ timeout: 5 })
