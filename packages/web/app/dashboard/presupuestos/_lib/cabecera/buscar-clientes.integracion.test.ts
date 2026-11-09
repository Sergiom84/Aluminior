import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { buscarClientesEnCatalogo } from './buscar-clientes.ts'

describe('búsqueda de clientes independiente del transporte Next', () => {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  const codigos = ['SANCLI001', 'SANCLI002', 'SANCLI003', 'QACALLE1', 'QACALLE2']
  const limpiar = () => db.delete(schema.clientes).where(inArray(schema.clientes.codigo, codigos))

  beforeAll(async () => {
    await limpiar()
    await db.insert(schema.clientes).values([
      { codigo: codigos[0], nombre: 'Saneamiento Álvarez Norte', activo: true },
      { codigo: codigos[1], nombre: 'Saneamiento Sur', nombreComercial: 'Álvarez Norte', activo: true },
      { codigo: codigos[2], nombre: 'Saneamiento Álvarez Norte inactivo', activo: false },
      {
        codigo: codigos[3], nombre: 'QA ZX91 López', activo: true,
        direccion: 'C/ QA-ZX91-CALLE 12', telefono: '699 991 001', telefonoMovil: '699991002',
      },
      {
        codigo: codigos[4], nombre: 'QA ZX91 inactivo', activo: false,
        direccion: 'C/ QA-ZX91-CALLE 12', telefono: '699 991 001',
      },
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

  it('encuentra por calle, apellido y teléfono, y no devuelve inactivos', async () => {
    const porCalle = await buscarClientesEnCatalogo(db, 'calle qa-zx91-calle')
    const porApellido = await buscarClientesEnCatalogo(db, 'lópez zx91')
    const porTelefono = await buscarClientesEnCatalogo(db, '699 991 001')
    const porMovil = await buscarClientesEnCatalogo(db, '699991002')
    expect(porCalle.map(f => f.codigo)).toEqual(['QACALLE1'])
    expect(porCalle[0]?.direccion).toBe('C/ QA-ZX91-CALLE 12')
    expect(porApellido.map(f => f.codigo)).toEqual(['QACALLE1'])
    expect(porTelefono.map(f => f.codigo)).toEqual(['QACALLE1'])
    expect(porMovil.map(f => f.codigo)).toEqual(['QACALLE1'])
  })
})
