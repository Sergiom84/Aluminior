/**
 * Hipótesis 2: la clave de resolución NO es el artículo genérico sino
 * EstructurasArticulos.DisComponente. Es decir:
 *
 *   ConjuntosLin: Conjunto(serie) + Componente(=DisComponente) -> Articulo real
 *
 * Indicio: el anexo I interpretó "genérico 10 -> GM100", pero GM100 es
 * "CERCO VENTANA" (un marco), y en la plantilla de 1+1 el MARCO INFERIOR
 * lleva DisComponente=10 mientras que el artículo genérico 10 es una HOJA.
 *
 * Mide la cobertura de los DisComponente de la plantilla "1+1" con la serie
 * GMA100 y su cadena de delegación, y comprueba coherencia semántica
 * (descripción del artículo real frente a la función de la ranura).
 *
 * Solo lectura. Uso: node scripts/hipotesis-discomponente.mjs
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

const conjuntos = leer('Conjuntos.csv')
const conjuntosLin = leer('ConjuntosLin.csv')
const coste = leer('ArticulosCoste.csv')
const articulos = leer('Articulos.csv')
const estArt = leer('EstructurasArticulos.csv')

const conCoste = new Set(coste.map((c) => (c.Articulo ?? '').trim()))
const desc = new Map(articulos.map((a) => [(a.Codigo ?? '').trim(), (a.Descripcion ?? '').trim()]))
const col = (f, n) => (f[n] ?? '').trim()

// Índice conjunto -> (componente -> articulo)
const porConjunto = new Map()
for (const f of conjuntosLin) {
  const cj = col(f, 'Conjunto'), comp = col(f, 'Componente'), art = col(f, 'Articulo')
  if (!cj || !comp || !art || art === '0') continue
  if (!porConjunto.has(cj)) porConjunto.set(cj, new Map())
  porConjunto.get(cj).set(comp, art)
}

// Cadena de delegación (igual que resolver-delegados.mjs)
const fichaConjunto = new Map(conjuntos.map((c) => [col(c, 'Codigo'), c]))
const COLS_DELEGA = Object.keys(conjuntos[0] ?? {}).filter((k) =>
  /^(TablaHojas\d?|TablaFijos\d?|TablaDobleH\d?|SubSerieDe|herr.+)$/.test(k),
)
function expandir(codigo, vistos = new Set()) {
  if (!codigo || vistos.has(codigo)) return vistos
  vistos.add(codigo)
  const ficha = fichaConjunto.get(codigo)
  if (!ficha) return vistos
  for (const c of COLS_DELEGA) {
    const v = col(ficha, c)
    if (v && v !== '0' && fichaConjunto.has(v)) expandir(v, vistos)
  }
  return vistos
}

// Plantilla de 1+1: pares únicos (DisComponente, Funcion, ArticuloGenerico)
const plantilla = estArt.filter((f) => col(f, 'Estructura') === '1+1' && !col(f, 'TipoDoc'))
const ranuras = new Map()
for (const f of plantilla) {
  const k = col(f, 'DisComponente')
  if (!ranuras.has(k)) ranuras.set(k, { funcion: col(f, 'Funcion'), generico: col(f, 'Articulo') })
}

const SERIE = 'GMA100'
const cadena = [...expandir(SERIE)]
console.log(`Serie ${SERIE} — cadena de delegación: ${cadena.join(', ')}`)
console.log(`Ranuras únicas (DisComponente) en la plantilla 1+1: ${ranuras.size}\n`)

console.log(`${'DisComp'.padEnd(8)} ${'Funcion'.padEnd(10)} ${'genérico'.padEnd(50)} ${'resuelto'.padEnd(10)} coste  descripción del real`)
let resueltos = 0, valorables = 0
for (const [comp, { funcion, generico }] of ranuras) {
  let hallado = null
  for (const cj of cadena) {
    const art = porConjunto.get(cj)?.get(comp)
    if (art) { hallado = { cj, art }; break }
  }
  const dGen = (desc.get(generico) ?? '').replace(/\(\*\*|\*\*\)/g, '').slice(0, 48)
  if (hallado) {
    resueltos++
    const tiene = conCoste.has(hallado.art)
    if (tiene) valorables++
    console.log(`${comp.padEnd(8)} ${funcion.padEnd(10)} ${dGen.padEnd(50)} ${hallado.art.padEnd(10)} ${tiene ? ' sí ' : ' NO '} ${(desc.get(hallado.art) ?? '').slice(0, 40)}`)
  } else {
    console.log(`${comp.padEnd(8)} ${funcion.padEnd(10)} ${dGen.padEnd(50)} ${'—'.padEnd(10)}  —`)
  }
}
console.log(`\nResueltas ${resueltos}/${ranuras.size} ranuras, con coste ${valorables}/${ranuras.size}`)
