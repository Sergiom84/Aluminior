/**
 * Cargador de TARIFA (T.56). Recibe un fichero del proveedor y lo carga en
 * `articulos_pvp` como una TARIFA NUEVA, listo para el swap de la tarifa 2026.
 *
 * SALVAGUARDAS (regla de entorno: Supabase compartida es SOLO LECTURA por defecto):
 *  1. Escribe SOLO en la tarifa destino indicada (`--tarifa`). Las tarifas históricas
 *     {1,2,3} están PROTEGIDAS: el cargador se niega a escribir en ellas.
 *  2. Idempotente: upsert por PK (articulo_codigo, acabado_codigo, tarifa) — re-ejecutar
 *     no duplica; solo toca filas de la tarifa destino. Reversible: `--rollback` borra
 *     exactamente esa tarifa (nunca una protegida).
 *  3. DRY-RUN por defecto: valida el fichero, resuelve códigos contra `articulos`, y
 *     muestra el DIFF (altas / cambios / no encontrados / fuera de rango) SIN escribir.
 *     Solo escribe con `--apply` explícito.
 *  4. Nunca inventa un precio: fila inválida o artículo desconocido -> se reporta, no entra.
 *
 * Esquema del fichero (CSV UTF-8; para XLSX, exportar a CSV):
 *   articulo        (obligatorio; casa con Articulos.codigo del catálogo)
 *   acabado         (código; vacío o '*' -> 'UNI' = precio no dependiente del acabado)
 *   precio          (obligatorio; PVP por unidad del TipoMetraje del artículo: €/ud, €/m, €/m²)
 *   fecha_vigencia  (opcional; se valida y reporta para trazabilidad)
 *   [recargo_*]     (opcional; hoy fuera del alcance de articulos_pvp — se avisa y se ignora)
 *
 * Uso:
 *   npx tsx packages/etl/src/cargar-tarifa.ts --file <ruta.csv> --tarifa 2026            (dry-run)
 *   npx tsx packages/etl/src/cargar-tarifa.ts --file <ruta.csv> --tarifa 2026 --apply    (escribe)
 *   npx tsx packages/etl/src/cargar-tarifa.ts --tarifa 2026 --rollback --apply           (borra esa tarifa)
 */
import { readFileSync } from 'node:fs'
import { parse } from 'csv-parse/sync'
import postgres from 'postgres'

// --- Entorno ---
for (const linea of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}
if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en .env')

// --- Configuración fija ---
const TARIFAS_PROTEGIDAS = new Set([1, 2, 3]) // históricas: nunca escribibles
const PRECIO_MIN = 0        // exclusivo: precio > 0
const PRECIO_MAX = 100000   // €/unidad; por encima se marca fuera de rango (revisar a mano)

// --- Args ---
const args = process.argv.slice(2)
function arg(nombre: string): string | null {
  const i = args.indexOf(nombre)
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null
}
const flag = (n: string) => args.includes(n)
const FICHERO = arg('--file')
const TARIFA = Number(arg('--tarifa'))
const APPLY = flag('--apply')
const ROLLBACK = flag('--rollback')
const DESCRIPCION = arg('--descripcion')   // procedencia; por defecto, el nombre del fichero
const PROVEEDOR = arg('--proveedor')       // opcional

function abortar(msg: string): never {
  console.error(`\n✗ ABORTADO: ${msg}`)
  process.exit(1)
}

if (!Number.isInteger(TARIFA) || TARIFA <= 0) abortar('--tarifa debe ser un entero positivo (p.ej. --tarifa 2026)')
if (TARIFAS_PROTEGIDAS.has(TARIFA)) abortar(`la tarifa ${TARIFA} está PROTEGIDA (histórica). Elige un id nuevo (p.ej. 2026)`)
if (!ROLLBACK && !FICHERO) abortar('falta --file <ruta.csv>')

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 3 })

// ── util ─────────────────────────────────────────────────────────────────────
const norm = (s: string | undefined) => (s ?? '').trim()
const aNum = (s: string | undefined) => {
  const n = Number(norm(s).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
const esFecha = (s: string) => s === '' || /^\d{4}-\d{2}-\d{2}$/.test(s) || /^\d{2}[/-]\d{2}[/-]\d{4}$/.test(s)

async function main() {
  console.log(`\n═══ CARGADOR DE TARIFA — destino tarifa=${TARIFA}  modo=${APPLY ? 'APPLY (escribe)' : 'DRY-RUN (no escribe)'} ═══`)

  // ── ROLLBACK ────────────────────────────────────────────────────────────────
  if (ROLLBACK) {
    const [{ n }] = await sql`SELECT COUNT(*)::int n FROM articulos_pvp WHERE tarifa = ${TARIFA}`
    console.log(`rollback: la tarifa ${TARIFA} tiene ${n} filas.`)
    if (!APPLY) { console.log('DRY-RUN: no se borra nada. Añade --apply para borrar.'); await sql.end(); return }
    const borradas = await sql`DELETE FROM articulos_pvp WHERE tarifa = ${TARIFA}`
    await sql`DELETE FROM tarifas WHERE id = ${TARIFA}`
    console.log(`✓ borradas ${borradas.count} filas de la tarifa ${TARIFA} y su registro en tarifas (históricas intactas).`)
    await sql.end(); return
  }

  // ── 1) PARSEAR fichero ────────────────────────────────────────────────────────
  const bruto = readFileSync(FICHERO!)
  const filas: Record<string, string>[] = parse(bruto, { columns: true, bom: true, skip_empty_lines: true, trim: true, relax_quotes: true })
  const cabeceras = filas.length ? Object.keys(filas[0]).map((k) => k.toLowerCase()) : []
  for (const req of ['articulo', 'precio']) {
    if (!cabeceras.includes(req)) abortar(`el fichero no tiene la columna obligatoria '${req}'. Cabeceras: ${cabeceras.join(', ')}`)
  }
  const col = (f: Record<string, string>, nombre: string) => {
    const k = Object.keys(f).find((x) => x.toLowerCase() === nombre)
    return k ? f[k] : undefined
  }
  if (cabeceras.some((h) => h.startsWith('recargo'))) {
    console.log('⚠ el fichero trae columnas de recargo: hoy están FUERA del alcance de articulos_pvp (necesitan tabla propia). Se ignoran.')
  }

  // ── 2) CATÁLOGO (solo lectura) para resolver códigos ──────────────────────────
  const catalogo = await sql<{ codigo: string; tipo_metraje: string }[]>`SELECT codigo, tipo_metraje FROM articulos`
  const tipoMetraje = new Map(catalogo.map((a) => [a.codigo, a.tipo_metraje]))

  // ── 3) VALIDAR fila a fila ────────────────────────────────────────────────────
  const validas = new Map<string, { articulo: string; acabado: string; precio: number; fecha: string }>()
  const noEncontrados: string[] = []
  const fueraRango: string[] = []
  const invalidas: string[] = []
  const duplicadas: string[] = []
  let nfila = 1
  for (const f of filas) {
    nfila++
    const articulo = norm(col(f, 'articulo'))
    let acabado = norm(col(f, 'acabado'))
    if (acabado === '' || acabado === '*') acabado = 'UNI'
    const precio = aNum(col(f, 'precio'))
    const fecha = norm(col(f, 'fecha_vigencia'))
    if (!articulo || precio === null) { invalidas.push(`fila ${nfila}: clave/precio ausente`); continue }
    if (!esFecha(fecha)) { invalidas.push(`fila ${nfila} (${articulo}): fecha_vigencia inválida '${fecha}'`); continue }
    if (!tipoMetraje.has(articulo)) { noEncontrados.push(articulo); continue }
    if (!(precio > PRECIO_MIN && precio < PRECIO_MAX)) { fueraRango.push(`${articulo}/${acabado}=${precio}`); continue }
    const clave = `${articulo}|${acabado}`
    if (validas.has(clave)) duplicadas.push(clave)
    validas.set(clave, { articulo, acabado, precio, fecha }) // última gana
  }

  // ── 4) DIFF contra la tarifa destino existente ────────────────────────────────
  const existentes = await sql<{ articulo_codigo: string; acabado_codigo: string; precio: string }[]>`
    SELECT articulo_codigo, acabado_codigo, precio FROM articulos_pvp WHERE tarifa = ${TARIFA}`
  const mapaExist = new Map(existentes.map((r) => [`${r.articulo_codigo}|${r.acabado_codigo}`, Number(r.precio)]))
  const altas: string[] = [], cambios: string[] = [], iguales: string[] = []
  for (const [clave, v] of validas) {
    if (!mapaExist.has(clave)) altas.push(clave)
    else if (Math.abs(mapaExist.get(clave)! - v.precio) > 1e-4) cambios.push(`${clave}: ${mapaExist.get(clave)} → ${v.precio}`)
    else iguales.push(clave)
  }

  // ── 4b) REGISTRO en `tarifas` (procedencia + vigencia persistida, T.57) ───────
  // fecha_vigencia de la tarifa = la fecha (no vacía) mayoritaria entre las filas válidas.
  const aISO = (f: string) => {
    const m = f.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/) // DD/MM/YYYY -> YYYY-MM-DD
    return m ? `${m[3]}-${m[2]}-${m[1]}` : f
  }
  const fechas = new Map<string, number>()
  for (const v of validas.values()) if (v.fecha) fechas.set(aISO(v.fecha), (fechas.get(aISO(v.fecha)) ?? 0) + 1)
  const vigencia = [...fechas.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  if (fechas.size > 1) console.log(`⚠ el fichero trae ${fechas.size} fechas de vigencia distintas; se registra la mayoritaria (${vigencia}).`)
  const registro = {
    id: TARIFA,
    descripcion: DESCRIPCION ?? `Tarifa ${TARIFA} (${(FICHERO ?? '').split(/[\\/]/).pop()})`,
    proveedor: PROVEEDOR ?? null,
    fecha_vigencia: vigencia,
  }

  // ── 5) INFORME ────────────────────────────────────────────────────────────────
  console.log(`\nfichero: ${FICHERO}`)
  console.log(`filas leídas: ${filas.length}   válidas: ${validas.size}`)
  console.log(`  ALTAS (clave nueva en tarifa ${TARIFA}): ${altas.length}`)
  console.log(`  CAMBIOS de precio:                       ${cambios.length}`)
  console.log(`  ya iguales (idempotente):                ${iguales.length}`)
  console.log(`  artículos NO encontrados en catálogo:    ${noEncontrados.length}${noEncontrados.length ? '  → ' + noEncontrados.slice(0, 8).join(', ') : ''}`)
  console.log(`  precios FUERA DE RANGO (0<p<${PRECIO_MAX}):  ${fueraRango.length}${fueraRango.length ? '  → ' + fueraRango.slice(0, 8).join(', ') : ''}`)
  console.log(`  filas inválidas:                         ${invalidas.length}${invalidas.length ? '  → ' + invalidas.slice(0, 5).join(' | ') : ''}`)
  console.log(`  duplicadas en fichero (última gana):     ${duplicadas.length}`)
  if (altas.length) console.log(`  muestra altas: ${altas.slice(0, 6).join(', ')}`)
  if (cambios.length) console.log(`  muestra cambios: ${cambios.slice(0, 6).join(' ; ')}`)
  console.log(`  registro en \`tarifas\`: id=${registro.id} descripcion="${registro.descripcion}" proveedor=${registro.proveedor ?? '(ninguno)'} fecha_vigencia=${registro.fecha_vigencia ?? '(ninguna)'} activa=true`)

  // ── 6) ESCRITURA (solo con --apply) ───────────────────────────────────────────
  if (!APPLY) {
    console.log(`\n● DRY-RUN: no se ha escrito NADA en la base de datos (ni articulos_pvp ni tarifas). Revisa el diff y añade --apply para cargar.`)
    await sql.end(); return
  }
  if (!validas.size) { console.log('\nno hay filas válidas que cargar.'); await sql.end(); return }
  const lote = [...validas.values()].map((v) => ({ articulo_codigo: v.articulo, acabado_codigo: v.acabado, tarifa: TARIFA, precio: v.precio.toFixed(4) }))
  await sql.begin(async (tx) => {
    await tx`INSERT INTO articulos_pvp ${tx(lote, 'articulo_codigo', 'acabado_codigo', 'tarifa', 'precio')}
             ON CONFLICT (articulo_codigo, acabado_codigo, tarifa) DO UPDATE SET precio = EXCLUDED.precio`
    // registro de la tarifa (procedencia + vigencia); fecha_carga la pone la BD (defaultNow).
    await tx`INSERT INTO tarifas ${tx([registro], 'id', 'descripcion', 'proveedor', 'fecha_vigencia')}
             ON CONFLICT (id) DO UPDATE SET descripcion = EXCLUDED.descripcion, proveedor = EXCLUDED.proveedor,
                                            fecha_vigencia = EXCLUDED.fecha_vigencia, fecha_carga = now()`
  })
  const [{ n }] = await sql`SELECT COUNT(*)::int n FROM articulos_pvp WHERE tarifa = ${TARIFA}`
  console.log(`\n✓ APPLY: upsert de ${lote.length} filas en tarifa ${TARIFA} + registro en tarifas. Total en esa tarifa ahora: ${n}. Históricas {1,2,3} intactas.`)
  await sql.end()
}

main().catch((e) => { console.error(e); process.exit(1) })
