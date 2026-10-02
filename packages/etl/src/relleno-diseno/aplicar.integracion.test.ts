/**
 * Relleno dirigido contra el Postgres EFÍMERO de Docker (nunca la Supabase
 * compartida). Levantar con: docker compose -f packages/db/docker-compose.yml up -d
 */
import postgres from 'postgres'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { planRelleno } from './plan.ts'
import { AbortoRelleno, rellenarDiseno } from './aplicar.ts'

const URL = urlDePruebasValidada(process.env.TEST_DATABASE_URL
  ?? 'postgres://aluminior:aluminior@localhost:55433/aluminior_etl_test')
const sql = postgres(URL, { ssl: false, max: 2, onnotice: () => {} })

/** Origen sintético con el formato del export (coma decimal, cadenas vacías). */
const plan = planRelleno(
  [
    { Codigo: 'C2', DisAncho: '1200', DisAlto: '1000' },
    { Codigo: 'NUEVA', DisAncho: '800', DisAlto: '800' },
  ],
  [
    { Estructura: 'C2', Id: '0', Tipo: '1', ContenidoEn: '-1', TipoMarco: 'NOR', TipoHoja: '0', TipoCurva: '0' },
    { Estructura: 'C2', Id: '4', Tipo: '3', ContenidoEn: '2', TipoHoja: '10', nHoja: '1', Cota: '1,5' },
    { Estructura: 'C2', Id: '4', Tipo: '3', ContenidoEn: '2', TipoHoja: '99', nHoja: '9' },
    { Estructura: 'C2', Id: '6', Tipo: '5', ContenidoEn: '4', TipoHoja: '0' },
    { Estructura: 'C2', Id: '9', Tipo: '5', ContenidoEn: '9' },
    { Estructura: 'C2', Id: '1', Tipo: '6', ContenidoEn: '0', TipoDoc: 'VPRES' },
  ],
)

const nodos = () => sql<{ id_item: number; tipo_hoja: number | null; numero_hoja: number | null;
  cota: string | null; tipo_marco: string | null }[]>`
  select id_item, tipo_hoja, numero_hoja, cota::text, tipo_marco from estructura_diseno_nodos order by id_item`

beforeEach(async () => {
  await sql.unsafe(`
    drop table if exists estructura_diseno_nodos;
    drop table if exists estructuras;
    create table estructuras (codigo text primary key, descripcion text not null,
      dis_ancho_mm integer, dis_alto_mm integer);
    create table estructura_diseno_nodos (estructura_codigo text not null references estructuras(codigo),
      id_item integer not null, tipo integer not null, contenido_en integer, invisible boolean not null default false,
      tipo_hoja integer, numero_hoja integer, tipo_cota integer, cota numeric(12, 3), equidistantes integer,
      tipo_marco text, tipo_curva integer, primary key (estructura_codigo, id_item));
    insert into estructuras (codigo, descripcion) values ('C2', 'CORREDERA'), ('SOLO_BASE', 'SIN ORIGEN');
    insert into estructura_diseno_nodos (estructura_codigo, id_item, tipo, contenido_en) values
      ('C2', 0, 1, -1), ('C2', 4, 3, 2), ('C2', 6, 5, 4), ('C2', 9, 5, 7), ('C2', 20, 2, 0);
  `)
})

afterAll(async () => {
  await sql.unsafe('drop table if exists estructura_diseno_nodos; drop table if exists estructuras;')
  await sql.end({ timeout: 5 })
})

describe('relleno dirigido de los campos de dibujo', () => {
  it('simula sin escribir y describe lo que haría', async () => {
    const informe = await rellenarDiseno(sql, plan)
    expect(informe).toMatchObject({
      aplicado: false,
      estructuras: { enOrigen: 2, ausentesEnBase: 1, enBaseSinOrigen: 1, aActualizar: 1, actualizadas: 0 },
      nodos: { enOrigen: 4, duplicadosEnOrigen: 1, ausentesEnBase: 0, enBaseSinOrigen: 1,
        identidadDistinta: 1, aActualizar: 3, actualizados: 0 },
    })
    expect((await nodos()).every((n) => n.tipo_hoja === null)).toBe(true)
    const [{ n }] = await sql<{ n: number }[]>`
      select count(*)::int as n from pg_tables where tablename like 'relleno_%'`
    expect(n).toBe(0)
  })

  it('actualiza solo filas existentes con identidad coincidente, sin insertar', async () => {
    const informe = await rellenarDiseno(sql, plan, { aplicar: true })
    expect(informe).toMatchObject({ aplicado: true, estructuras: { actualizadas: 1 }, nodos: { actualizados: 3 } })
    expect(await nodos()).toEqual([
      { id_item: 0, tipo_hoja: 0, numero_hoja: null, cota: null, tipo_marco: 'NOR' },
      { id_item: 4, tipo_hoja: 10, numero_hoja: 1, cota: '1.500', tipo_marco: null },
      { id_item: 6, tipo_hoja: 0, numero_hoja: null, cota: null, tipo_marco: null },
      { id_item: 9, tipo_hoja: null, numero_hoja: null, cota: null, tipo_marco: null },
      { id_item: 20, tipo_hoja: null, numero_hoja: null, cota: null, tipo_marco: null },
    ])
    const estructuras = await sql`select codigo, dis_ancho_mm, dis_alto_mm from estructuras order by codigo`
    expect(estructuras).toEqual([
      { codigo: 'C2', dis_ancho_mm: 1200, dis_alto_mm: 1000 },
      { codigo: 'SOLO_BASE', dis_ancho_mm: null, dis_alto_mm: null },
    ])
  })

  it('es idempotente', async () => {
    await rellenarDiseno(sql, plan, { aplicar: true })
    const segunda = await rellenarDiseno(sql, plan, { aplicar: true })
    expect(segunda).toMatchObject({ estructuras: { actualizadas: 0, sinCambios: 1 },
      nodos: { actualizados: 0, sinCambios: 3 } })
  })

  it('aborta sin escribir si falta la migración', async () => {
    await sql.unsafe('alter table estructura_diseno_nodos drop column tipo_curva')
    await expect(rellenarDiseno(sql, plan, { aplicar: true })).rejects.toBeInstanceOf(AbortoRelleno)
    expect((await nodos()).every((n) => n.tipo_hoja === null)).toBe(true)
  })
})
