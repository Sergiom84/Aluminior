/**
 * Caracterización de la ruta económica de ESTRUCTURA contra PostgreSQL local.
 * El acristalamiento tiene sus propias 12 pruebas de integración; aquí se
 * sustituye por un resultado neutro para aislar perfiles, acabado y satélites.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'

vi.mock('./acristalamiento-estructura.ts', () => ({
  resolverAcristalamientoEstructura: vi.fn(async (_cliente, entrada) =>
    entrada.vidrioCodigo === 'VIDRIO_CON_PROBLEMA'
      ? {
          ok: true,
          precio: entrada.precioInicial + 5,
          piezas: [{
            articuloCodigo: 'VIDRIO_CON_PROBLEMA', cantidad: '1',
            largoCorteMm: '900', anchoCorteMm: '700', funcion: 'VIDRIO',
          }],
          acristalamiento: [{
            slot: 1, vidrioHojas: 'VIDRIO_CON_PROBLEMA', vidrioFijos: null, variante: '2',
          }],
          problemas: ['vidrio sin valorar de caracterización'],
        }
      : { ok: true, precio: entrada.precioInicial, piezas: [], acristalamiento: [], problemas: [] },
  ),
}))

const { valorarEstructura } = await import('./valorar-estructura.ts')

const SERIE = '__TEST_SERIE_VAL__'
const ESTRUCTURA = '__TEST_ESTRUCTURA_VAL__'
const PERFIL = '__TEST_PERFIL_VAL__'
const HERRAJE = '__TEST_HERRAJE_VAL__'
const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)

describe('valorarEstructura', () => {
  const db = crearDb(urlPruebas)

  const limpiar = async () => {
    await db.delete(schema.herrajeConjuntos)
      .where(eq(schema.herrajeConjuntos.serieCodigo, SERIE))
    await db.delete(schema.opcionesHerraje)
      .where(eq(schema.opcionesHerraje.conjuntoCodigo, HERRAJE))
    await db.delete(schema.articulosPvp)
      .where(eq(schema.articulosPvp.articuloCodigo, PERFIL))
    await db.delete(schema.articulosCoste)
      .where(eq(schema.articulosCoste.articuloCodigo, PERFIL))
    await db.delete(schema.estructuras)
      .where(eq(schema.estructuras.codigo, ESTRUCTURA))
    await db.delete(schema.articulos)
      .where(eq(schema.articulos.codigo, PERFIL))
    await db.delete(schema.series).where(eq(schema.series.codigo, SERIE))
  }

  beforeAll(async () => {
    await limpiar()
    await db.insert(schema.series).values({ codigo: SERIE })
    await db.insert(schema.estructuras).values({
      codigo: ESTRUCTURA,
      descripcion: 'ESTRUCTURA DE CARACTERIZACIÓN',
    })
    await db.insert(schema.articulos).values({
      codigo: PERFIL,
      descripcion: 'PERFIL REAL DE CARACTERIZACIÓN',
      tipoMetraje: 'ML',
    })
    await db.insert(schema.estructuraComponentes).values({
      estructuraCodigo: ESTRUCTURA,
      articuloCodigo: PERFIL,
      cantidad: '2',
      formulaLargo: 'A',
      funcion: 'MV',
    })
    // El señuelo alfabético demuestra que sigue mandando el acabado exacto.
    await db.insert(schema.articulosPvp).values([
      { articuloCodigo: PERFIL, acabadoCodigo: 'A', tarifa: 1, precio: '99.0000' },
      { articuloCodigo: PERFIL, acabadoCodigo: 'L', tarifa: 1, precio: '10.0000' },
    ])
    await db.insert(schema.herrajeConjuntos).values({
      serieCodigo: SERIE,
      estructuraCodigo: ESTRUCTURA,
      conjuntos: HERRAJE,
      muestras: 10,
      totalMuestras: 10,
    })
    await db.insert(schema.opcionesHerraje).values({
      conjuntoCodigo: HERRAJE,
      opcionCodigo: '2',
      descripcion: 'CIERRE DE CARACTERIZACIÓN',
    })
  }, 60_000)

  afterAll(async () => {
    await limpiar()
    await db.$client.end()
  })

  it('conserva precio, descripción, despiece y opciones de la rama original', async () => {
    const resultado = await valorarEstructura(db, {
      codigo: ESTRUCTURA,
      serieCodigo: SERIE,
      anchoMm: 1200,
      altoMm: 1000,
      vidrioCodigo: null,
      varianteAcristalamiento: '2',
      acabadoCodigo: 'L',
      tarifa: 1,
      opcionesHerraje: [`${HERRAJE}|2`],
    })

    expect(resultado).toMatchObject({
      ok: true,
      descripcion: 'ESTRUCTURA DE CARACTERIZACIÓN',
      precioUnitario: 24,
      aviso: null,
      acristalamiento: [],
      opcionesHerraje: [{
        categoria: HERRAJE,
        opcionCodigo: '2',
        descripcion: 'CIERRE DE CARACTERIZACIÓN',
      }],
    })
    if (!resultado.ok) return
    expect(resultado.piezas).toEqual([expect.objectContaining({
      articuloCodigo: PERFIL,
      cantidad: '2',
      largoCorteMm: '1200',
      funcion: 'MV',
    })])
  })

  it('propaga acristalamiento y avisos, pero anula el subtotal parcial', async () => {
    const resultado = await valorarEstructura(db, {
      codigo: ESTRUCTURA,
      serieCodigo: SERIE,
      anchoMm: 1200,
      altoMm: 1000,
      vidrioCodigo: 'VIDRIO_CON_PROBLEMA',
      varianteAcristalamiento: '2',
      acabadoCodigo: 'L',
      tarifa: 1,
      opcionesHerraje: [],
    })

    expect(resultado).toMatchObject({
      ok: true,
      precioUnitario: null,
      aviso: 'Importe incompleto: vidrio sin valorar de caracterización.',
      acristalamiento: [{ slot: 1, vidrioHojas: 'VIDRIO_CON_PROBLEMA' }],
    })
    if (!resultado.ok) return
    expect(resultado.piezas.map((pieza) => pieza.articuloCodigo))
      .toEqual([PERFIL, 'VIDRIO_CON_PROBLEMA'])
  })

  it('mantiene los rechazos de estructura, medidas y serie como errores de campo', async () => {
    const base = {
      codigo: ESTRUCTURA,
      serieCodigo: SERIE,
      anchoMm: 1200,
      altoMm: 1000,
      vidrioCodigo: null,
      varianteAcristalamiento: '2' as const,
      acabadoCodigo: 'L',
      tarifa: 1,
      opcionesHerraje: [],
    }
    expect(await valorarEstructura(db, { ...base, codigo: 'NO_EXISTE' }))
      .toEqual({ ok: false, errores: { codigo: ['Estructura no encontrada'] } })
    expect(await valorarEstructura(db, { ...base, anchoMm: null }))
      .toEqual({ ok: false, errores: { anchoMm: ['Indica ancho y alto del hueco'] } })
    expect(await valorarEstructura(db, { ...base, serieCodigo: null }))
      .toEqual({ ok: false, errores: { serieCodigo: ['Indique Serie primero'] } })
  })
})
