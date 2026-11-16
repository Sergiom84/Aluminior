import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { filtroPorPlan } from './filtro.ts'
import { planBusqueda } from './plan.ts'
import type { TipoBusqueda } from './tipos.ts'

describe('listado de presupuestos buscado por tipo', () => {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  const serie = 'QA-TIPO'
  const clientes = ['QATIPO1', 'QATIPO2']
  const potencial = 'QATIPOP1'
  const nombres = new Map<string, string>()

  const limpiar = async () => {
    await db.delete(schema.presupuestos).where(eq(schema.presupuestos.serie, serie))
    await db.delete(schema.obras).where(inArray(schema.obras.clienteCodigo, clientes))
    await db.delete(schema.clientesPotenciales).where(eq(schema.clientesPotenciales.codigo, potencial))
    await db.delete(schema.clientes).where(inArray(schema.clientes.codigo, clientes))
  }

  beforeAll(async () => {
    await limpiar()
    await db.insert(schema.clientes).values([
      {
        codigo: clientes[0], nombre: 'LUIS ANTONIO AGUDO HERAS',
        direccion: 'Avda. de Andalucía 12', telefono: '958 12 34 56',
      },
      { codigo: clientes[1], nombre: 'MARÍA LUISA PÉREZ', direccion: 'C/ Mayor 3', telefonoMovil: '600-111-222' },
    ])
    await db.insert(schema.clientesPotenciales).values({
      codigo: potencial, nombre: 'Potencial Zumárraga', telefono: '611.22.33.44',
    })
    const [obra] = await db.insert(schema.obras).values({
      clienteCodigo: clientes[0], descripcion: 'Reforma ático Zafra',
    }).returning({ id: schema.obras.id })
    const filas = await db.insert(schema.presupuestos).values([
      {
        numero: 991201, serie, revision: 0, fecha: '1993-03-15', clienteCodigo: clientes[0],
        obraTexto: 'Cocina interior', referenciaInterna: 'REF-ZX77', total: '2176.09',
      },
      { numero: 991202, serie, revision: 0, fecha: '1993-04-15', clienteCodigo: clientes[1], obraId: obra.id, total: '2176.50' },
      { numero: 992201, serie, revision: 0, fecha: '1994-03-15', nombreLibre: 'Agudo Luis particular', total: '80.00' },
      { numero: 992202, serie, revision: 0, fecha: '1993-03-16', potencialCodigo: potencial, total: '2176.09' },
    ]).returning({ id: schema.presupuestos.id })
    filas.forEach((fila, indice) => nombres.set(fila.id, `P${indice + 1}`))
    await db.insert(schema.lineas).values({
      presupuestoId: filas[3].id, orden: 1, tipo: 'ARTICULO', descripcion: 'QA sin valorar',
      valoracionCompleta: false, total: null,
    })
  })
  afterAll(async () => {
    await limpiar()
    await db.$client.end({ timeout: 5 })
  })

  /** Misma forma de consulta que el listado: left join de cliente y potencial. */
  async function buscar(tipo: TipoBusqueda, consulta: string) {
    const plan = planBusqueda(tipo, consulta)
    if (!plan) throw new Error('consulta vacía')
    const filas = await db.select({ id: schema.presupuestos.id })
      .from(schema.presupuestos)
      .leftJoin(schema.clientes, eq(schema.clientes.codigo, schema.presupuestos.clienteCodigo))
      .leftJoin(schema.clientesPotenciales, eq(schema.clientesPotenciales.codigo, schema.presupuestos.potencialCodigo))
      .where(and(eq(schema.presupuestos.serie, serie), filtroPorPlan(plan)))
    return filas.map((fila) => nombres.get(fila.id)).sort()
  }

  it('nombre: fragmentos en cualquier orden, sin acentos, en cliente, nombre libre y potencial', async () => {
    expect(await buscar('nombre', 'agudo luis')).toEqual(['P1', 'P3'])
    expect(await buscar('nombre', 'perez maria')).toEqual(['P2'])
    expect(await buscar('nombre', 'ZUMARRAGA')).toEqual(['P4'])
    expect(await buscar('nombre', 'luis')).toEqual(['P1', 'P2', 'P3'])
    // Los fragmentos deben estar en el mismo campo: el nombre libre no completa al cliente.
    expect(await buscar('nombre', 'heras particular')).toEqual([])
  })

  it('codigo: número y código de cliente por prefijo, referencia por contenido', async () => {
    expect(await buscar('codigo', '99120')).toEqual(['P1', 'P2'])
    expect(await buscar('codigo', '991202')).toEqual(['P2'])
    expect(await buscar('codigo', '1202')).toEqual([])
    expect(await buscar('codigo', 'qatipo2')).toEqual(['P2'])
    expect(await buscar('codigo', 'qatipop')).toEqual(['P4'])
    expect(await buscar('codigo', 'zx77')).toEqual(['P1'])
  })

  it('calle: dirección del cliente con abreviaturas y en cualquier orden', async () => {
    expect(await buscar('calle', 'andalucia avenida')).toEqual(['P1'])
    expect(await buscar('calle', 'c/ mayor')).toEqual(['P2'])
    expect(await buscar('calle', 'agudo')).toEqual([])
  })

  it('telefono: ignora espacios, puntos y guiones en ambos lados', async () => {
    expect(await buscar('telefono', '958123456')).toEqual(['P1'])
    expect(await buscar('telefono', '58-12')).toEqual(['P1'])
    expect(await buscar('telefono', '600 111 222')).toEqual(['P2'])
    expect(await buscar('telefono', '22.33.44')).toEqual(['P4'])
    expect(await buscar('telefono', '12')).toEqual([])
  })

  it('obra: texto de obra y descripción de la obra enlazada', async () => {
    expect(await buscar('obra', 'cocina')).toEqual(['P1'])
    expect(await buscar('obra', 'zafra ATICO')).toEqual(['P2'])
    expect(await buscar('obra', 'agudo')).toEqual([])
  })

  it('fecha: día, día de cualquier año, mes y año', async () => {
    expect(await buscar('fecha', '15/03/1993')).toEqual(['P1'])
    expect(await buscar('fecha', '15/03')).toEqual(['P1', 'P3'])
    expect(await buscar('fecha', '03/1993')).toEqual(['P1', 'P4'])
    expect(await buscar('fecha', '1994')).toEqual(['P3'])
    expect(await buscar('fecha', 'marzo')).toEqual([])
  })

  it('precio: exacto al céntimo o euro entero, nunca un documento sin valorar', async () => {
    expect(await buscar('precio', '2176,09')).toEqual(['P1'])
    expect(await buscar('precio', '2.176,09')).toEqual(['P1'])
    expect(await buscar('precio', '2176.09')).toEqual(['P1'])
    expect(await buscar('precio', '2176')).toEqual(['P1', 'P2'])
    expect(await buscar('precio', '80')).toEqual(['P3'])
    expect(await buscar('precio', '2176,10')).toEqual([])
  })
})
