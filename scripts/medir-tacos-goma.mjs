/**
 * MEDICIÓN, frentes 2 y 3 de S.8.
 *
 * Frente 2 — tacos de pilastra (GM4870/GM5102/GM4726). Los tres se declaran
 * igual: comp='!', Cantidad=2, AsociadoA='TRAVESAÑOS PEQUEÑOS'. No existe
 * ninguna categoría 'PILASTRA' en ConjuntosAsoc, así que el ancla declarada
 * es el travesaño pequeño. Aquí se busca qué rasgo de la instancia cuenta
 * exactamente esos travesaños: real = 2 × rasgo × k.
 *
 * Frente 3 — goma GM4090. Sólo dos filas: comp='A' cdad=2 y comp='L' cdad=2.
 * Si es falso negativo no puede ser por los largos: se comprueba si su
 * conjunto llega siquiera a estar entre las opciones de la línea.
 *
 * Solo lectura. Uso: npx tsx scripts/medir-tacos-goma.mjs
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
const TACOS = new Set(['GM4870', 'GM5102', 'GM4726'])
const GOMA = 'GM4090'

const asocPorConjunto = new Map()
const conjuntosDe = new Map() // artículo -> Set(conjunto)
for (const f of conjuntosAsoc) {
  const cj = col(f, 'Conjunto'), art = col(f, 'Articulo')
  if (!cj || !art || art === '0') continue
  if (!asocPorConjunto.has(cj)) asocPorConjunto.set(cj, [])
  asocPorConjunto.get(cj).push(f)
  if (!conjuntosDe.has(art)) conjuntosDe.set(art, new Set())
  conjuntosDe.get(art).add(cj)
}
console.log(`Conjuntos que declaran GM4090: ${[...(conjuntosDe.get(GOMA) ?? [])].join(', ') || '(ninguno)'}`)
for (const t of TACOS) {
  console.log(`Conjuntos que declaran ${t}: ${(conjuntosDe.get(t) ?? new Set()).size}`)
}

// --- instancias: ranuras y rasgos (igual que v5) ---
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
const hojasPorLinea = new Map()
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
  // rasgo nuevo: función × genérico, para separar travesaños pequeños de grandes
  if (fn && gen && gen !== '0') rr.set(`fg:${fn}:${gen}`, (rr.get(`fg:${fn}:${gen}`) ?? 0) + cant)
  // travesaño pequeño: genérico 11 (TM) o, cuando la estructura no lo usa,
  // el travesaño horizontal TH. Rasgo combinado a contrastar.
  if (gen === '11' || fn === 'TH') rr.set('trvPeq', (rr.get('trvPeq') ?? 0) + cant)
  const idHoja = num(f, 'DisIdHoja')
  if (idHoja > 0) {
    if (!hojasPorLinea.has(k)) hojasPorLinea.set(k, new Set())
    hojasPorLinea.get(k).add(idHoja)
  }
}

// --- oráculo ---
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
    let nVidrios = 0
    for (const h of hijasPorPadre.get(col(p, 'nLinea')) ?? []) {
      const art = col(h, 'Articulo'), fn = col(h, 'Funcion')
      if (!art || art === '0' || FUNCIONES_PERFIL.has(fn)) continue
      const fam = famPorArt.get(art) ?? ''
      if (fam === '050' || fam === '051') {
        if (fam === '050') nVidrios += Math.max(1, Math.round(num(h, 'Cdad')))
        continue
      }
      reales.set(art, (reales.get(art) ?? 0) + (num(h, 'Cdad') || 0))
    }
    if (!reales.size) continue
    lineas.push({
      k, opciones, ranuras, reales, nVidrios,
      rasgos: rasgosInstancia.get(k) ?? new Map(),
      nHojas: hojasPorLinea.get(k)?.size ?? 0,
    })
  }
}
console.log(`\nLíneas del oráculo: ${lineas.length}`)

// ===== FRENTE 2: ancla de los tacos =====
console.log('\n===== FRENTE 2: tacos de pilastra =====')
const obs = []
for (const linea of lineas) {
  for (const t of TACOS) {
    const real = linea.reales.get(t)
    // ¿la línea puede aportar este taco? su conjunto debe estar en opciones
    const cjs = conjuntosDe.get(t) ?? new Set()
    const activo = [...linea.opciones.keys()].some((cj) => cjs.has(cj))
    if (!activo && real === undefined) continue
    obs.push({ art: t, real: real ?? 0, activo, rasgos: linea.rasgos, nHojas: linea.nHojas, k: linea.k })
  }
}
const conTaco = obs.filter((o) => o.real > 0)
console.log(`Observaciones (línea × taco): ${obs.length}   con el taco presente: ${conTaco.length}`)
console.log(`  de ellas, con el conjunto activo en la línea: ${conTaco.filter((o) => o.activo).length}`)
const cdadFrec = new Map()
for (const o of conTaco) cdadFrec.set(o.real, (cdadFrec.get(o.real) ?? 0) + 1)
console.log(`  cantidades reales: ${[...cdadFrec].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}×${n}`).join('  ')}`)

// ¿qué rasgo explica real = 2 × rasgo × k?
const nombres = new Set()
for (const o of conTaco) for (const n of o.rasgos.keys()) nombres.add(n)
nombres.add('nHojas')
const candidatos = []
for (const nombre of nombres) {
  const ratios = new Map()
  for (const o of conTaco) {
    const v = nombre === 'nHojas' ? o.nHojas : (o.rasgos.get(nombre) ?? 0)
    if (v <= 0) continue
    const r = Math.round((o.real / (2 * v)) * 100) / 100
    ratios.set(r, (ratios.get(r) ?? 0) + 1)
  }
  if (!ratios.size) continue
  const [kk] = [...ratios.entries()].sort((a, b) => b[1] - a[1])[0]
  if (kk <= 0) continue
  let ok = 0
  for (const o of conTaco) {
    const v = nombre === 'nHojas' ? o.nHojas : (o.rasgos.get(nombre) ?? 0)
    if (Math.abs(2 * v * kk - o.real) < 0.01) ok++
  }
  candidatos.push({ nombre, k: kk, ok, total: conTaco.length })
}
candidatos.sort((a, b) => b.ok - a.ok)
console.log('\n  rasgo candidato                     k      aciertos')
for (const c of candidatos.slice(0, 12)) {
  const marca = c.total >= 3 && c.ok / c.total >= 0.9 ? '✔' : '✘'
  console.log(`  ${marca} ${c.nombre.padEnd(32)} ${String(c.k).padStart(5)}   ${c.ok}/${c.total} (${(100 * c.ok / c.total).toFixed(1)}%)`)
}

// ===== FRENTE 3: goma GM4090 =====
console.log('\n===== FRENTE 3: goma GM4090 =====')
let conGoma = 0, gomaActiva = 0
const gomaCdad = new Map()
for (const linea of lineas) {
  const real = linea.reales.get(GOMA)
  if (real === undefined) continue
  conGoma++
  gomaCdad.set(real, (gomaCdad.get(real) ?? 0) + 1)
  const cjs = conjuntosDe.get(GOMA) ?? new Set()
  if ([...linea.opciones.keys()].some((cj) => cjs.has(cj))) gomaActiva++
}
console.log(`Líneas con GM4090 real: ${conGoma}`)
console.log(`  de ellas, con un conjunto que declara GM4090 entre sus opciones: ${gomaActiva}`)
console.log(`  cantidades reales: ${[...gomaCdad].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([c, n]) => `${c}×${n}`).join('  ')}`)
console.log(`\n  ${descArt.get(GOMA) ?? ''}`)

// Las cantidades son múltiplos de 4 y las dos filas dan 2×ancho + 2×alto = 4
// por hueco acristalado. Hipótesis: cantidad = 4 × nº de vidrios de la línea.
let ok4 = 0, totalG = 0
const detalle = []
for (const linea of lineas) {
  const real = linea.reales.get(GOMA)
  if (real === undefined) continue
  totalG++
  if (Math.abs(4 * linea.nVidrios - real) < 0.01) ok4++
  else if (detalle.length < 8) detalle.push(`real=${real} vidrios=${linea.nVidrios} (4×=${4 * linea.nVidrios})  ${linea.k}`)
}
console.log(`\n  Hipótesis "cantidad = 4 × nº de vidrios": ${ok4}/${totalG} (${(100 * ok4 / totalG).toFixed(1)}%)`)
for (const d of detalle) console.log(`    ✘ ${d}`)

// Frente 2: ¿qué tienen en común las líneas donde gen:11 no explica el taco?
console.log('\n===== FRENTE 2: los casos que gen:11 no explica =====')
let mostrados = 0
for (const o of conTaco) {
  const v = o.rasgos.get('gen:11') ?? 0
  if (Math.abs(2 * v - o.real) < 0.01) continue
  if (mostrados++ >= 12) break
  const otros = ['gen:97', 'gen:2', 'gen:3', 'fn:TM', 'fn:TH']
    .map((n) => `${n}=${o.rasgos.get(n) ?? 0}`).join(' ')
  console.log(`  ${o.art}  real=${String(o.real).padStart(3)}  gen:11=${String(v).padStart(2)}  ${otros}  ${o.k}`)
}
