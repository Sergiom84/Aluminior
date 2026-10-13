import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import postgres from 'postgres'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { eq, sql as expresion } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { valorarEstructura } from '../valorar-estructura.ts'
import { altaLinea } from '../../lineas/alta-linea.ts'

const base = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const nombre = `aluminior_web_tabla_${randomUUID().replaceAll('-', '')}_test`
const admin = postgres(base, { max: 1, onnotice: () => {} })
let db: ReturnType<typeof crearDb>
type Tx = Parameters<Parameters<ReturnType<typeof crearDb>['transaction']>[0]>[0]
const politicas = { noMedidasInferiores: false, noMedidasSuperiores: false, soloMedidasAncho: false,
  soloMedidasLargo: false, noPrecioCero: false }
const entrada = { codigo: 'QA-EST', serieCodigo: 'QA-S', anchoMm: 1100, altoMm: 1800, vidrioCodigo: null,
  varianteAcristalamiento: '2' as const, acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI', tarifa: 1,
  opcionesHerraje: [], trazabilidad: true }

beforeAll(async () => {
  await admin.unsafe(`CREATE DATABASE ${nombre}`)
  db = crearDb(urlDePruebasValidada(base.replace(/\/[^/]+$/, `/${nombre}`)))
  await db.$client`CREATE SCHEMA auth`
  await db.$client`CREATE TABLE auth.users(id uuid PRIMARY KEY)`
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../../../../../../db/migrations', import.meta.url)) })
}, 60000)
afterAll(async () => {
  await db?.$client.end({ timeout: 5 })
  await admin.unsafe(`DROP DATABASE IF EXISTS ${nombre} WITH (FORCE)`)
  await admin.end({ timeout: 5 })
})

async function caso(marca: boolean | null, conPrecios: boolean, verificar: (tx: Tx) => Promise<void>) {
  const rollback = new Error('rollback de caso de precio dimensional')
  await expect(db.transaction(async tx => {
    await tx.insert(schema.series).values({ codigo: 'QA-S' })
    await tx.insert(schema.estructuras).values({ codigo: 'QA-EST', descripcion: 'Estructura dimensional sintética', esAccesorio: true })
    await tx.insert(schema.articulos).values({ codigo: 'QA-A', descripcion: 'Artículo dimensional sintético', tipoMetraje: 'UD' })
    await tx.insert(schema.articulosDespiece).values({ articuloCodigo: 'QA-A', generico: false,
      dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false, precioEnTabla: marca, politicasPrecioTabla: politicas })
    await tx.insert(schema.articulosPvp).values(['L', 'UNI'].map(acabadoCodigo => ({ articuloCodigo: 'QA-A', acabadoCodigo, tarifa: 1, precio: '1.2' })))
    await tx.insert(schema.articulosCoste).values({ articuloCodigo: 'QA-A', proveedorCodigo: 'QA-P', acabadoCodigo: 'L', coste: '1' })
    await tx.insert(schema.estructuraPlantillaCatalogo).values({ estructuraCodigo: 'QA-EST', lineaOrigen: 1,
      idPieza: 0, articulo: 'QA-A', cantidad: '1', formulaLargo: 'L', formulaAncho: 'A', gruposAdicionales: [] })
    await tx.insert(schema.estructuraComponentes).values({ estructuraCodigo: 'QA-EST', lineaOrigen: 1,
      articuloCodigo: 'QA-A', cantidad: '1', formulaLargo: marca === false ? null : 'L', formulaAncho: marca === false ? null : 'A' })
    await tx.insert(schema.conjuntos).values({ codigo: 'QA-S' })
    await tx.insert(schema.conjuntoParametrosDespiece).values({ conjuntoCodigo: 'QA-S', herrajes: {}, manoObra: {},
      grosorMaximoSimple: '0', grosorMaximoDoble: '0' })
    if (conPrecios) await tx.insert(schema.articulosPrecioTablaPvp).values([1000, 1500].map(ancho => ({
      articuloCodigo: 'QA-A', acabadoCodigo: 'L', tarifa: 1, anchoMm: String(ancho), largoMm: '2000',
      precio: ancho === 1000 ? '7.35' : '11.25', acabadoDependiente: false })))
    await verificar(tx)
    throw rollback
  })).rejects.toBe(rollback)
}

async function guardar(tx: Tx) {
  const [p] = await tx.insert(schema.presupuestos).values({ numero: 999015, serie: 'QA-TABLA', fecha: '2026-10-12',
    nombreLibre: 'Prueba sintética dimensional', tarifa: 1 }).returning()
  const alta = await altaLinea(tx as unknown as Parameters<typeof altaLinea>[0], { presupuestoId: p!.id, tipo: 'ESTRUCTURA',
    codigo: 'QA-EST', serieCodigo: 'QA-S', referencia: null, vidrioCodigo: null, opcionAcristalamiento: 1,
    varianteAcristalamiento: '2', cantidad: 2, anchoMm: 1100, altoMm: 1800, acabadoCodigo: 'L',
    configuracionCerramiento: null, horasFabricacion: '0', horasColocacion: '0' })
  expect(alta.ok).toBe(true)
  const [linea] = await tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, p!.id))
  const piezas = await tx.select().from(schema.lineasDespiece).where(eq(schema.lineasDespiece.lineaId, linea!.id))
  return { linea, piezas }
}

describe('precio dimensional de estructura, guardado y compatibilidad', () => {
  it('usa el PVP por unidad demostrado y conserva medidas y costes desconocidos al guardar', () => caso(true, true, async tx => {
    expect(await valorarEstructura(tx, entrada)).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 11.25,
      piezas: [{ largoCorteMm: '1800', anchoCorteMm: '1100', costeUnitario: null, costeTotal: null }] })
    const { linea, piezas } = await guardar(tx)
    expect(linea).toMatchObject({ precioUnitario: '11.2500', total: '22.50', valoracionCompleta: true })
    expect(piezas).toMatchObject([{ largoCorteMm: '1800.00', anchoCorteMm: '1100.00', costeUnitario: null, costeTotal: null }])
  }))
  it('sin fila guarda importe nulo y ningún coste plano supuesto', () => caso(true, false, async tx => {
    const r = await valorarEstructura(tx, entrada)
    expect(r).toMatchObject({ ok: true, precioUnitario: null, materialCompleto: false })
    if (r.ok) expect(r.partidas).toMatchObject([{ precioUnitario: null, importeExacto: null }])
    expect((await guardar(tx)).linea).toMatchObject({ precioUnitario: null, total: null, valoracionCompleta: false })
  }))
  it('la marca desconocida no usa el precio plano aunque exista una tabla', () => caso(null, true, async tx => {
    expect(await valorarEstructura(tx, entrada)).toMatchObject({ ok: true, precioUnitario: null,
      aviso: expect.stringContaining('actualizar el catálogo') })
  }))
  it('sin columnas nuevas la consulta sigue viva y la línea queda incompleta', () => caso(true, true, async tx => {
    await tx.execute(expresion`ALTER TABLE articulos_despiece DROP COLUMN precio_en_tabla, DROP COLUMN politicas_precio_tabla`)
    expect(await valorarEstructura(tx, entrada)).toMatchObject({ ok: true, precioUnitario: null, materialCompleto: false })
    expect(await tx.execute(expresion`SELECT 1 AS vivo`)).toMatchObject([{ vivo: 1 }])
  }))
  it('la vía anterior no recupera un precio plano para un artículo dimensional', () => caso(true, true, async tx => {
    await tx.delete(schema.estructuraPlantillaCatalogo)
    const r = await valorarEstructura(tx, entrada)
    expect(r).toMatchObject({ ok: true, motor: 'anterior', precioUnitario: null, materialCompleto: false,
      piezas: [{ costeUnitario: null, costeTotal: null }] })
    if (r.ok) expect(r.partidas).toMatchObject([{ precioUnitario: null, importeExacto: null }])
  }))
  it('la vía anterior conserva PVP/coste ordinarios y su aviso de vidrio pendiente', () => caso(false, false, async tx => {
    await tx.delete(schema.estructuraPlantillaCatalogo)
    const r = await valorarEstructura(tx, entrada)
    expect(r).toMatchObject({ ok: true, motor: 'anterior', precioUnitario: null,
      aviso: expect.stringContaining('sin vidrio elegido'), piezas: [{ costeUnitario: '1', costeTotal: '1' }] })
    if (r.ok) expect(r.partidas).toMatchObject([{ precioUnitario: '1.2000', importeExacto: '1.2000000000' }])
  }))
})
