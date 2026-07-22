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
 * Uso (CLI):
 *   npx tsx packages/etl/src/cargar-tarifa.ts --file <ruta.csv> --tarifa 2026            (dry-run)
 *   npx tsx packages/etl/src/cargar-tarifa.ts --file <ruta.csv> --tarifa 2026 --apply    (escribe)
 *   npx tsx packages/etl/src/cargar-tarifa.ts --tarifa 2026 --rollback --apply           (borra esa tarifa)
 *
 * Los efectos de ESCRITURA viven en `cargarTarifa(sql, opciones)` — función pura de
 * BD, sin `process.exit` ni lectura de `.env`, para poder testarla contra un Postgres
 * efímero (ver packages/etl/src/cargar-tarifa.test.ts). El bloque CLI de más abajo solo
 * se ejecuta cuando el fichero se invoca directamente.
 */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { parse } from 'csv-parse/sync'
import postgres from 'postgres'
// Reglas puras (protección de tarifas, validación de fila, diff) — testeadas en core (T.59).
import { PRECIO_MAX, tarifaDestinoValida, tarifaProtegida, validarFilaTarifa, diffTarifa, type FilaTarifa } from '@aluminior/core/precios'

/** Conexión postgres inyectable (misma forma que devuelve `postgres(url)`). */
type Sql = ReturnType<typeof postgres>

export interface OpcionesCarga {
  /** Ruta del CSV del proveedor. Obligatoria salvo en rollback. */
  fichero?: string | null
  /** Tarifa destino (entero positivo, no protegida). */
  tarifa: number
  /** Escribe de verdad. Sin él, DRY-RUN (no toca la BD). */
  apply?: boolean
  /** Borra la tarifa destino (con --apply). */
  rollback?: boolean
  /** Procedencia; por defecto el nombre del fichero. */
  descripcion?: string | null
  /** Proveedor opcional. */
  proveedor?: string | null
}

export interface ResultadoCarga {
  modo: 'rollback' | 'dry-run' | 'apply'
  tarifa: number
  escrito: boolean
  /** Filas upsertadas (apply) o que se upsertarían (dry-run). */
  filas: number
  /** Filas totales en la tarifa destino tras la operación (apply/rollback). */
  totalEnTarifa: number
  altas: number
  cambios: number
  iguales: number
  noEncontrados: number
  fueraRango: number
  invalidas: number
}

/**
 * Error de ABORTO por salvaguarda (tarifa protegida, argumentos inválidos, fichero
 * sin columnas). La CLI lo traduce a `process.exit(1)`; en tests se puede capturar.
 */
export class AbortoCarga extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'AbortoCarga'
  }
}

/**
 * Efectos de ESCRITURA/lectura del cargador contra la BD (parametrizada por `sql`).
 * NO cierra la conexión (la gestiona quien la abre) ni lee `.env` ni llama a exit.
 */
export async function cargarTarifa(
  sql: Sql,
  opciones: OpcionesCarga,
  log: (msg: string) => void = console.log,
): Promise<ResultadoCarga> {
  const { tarifa: TARIFA, apply: APPLY = false, rollback: ROLLBACK = false } = opciones
  const FICHERO = opciones.fichero ?? null
  const DESCRIPCION = opciones.descripcion ?? null
  const PROVEEDOR = opciones.proveedor ?? null

  // ── SALVAGUARDAS de argumento (idénticas a la CLI) ────────────────────────────
  if (TARIFA <= 0 || !Number.isInteger(TARIFA)) throw new AbortoCarga('--tarifa debe ser un entero positivo (p.ej. --tarifa 2026)')
  if (tarifaProtegida(TARIFA)) throw new AbortoCarga(`la tarifa ${TARIFA} está PROTEGIDA (histórica). Elige un id nuevo (p.ej. 2026)`)
  if (!tarifaDestinoValida(TARIFA)) throw new AbortoCarga(`--tarifa ${TARIFA} no es un destino válido`)
  if (!ROLLBACK && !FICHERO) throw new AbortoCarga('falta --file <ruta.csv>')

  log(`\n═══ CARGADOR DE TARIFA — destino tarifa=${TARIFA}  modo=${APPLY ? 'APPLY (escribe)' : 'DRY-RUN (no escribe)'} ═══`)

  // ── ROLLBACK ────────────────────────────────────────────────────────────────
  if (ROLLBACK) {
    const [{ n }] = await sql`SELECT COUNT(*)::int n FROM articulos_pvp WHERE tarifa = ${TARIFA}`
    log(`rollback: la tarifa ${TARIFA} tiene ${n} filas.`)
    if (!APPLY) {
      log('DRY-RUN: no se borra nada. Añade --apply para borrar.')
      return { modo: 'rollback', tarifa: TARIFA, escrito: false, filas: 0, totalEnTarifa: n, altas: 0, cambios: 0, iguales: 0, noEncontrados: 0, fueraRango: 0, invalidas: 0 }
    }
    const borradas = await sql`DELETE FROM articulos_pvp WHERE tarifa = ${TARIFA}`
    await sql`DELETE FROM tarifas WHERE id = ${TARIFA}`
    log(`✓ borradas ${borradas.count} filas de la tarifa ${TARIFA} y su registro en tarifas (históricas intactas).`)
    return { modo: 'rollback', tarifa: TARIFA, escrito: true, filas: borradas.count, totalEnTarifa: 0, altas: 0, cambios: 0, iguales: 0, noEncontrados: 0, fueraRango: 0, invalidas: 0 }
  }

  // ── 1) PARSEAR fichero ────────────────────────────────────────────────────────
  const bruto = readFileSync(FICHERO!)
  const filas: Record<string, string>[] = parse(bruto, { columns: true, bom: true, skip_empty_lines: true, trim: true, relax_quotes: true })
  const cabeceras = filas.length ? Object.keys(filas[0]).map((k) => k.toLowerCase()) : []
  for (const req of ['articulo', 'precio']) {
    if (!cabeceras.includes(req)) throw new AbortoCarga(`el fichero no tiene la columna obligatoria '${req}'. Cabeceras: ${cabeceras.join(', ')}`)
  }
  const col = (f: Record<string, string>, nombre: string) => {
    const k = Object.keys(f).find((x) => x.toLowerCase() === nombre)
    return k ? f[k] : undefined
  }
  if (cabeceras.some((h) => h.startsWith('recargo'))) {
    log('⚠ el fichero trae columnas de recargo: hoy están FUERA del alcance de articulos_pvp (necesitan tabla propia). Se ignoran.')
  }

  // ── 2) CATÁLOGO (solo lectura) para resolver códigos ──────────────────────────
  const catalogo = await sql<{ codigo: string; tipo_metraje: string }[]>`SELECT codigo, tipo_metraje FROM articulos`
  const tipoMetraje = new Map(catalogo.map((a) => [a.codigo, a.tipo_metraje]))

  // ── 3) VALIDAR fila a fila (formato/rango en core; catálogo con la BD) ─────────
  const validas = new Map<string, FilaTarifa>()
  const noEncontrados: string[] = []
  const fueraRango: string[] = []
  const invalidas: string[] = []
  const duplicadas: string[] = []
  let nfila = 1
  for (const f of filas) {
    nfila++
    const v = validarFilaTarifa({ articulo: col(f, 'articulo'), acabado: col(f, 'acabado'), precio: col(f, 'precio'), fecha_vigencia: col(f, 'fecha_vigencia') })
    if (!v.ok) {
      if (v.motivo === 'rango') fueraRango.push(v.detalle)
      else invalidas.push(`fila ${nfila}: ${v.detalle}`)
      continue
    }
    if (!tipoMetraje.has(v.fila.articulo)) { noEncontrados.push(v.fila.articulo); continue }
    const clave = `${v.fila.articulo}|${v.fila.acabado}`
    if (validas.has(clave)) duplicadas.push(clave)
    validas.set(clave, v.fila) // última gana
  }

  // ── 4) DIFF contra la tarifa destino existente (idempotencia) ─────────────────
  const existentes = await sql<{ articulo_codigo: string; acabado_codigo: string; precio: string }[]>`
    SELECT articulo_codigo, acabado_codigo, precio FROM articulos_pvp WHERE tarifa = ${TARIFA}`
  const mapaExist = new Map(existentes.map((r) => [`${r.articulo_codigo}|${r.acabado_codigo}`, Number(r.precio)]))
  const { altas, cambios, iguales } = diffTarifa(validas, mapaExist)

  // ── 4b) REGISTRO en `tarifas` (procedencia + vigencia persistida, T.57) ───────
  // fecha_vigencia de la tarifa = la fecha (no vacía) mayoritaria entre las filas válidas.
  const aISO = (f: string) => {
    const m = f.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/) // DD/MM/YYYY -> YYYY-MM-DD
    return m ? `${m[3]}-${m[2]}-${m[1]}` : f
  }
  const fechas = new Map<string, number>()
  for (const v of validas.values()) if (v.fecha) fechas.set(aISO(v.fecha), (fechas.get(aISO(v.fecha)) ?? 0) + 1)
  const vigencia = [...fechas.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  if (fechas.size > 1) log(`⚠ el fichero trae ${fechas.size} fechas de vigencia distintas; se registra la mayoritaria (${vigencia}).`)
  const registro = {
    id: TARIFA,
    descripcion: DESCRIPCION ?? `Tarifa ${TARIFA} (${(FICHERO ?? '').split(/[\\/]/).pop()})`,
    proveedor: PROVEEDOR ?? null,
    fecha_vigencia: vigencia,
  }

  // ── 5) INFORME ────────────────────────────────────────────────────────────────
  log(`\nfichero: ${FICHERO}`)
  log(`filas leídas: ${filas.length}   válidas: ${validas.size}`)
  log(`  ALTAS (clave nueva en tarifa ${TARIFA}): ${altas.length}`)
  log(`  CAMBIOS de precio:                       ${cambios.length}`)
  log(`  ya iguales (idempotente):                ${iguales.length}`)
  log(`  artículos NO encontrados en catálogo:    ${noEncontrados.length}${noEncontrados.length ? '  → ' + noEncontrados.slice(0, 8).join(', ') : ''}`)
  log(`  precios FUERA DE RANGO (0<p<${PRECIO_MAX}):  ${fueraRango.length}${fueraRango.length ? '  → ' + fueraRango.slice(0, 8).join(', ') : ''}`)
  log(`  filas inválidas:                         ${invalidas.length}${invalidas.length ? '  → ' + invalidas.slice(0, 5).join(' | ') : ''}`)
  log(`  duplicadas en fichero (última gana):     ${duplicadas.length}`)
  if (altas.length) log(`  muestra altas: ${altas.slice(0, 6).join(', ')}`)
  if (cambios.length) log(`  muestra cambios: ${cambios.slice(0, 6).join(' ; ')}`)
  log(`  registro en \`tarifas\`: id=${registro.id} descripcion="${registro.descripcion}" proveedor=${registro.proveedor ?? '(ninguno)'} fecha_vigencia=${registro.fecha_vigencia ?? '(ninguna)'} activa=true`)

  // ── 6) ESCRITURA (solo con --apply) ───────────────────────────────────────────
  if (!APPLY) {
    log(`\n● DRY-RUN: no se ha escrito NADA en la base de datos (ni articulos_pvp ni tarifas). Revisa el diff y añade --apply para cargar.`)
    return { modo: 'dry-run', tarifa: TARIFA, escrito: false, filas: validas.size, totalEnTarifa: existentes.length, altas: altas.length, cambios: cambios.length, iguales: iguales.length, noEncontrados: noEncontrados.length, fueraRango: fueraRango.length, invalidas: invalidas.length }
  }
  if (!validas.size) {
    log('\nno hay filas válidas que cargar.')
    return { modo: 'apply', tarifa: TARIFA, escrito: false, filas: 0, totalEnTarifa: existentes.length, altas: altas.length, cambios: cambios.length, iguales: iguales.length, noEncontrados: noEncontrados.length, fueraRango: fueraRango.length, invalidas: invalidas.length }
  }
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
  log(`\n✓ APPLY: upsert de ${lote.length} filas en tarifa ${TARIFA} + registro en tarifas. Total en esa tarifa ahora: ${n}. Históricas {1,2,3} intactas.`)
  return { modo: 'apply', tarifa: TARIFA, escrito: true, filas: lote.length, totalEnTarifa: n, altas: altas.length, cambios: cambios.length, iguales: iguales.length, noEncontrados: noEncontrados.length, fueraRango: fueraRango.length, invalidas: invalidas.length }
}

// ═══ CLI ═══════════════════════════════════════════════════════════════════════
// Solo se ejecuta cuando el fichero se invoca directamente (no al importarlo en tests).
async function cli() {
  // --- Entorno ---
  for (const linea of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
    const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
    if (m) process.env[m[1]] ??= m[2].trim()
  }
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en .env')

  // --- Args ---
  const args = process.argv.slice(2)
  const arg = (nombre: string): string | null => {
    const i = args.indexOf(nombre)
    return i >= 0 && i + 1 < args.length ? args[i + 1] : null
  }
  const flag = (n: string) => args.includes(n)
  const opciones: OpcionesCarga = {
    fichero: arg('--file'),
    tarifa: Number(arg('--tarifa')),
    apply: flag('--apply'),
    rollback: flag('--rollback'),
    descripcion: arg('--descripcion'),
    proveedor: arg('--proveedor'),
  }

  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 3 })
  try {
    await cargarTarifa(sql, opciones)
  } finally {
    await sql.end()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  cli().catch((e) => {
    if (e instanceof AbortoCarga) console.error(`\n✗ ABORTADO: ${e.message}`)
    else console.error(e)
    process.exit(1)
  })
}
