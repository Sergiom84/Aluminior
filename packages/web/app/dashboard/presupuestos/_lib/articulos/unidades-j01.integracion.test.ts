import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { resolverPrecioArticulo, valorarArticulo } from './valorar-articulo.ts'

afterAll(async () => {
  await crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL)).$client.end({ timeout: 5 })
})

const tipos = ['UD', 'ML', 'M2'] as const
const codigos = tipos.map((t) => `__J01_ART_${t}`)
describe('J01 — artículo dimensional sin medidas', () => {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  const limpiar = async () => {
    await db.delete(schema.articulosPvp).where(inArray(schema.articulosPvp.articuloCodigo, codigos))
    await db.delete(schema.articulosDespiece).where(inArray(schema.articulosDespiece.articuloCodigo, codigos))
    await db.delete(schema.articulos).where(inArray(schema.articulos.codigo, codigos))
  }
  beforeAll(async () => {
    await limpiar()
    await db.insert(schema.articulos).values(tipos.map((tipoMetraje, i) => ({
      codigo: codigos[i], descripcion: `J01 ${tipoMetraje}`, tipoMetraje,
    })))
    await db.insert(schema.articulosDespiece).values(codigos.map((articuloCodigo) => ({
      articuloCodigo, generico: false, dobleAcristalamiento: false,
      grosorAcristalar: '0', incrementosPrecio: false, precioEnTabla: false,
    })))
    await db.insert(schema.articulosPvp).values(codigos.flatMap((articuloCodigo) => [
      { articuloCodigo, acabadoCodigo: 'BLA', tarifa: 9101, precio: '20.0000' },
      { articuloCodigo, acabadoCodigo: 'UNI', tarifa: 9101, precio: '18.0000' },
      { articuloCodigo, acabadoCodigo: 'BLA', tarifa: 9102, precio: '99.0000' },
    ]))
  })
  afterAll(limpiar)

  it('UD conserva PVP exacto 20, no genérico 18 ni tarifa ajena 99', async () => {
    expect(await valorarArticulo(db, { codigo: codigos[0], tarifa: 9101, acabadoCodigo: 'BLA' }))
      .toMatchObject({ ok: true, precioUnitario: '20.0000', aviso: null })
  })
  it.each(['ML', 'M2'])('%s no cobra el precio por metraje como si fuera por unidad', async (tipo) => {
    expect(await valorarArticulo(db, { codigo: `__J01_ART_${tipo}`, tarifa: 9101, acabadoCodigo: 'BLA' }))
      .toEqual({ ok: true, descripcion: `J01 ${tipo}`, precioUnitario: null,
        aviso: `Importe incompleto: el artículo ${tipo} necesita medidas para calcular el metraje.`, acabadoAplicado: null })
  })
  it('tarifa ausente no toma precio de otra', async () => {
    expect(await valorarArticulo(db, { codigo: codigos[0], tarifa: 9103, acabadoCodigo: 'BLA' }))
      .toMatchObject({ ok: true, precioUnitario: null })
  })
})

describe('J01 — mosquitera M2 de familia 053', () => {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  const codigo = '__J01_MOSQ_M2'
  const rollback = new Error('rollback mosquitera M2')

  async function caso(verificar: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<void>) {
    try {
      await db.transaction(async tx => {
        await tx.insert(schema.familias).values({ codigo: '053', descripcion: 'Mosquiteras sintéticas' }).onConflictDoNothing()
        await tx.insert(schema.articulos).values({
          codigo, descripcion: 'Mosquitera M2 sintética', tipoMetraje: 'M2', familiaCodigo: '053',
          metrajeMinimo: '1.250', metrajeMultiploAncho: '0', metrajeMultiploLargo: '0',
        })
        await tx.insert(schema.articulosDespiece).values({
          articuloCodigo: codigo, generico: false, dobleAcristalamiento: false,
          grosorAcristalar: '0', incrementosPrecio: false, precioEnTabla: false,
        })
        await tx.insert(schema.articulosPvp).values({
          articuloCodigo: codigo, acabadoCodigo: 'L', tarifa: 9104, precio: '56.7600',
        })
        await verificar(tx)
        throw rollback
      })
    } catch (error) { if (error !== rollback) throw error }
  }

  const valorar = (tx: Parameters<Parameters<typeof db.transaction>[0]>[0], anchoMm?: number, altoMm?: number) =>
    valorarArticulo(tx as unknown as Parameters<typeof valorarArticulo>[0], {
      codigo, tarifa: 9104, acabadoCodigo: 'L', anchoMm, altoMm,
    })

  it.each([[745, 1095, '70.9500'], [1500, 1130, '96.4900'], [1220, 1200, '82.8700']] as const)(
    '%s × %s aplica superficie con mínimo', async (ancho, alto, precio) => {
      await caso(async tx => {
        expect(await valorar(tx, ancho, alto)).toMatchObject({
          ok: true, precioUnitario: precio, aviso: null, acabadoAplicado: 'L',
        })
      })
    },
  )

  it('sin medidas sigue pidiendo metraje y no cobra el PVP', async () => {
    await caso(async tx => {
      expect(await valorar(tx)).toEqual({
        ok: true, descripcion: 'Mosquitera M2 sintética', precioUnitario: null,
        aviso: 'Importe incompleto: el artículo M2 necesita medidas para calcular el metraje.',
        acabadoAplicado: null,
      })
    })
  })
})

describe('J01 — procedencia canónica de genéricos', () => {
  it.each(['UNI', '*', '', null])('solicitud %s prefiere UNI independientemente del orden', (acabado) => {
    const filas = [{ acabadoCodigo: '*', precio: '5.0000' }, { acabadoCodigo: 'UNI', precio: '5.0000' }]
    for (const orden of [filas, [...filas].reverse()]) {
      expect(resolverPrecioArticulo(orden, acabado, 9101))
        .toEqual({ precio: '5.0000', acabadoAplicado: 'UNI' })
    }
  })
})
