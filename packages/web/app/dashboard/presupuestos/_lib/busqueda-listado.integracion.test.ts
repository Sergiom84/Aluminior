import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { filtroClienteSeleccionado, filtroListadoPresupuestos } from './busqueda-listado.ts'

describe('listado comercial por fecha y precio', () => {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  const serie = 'QA-BUSQ'
  const ids: string[] = []

  const limpiar = async () => {
    const filas = await db.select({ id: schema.presupuestos.id })
      .from(schema.presupuestos)
      .where(eq(schema.presupuestos.serie, serie))
    if (filas.length) {
      await db.delete(schema.presupuestos).where(inArray(schema.presupuestos.id, filas.map(f => f.id)))
    }
  }

  beforeAll(async () => {
    await limpiar()
    const insertados = await db.insert(schema.presupuestos).values([
      { numero: 1, serie, revision: 0, fecha: '1991-07-17', nombreLibre: 'QA busqueda valorada', total: '1200.50' },
      { numero: 2, serie, revision: 0, fecha: '1991-08-02', nombreLibre: 'QA busqueda ochenta', total: '80.00' },
      { numero: 3, serie, revision: 0, fecha: '1991-07-17', nombreLibre: 'QA busqueda incompleta', total: '1200.50' },
    ]).returning({ id: schema.presupuestos.id })
    ids.push(...insertados.map(f => f.id))
    await db.insert(schema.lineas).values({
      presupuestoId: ids[2], orden: 1, tipo: 'ARTICULO', descripcion: 'QA sin valorar',
      valoracionCompleta: false, total: null,
    })
  })
  afterAll(async () => {
    await limpiar()
    await db.$client.end({ timeout: 5 })
  })

  async function encontrados(consulta: string) {
    const filas = await db.select({ id: schema.presupuestos.id })
      .from(schema.presupuestos)
      .leftJoin(schema.clientes, eq(schema.clientes.codigo, schema.presupuestos.clienteCodigo))
      .where(and(eq(schema.presupuestos.serie, serie), filtroListadoPresupuestos(consulta)))
    return filas.map(f => f.id)
  }

  it('encuentra por la fecha visible y por el precio, y no trata como precio un documento sin valorar', async () => {
    const porFecha = await encontrados('17/07/1991')
    expect(porFecha).toEqual(expect.arrayContaining([ids[0], ids[2]]))
    expect(porFecha).not.toContain(ids[1])

    const porPrecio = await encontrados('1.200,50')
    expect(porPrecio).toEqual([ids[0]])

    expect(await encontrados('80')).toEqual([ids[1]])
    expect(await encontrados('02/08/1991')).toEqual([ids[1]])
    expect(await encontrados('1.200,51')).toEqual([])
  })

  it('incluye el código canónico y el mismo nombre libre, y excluye el resto', async () => {
    const codigo = 'QASELCLI'
    const serieCliente = 'QA-SELCLI'
    await db.delete(schema.presupuestos).where(eq(schema.presupuestos.serie, serieCliente))
    await db.delete(schema.clientes).where(eq(schema.clientes.codigo, codigo))
    await db.insert(schema.clientes).values({ codigo, nombre: 'QA Selección ZX93', nombreComercial: 'Comercial ZX93' })
    const filas = await db.insert(schema.presupuestos).values([
      { numero: 1, serie: serieCliente, revision: 0, fecha: '1992-01-04', clienteCodigo: codigo, nombreLibre: 'Otro texto', total: '10.00' },
      { numero: 2, serie: serieCliente, revision: 0, fecha: '1992-01-05', nombreLibre: 'QA Selección ZX93', total: '20.00' },
      { numero: 3, serie: serieCliente, revision: 0, fecha: '1992-01-06', nombreLibre: 'Ajeno ZX93', total: '30.00' },
    ]).returning({ id: schema.presupuestos.id })
    try {
      const encontradosCliente = await db.select({ id: schema.presupuestos.id })
        .from(schema.presupuestos)
        .where(and(
          eq(schema.presupuestos.serie, serieCliente),
          filtroClienteSeleccionado({ codigo, nombre: 'QA Selección ZX93', nombreComercial: 'Comercial ZX93' }),
        ))
      const idsCliente = encontradosCliente.map(f => f.id)
      expect(idsCliente).toEqual(expect.arrayContaining([filas[0].id, filas[1].id]))
      expect(idsCliente).not.toContain(filas[2].id)
    } finally {
      await db.delete(schema.presupuestos).where(eq(schema.presupuestos.serie, serieCliente))
      await db.delete(schema.clientes).where(eq(schema.clientes.codigo, codigo))
    }
  })
})
