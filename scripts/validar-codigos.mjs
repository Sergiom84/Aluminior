/**
 * Mide la cobertura real del parser de códigos de estructura contra el
 * catálogo completo del sistema original.
 *
 * No busca que dé 100%: busca saber CUÁNTO cubre y QUÉ se le escapa, para
 * decidir con datos si merece la pena refinarlo o no.
 *
 * Uso: node scripts/validar-codigos.mjs
 */
import { readFileSync } from 'node:fs'
import { parse } from 'csv-parse/sync'
import { parsearCodigo, describir } from '../packages/core/src/estructuras/codigo.ts'

for (const linea of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

const filas = parse(readFileSync(`${process.env.RUTA_CSV_ORIGEN}/Estructuras.csv`), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})

let ok = 0
const fallos = []

for (const f of filas) {
  const codigo = (f.Codigo ?? '').trim()
  if (!codigo) continue
  const r = parsearCodigo(codigo)
  if (r.reconocido) ok++
  else fallos.push({ codigo, descripcion: (f.Descripcion ?? '').trim(), resto: r.noReconocidos })
}

const total = ok + fallos.length
console.log(`\nCatálogo de estructuras: ${total} códigos`)
console.log(`  Reconocidos    : ${ok} (${Math.round((100 * ok) / total)}%)`)
console.log(`  No reconocidos : ${fallos.length}\n`)

console.log('--- Muestra de reconocidos (código -> lectura del parser) ---')
for (const f of filas.slice(0, 400)) {
  const r = parsearCodigo((f.Codigo ?? '').trim())
  if (r.reconocido && r.modulos.length > 1) {
    console.log(`  ${r.codigo.padEnd(12)} ${describir(r)}`)
  }
}

console.log('\n--- Los 25 fragmentos no reconocidos más frecuentes ---')
const frec = new Map()
for (const f of fallos) {
  for (const r of f.resto) frec.set(r, (frec.get(r) ?? 0) + 1)
}
for (const [frag, n] of [...frec.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
  console.log(`  ${String(n).padStart(4)} × "${frag}"`)
}
