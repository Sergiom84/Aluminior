import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { cargarPreciosTabla } from './aplicar.ts'

const base = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const nombre = `aluminior_precio_tabla_${randomUUID().replaceAll('-', '')}_test`
const admin = postgres(base, { max: 1, onnotice: () => {} })
let sql: ReturnType<typeof postgres>
const origen = mkdtempSync(join(tmpdir(), 'aluminior-tabla-integracion-'))
const articulos = 'Codigo,PrecioTablaSN,ptNoMedInfSN,ptNoMedSupSN,ptSoloMedTablaAnchoSN,ptSoloMedTablaLargoSN,ptNoPVPCeroSN\nQA-T,True,False,False,False,False,False\nQA-F,False,False,False,False,False,False\n'
const pvp = 'Articulo,Acabado,Tarifa,Ancho,Largo,PVP,EsAcabadoDependienteSN\nQA-T,L,1,1000,2000,"12,34",False\n'
const contenido = async () => ({
  configuracion: [...await sql`SELECT * FROM articulos_despiece ORDER BY articulo_codigo`],
  precios: [...await sql`SELECT * FROM articulos_precio_tabla_pvp ORDER BY articulo_codigo`],
})

beforeAll(async () => {
  await admin.unsafe(`CREATE DATABASE ${nombre}`)
  sql = postgres(urlDePruebasValidada(base.replace(/\/[^/]+$/, `/${nombre}`)), { max: 1, onnotice: () => {} })
  await sql`CREATE SCHEMA auth`
  await sql`CREATE TABLE auth.users (id uuid PRIMARY KEY)`
  await migrate(drizzle(sql), { migrationsFolder: fileURLToPath(new URL('../../../db/migrations', import.meta.url)) })
  await sql`INSERT INTO articulos(codigo,descripcion) VALUES ('QA-T','Artículo dimensional sintético'),('QA-F','Artículo plano sintético')`
  await sql`INSERT INTO articulos_despiece(articulo_codigo,generico,doble_acristalamiento,grosor_acristalar,incrementos_precio)
    VALUES ('QA-T',false,false,0,false),('QA-F',false,false,0,false)`
  await sql`INSERT INTO articulos_pvp(articulo_codigo,acabado_codigo,tarifa,precio) VALUES ('QA-T','L',1,1.2)`
  await sql`INSERT INTO articulos_coste(articulo_codigo,proveedor_codigo,acabado_codigo,coste) VALUES ('QA-T','QA-P','L',1)`
  await sql`INSERT INTO clientes(codigo,nombre) VALUES ('QA-C','Cliente sintético protegido')`
  await sql`INSERT INTO presupuestos(numero,serie,fecha,nombre_libre) VALUES (999003,'QA','2026-10-12','Documento sintético protegido')`
  writeFileSync(join(origen, 'Articulos.csv'), articulos)
  writeFileSync(join(origen, 'ArticulosPrecioTablaPVP.csv'), pvp)
}, 60000)

afterAll(async () => {
  await sql?.end({ timeout: 5 })
  await admin.unsafe(`DROP DATABASE IF EXISTS ${nombre} WITH (FORCE)`)
  await admin.end({ timeout: 5 })
  rmSync(origen, { recursive: true, force: true })
})

describe('carga de precio por dimensiones en una BD efímera propia', () => {
  it('simula por defecto y revierte contenido, no sólo recuentos', async () => {
    const antes = await contenido()
    expect(antes.configuracion.map(f => f.precio_en_tabla)).toEqual([null, null])
    const r = await cargarPreciosTabla(sql, origen)
    expect(r).toMatchObject({ aplicado: false, articulosActualizados: 2, precios: 1 })
    expect(await contenido()).toEqual(antes)
  })
  it('aplica y repite sin alterar documentos, clientes, costes o PVP plano', async () => {
    const r = await cargarPreciosTabla(sql, origen, true)
    const antes = await contenido()
    const repetida = await cargarPreciosTabla(sql, origen, true)
    expect(repetida.protegidas).toEqual(r.protegidas)
    expect(await contenido()).toEqual(antes)
    expect(antes.configuracion.map(f => f.precio_en_tabla)).toEqual([false, true])
    expect(antes.precios).toMatchObject([{ precio: '12.3400', ancho_mm: '1000.000', largo_mm: '2000.000' }])
    expect(await sql`SELECT precio FROM articulos_pvp`).toMatchObject([{ precio: '1.2000' }])
    expect(await sql`SELECT coste FROM articulos_coste`).toMatchObject([{ coste: '1.0000' }])
    expect(await sql`SELECT count(*)::int AS n FROM presupuestos`).toMatchObject([{ n: 1 }])
  })
  it('también simula con postgres-js puro sin los serializadores alterados por Drizzle', async () => {
    const puro = postgres(urlDePruebasValidada(base.replace(/\/[^/]+$/, `/${nombre}`)), { max: 1, onnotice: () => {} })
    const antes = await contenido()
    try {
      expect(await cargarPreciosTabla(puro, origen)).toMatchObject({ aplicado: false, precios: 1 })
      expect(await contenido()).toEqual(antes)
      expect(antes.configuracion.every(f => typeof f.politicas_precio_tabla === 'object')).toBe(true)
    } finally { await puro.end({ timeout: 5 }) }
  })
  it('un CSV duplicado se rechaza antes de modificar configuración o precios', async () => {
    const antes = await contenido()
    writeFileSync(join(origen, 'ArticulosPrecioTablaPVP.csv'), pvp + 'QA-T,L,1,1000,2000,99,False\n')
    await expect(cargarPreciosTabla(sql, origen, true)).rejects.toThrow('duplicado')
    expect(await contenido()).toEqual(antes)
    writeFileSync(join(origen, 'ArticulosPrecioTablaPVP.csv'), pvp)
  })
  it('TRUE permanece activo en configuración, restricciones y acabado dependiente al cargar', async () => {
    const original = await contenido()
    try {
      writeFileSync(join(origen, 'Articulos.csv'), articulos.replace(
        'QA-T,True,False,False,False,False,False', 'QA-T,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE'))
      writeFileSync(join(origen, 'ArticulosPrecioTablaPVP.csv'), pvp.replace('False', 'TRUE'))
      await cargarPreciosTabla(sql, origen, true)
      const despues = await contenido()
      expect(despues.configuracion.find(f => f.articulo_codigo === 'QA-T')).toMatchObject({
        precio_en_tabla: true, politicas_precio_tabla: { noMedidasInferiores: true, noMedidasSuperiores: true,
          soloMedidasAncho: true, soloMedidasLargo: true, noPrecioCero: true } })
      expect(despues.precios[0].acabado_dependiente).toBe(true)
    } finally {
      writeFileSync(join(origen, 'Articulos.csv'), articulos)
      writeFileSync(join(origen, 'ArticulosPrecioTablaPVP.csv'), pvp)
      await cargarPreciosTabla(sql, origen, true)
    }
    expect(await contenido()).toEqual(original)
  })
  it.each([
    ['tarifa fraccionaria', '1,49', '1000', '2000'],
    ['tarifa que antes se redondeaba arriba', '1,5', '1000', '2000'],
    ['fracción por debajo de la precisión de number', '1,00000000000000001', '1000', '2000'],
    ['ancho no representable', '1', '1000,0001', '2000'],
    ['largo no representable', '1', '1000', '2000,1234'],
    ['medida fuera de numeric(10,3)', '1', '10000000', '2000'],
    ['notación no admitida en el export', '1', '1e3', '2000'],
  ])('rechaza %s antes de escribir sin alterar siquiera la configuración', async (_caso, tarifa, ancho, largo) => {
    const antes = await contenido()
    try {
      writeFileSync(join(origen, 'ArticulosPrecioTablaPVP.csv'),
        `Articulo,Acabado,Tarifa,Ancho,Largo,PVP,EsAcabadoDependienteSN\nQA-T,L,"${tarifa}","${ancho}","${largo}",12,False\n`)
      await expect(cargarPreciosTabla(sql, origen, true)).rejects.toThrow('sin clave, medidas o precio válidos')
      expect(await contenido()).toEqual(antes)
    } finally { writeFileSync(join(origen, 'ArticulosPrecioTablaPVP.csv'), pvp) }
  })
  it('RLS oculta el catálogo a un rol de navegador incluso con permisos de filas', async () => {
    const rol = `qa_tabla_${randomUUID().replaceAll('-', '')}`
    const antes = await contenido()
    await admin.unsafe(`CREATE ROLE ${rol} NOLOGIN NOBYPASSRLS`)
    try {
      await sql.unsafe(`GRANT USAGE ON SCHEMA public TO ${rol}`)
      await sql.unsafe(`GRANT SELECT,INSERT,UPDATE,DELETE ON articulos_precio_tabla_pvp TO ${rol}`)
      await sql.begin(async tx => {
        await tx.unsafe(`SET LOCAL ROLE ${rol}`)
        expect(await tx`SELECT count(*)::int AS n FROM articulos_precio_tabla_pvp`).toMatchObject([{ n: 0 }])
        expect((await tx`UPDATE articulos_precio_tabla_pvp SET precio=99`).count).toBe(0)
        expect((await tx`DELETE FROM articulos_precio_tabla_pvp`).count).toBe(0)
      })
      await expect(sql.begin(async tx => {
        await tx.unsafe(`SET LOCAL ROLE ${rol}`)
        await tx`INSERT INTO articulos_precio_tabla_pvp(articulo_codigo,acabado_codigo,tarifa,ancho_mm,largo_mm,precio)
          VALUES ('QA-PUBLICO','L',1,1,1,1)`
      })).rejects.toMatchObject({ code: '42501' })
      expect(await contenido()).toEqual(antes)
    } finally {
      await sql.unsafe(`DROP OWNED BY ${rol}`)
      await admin.unsafe(`DROP ROLE ${rol}`)
    }
  })
  it('0031 conserva las filas previas desconocidas y su DDL puede revertirse transaccionalmente', async () => {
    const antes = await contenido(), rollback = new Error('rollback de migración local')
    const migracion = readFileSync(fileURLToPath(new URL('../../../db/migrations/0031_articulos_precio_en_tabla.sql', import.meta.url)), 'utf8')
    await expect(sql.begin(async tx => {
      await tx`DROP TABLE articulos_precio_tabla_pvp`
      await tx`ALTER TABLE articulos_despiece DROP COLUMN precio_en_tabla, DROP COLUMN politicas_precio_tabla`
      await tx.unsafe(migracion)
      expect([...await tx`SELECT precio_en_tabla FROM articulos_despiece`].every(f => f.precio_en_tabla === null)).toBe(true)
      expect(await tx`SELECT relrowsecurity FROM pg_class WHERE oid='articulos_precio_tabla_pvp'::regclass`)
        .toMatchObject([{ relrowsecurity: true }])
      throw rollback
    })).rejects.toBe(rollback)
    expect(await contenido()).toEqual(antes)
  })
  it('se niega sin capacidad de 0031 sin alterar contenido protegido', async () => {
    await sql`ALTER TABLE articulos_despiece DROP COLUMN precio_en_tabla`
    await expect(cargarPreciosTabla(sql, origen, true)).rejects.toThrow('Falta migración 0031')
    expect(await sql`SELECT precio FROM articulos_pvp`).toMatchObject([{ precio: '1.2000' }])
  })
})
