/**
 * EstructurasArticulos mezcla dos cosas distintas:
 *   - PLANTILLAS de catálogo: cómo se despieza una estructura (sin documento)
 *   - INSTANCIAS ya calculadas: el despiece real de un presupuesto/albarán/factura
 *
 * Distinguirlas es imprescindible: las plantillas son la definición que hay que
 * modelar; las instancias son el oráculo contra el que validar el motor.
 *
 * Uso: node scripts/analizar-despiece.mjs
 */
import { readFileSync } from 'node:fs'
import { parse } from 'csv-parse/sync'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}

const filas = parse(readFileSync(`${process.env.RUTA_CSV_ORIGEN}/EstructurasArticulos.csv`), {
  columns: true, bom: true, skip_empty_lines: true, relax_quotes: true,
})

const plantillas = filas.filter((f) => !f.TipoDoc?.trim())
const instancias = filas.filter((f) => f.TipoDoc?.trim())

console.log(`Total filas          : ${filas.length}`)
console.log(`  Plantillas (sin doc): ${plantillas.length}`)
console.log(`  Instancias (con doc): ${instancias.length}\n`)

const porTipo = new Map()
for (const f of instancias) porTipo.set(f.TipoDoc, (porTipo.get(f.TipoDoc) ?? 0) + 1)
console.log('Instancias por tipo de documento:')
for (const [t, n] of [...porTipo].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(8)} ${n}`)
}

const estrPlantilla = new Set(plantillas.map((f) => f.Estructura).filter(Boolean))
console.log(`\nEstructuras con plantilla de despiece: ${estrPlantilla.size}`)

const conFormula = plantillas.filter((f) => f.FormulaLargo?.trim()).length
console.log(`Plantillas con fórmula de largo      : ${conFormula} (${Math.round(100*conFormula/plantillas.length)}%)`)

console.log('\n--- Ejemplo: despiece de una estructura de catálogo ---')
const muestra = plantillas.find((f) => f.Estructura === '1+1') ?? plantillas[0]
const deEsa = plantillas.filter((f) => f.Estructura === muestra.Estructura).slice(0, 12)
console.log(`Estructura "${muestra.Estructura}" — ${plantillas.filter(f=>f.Estructura===muestra.Estructura).length} componentes\n`)
console.log('  Artículo         Cant  Corte  Fórmula largo     Ángulos      Función')
for (const f of deEsa) {
  console.log(
    `  ${(f.Articulo||'').padEnd(16)} ${(f.Cantidad||'').padStart(4)} ${(f.TipoCorte||'').padEnd(6)} ` +
    `${(f.FormulaLargo||'').padEnd(17)} ${(f.AnguloI||'')}/${(f.AnguloD||'')}`.padEnd(13) +
    `  ${f.Funcion || ''}`,
  )
}
