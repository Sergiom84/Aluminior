import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { buscarClientesEnCatalogo } from './buscar-clientes.ts'

describe('búsqueda de clientes independiente del transporte Next', () => {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  const codigos = ['SANCLI001', 'SANCLI002', 'SANCLI003']
  const limpiar = () => db.delete(schema.clientes).where(inArray(schema.clientes.codigo, codigos))

  beforeAll(async () => {
    await limpiar()
    await db.insert(schema.clientes).values([
      { codigo: codigos[0], nombre: 'Saneamiento Álvarez Norte', activo: true },
      { codigo: codigos[1], nombre: 'Saneamiento Sur', nombreComercial: 'Álvarez Norte', activo: true },
      { codigo: codigos[2], nombre: 'Saneamiento Álvarez Norte inactivo', activo: false },
    ])
  })
  afterAll(async () => {
    await limpiar()
    await db.$client.end({ timeout: 5 })
  })

  it('devuelve el código canónico a partir de un prefijo', async () => {
    const filas = await buscarClientesEnCatalogo(db, 'sancli00')
    expect(filas.map(f => f.codigo).sort()).toEqual(codigos.slice(0, 2))
  })

  it('combina fragmentos desordenados, acentos y nombre comercial', async () => {
    const filas = await buscarClientesEnCatalogo(db, 'nOr Álv saneam')
    expect(filas.map(f => f.codigo).sort()).toEqual(codigos.slice(0, 2))
  })

  it('ignora comodines de nombre y excluye clientes inactivos', async () => {
    const filas = await buscarClientesEnCatalogo(db, 'sanea% _álv norte')
    expect(filas.map(f => f.codigo).sort()).toEqual(codigos.slice(0, 2))
  })
})
