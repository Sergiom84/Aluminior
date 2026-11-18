/**
 * Acabado propio de una unión, contra Postgres efímero y catálogo sintético J04.
 *
 * Productor guarda `Acabado` en cada fila hija del GRUPO (260289: PSU006 en L
 * dentro de un mirador en VS). El catálogo real de ese caso no está en la base
 * de pruebas, así que aquí se demuestra la regla con un segundo acabado
 * sintético cuyo PVP es el doble: la unión en ese acabado cobra su PVP, la que
 * no lo tiene hereda el de la línea, y los módulos no cambian.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import postgres from 'postgres'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { asignarMaterialesUnion, composicionExplicita, descripcionGrupo } from '@aluminior/core/estructuras'
import { valorarCerramiento } from './valorar-cerramiento.ts'
import { leerNombresDescripcion } from './nombres-descripcion.ts'
import { J04, configuracionJ04, sembrarCatalogoJ04 } from './catalogo-j04.fixture.ts'

const base = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const nombre = `aluminior_acabado_elemento_${randomUUID().replaceAll('-', '')}_test`
const admin = postgres(base, { max: 1, onnotice: () => {} })
let db: ReturnType<typeof crearDb>
type Tx = Parameters<Parameters<ReturnType<typeof crearDb>['transaction']>[0]>[0]

/** Segundo acabado sintético: mismo catálogo, PVP doble en los artículos de la unión. */
const OTRO = 'QA-J04-B'

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

async function caso(verificar: (tx: Tx) => Promise<void>) {
  const rollback = new Error('rollback de acabado por elemento sintético')
  await expect(db.transaction(async tx => {
    await sembrarCatalogoJ04(tx)
    await tx.insert(schema.acabados).values({ codigo: OTRO, descripcion: 'Acabado sintético B' })
    for (const [articuloCodigo, precio, coste] of [['QA-J04-U', '24', '10'], ['QA-J04-T', '0.4', '0.2']] as const) {
      await tx.insert(schema.articulosPvp).values({ articuloCodigo, acabadoCodigo: OTRO, tarifa: J04.tarifa, precio })
      await tx.insert(schema.articulosCoste).values({ articuloCodigo, acabadoCodigo: OTRO, proveedorCodigo: 'QA-J04-PROV', coste })
    }
    await verificar(tx)
    throw rollback
  })).rejects.toBe(rollback)
}

const configuracion = (acabadoUnion?: string) => {
  const v3 = composicionExplicita(configuracionJ04())
  return acabadoUnion ? asignarMaterialesUnion(v3, v3.uniones[0]!.id, { acabadoCodigo: acabadoUnion }) : v3
}
const entrada = (acabadoUnion?: string) => ({ configuracion: configuracion(acabadoUnion), serieCodigo: J04.serie,
  acabadoCodigo: J04.acabado, vidrioCodigo: J04.vidrio, tarifa: J04.tarifa, varianteAcristalamiento: '1' as const })
const venta = (r: Awaited<ReturnType<typeof valorarCerramiento>>) =>
  r.origenes.map(o => [o.origen.tipo, o.acabadoCodigo, o.venta.importe])

describe('acabado propio de la unión en un GRUPO', () => {
  it('la unión con acabado propio se valora con el PVP de ese acabado; sin él hereda el de la línea', () => caso(async tx => {
    const heredado = await valorarCerramiento(tx, entrada())
    const propio = await valorarCerramiento(tx, entrada(OTRO))
    expect(heredado.redondeoVenta).toBe('ESTRUCTURA_NUMBER_V1')
    // Unión: 0,8 m × 12 €/ML + 4 × 0,20 € = 10,40 en J04; 0,8 × 24 + 4 × 0,40 = 20,80 en B.
    expect(venta(heredado).at(-1)).toEqual(['UNION', J04.acabado, '10.40'])
    expect(venta(propio).at(-1)).toEqual(['UNION', OTRO, '20.80'])
    expect(venta(propio).slice(0, 2)).toEqual(venta(heredado).slice(0, 2))
    expect(propio.ventaMateriales).toEqual({ completo: true, importe: '151.23' })
    expect(heredado.ventaMateriales).toEqual({ completo: true, importe: '140.83' })
    expect(propio.origenes.at(-1)!.partidasValoracion.map(p => p.precioUnitario)).toEqual(['24.0000', '0.4000'])
  }))

  it('la descripción toma el nombre del acabado propio de un módulo', () => caso(async tx => {
    const v3 = composicionExplicita(configuracionJ04())
    const conModuloB = { ...v3, modulos: v3.modulos.map((m, i) => i === 1 ? { ...m, materiales: { acabadoCodigo: OTRO } } : m) }
    const datos = await leerNombresDescripcion(tx, { configuracion: conModuloB, serieCodigo: J04.serie,
      vidrioCodigo: J04.vidrio, acabadoCodigo: J04.acabado })
    expect(descripcionGrupo(conModuloB, datos).split('\n').filter(l => l.startsWith('EN COLOR')))
      .toEqual(['EN COLOR Acabado sintético J04', 'EN COLOR Acabado sintético B'])
  }))
})
