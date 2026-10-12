import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import postgres from 'postgres'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { esquemaLinea } from '../lineas/esquema-linea.ts'
import { resolverMaterialesEstructura } from '../estructuras/materiales-estructura.ts'
import { valorarCerramiento } from './valorar-cerramiento.ts'
import { altaCerramientoValorado } from './alta-valorada.ts'
import { leerResultadoCerramiento } from './resultado-persistido.ts'
import { J04, configuracionJ04, sembrarCatalogoJ04 } from './catalogo-j04.fixture.ts'

const base = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const nombre = `aluminior_union_tabla_${randomUUID().replaceAll('-', '')}_test`
const admin = postgres(base, { max: 1, onnotice: () => {} })
let db: ReturnType<typeof crearDb>
type Tx = Parameters<Parameters<ReturnType<typeof crearDb>['transaction']>[0]>[0]
const entrada = () => ({ configuracion: configuracionJ04(), serieCodigo: J04.serie,
  acabadoCodigo: J04.acabado, vidrioCodigo: J04.vidrio, tarifa: J04.tarifa,
  varianteAcristalamiento: '1' as const })

beforeAll(async () => {
  await admin.unsafe(`CREATE DATABASE ${nombre}`)
  db = crearDb(urlDePruebasValidada(base.replace(/\/[^/]+$/, `/${nombre}`)))
  await db.$client`CREATE SCHEMA auth`
  await db.$client`CREATE TABLE auth.users(id uuid PRIMARY KEY)`
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../../../../../db/migrations', import.meta.url)) })
}, 60000)
afterAll(async () => {
  await db?.$client.end({ timeout: 5 })
  await admin.unsafe(`DROP DATABASE IF EXISTS ${nombre} WITH (FORCE)`)
  await admin.end({ timeout: 5 })
})

async function caso(marca: boolean | null, verificar: (tx: Tx) => Promise<void>) {
  const rollback = new Error('rollback de unión legacy sintética')
  await expect(db.transaction(async tx => {
    await sembrarCatalogoJ04(tx)
    await tx.update(schema.articulosDespiece).set({ precioEnTabla: marca })
      .where(eq(schema.articulosDespiece.articuloCodigo, 'QA-J04-T'))
    // Hay una tabla además de PVP/coste planos. La ruta legacy no acredita
    // ni las dimensiones de la pieza ni el selector por tabla.
    await tx.insert(schema.articulosPrecioTablaPvp).values({ articuloCodigo: 'QA-J04-T',
      acabadoCodigo: J04.acabado, tarifa: J04.tarifa, anchoMm: '1000', largoMm: '2000',
      precio: '17', acabadoDependiente: false })
    await verificar(tx)
    throw rollback
  })).rejects.toBe(rollback)
}

async function guardar(tx: Tx) {
  const [p] = await tx.insert(schema.presupuestos).values({ numero: 999033, serie: 'QA-UNION',
    fecha: '2026-10-12', nombreLibre: 'Grupo sintético de unión', tarifa: J04.tarifa }).returning()
  const datos = esquemaLinea.parse({ presupuestoId: p!.id, tipo: 'CERRAMIENTO', codigo: 'GRUPO', cantidad: 2,
    configuracionCerramiento: JSON.stringify(configuracionJ04()), serieCodigo: J04.serie,
    acabadoCodigo: J04.acabado, vidrioCodigo: J04.vidrio, varianteAcristalamiento: '1',
    horasFabricacion: '0', horasColocacion: '0', referencia: 'QA unión reversible' })
  expect((await altaCerramientoValorado(tx, datos)).ok).toBe(true)
  const [linea] = await tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, p!.id))
  const resultado = await leerResultadoCerramiento(tx, linea!.id)
  const piezas = await tx.select().from(schema.lineasDespiece).where(eq(schema.lineasDespiece.lineaId, linea!.id))
  return { linea, resultado, piezas }
}

describe('GRUPO con unión legacy: precio dimensional y configuración desconocida', () => {
  it.each([true, null])('marca %s bloquea venta/coste planos en cálculo y guardado', marca => caso(marca, async tx => {
    const material = await resolverMaterialesEstructura(tx, { ...entrada(), codigo: 'GMU038',
      anchoMm: 60, altoMm: 800, vidrioCodigo: null, opcionesHerraje: [] })
    expect(material).toMatchObject({ ok: true, precioUnitario: null, valoracion: { completa: false } })
    if (!material.ok) throw new Error('Fixture sin material')
    expect(material.valoracion.lineas.find(p => p.articuloCodigo === 'QA-J04-T'))
      .toMatchObject({ precioUnitario: null, importe: null, incidencia: expect.any(String) })
    expect(material.filasPvp.some(p => p.articuloCodigo === 'QA-J04-T')).toBe(false)

    const resultado = await valorarCerramiento(tx, entrada())
    expect(resultado.redondeoVenta).toBe('ESTRUCTURA_NUMBER_V1')
    expect(resultado.origenes.filter(o => o.origen.tipo === 'MODULO').every(o => o.venta.completo && o.coste.completo)).toBe(true)
    const union = resultado.origenes.find(o => o.origen.tipo === 'UNION')!
    expect(union).toMatchObject({ venta: { completo: false, importe: null }, coste: { completo: false, importe: null } })
    expect(union.partidasValoracion.find(p => p.articuloCodigo === 'QA-J04-T'))
      .toMatchObject({ precioUnitario: null, importeExacto: null, criterioPrecio: 'SIN_PRECIO', incidencia: expect.any(String) })
    expect(union.piezas.find(p => p.articuloCodigo === 'QA-J04-T'))
      .toMatchObject({ costeUnitario: null, costeTotal: null, cantidad: '4', unidad: 'UD' })
    expect(union.diagnosticos.some(d => d.ambito === 'FABRICACION' && d.bloqueante)).toBe(true)
    expect(resultado).toMatchObject({ ventaMateriales: { completo: false, importe: null }, costeMateriales: { completo: false, importe: null } })

    const guardado = await guardar(tx)
    expect(guardado.linea).toMatchObject({ tipo: 'CERRAMIENTO', precioUnitario: null, total: null, valoracionCompleta: false })
    expect(guardado.resultado).toEqual(resultado)
    expect(guardado.piezas.find(p => p.articuloCodigo === 'QA-J04-T'))
      .toMatchObject({ origenTipo: 'UNION', costeUnitario: null, costeTotal: null, cantidad: '4.000' })
  }))
  it('marca false conserva el cálculo ordinario de la unión y su GRUPO guardado', () => caso(false, async tx => {
    const resultado = await valorarCerramiento(tx, entrada())
    expect(resultado.redondeoVenta).toBe('ESTRUCTURA_NUMBER_V1')
    expect(resultado).toMatchObject({ ventaMateriales: { completo: true, importe: '140.83' }, costeMateriales: { completo: true, importe: '53.6720' } })
    expect(resultado.origenes.find(o => o.origen.tipo === 'UNION')).toMatchObject({
      venta: { completo: true, importe: '10.40' }, coste: { completo: true, importe: '4.4000' } })
    const guardado = await guardar(tx)
    expect(guardado.linea).toMatchObject({ tipo: 'CERRAMIENTO', precioUnitario: '140.8300', total: '281.66', valoracionCompleta: true })
    expect(guardado.resultado).toEqual(resultado)
    expect(guardado.piezas.find(p => p.articuloCodigo === 'QA-J04-T'))
      .toMatchObject({ origenTipo: 'UNION', costeUnitario: '0.1000', costeTotal: '0.4000' })
  }))
})
