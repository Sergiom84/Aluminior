import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { resolverPrecioArticulo, valorarArticulo } from './valorar-articulo.ts'

const tipos = ['UD', 'ML', 'M2'] as const
const codigos = tipos.map((t) => `__J01_ART_${t}`)
describe('J01 — artículo dimensional sin medidas', () => {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  const limpiar = async () => {
    await db.delete(schema.articulosPvp).where(inArray(schema.articulosPvp.articuloCodigo, codigos))
    await db.delete(schema.articulos).where(inArray(schema.articulos.codigo, codigos))
  }
  beforeAll(async () => {
    await limpiar()
    await db.insert(schema.articulos).values(tipos.map((tipoMetraje, i) => ({
      codigo: codigos[i], descripcion: `J01 ${tipoMetraje}`, tipoMetraje,
    })))
    await db.insert(schema.articulosPvp).values(codigos.flatMap((articuloCodigo) => [
      { articuloCodigo, acabadoCodigo: 'BLA', tarifa: 9101, precio: '20.0000' },
      { articuloCodigo, acabadoCodigo: 'UNI', tarifa: 9101, precio: '18.0000' },
      { articuloCodigo, acabadoCodigo: 'BLA', tarifa: 9102, precio: '99.0000' },
    ]))
  })
  afterAll(async () => { await limpiar(); await db.$client.end({ timeout: 5 }) })

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

describe('J01 — procedencia canónica de genéricos', () => {
  it.each(['UNI', '*', '', null])('solicitud %s prefiere UNI independientemente del orden', (acabado) => {
    const filas = [{ acabadoCodigo: '*', precio: '5.0000' }, { acabadoCodigo: 'UNI', precio: '5.0000' }]
    for (const orden of [filas, [...filas].reverse()]) {
      expect(resolverPrecioArticulo(orden, acabado, 9101))
        .toEqual({ precio: '5.0000', acabadoAplicado: 'UNI' })
    }
  })
})
