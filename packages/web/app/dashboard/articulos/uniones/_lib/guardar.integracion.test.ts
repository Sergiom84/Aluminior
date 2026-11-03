import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { asc, eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { guardarUnion } from '../../../../../lib/catalogo-uniones/guardar.ts'
import type { UnionFormulario } from '../../../../../lib/catalogo-uniones/validar.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const CODIGOS = ['QA-UV-VENT', 'QA-UV-IMP', 'QA-UV-NEW', 'QA-UV-FALLA']
const IMAGENES = ['QA-UV-OK.png', 'QA-UV-FALLA.png']

const ficha = (codigo: string, cambios: Partial<UnionFormulario> = {}): UnionFormulario => ({
  codigo, descripcion: `Unión ${codigo}`, cantidad: 1, perfiles: ['QA-UV-PERF', '', ''],
  grosor: 60, l1: 0, l2: 0, tipo: 0, manoObraMinutos: 5, deUsuario: true,
  seriesEspecificas: false, series: [], imagen: '', ...cambios,
})

const receta = (codigo: string) => db.select({
  articulo: schema.estructuraPlantillaCatalogo.articulo, funcion: schema.estructuraPlantillaCatalogo.funcion,
}).from(schema.estructuraPlantillaCatalogo)
  .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, codigo))
  .orderBy(asc(schema.estructuraPlantillaCatalogo.lineaOrigen))

async function limpiar() {
  await db.delete(schema.dibujoCatalogo).where(inArray(schema.dibujoCatalogo.nombre, IMAGENES))
  await db.delete(schema.estructuras).where(inArray(schema.estructuras.codigo, CODIGOS))
  await db.delete(schema.articulos).where(eq(schema.articulos.codigo, 'QA-UV-PERF'))
}

const fila = (codigo: string, articulo: string, funcion: string, lineaOrigen: number) => ({
  estructuraCodigo: codigo, lineaOrigen, idPieza: 0, articulo, funcion, cantidad: '2',
  formulaLargo: 'H-10', hoja: 0, gruposAdicionales: ['', '', '', ''],
})

describe('guardar una unión del catálogo', () => {
  beforeAll(async () => {
    await limpiar()
    await db.insert(schema.articulos).values({ codigo: 'QA-UV-PERF', descripcion: 'Perfil de prueba' })
    await db.insert(schema.estructuras).values([
      { codigo: 'QA-UV-VENT', descripcion: 'Ventana', familia: '003', esAccesorio: false },
      { codigo: 'QA-UV-IMP', descripcion: 'Unión importada', familia: '103', esAccesorio: true },
    ])
    await db.insert(schema.estructuraPlantillaCatalogo).values([
      fila('QA-UV-VENT', 'MARCO', 'MARCO', 1),
      fila('QA-UV-IMP', 'TUBO-ORIG', 'UNION', 1), fila('QA-UV-IMP', 'TAPA', 'ACC', 2),
    ])
    await db.insert(schema.estructuraUnion).values({
      estructuraCodigo: 'QA-UV-IMP', grosor: '40', tipo: 0, deUsuario: false,
    })
  })
  afterAll(limpiar)

  it('no convierte en unión una estructura que no lo es ni borra su receta', async () => {
    expect(await guardarUnion(ficha('QA-UV-VENT'), false, null, db))
      .toEqual({ ok: false, errores: { codigo: ['No es una unión'] } })
    const [estructura] = await db.select().from(schema.estructuras).where(eq(schema.estructuras.codigo, 'QA-UV-VENT'))
    expect(estructura).toMatchObject({ familia: '003', esAccesorio: false })
    expect(await receta('QA-UV-VENT')).toEqual([{ articulo: 'MARCO', funcion: 'MARCO' }])
  })

  it('edita los datos de una unión importada sin reescribir su receta de Productor', async () => {
    expect(await guardarUnion(ficha('QA-UV-IMP', { grosor: 55, perfiles: ['', '', ''] }), false, null, db))
      .toEqual({ ok: true, codigo: 'QA-UV-IMP' })
    const [union] = await db.select().from(schema.estructuraUnion).where(eq(schema.estructuraUnion.estructuraCodigo, 'QA-UV-IMP'))
    expect(union).toMatchObject({ grosor: '55.000', deUsuario: true, manoObraMinutos: '0.0000' })
    expect(await receta('QA-UV-IMP')).toEqual([
      { articulo: 'TUBO-ORIG', funcion: 'UNION' }, { articulo: 'TAPA', funcion: 'ACC' },
    ])
  })

  it('da de alta una unión nueva con receta e imagen guardada en la base', async () => {
    const subida = { nombre: 'QA-UV-OK.png', tipo: 'image/png', contenido: Buffer.from([137, 80, 78, 71]) }
    expect(await guardarUnion(ficha('QA-UV-NEW'), true, subida, db)).toEqual({ ok: true, codigo: 'QA-UV-NEW' })
    const [union] = await db.select().from(schema.estructuraUnion).where(eq(schema.estructuraUnion.estructuraCodigo, 'QA-UV-NEW'))
    expect(union.imagen).toBe('QA-UV-OK.png')
    const [dibujo] = await db.select().from(schema.dibujoCatalogo).where(eq(schema.dibujoCatalogo.nombre, 'QA-UV-OK.png'))
    expect({ tipo: dibujo.tipo, bytes: dibujo.bytes, largo: dibujo.contenido.length }).toEqual({ tipo: 'image/png', bytes: 4, largo: 4 })
    expect(await receta('QA-UV-NEW')).toEqual([
      { articulo: 'QA-UV-PERF', funcion: 'UNION1' }, { articulo: 'MO', funcion: 'MO' },
    ])
  })

  it('si la escritura falla a mitad, no deja imagen ni estructura', async () => {
    const subida = { nombre: 'QA-UV-FALLA.png', tipo: 'image/png', contenido: Buffer.from([1]) }
    // La serie repetida viola la clave de estructura_union_series después de insertar la imagen.
    await expect(guardarUnion(ficha('QA-UV-FALLA', { seriesEspecificas: true, series: ['QA', 'QA'] }), true, subida, db))
      .rejects.toThrow()
    expect(await db.select().from(schema.dibujoCatalogo).where(eq(schema.dibujoCatalogo.nombre, 'QA-UV-FALLA.png'))).toEqual([])
    expect(await db.select().from(schema.estructuras).where(eq(schema.estructuras.codigo, 'QA-UV-FALLA'))).toEqual([])
  })
})
