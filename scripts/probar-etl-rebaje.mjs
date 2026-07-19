/**
 * Ejecuta el módulo de ETL `medirRebajeHoja` aislado, SIN tocar la base.
 *
 * Sirve para comprobar qué produciría la carga antes de lanzarla, y para
 * verificar que las cifras coinciden con las medidas en los anexos T.9-T.13.
 *
 * Uso: npx tsx scripts/probar-etl-rebaje.mjs
 */
import { readFileSync } from 'node:fs'
import { medirRebajeHoja } from '../packages/etl/src/medir-rebaje-hoja.ts'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const r = await medirRebajeHoja(process.env.RUTA_CSV_ORIGEN)

console.log('=== medirRebajeHoja (umbral 99%) ===\n')
console.log(`Observaciones de hoja:        ${r.observaciones}`)
console.log(`Reglas publicadas:            ${r.reglas.length}`)
console.log(`  de ellas EXACTAS (sin aviso al valorar): ${r.gruposExactos}`)
console.log(`  con aviso (muestras < total):            ${r.reglas.length - r.gruposExactos}`)
console.log(`Piezas cubiertas por una regla: ${r.observacionesCubiertas}/${r.observaciones} (${(100 * r.observacionesCubiertas / r.observaciones).toFixed(1)}%)`)
console.log(`Grupos descartados:           ${r.gruposDescartados}`)
console.log(`  de ellos, válidos al 90% pero no al 99%: ${r.gruposEntreUmbrales}`)
console.log(`  (esos son los que revisar a mano para recuperar cobertura)`)

console.log('\n--- muestra de reglas ---')
for (const g of r.reglas.slice(0, 10)) {
  const exacta = g.muestras === g.total_muestras ? '  exacta' : '  CON AVISO'
  console.log(`  ${g.perfil_codigo.padEnd(10)} ${g.eje}  ${String(g.rebaje_mm).padStart(7)} mm  ${g.muestras}/${g.total_muestras}${exacta}   serie=${g.serie_codigo}  fx=${g.formula}`)
}
// Ninguna regla puede salir con muestras > total ni con rebaje absurdo.
const malas = r.reglas.filter((g) => g.muestras > g.total_muestras || !Number.isFinite(g.rebaje_mm))
console.log(`\nReglas incoherentes (deben ser 0): ${malas.length}`)
