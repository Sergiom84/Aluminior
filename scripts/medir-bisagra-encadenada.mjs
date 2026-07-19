/**
 * MEDICIÓN: la categoría '!' BISAGRA PRACTICABLE, ¿encadena sobre otro
 * asociado?
 *
 * S.9.6 dejó esta categoría como el único frente '!' con señal: n=162, 28
 * observaciones con real>0, y su mejor rasgo de instancia (dis:PRPV × 2)
 * atascado en 84,0%. Todos los rasgos probados hasta ahora son de PERFIL
 * (funciones, genéricos, ranuras).
 *
 * Pero S.2 ya anotaba que algunas categorías '!' "encadenan sobre otros
 * asociados". El nombre de la categoría lo dice: la cantidad de puntos de
 * cierre depende del número de BISAGRAS, que es a su vez un asociado.
 *
 * Se mide aquí con rasgos nuevos `asoc:<codigo>` = cantidad REAL de cada
 * otro asociado de la línea. Ojo: esto es un DIAGNÓSTICO, no un predictor —
 * usa el oráculo como entrada. Si encadena, habrá que predecir primero la
 * bisagra y encadenar después; si no encadena, se anota y se para.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-bisagra-encadenada.mjs
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const ORIGEN = process.env.RUTA_CSV_ORIGEN
const leer = (n) => parse(readFileSync(join(ORIGEN, n)), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})
const col = (f, n) => (f[n] ?? '').trim()
const num = (f, n) => Number(col(f, n).replace(',', '.')) || 0

const conjuntosAsoc = leer('ConjuntosAsoc.csv')
const opcionesDoc = leer('VOpcionesHerraje.csv')
const articulos = leer('Articulos.csv')
const estArt = leer('EstructurasArticulos.csv')
const famPorArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Familia')]))
const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

const DOCS = [
  { tipo: 'VPRES', lin: 'VPresupuestosLin.csv' },
  { tipo: 'VALB', lin: 'VAlbaranesLin.csv' },
  { tipo: 'VFAC', lin: 'VFacturasLin.csv' },
]
const CATEGORIA = 'BISAGRA PRACTICABLE'

const asocPorConjunto = new Map()
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
}
const opcionesPorLinea = new Map()
for (const f of opcionesDoc) {
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (!opcionesPorLinea.has(k)) opcionesPorLinea.set(k, new Map())
  const porConj = opcionesPorLinea.get(k)
  const cj = col(f, 'Conjunto')
  if (!porConj.has(cj)) porConj.set(cj, new Set())
  if (col(f, 'SelecSN') === 'True') porConj.get(cj).add(col(f, 'nOpcion'))
}
const ranurasInstancia = new Map()
const rasgosInstancia = new Map()
for (const f of estArt) {
  const t = col(f, 'TipoDoc')
  if (!t) continue
  const k = `${t}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  const dis = col(f, 'DisComponente')
  const cant = num(f, 'Cantidad') || 1
  if (dis && dis !== '0') {
    if (!ranurasInstancia.has(k)) ranurasInstancia.set(k, new Map())
    const m = ranurasInstancia.get(k)
    m.set(dis, (m.get(dis) ?? 0) + cant)
  }
  if (!rasgosInstancia.has(k)) rasgosInstancia.set(k, new Map())
  const rr = rasgosInstancia.get(k)
  const fn = col(f, 'Funcion'), gen = col(f, 'Articulo')
  if (fn) rr.set(`fn:${fn}`, (rr.get(`fn:${fn}`) ?? 0) + cant)
  if (gen && gen !== '0') rr.set(`gen:${gen}`, (rr.get(`gen:${gen}`) ?? 0) + cant)
  if (gen === '11' || fn === 'TH') rr.set('trvPeq', (rr.get('trvPeq') ?? 0) + cant)
}

const FUNCIONES_PERFIL = new Set(['MV', 'MH', 'HV', 'HH', 'TM', 'TH', 'TV'])
const lineas = []
for (const doc of DOCS) {
  const vLin = leer(doc.lin)
  const hijasPorPadre = new Map()
  for (const f of vLin) {
    const p = col(f, 'nEstr')
    if (!p || p === '0') continue
    if (!hijasPorPadre.has(p)) hijasPorPadre.set(p, [])
    hijasPorPadre.get(p).push(f)
  }
  for (const p of vLin) {
    if (col(p, 'EstructuraSN') !== 'True') continue
    const k = `${doc.tipo}|${col(p, 'nDoc')}|${col(p, 'nLinea')}`
    const opciones = opcionesPorLinea.get(k)
    const ranuras = ranurasInstancia.get(k)
    if (!opciones || !ranuras) continue
    const reales = new Map()
    const perfilesLinea = new Set()
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0') continue
      if (FUNCIONES_PERFIL.has(fn)) { perfilesLinea.add(art); continue }
      const fam = famPorArt.get(art) ?? ''
      if (fam === '050' || fam === '051') continue
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    if (!reales.size) continue
    lineas.push({
      k, opciones, ranuras, reales, perfilesLinea,
      rasgos: rasgosInstancia.get(k) ?? new Map(),
    })
  }
}

const ESPECIALES = new Set(['A', 'L', '!', '59R'])
function filasOpcionOk(linea) {
  const activas = []
  for (const [cj, marcadas] of linea.opciones) {
    for (const f of asocPorConjunto.get(cj) ?? []) {
      const nOp = col(f, 'nOpcion')
      if (nOp && nOp !== '0' && !marcadas.has(nOp)) continue
      const artAsoc = col(f, 'ArticuloAsoc')
      if (artAsoc && artAsoc !== '0' && !linea.perfilesLinea.has(artAsoc)) continue
      activas.push(f)
    }
  }
  return activas
}

// --- observaciones de la categoría ---
const obs = []
for (const linea of lineas) {
  const porArt = new Map()
  for (const f of filasOpcionOk(linea)) {
    const comp = col(f, 'ComponenteAsoc'), art = col(f, 'Articulo')
    if (comp === '!') {
      const acc = porArt.get(art) ?? { bang: 0, otras: 0, textos: new Set() }
      acc.bang += num(f, 'Cantidad')
      acc.textos.add(col(f, 'AsociadoA'))
      porArt.set(art, acc)
    } else if (!comp || linea.ranuras.has(comp) || ESPECIALES.has(comp)) {
      const acc = porArt.get(art) ?? { bang: 0, otras: 0, textos: new Set() }
      acc.otras++
      porArt.set(art, acc)
    }
  }
  for (const [art, acc] of porArt) {
    if (acc.bang <= 0 || acc.otras > 0 || acc.textos.size !== 1) continue
    if ([...acc.textos][0] !== CATEGORIA) continue
    obs.push({ art, base: acc.bang, real: linea.reales.get(art) ?? 0, linea })
  }
}
console.log(`Observaciones de '${CATEGORIA}': ${obs.length}`)
console.log(`  con real > 0: ${obs.filter((o) => o.real > 0).length}`)
const porArticulo = new Map()
for (const o of obs) porArticulo.set(o.art, (porArticulo.get(o.art) ?? 0) + 1)
for (const [a, n] of porArticulo) console.log(`  ${a}  n=${n}  ${descArt.get(a) ?? ''}`)

// --- rasgos: los de instancia MÁS los asociados reales de la línea ---
function rasgosDe(o) {
  const r = new Map([['const1', 1]])
  for (const [dis, n] of o.linea.ranuras) r.set(`dis:${dis}`, n)
  for (const [nombre, n] of o.linea.rasgos) r.set(nombre, n)
  // NUEVO: encadenar sobre otros asociados reales de la línea
  for (const [art, cdad] of o.linea.reales) {
    if (art === o.art) continue
    r.set(`asoc:${art}`, cdad)
  }
  return r
}
const nombres = new Set()
const rasgosPorObs = obs.map((o) => { const r = rasgosDe(o); for (const n of r.keys()) nombres.add(n); return r })

const candidatos = []
for (const nombre of nombres) {
  const ratios = new Map()
  for (let i = 0; i < obs.length; i++) {
    const v = rasgosPorObs[i].get(nombre) ?? 0
    if (obs[i].base * v <= 0) continue
    const r = Math.round((obs[i].real / (obs[i].base * v)) * 100) / 100
    ratios.set(r, (ratios.get(r) ?? 0) + 1)
  }
  if (!ratios.size) continue
  const [k] = [...ratios.entries()].sort((a, b) => b[1] - a[1])[0]
  if (k <= 0) continue
  let ok = 0
  for (let i = 0; i < obs.length; i++) {
    const v = rasgosPorObs[i].get(nombre) ?? 0
    if (Math.abs(obs[i].base * v * k - obs[i].real) < 0.01) ok++
  }
  candidatos.push({ nombre, k, ok })
}
// Variante SIN base: aquí Cantidad vale 1, 5 ó 10 mientras el real vale
// 1, 2 ó 3, así que la columna Cantidad no se comporta como multiplicador.
for (const nombre of nombres) {
  const ratios = new Map()
  for (let i = 0; i < obs.length; i++) {
    const v = rasgosPorObs[i].get(nombre) ?? 0
    if (v <= 0) continue
    const r = Math.round((obs[i].real / v) * 100) / 100
    ratios.set(r, (ratios.get(r) ?? 0) + 1)
  }
  if (!ratios.size) continue
  const [k] = [...ratios.entries()].sort((a, b) => b[1] - a[1])[0]
  if (k <= 0) continue
  let ok = 0
  for (let i = 0; i < obs.length; i++) {
    const v = rasgosPorObs[i].get(nombre) ?? 0
    if (Math.abs(v * k - obs[i].real) < 0.01) ok++
  }
  candidatos.push({ nombre: `${nombre} (sin base)`, k, ok })
}

candidatos.sort((a, b) => b.ok - a.ok)
console.log('\n--- mejores rasgos (incluidos los encadenados asoc:*) ---')
for (const c of candidatos.slice(0, 15)) {
  const marca = c.ok / obs.length >= 0.9 ? '✔' : '✘'
  const d = c.nombre.startsWith('asoc:') ? `  ${descArt.get(c.nombre.slice(5))?.slice(0, 30) ?? ''}` : ''
  console.log(`  ${marca} ${c.nombre.padEnd(24)} × ${String(c.k).padStart(5)}   ${c.ok}/${obs.length} (${(100 * c.ok / obs.length).toFixed(1)}%)${d}`)
}

// --- PRUEBA DECISIVA: ¿el contexto observable DETERMINA la cantidad? ---
// Si dos observaciones comparten artículo, base y TODOS los rasgos pero
// tienen cantidades reales distintas, ninguna regla sobre estas entradas
// puede acertar las dos: falta un dato que no está en los CSV.
const grupos = new Map()
for (let i = 0; i < obs.length; i++) {
  const r = rasgosPorObs[i]
  const firma = JSON.stringify([
    obs[i].art, obs[i].base,
    [...r.entries()].filter(([, v]) => v !== 0).sort(([a], [b]) => a < b ? -1 : 1),
  ])
  if (!grupos.has(firma)) grupos.set(firma, [])
  grupos.get(firma).push(obs[i].real)
}
let ambiguos = 0, obsAmbiguas = 0
const ejemplos = []
for (const [firma, reales] of grupos) {
  const distintos = new Set(reales)
  if (distintos.size <= 1) continue
  ambiguos++
  obsAmbiguas += reales.length
  if (ejemplos.length < 5) {
    const [art, base] = JSON.parse(firma)
    ejemplos.push(`${art} base=${base} → reales distintos: ${[...distintos].sort().join(', ')} (${reales.length} obs)`)
  }
}
console.log(`\n--- ¿el contexto observable determina la cantidad? ---`)
console.log(`  Grupos de contexto idéntico: ${grupos.size}`)
console.log(`  Grupos con cantidades reales DISTINTAS: ${ambiguos}  (${obsAmbiguas} observaciones)`)
for (const e of ejemplos) console.log(`    ✘ ${e}`)
const techo = obs.length - obsAmbiguas + ambiguos
console.log(`  Techo teórico de acierto con estas entradas: ${techo}/${obs.length} (${(100 * techo / obs.length).toFixed(1)}%)`)

// --- ¿cómo son las observaciones con real > 0? ---
console.log('\n--- observaciones con real > 0 ---')
for (const o of obs.filter((x) => x.real > 0).slice(0, 20)) {
  const r = rasgosDe(o)
  const bis = [...o.linea.reales.entries()]
    .filter(([a]) => /BISAGRA/i.test(descArt.get(a) ?? ''))
    .map(([a, c]) => `${a}×${c}`).join(' ') || '(ninguna bisagra)'
  console.log(`  ${o.art} base=${o.base} real=${o.real}  bisagras: ${bis}`)
}
