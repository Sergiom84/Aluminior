/**
 * Tests de INTEGRACIÓN de los efectos de ESCRITURA del cargador de tarifa (T.56-T.59).
 *
 * Se ejecutan contra un Postgres EFÍMERO en Docker (NUNCA la Supabase compartida,
 * que es SOLO LECTURA). Levantar con:
 *   docker compose -f packages/db/docker-compose.yml up -d
 *
 * El test crea el esquema mínimo (articulos + articulos_pvp + tarifas, DDL tomado
 * verbatim de las migraciones 0000 y 0014), siembra tarifas históricas {1,2,3}, y
 * verifica: --apply carga, es idempotente, --rollback borra SOLO el destino, no toca
 * otras tarifas, y las salvaguardas (escribir en {1,2,3}) ABORTAN.
 */
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import postgres from 'postgres'
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { cargarTarifa, AbortoCarga } from './cargar-tarifa.ts'

// URL del Postgres efímero (docker-compose de packages/db). Override con TEST_DATABASE_URL.
const URL = process.env.TEST_DATABASE_URL ?? 'postgres://aluminior:aluminior@localhost:55432/aluminior_test'
const sql = postgres(URL, { ssl: false, max: 3, onnotice: () => {} })
const noop = () => {}

let tmp: string
const csv = (nombre: string, contenido: string): string => {
  const ruta = join(tmp, nombre)
  writeFileSync(ruta, contenido, 'utf8')
  return ruta
}

// Precios de las tarifas históricas {1,2,3}: se siembran y NO deben cambiar nunca.
const HISTORICAS = [
  { articulo_codigo: 'GM306', acabado_codigo: 'UNI', tarifa: 1, precio: '5.0000' },
  { articulo_codigo: 'GM306', acabado_codigo: 'UNI', tarifa: 2, precio: '6.0000' },
  { articulo_codigo: 'GM306', acabado_codigo: 'UNI', tarifa: 3, precio: '7.0000' },
  { articulo_codigo: 'PT100', acabado_codigo: 'L', tarifa: 2, precio: '12.5000' },
]

async function snapshotHistoricas() {
  return sql`SELECT articulo_codigo, acabado_codigo, tarifa, precio::text
             FROM articulos_pvp WHERE tarifa IN (1,2,3)
             ORDER BY tarifa, articulo_codigo, acabado_codigo`
}

beforeAll(async () => {
  tmp = mkdtempSync(join(tmpdir(), 'tarifa-test-'))
  // Esquema mínimo. articulos_pvp y tarifas son DDL verbatim de migraciones 0000/0014.
  await sql.unsafe(`
    DROP TABLE IF EXISTS articulos_pvp;
    DROP TABLE IF EXISTS tarifas;
    DROP TABLE IF EXISTS articulos;
    CREATE TABLE articulos (
      codigo text PRIMARY KEY NOT NULL,
      descripcion text NOT NULL,
      tipo_metraje text DEFAULT 'UD' NOT NULL
    );
    CREATE TABLE articulos_pvp (
      articulo_codigo text NOT NULL,
      acabado_codigo text NOT NULL,
      tarifa integer NOT NULL,
      precio numeric(12, 4) NOT NULL,
      CONSTRAINT articulos_pvp_pk PRIMARY KEY (articulo_codigo, acabado_codigo, tarifa)
    );
    CREATE TABLE tarifas (
      id integer PRIMARY KEY NOT NULL,
      descripcion text NOT NULL,
      proveedor text,
      fecha_vigencia timestamp with time zone,
      fecha_carga timestamp with time zone DEFAULT now() NOT NULL,
      activa boolean DEFAULT true NOT NULL
    );
  `)
})

afterAll(async () => {
  await sql.end()
  if (tmp) rmSync(tmp, { recursive: true, force: true })
})

beforeEach(async () => {
  // Estado limpio y determinista antes de cada test.
  await sql`TRUNCATE articulos, articulos_pvp, tarifas`
  await sql`INSERT INTO articulos ${sql([
    { codigo: 'GM306', descripcion: 'Perfil GM306', tipo_metraje: 'ML' },
    { codigo: 'PT100', descripcion: 'Perfil PT100', tipo_metraje: 'ML' },
    { codigo: 'HR200', descripcion: 'Herraje HR200', tipo_metraje: 'UD' },
  ], 'codigo', 'descripcion', 'tipo_metraje')}`
  await sql`INSERT INTO articulos_pvp ${sql(HISTORICAS, 'articulo_codigo', 'acabado_codigo', 'tarifa', 'precio')}`
  await sql`INSERT INTO tarifas ${sql([
    { id: 1, descripcion: 'Histórica 1' },
    { id: 2, descripcion: 'Histórica 2' },
    { id: 3, descripcion: 'Histórica 3' },
  ], 'id', 'descripcion')}`
})

const CSV_2026 = 'articulo,acabado,precio,fecha_vigencia\nGM306,*,8.55,2026-01-01\nPT100,L,12.50,2026-01-01\nHR200,*,3.00,2026-01-01\n'

describe('cargarTarifa — efectos de escritura (Postgres efímero)', () => {
  it('DRY-RUN no escribe nada', async () => {
    const file = csv('t.csv', CSV_2026)
    const r = await cargarTarifa(sql, { fichero: file, tarifa: 2026, apply: false }, noop)
    expect(r.modo).toBe('dry-run')
    expect(r.escrito).toBe(false)
    const [{ n }] = await sql`SELECT COUNT(*)::int n FROM articulos_pvp WHERE tarifa = 2026`
    expect(n).toBe(0)
    const [{ t }] = await sql`SELECT COUNT(*)::int t FROM tarifas WHERE id = 2026`
    expect(t).toBe(0)
  })

  it('--apply carga la tarifa nueva (filas nuevas + registro en tarifas)', async () => {
    const file = csv('t.csv', CSV_2026)
    const r = await cargarTarifa(sql, { fichero: file, tarifa: 2026, apply: true }, noop)
    expect(r.escrito).toBe(true)
    expect(r.filas).toBe(3)
    expect(r.altas).toBe(3)

    const filas = await sql`SELECT articulo_codigo, acabado_codigo, precio::text
                            FROM articulos_pvp WHERE tarifa = 2026
                            ORDER BY articulo_codigo, acabado_codigo`
    expect(filas).toEqual([
      { articulo_codigo: 'GM306', acabado_codigo: 'UNI', precio: '8.5500' },
      { articulo_codigo: 'HR200', acabado_codigo: 'UNI', precio: '3.0000' },
      { articulo_codigo: 'PT100', acabado_codigo: 'L', precio: '12.5000' },
    ])
    const [reg] = await sql`SELECT id, descripcion, activa FROM tarifas WHERE id = 2026`
    expect(reg).toMatchObject({ id: 2026, activa: true })
  })

  it('es IDEMPOTENTE: re-aplicar no duplica ni cambia el resultado', async () => {
    const file = csv('t.csv', CSV_2026)
    const r1 = await cargarTarifa(sql, { fichero: file, tarifa: 2026, apply: true }, noop)
    const snap1 = await sql`SELECT articulo_codigo, acabado_codigo, precio::text FROM articulos_pvp WHERE tarifa = 2026 ORDER BY 1,2`

    const r2 = await cargarTarifa(sql, { fichero: file, tarifa: 2026, apply: true }, noop)
    const snap2 = await sql`SELECT articulo_codigo, acabado_codigo, precio::text FROM articulos_pvp WHERE tarifa = 2026 ORDER BY 1,2`

    expect(r2.iguales).toBe(3)      // todo igual la segunda vez
    expect(r2.altas).toBe(0)
    expect(r2.cambios).toBe(0)
    expect(r2.totalEnTarifa).toBe(r1.totalEnTarifa) // no duplica
    expect(snap2).toEqual(snap1)                    // resultado idéntico
  })

  it('un cambio de precio se aplica sin crear filas nuevas (upsert por PK)', async () => {
    await cargarTarifa(sql, { fichero: csv('a.csv', CSV_2026), tarifa: 2026, apply: true }, noop)
    const nuevo = 'articulo,acabado,precio,fecha_vigencia\nGM306,*,9.99,2026-01-01\nPT100,L,12.50,2026-01-01\nHR200,*,3.00,2026-01-01\n'
    const r = await cargarTarifa(sql, { fichero: csv('b.csv', nuevo), tarifa: 2026, apply: true }, noop)
    expect(r.cambios).toBe(1)
    expect(r.totalEnTarifa).toBe(3) // sigue habiendo 3 filas, no 4
    const [row] = await sql`SELECT precio::text FROM articulos_pvp WHERE tarifa = 2026 AND articulo_codigo = 'GM306'`
    expect(row.precio).toBe('9.9900')
  })

  it('--rollback --apply borra SOLO la tarifa destino (y su registro)', async () => {
    await cargarTarifa(sql, { fichero: csv('t.csv', CSV_2026), tarifa: 2026, apply: true }, noop)
    const r = await cargarTarifa(sql, { tarifa: 2026, rollback: true, apply: true }, noop)
    expect(r.modo).toBe('rollback')
    expect(r.escrito).toBe(true)
    const [{ n }] = await sql`SELECT COUNT(*)::int n FROM articulos_pvp WHERE tarifa = 2026`
    expect(n).toBe(0)
    const [{ t }] = await sql`SELECT COUNT(*)::int t FROM tarifas WHERE id = 2026`
    expect(t).toBe(0)
  })

  it('NO toca las tarifas {1,2,3}: intactas antes y después de apply + rollback', async () => {
    const antes = await snapshotHistoricas()
    await cargarTarifa(sql, { fichero: csv('t.csv', CSV_2026), tarifa: 2026, apply: true }, noop)
    expect(await snapshotHistoricas()).toEqual(antes)
    await cargarTarifa(sql, { tarifa: 2026, rollback: true, apply: true }, noop)
    expect(await snapshotHistoricas()).toEqual(antes)
    // Las históricas siguen teniendo sus 4 filas originales.
    const [{ n }] = await sql`SELECT COUNT(*)::int n FROM articulos_pvp WHERE tarifa IN (1,2,3)`
    expect(n).toBe(HISTORICAS.length)
  })

  it('SALVAGUARDA: apply sobre una tarifa protegida {1,2,3} ABORTA y no escribe', async () => {
    const antes = await snapshotHistoricas()
    for (const protegida of [1, 2, 3]) {
      await expect(
        cargarTarifa(sql, { fichero: csv('t.csv', CSV_2026), tarifa: protegida, apply: true }, noop),
      ).rejects.toBeInstanceOf(AbortoCarga)
    }
    expect(await snapshotHistoricas()).toEqual(antes) // nada cambió
  })

  it('SALVAGUARDA: rollback sobre una tarifa protegida ABORTA y no borra', async () => {
    const antes = await snapshotHistoricas()
    await expect(
      cargarTarifa(sql, { tarifa: 2, rollback: true, apply: true }, noop),
    ).rejects.toBeInstanceOf(AbortoCarga)
    expect(await snapshotHistoricas()).toEqual(antes)
  })

  it('SALVAGUARDA: destino no entero/positivo ABORTA', async () => {
    await expect(cargarTarifa(sql, { fichero: csv('t.csv', CSV_2026), tarifa: 0, apply: true }, noop)).rejects.toBeInstanceOf(AbortoCarga)
    await expect(cargarTarifa(sql, { fichero: csv('t.csv', CSV_2026), tarifa: 1.5, apply: true }, noop)).rejects.toBeInstanceOf(AbortoCarga)
  })
})
