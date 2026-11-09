import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { filtroListadoClientes } from '../../../lib/busqueda-clientes.ts'

describe('listado de clientes por calle, nombre y teléfono', () => {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  const codigos = ['QALIST1', 'QALIST2']
  const limpiar = () => db.delete(schema.clientes).where(inArray(schema.clientes.codigo, codigos))

  beforeAll(async () => {
    await limpiar()
    await db.insert(schema.clientes).values([
      {
        codigo: codigos[0], nombre: 'QA Listado ZX92 García', activo: true,
        direccion: 'Avda. QA-ZX92-PLAZA', telefono: '699 991 003', nif: 'ZX92NIF',
      },
      { codigo: codigos[1], nombre: 'QA Listado otro', activo: true, poblacion: 'ZX92VILLA' },
    ])
  })
  afterAll(async () => {
    await limpiar()
    await db.$client.end({ timeout: 5 })
  })

  async function codigosDe(consulta: string) {
    const filas = await db.select({ codigo: schema.clientes.codigo })
      .from(schema.clientes)
      .where(and(inArray(schema.clientes.codigo, codigos), filtroListadoClientes(consulta)))
      .orderBy(schema.clientes.codigo)
    return filas.map(f => f.codigo)
  }

  it('encuentra la calle aunque esté abreviada, y el apellido en otro orden', async () => {
    expect(await codigosDe('avenida qa-zx92-plaza')).toEqual(['QALIST1'])
    expect(await codigosDe('garcía zx92')).toEqual(['QALIST1'])
    expect(await codigosDe('699991003')).toEqual(['QALIST1'])
  })

  it('conserva NIF y población', async () => {
    expect(await codigosDe('ZX92NIF')).toEqual(['QALIST1'])
    expect(await codigosDe('zx92villa')).toEqual(['QALIST2'])
  })

  it('no filtra si la consulta está vacía', () => {
    expect(filtroListadoClientes('   ')).toBeUndefined()
  })
})
