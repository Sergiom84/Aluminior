/**
 * Comprueba el ENGANCHE del rebaje: que la clave que construye la web
 * coincida con la que guardó el ETL.
 *
 * Es el riesgo real de esta integración. El ETL guarda la fórmula tomada de
 * `FormulaLargoCorte || FormulaLargo` del CSV; la web busca con la fórmula
 * que trae la plantilla ya cargada en la BASE. Si esas dos cadenas no son la
 * misma, la búsqueda no encuentra nada, TODA pieza de hoja queda sin medida
 * y ninguna línea con hoja se valora — un fallo silencioso que compila,
 * pasa el typecheck y no rompe ningún test.
 *
 * Solo lectura. Uso: npx tsx scripts/comprobar-enganche-rebaje.mjs
 */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim()
}
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require', max: 2 })

// Cómo se llaman las columnas de la plantilla en la base
const cols = await sql`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'estructura_componentes' AND column_name LIKE '%formula%'`
console.log(`Columnas de fórmula en estructura_componentes: ${cols.map((c) => c.column_name).join(', ')}\n`)

// ¿Cuántas reglas encuentran una pieza de plantilla con su misma fórmula?
const casadas = await sql`
  SELECT count(*)::int AS n FROM hoja_rebajes r
  WHERE EXISTS (
    SELECT 1 FROM estructura_componentes c
    WHERE c.funcion = r.eje AND coalesce(c.formula_largo, '') = r.formula
  )`
const [{ total }] = await sql`SELECT count(*)::int AS total FROM hoja_rebajes`
console.log(`Reglas cuya fórmula existe en la plantilla de la base: ${casadas[0].n}/${total}`)
if (casadas[0].n < total) {
  console.log('\n  --- reglas SIN pareja de fórmula (la web no las encontraría) ---')
  const huerfanas = await sql`
    SELECT r.perfil_codigo, r.eje, r.formula, r.serie_codigo, r.total_muestras
    FROM hoja_rebajes r
    WHERE NOT EXISTS (
      SELECT 1 FROM estructura_componentes c
      WHERE c.funcion = r.eje AND coalesce(c.formula_largo, '') = r.formula)
    ORDER BY r.total_muestras DESC LIMIT 10`
  for (const h of huerfanas) {
    console.log(`    ${h.perfil_codigo.padEnd(10)} ${h.eje}  fx=${JSON.stringify(h.formula)}  serie=${h.serie_codigo}  (${h.total_muestras} piezas)`)
  }
}

// Simulación del enganche para una serie concreta: ¿cuántas piezas de hoja
// de sus estructuras encontrarían regla?
const [serie] = await sql`
  SELECT serie_codigo, count(*)::int AS reglas, sum(total_muestras)::int AS piezas
  FROM hoja_rebajes GROUP BY serie_codigo ORDER BY piezas DESC LIMIT 1`
console.log(`\nSerie con más respaldo: ${serie.serie_codigo} (${serie.reglas} reglas, ${serie.piezas} piezas)`)
const cobertura = await sql`
  SELECT
    count(*)::int AS piezas_hoja,
    count(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM hoja_rebajes r
      WHERE r.serie_codigo = ${serie.serie_codigo}
        AND r.eje = c.funcion
        AND r.formula = coalesce(c.formula_largo, '')
    ))::int AS con_regla
  FROM estructura_componentes c
  WHERE c.funcion IN ('HV', 'HH')`
console.log(`  piezas de hoja en plantilla: ${cobertura[0].piezas_hoja}`)
console.log(`  con regla para esa serie:    ${cobertura[0].con_regla}`)
console.log('\n  (la cobertura real por línea depende del perfil resuelto;')
console.log('   lo que se verifica aquí es que la CLAVE casa, no el porcentaje)')
await sql.end()
