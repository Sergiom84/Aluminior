/**
 * Variantes de componente: la corredera C2 con serie GMC400 usa en
 * ConjuntosLin componentes "21.2", "22.2"… (sufijo = ¿número de hojas?).
 * Compara la plantilla de C2 (DisComponente) con los componentes disponibles
 * de GMC400, y mira qué campos de la plantilla (DisNHoja, DisTipoHoja…)
 * explican el sufijo.
 *
 * Solo lectura. Uso: node scripts/inspeccionar-variantes.mjs
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

const estArt = leer('EstructurasArticulos.csv')
const conjuntosLin = leer('ConjuntosLin.csv')
const articulos = leer('Articulos.csv')
const desc = new Map(articulos.map((a) => [col(a, 'Codigo'), col(a, 'Descripcion')]))

console.log('=== Plantilla de C2: ranuras ===')
const CAMPOS = ['Articulo', 'Funcion', 'DisComponente', 'DisTipoHoja', 'DisNHoja', 'DisIdHoja', 'FormulaLargoCorte']
const plantC2 = estArt.filter((f) => col(f, 'Estructura') === 'C2' && !col(f, 'TipoDoc'))
console.log(CAMPOS.join(' | '))
for (const f of plantC2) {
  console.log(CAMPOS.map((c) => col(f, c)).join(' | ') + '  ' + (desc.get(col(f, 'Articulo')) ?? '').replace(/\(\*\*|\*\*\)/g, '').slice(0, 40))
}

console.log('\n=== Componentes de GMC400 en ConjuntosLin (con artículo) ===')
const deGMC = conjuntosLin.filter((f) => col(f, 'Conjunto') === 'GMC400' && col(f, 'Articulo') && col(f, 'Articulo') !== '0')
for (const f of deGMC) {
  console.log(`  ${col(f, 'Componente').padEnd(8)} -> ${col(f, 'Articulo').padEnd(10)} ${(desc.get(col(f, 'Articulo')) ?? '').slice(0, 45)}`)
}

console.log('\n=== ¿Cuántos componentes con punto hay en todo ConjuntosLin? ===')
const conPunto = new Map()
for (const f of conjuntosLin) {
  const c = col(f, 'Componente')
  const m = c.match(/^(.+)\.(\d+)$/)
  if (m && col(f, 'Articulo') && col(f, 'Articulo') !== '0') {
    conPunto.set(m[2], (conPunto.get(m[2]) ?? 0) + 1)
  }
}
console.log(`  sufijos: ${[...conPunto.entries()].map(([s, n]) => `.${s}(${n})`).join(' ')}`)
