/**
 * VALIDACIÓN CONTRA EL ORÁCULO
 *
 * Mecanismo bajo prueba (hipótesis 2, medida en hipotesis-discomponente.mjs):
 *   perfil real = ConjuntosLin[ Conjunto ∈ cadena(serie), Componente = DisComponente ]
 * donde cadena(serie) = serie + conjuntos delegados (TablaHojas/Fijos/DobleH,
 * SubSerieDe, herr*) transitivamente.
 *
 * Oráculo: las instancias de despiece ya calculadas por el sistema original
 * (EstructurasArticulos con TipoDoc/nDoc), cuyo Articulo es el perfil REAL
 * que GAIA eligió. La serie de cada línea sale de VDatosLinEstr.Conjunto1.
 *
 * Para cada pieza de instancia con DisComponente:
 *   - predicción == real          -> acierto
 *   - predicción != real          -> fallo (grave: precio de otro perfil)
 *   - sin predicción, real existe -> hueco (se sabría: "sin valorar")
 *
 * Solo lectura. Uso: node scripts/validar-oraculo.mjs
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

const conjuntos = leer('Conjuntos.csv')
const conjuntosLin = leer('ConjuntosLin.csv')
const datosLin = leer('VDatosLinEstr.csv')
const estArt = leer('EstructurasArticulos.csv')
const articulos = leer('Articulos.csv')

const descArt = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))
const esGenerico = (a) => (descArt.get(a) ?? '').startsWith('(**')

// --- resolución: conjunto -> (componente -> articulo) + delegación ---
const porConjunto = new Map()
for (const f of conjuntosLin) {
  const cj = col(f, 'Conjunto'), comp = col(f, 'Componente'), art = col(f, 'Articulo')
  if (!cj || !comp || !art || art === '0') continue
  if (!porConjunto.has(cj)) porConjunto.set(cj, new Map())
  porConjunto.get(cj).set(comp, art)
}
const ficha = new Map(conjuntos.map((c) => [col(c, 'Codigo'), c]))
const COLS_DELEGA = Object.keys(conjuntos[0] ?? {}).filter((k) =>
  /^(TablaHojas\d?|TablaFijos\d?|TablaDobleH\d?|SubSerieDe|herr.+)$/.test(k),
)
const cadenaCache = new Map()
function cadena(serie) {
  if (cadenaCache.has(serie)) return cadenaCache.get(serie)
  const vistos = new Set()
  const rec = (c) => {
    if (!c || vistos.has(c)) return
    vistos.add(c)
    const fc = ficha.get(c)
    if (!fc) return
    for (const k of COLS_DELEGA) {
      const v = col(fc, k)
      if (v && v !== '0' && ficha.has(v)) rec(v)
    }
  }
  rec(serie)
  const r = [...vistos]
  cadenaCache.set(serie, r)
  return r
}
function resolver(serie, componente) {
  for (const cj of cadena(serie)) {
    const art = porConjunto.get(cj)?.get(componente)
    if (art) return art
  }
  return null
}

// --- serie por línea de documento ---
// VDatosLinEstr: TipoDoc + nVDoc + nVLinea -> Conjunto1
// EstructurasArticulos instancias: TipoDoc + nDoc + nLinEstr
const seriePorLinea = new Map()
for (const f of datosLin) {
  seriePorLinea.set(`${col(f, 'TipoDoc')}|${col(f, 'nVDoc')}|${col(f, 'nVLinea')}`, col(f, 'Conjunto1'))
}

const instancias = estArt.filter((f) => col(f, 'TipoDoc'))
console.log(`Instancias de despiece: ${instancias.length} filas`)
const tiposDoc = new Map()
for (const f of instancias) tiposDoc.set(col(f, 'TipoDoc'), (tiposDoc.get(col(f, 'TipoDoc')) ?? 0) + 1)
console.log(`TipoDoc: ${[...tiposDoc.entries()].map(([t, n]) => `${t}(${n})`).join(' ')}`)

// tasa de cruce con VDatosLinEstr
let conSerie = 0, sinSerie = 0
for (const f of instancias) {
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  if (seriePorLinea.get(k)) conSerie++; else sinSerie++
}
console.log(`Cruce con VDatosLinEstr: ${conSerie} con serie, ${sinSerie} sin serie`)

// --- validación pieza a pieza ---
let aciertos = 0, fallos = 0, huecos = 0, realGenerico = 0, sinComp = 0
const fallosDetalle = new Map()
const huecosPorComp = new Map()
for (const f of instancias) {
  const k = `${col(f, 'TipoDoc')}|${col(f, 'nDoc')}|${col(f, 'nLinEstr')}`
  const serie = seriePorLinea.get(k)
  if (!serie) continue
  const comp = col(f, 'DisComponente')
  const real = col(f, 'Articulo')
  if (!comp) { sinComp++; continue }
  if (!real || esGenerico(real)) { realGenerico++; continue }
  const pred = resolver(serie, comp)
  if (!pred) {
    huecos++
    huecosPorComp.set(comp, (huecosPorComp.get(comp) ?? 0) + 1)
  } else if (pred === real) {
    aciertos++
  } else {
    fallos++
    const kk = `${serie} comp:${comp} pred:${pred} real:${real}`
    fallosDetalle.set(kk, (fallosDetalle.get(kk) ?? 0) + 1)
  }
}

const evaluadas = aciertos + fallos + huecos
console.log(`\n=== Resultado pieza a pieza (piezas con DisComponente y artículo real) ===`)
console.log(`Evaluadas      : ${evaluadas}`)
console.log(`Aciertos       : ${aciertos} (${(100 * aciertos / evaluadas).toFixed(1)}%)`)
console.log(`FALLOS         : ${fallos} (${(100 * fallos / evaluadas).toFixed(1)}%)  <- prediría OTRO perfil`)
console.log(`Huecos         : ${huecos} (${(100 * huecos / evaluadas).toFixed(1)}%)  <- "sin valorar" honesto`)
console.log(`(descartadas: ${sinComp} sin DisComponente, ${realGenerico} con artículo aún genérico)`)

console.log(`\n--- Fallos más frecuentes (top 15) ---`)
for (const [k, n] of [...fallosDetalle.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${String(n).padStart(5)}  ${k}`)
}
console.log(`\n--- Huecos por componente (top 15) ---`)
for (const [k, n] of [...huecosPorComp.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${String(n).padStart(5)}  componente ${k}`)
}
