/**
 * EXPLORACIÓN (solo lectura): ¿ConjuntosAsoc declara CONTRA QUÉ se compara
 * su rango MedidaMin/MedidaMax?
 *
 * S.9.1 dejó dos colas sin explicar: 24 casos donde la medida evaluada cae
 * fuera del tramo que el oráculo eligió (sin desvío constante y sin mejor
 * fuente), y 454 filas descartadas porque la plantilla no trae fórmula para
 * la ranura. Ambas se han tratado como si la medida sólo pudiera salir de la
 * plantilla.
 *
 * Pero ConjuntosAsoc tiene columnas propias sin semántica asignada todavía:
 * TipoMedCV, FormulaTablaHerrAlto/Ancho, AltoALMin/Max, PlHojasX/Y,
 * FormulaOpcion. Si alguna declara el eje o la fórmula de la medida, sería
 * justo el discriminante que falta.
 *
 * Aquí sólo se mira qué contienen. Sin construir nada.
 *
 * Uso: npx tsx scripts/explorar-medida-conjuntos.mjs
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
console.log(`Filas de ConjuntosAsoc: ${conjuntosAsoc.length}`)

const conRango = conjuntosAsoc.filter((f) => num(f, 'MedidaMax') > 0)
console.log(`Filas con rango (MedidaMax > 0): ${conRango.length}\n`)

const CAMPOS = [
  'TipoMedCV', 'FormulaTablaHerrAlto', 'FormulaTablaHerrAncho',
  'TablaHerrajeInsertar', 'AltoALMin', 'AltoALMax', 'PlHojasX', 'PlHojasY',
  'PlHojasXYstr', 'FormulaOpcion', 'AsocAModulo', 'AperturaTH', 'Intervalo',
  'FormulaL', 'FormulaA', 'GrupoAsoc', 'AsocAGrupoAsoc',
]
for (const campo of CAMPOS) {
  const frec = new Map()
  let vacios = 0
  for (const f of conRango) {
    const v = col(f, campo)
    if (!v || v === '0') { vacios++; continue }
    frec.set(v, (frec.get(v) ?? 0) + 1)
  }
  const conValor = conRango.length - vacios
  console.log(`${campo.padEnd(24)} con valor: ${String(conValor).padStart(5)}/${conRango.length}`)
  if (!conValor) continue
  for (const [v, n] of [...frec].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    console.log(`    ${String(n).padStart(5)}  ${JSON.stringify(v).slice(0, 70)}`)
  }
}

// TipoMedCV es el candidato principal: ¿se reparte por componente/artículo?
console.log('\n--- TipoMedCV cruzado con ComponenteAsoc (filas con rango) ---')
const cruce = new Map()
for (const f of conRango) {
  const t = col(f, 'TipoMedCV') || '(vacío)'
  const c = col(f, 'ComponenteAsoc') || '(vacío)'
  const k = `${t} | ${c}`
  cruce.set(k, (cruce.get(k) ?? 0) + 1)
}
for (const [k, n] of [...cruce].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  console.log(`  ${String(n).padStart(5)}  ${k}`)
}
