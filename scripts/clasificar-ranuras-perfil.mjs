/**
 * Clasifica por CAUSA las ranuras de perfil que la cadena del anexo J no
 * resuelve, con su peso en combinaciones serie × estructura.
 *
 * El paso 4 del anexo J dice que ciertos DisComponente NO resuelven por serie
 * POR DISEÑO: cristal (1), manilla (130), mano de obra (39), infHV (50). Si
 * esas ranuras se están contando como "perfil pendiente", el frente medido en
 * T.20 está inflado y el tapón real es otro.
 *
 * Sólo lectura. Ningún cambio de comportamiento.
 */
import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { construirResoluciones, expandirCadena, resolverComponente }
  from '../packages/core/src/series/resolver.ts'

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const url = env.match(/^DATABASE_URL=(.*)$/m)[1].trim().replace(/^["']|["']$/g, '')
const sql = postgres(url)

const FUNCIONES_HOJA = new Set(['HV', 'HH'])
const esAsociado = (fn) => !!fn && (fn.startsWith('inf') || fn.startsWith('Acc'))

/** Anexo J, paso 4: no resuelven por serie porque no les toca. */
const NO_RESUELVEN_POR_DISENYO = new Map([
  ['1', 'cristal / acristalamiento (lo elige el usuario)'],
  ['130', 'manilla (opciones de herraje)'],
  ['39', 'mano de obra (campos mo* de Conjuntos)'],
  ['50', 'infHV'],
])

const series = (await sql`select codigo from series order by codigo`).map((s) => s.codigo)
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
const conHoja = new Set()
for (const [estr, cs] of porEstr) {
  if (cs.some((c) => FUNCIONES_HOJA.has(c.funcion))) conHoja.add(estr)
}

// Qué componentes existen en la resolución de CADA serie, y con qué sufijos.
const causas = new Map()   // clave ranura -> {causa, peso, ejemploSerie}
const pesoCausa = new Map()

for (const serie of series) {
  const cadena = expandirCadena(serie, mapaDeleg)
  const filas = await sql`
    select conjunto_codigo, componente, articulo_codigo
    from conjunto_resoluciones where conjunto_codigo = any(${cadena})`
  const resoluciones = construirResoluciones(cadena, filas.map((r) => ({
    conjuntoCodigo: r.conjunto_codigo, componente: r.componente, articuloCodigo: r.articulo_codigo,
  })))
  // Todos los componentes que la serie conoce, con sufijo o sin él.
  const conocidos = new Set(resoluciones.keys())

  for (const estr of conHoja) {
    for (const c of porEstr.get(estr)) {
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
      if (!comp) causa = 'A. sin componente_disenyo (la plantilla no da clave)'
      else if (NO_RESUELVEN_POR_DISENYO.has(comp)) {
        causa = `B. no resuelve por serie POR DISEÑO — ${NO_RESUELVEN_POR_DISENYO.get(comp)}`
      } else if (conocidos.has(`${comp}.1`) && !conocidos.has(`${comp}.2`)) {
        causa = 'C. sólo existe la variante .1 (cristal sencillo) y se pidió .2'
      } else if ([...conocidos].some((k) => k === comp || k.startsWith(`${comp}.`))) {
        causa = 'D. el componente existe en la cadena pero sin artículo real'
      } else {
        causa = 'E. sin candidato: el componente no está en la cadena de la serie'
      }

      const clave = `${c.articulo_codigo}|${c.funcion}|${comp ?? 'null'}`
      const prev = causas.get(clave)
      if (!prev) causas.set(clave, { causa, peso: 1, serie })
      else { prev.peso++; if (prev.causa !== causa) prev.causa = 'MIXTA (varía por serie)' }
      pesoCausa.set(causa, (pesoCausa.get(causa) || 0) + 1)
    }
  }
}

console.log(`ranuras de perfil distintas sin resolver: ${causas.size}\n`)
console.log('══ Peso por CAUSA (combinaciones serie × estructura) ══')
const total = [...pesoCausa.values()].reduce((a, b) => a + b, 0)
for (const [causa, peso] of [...pesoCausa].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(peso).padStart(7)}  ${(peso / total * 100).toFixed(1).padStart(5)}%  ${causa}`)
}
console.log(`  ${String(total).padStart(7)}  100.0%  TOTAL`)

console.log('\n══ Ranuras distintas por causa ══')
const ranurasPorCausa = new Map()
for (const [clave, v] of causas) {
  if (!ranurasPorCausa.has(v.causa)) ranurasPorCausa.set(v.causa, [])
  ranurasPorCausa.get(v.causa).push({ clave, peso: v.peso })
}
for (const [causa, lista] of [...ranurasPorCausa].sort((a, b) => b[1].length - a[1].length)) {
  const peso = lista.reduce((a, b) => a + b.peso, 0)
  console.log(`\n  ${causa}`)
  console.log(`    ${lista.length} ranuras distintas · ${peso} combinaciones`)
  for (const r of lista.sort((a, b) => b.peso - a.peso).slice(0, 8)) {
    const art = r.clave.split('|')[0]
    console.log(`      ${r.clave}  ×${r.peso}   ${(descripcion.get(art) ?? '').slice(0, 52)}`)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Lo accionable: por COMBINACIÓN serie × estructura, ¿qué causas la bloquean?
// Si a muchas sólo las bloquea el cristal (causa B), tratarlo como lo que es
// —una ranura que no toca a la serie— las desbloquea en bloque.
// ─────────────────────────────────────────────────────────────────────────
const combo = { soloB: 0, soloC: 0, conE: 0, total: 0, ninguna: 0 }
for (const serie of series) {
  const cadena = expandirCadena(serie, mapaDeleg)
  const filas = await sql`
    select conjunto_codigo, componente, articulo_codigo
    from conjunto_resoluciones where conjunto_codigo = any(${cadena})`
  const resoluciones = construirResoluciones(cadena, filas.map((r) => ({
    conjuntoCodigo: r.conjunto_codigo, componente: r.componente, articuloCodigo: r.articulo_codigo,
  })))
  const conocidos = new Set(resoluciones.keys())
  for (const estr of conHoja) {
    combo.total++
    const vistas = new Set()
    for (const c of porEstr.get(estr)) {
      if (esAsociado(c.funcion)) continue
      const comp = c.componente_disenyo
      let falla
      if (!comp) falla = genericos.has(c.articulo_codigo)
      else {
        const r = resolverComponente(comp, resoluciones, '2')
        falla = !r.articuloCodigo && genericos.has(c.articulo_codigo)
      }
      if (!falla) continue
      if (!comp) vistas.add('A')
      else if (NO_RESUELVEN_POR_DISENYO.has(comp)) vistas.add('B')
      else if (conocidos.has(`${comp}.1`) && !conocidos.has(`${comp}.2`)) vistas.add('C')
      else vistas.add('E')
    }
    if (vistas.size === 0) combo.ninguna++
    else if (vistas.size === 1 && vistas.has('B')) combo.soloB++
    else if (vistas.size === 1 && vistas.has('C')) combo.soloC++
    if (vistas.has('E')) combo.conE++
  }
}
console.log('\n══ Por COMBINACIÓN serie × estructura-con-hoja ══')
console.log(`  combinaciones                                   : ${combo.total}`)
console.log(`  sin ninguna ranura de perfil pendiente          : ${combo.ninguna}`)
console.log(`  bloqueadas SÓLO por el cristal (causa B)        : ${combo.soloB}`)
console.log(`  bloqueadas SÓLO por variante .1/.2 (causa C)    : ${combo.soloC}`)
console.log(`  con al menos una ranura sin candidato (causa E) : ${combo.conE}`)

await sql.end({ timeout: 5 })
