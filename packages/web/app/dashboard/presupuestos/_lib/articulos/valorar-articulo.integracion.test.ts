import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { valorarArticulo } from './valorar-articulo.ts'

const CODIGO = 'ZZARTPVP'

describe('valoración de artículo, SQL real contra PostgreSQL', () => {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))

  const limpiar = async () => {
    await db.delete(schema.articulosPvp)
      .where(eq(schema.articulosPvp.articuloCodigo, CODIGO))
    await db.delete(schema.articulos)
      .where(eq(schema.articulos.codigo, CODIGO))
  }

  beforeAll(async () => {
    await limpiar()
    await db.insert(schema.articulos).values({
      codigo: CODIGO,
      descripcion: 'Artículo de prueba con acabados',
    })
    await db.insert(schema.articulosPvp).values([
      { articuloCodigo: CODIGO, acabadoCodigo: 'BLA', tarifa: 7, precio: '12.3400' },
      { articuloCodigo: CODIGO, acabadoCodigo: 'MAD', tarifa: 7, precio: '99.9900' },
      { articuloCodigo: CODIGO, acabadoCodigo: 'BLA', tarifa: 8, precio: '777.0000' },
    ])
  })

  afterAll(async () => {
    await limpiar()
    await db.$client.end({ timeout: 5 })
  })

  it('lee sólo el acabado y la tarifa exactos, no los señuelos', async () => {
    expect(await valorarArticulo(db, {
      codigo: CODIGO, tarifa: 7, acabadoCodigo: 'BLA',
    })).toEqual({
      ok: true,
      descripcion: 'Artículo de prueba con acabados',
      precioUnitario: '12.3400',
      aviso: null,
      acabadoAplicado: 'BLA',
    })
  })

  it('sin acabado no elige una de las filas concretas', async () => {
    expect(await valorarArticulo(db, {
      codigo: CODIGO, tarifa: 7, acabadoCodigo: null,
    })).toEqual({
      ok: true,
      descripcion: 'Artículo de prueba con acabados',
      precioUnitario: null,
      aviso: 'Importe incompleto: elige un acabado con precio para este artículo.',
      acabadoAplicado: null,
    })
  })

  it('un acabado inexistente no cae en otro acabado', async () => {
    const resultado = await valorarArticulo(db, {
      codigo: CODIGO, tarifa: 7, acabadoCodigo: 'NEG',
    })
    expect(resultado.ok && resultado.precioUnitario).toBeNull()
    expect(resultado.ok && resultado.aviso).toContain('acabado NEG')
  })
})
