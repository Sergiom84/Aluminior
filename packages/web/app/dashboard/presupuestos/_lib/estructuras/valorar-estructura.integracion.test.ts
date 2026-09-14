/**
 * Caracterización de la ruta económica de ESTRUCTURA contra PostgreSQL local.
 * El acristalamiento tiene sus propias 12 pruebas de integración; aquí se
 * sustituye por un resultado neutro para aislar perfiles, acabado y satélites.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { and, eq, inArray } from 'drizzle-orm'
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

  it('J01: un componente M2 sin superficie propaga incompleto hasta la estructura', async () => {
    await db.update(schema.articulos).set({ tipoMetraje: 'M2' })
      .where(eq(schema.articulos.codigo, PERFIL))
    try {
      const resultado = await valorarEstructura(db, {
        codigo: ESTRUCTURA, serieCodigo: SERIE, anchoMm: 1200, altoMm: 1000,
        vidrioCodigo: null, varianteAcristalamiento: '2', acabadoCodigo: 'L',
        tarifa: 1, opcionesHerraje: [],
      })
      expect(resultado).toMatchObject({ ok: true, precioUnitario: null })
      expect(resultado.ok && resultado.aviso).toContain('sin medidas suficientes')
    } finally {
      await db.update(schema.articulos).set({ tipoMetraje: 'ML' })
        .where(eq(schema.articulos.codigo, PERFIL))
    }
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

  describe('desempate del PVP por acabado (T.73)', () => {
    const base = {
      codigo: ESTRUCTURA,
      serieCodigo: SERIE,
      anchoMm: 1200,
      altoMm: 1000,
      vidrioCodigo: null,
      varianteAcristalamiento: '2' as const,
      tarifa: 1,
      opcionesHerraje: [],
    }
    /** Filas añadidas por un caso concreto, sobre las 'A' y 'L' del sembrado. */
    const conPvpExtra = async (
      filas: { acabadoCodigo: string; precio: string }[],
      caso: () => Promise<void>,
    ) => {
      await db.insert(schema.articulosPvp).values(
        filas.map((f) => ({ articuloCodigo: PERFIL, tarifa: 1, ...f })),
      )
      try {
        await caso()
      } finally {
        await db.delete(schema.articulosPvp)
          .where(and(
            eq(schema.articulosPvp.articuloCodigo, PERFIL),
            inArray(schema.articulosPvp.acabadoCodigo, filas.map((f) => f.acabadoCodigo)),
          ))
      }
    }

    it('un acabado sin fila propia NO cobra el precio de otro acabado', async () => {
      // Sembrado: 'A' = 99 y 'L' = 10, ninguno genérico. Antes de T.73 el
      // `ORDER BY ... acabado_codigo LIMIT 1` devolvía 99 —'A' es el primero—,
      // así que un acabado sin tarifa se facturaba al precio más caro de la
      // lista. Ahora la línea queda sin valorar.
      const r = await valorarEstructura(db, { ...base, acabadoCodigo: 'NO_TARIFADO' })

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.precioUnitario).toBeNull()
      expect(r.aviso).toMatch(/^Importe incompleto:/)
      // El despiece sí se calcula: lo que falta es el precio, no la geometría.
      expect(r.piezas).toHaveLength(1)
    })

    it('el genérico UNI resuelve cuando no hay acabado exacto', async () => {
      await conPvpExtra([{ acabadoCodigo: 'UNI', precio: '5.0000' }], async () => {
        const r = await valorarEstructura(db, { ...base, acabadoCodigo: 'NO_TARIFADO' })

        expect(r.ok).toBe(true)
        if (!r.ok) return
        // 2 piezas × 1,2 m × 5 €/ml. El 99 de 'A' sigue sin entrar.
        expect(r.precioUnitario).toBe(12)
        expect(r.aviso).toBeNull()
      })
    })

    it('el acabado exacto sigue ganando al genérico', async () => {
      await conPvpExtra([{ acabadoCodigo: 'UNI', precio: '5.0000' }], async () => {
        const r = await valorarEstructura(db, { ...base, acabadoCodigo: 'L' })

        expect(r.ok).toBe(true)
        if (!r.ok) return
        expect(r.precioUnitario).toBe(24) // 'L' = 10, no el genérico
      })
    })

    it('dos precios genéricos incompatibles bloquean y lo dicen', async () => {
      await conPvpExtra(
        [{ acabadoCodigo: 'UNI', precio: '5.0000' }, { acabadoCodigo: '*', precio: '7.0000' }],
        async () => {
          const r = await valorarEstructura(db, { ...base, acabadoCodigo: 'NO_TARIFADO' })

          expect(r.ok).toBe(true)
          if (!r.ok) return
          expect(r.precioUnitario).toBeNull()
          expect(r.aviso).toContain('con varios precios en la tarifa y ninguno aplicable al acabado')
          expect(r.aviso).toContain(PERFIL)
          // Y NO se cuenta ademas como ausente: son diagnosticos opuestos.
          expect(r.aviso).not.toContain('artículos sin precio en la tarifa')
        },
      )
    })

    it('un artículo ausente sí se cuenta como sin precio', () => {
      // El contraste del caso anterior: sin ambigüedad, el mensaje de ausencia
      // sigue emitiéndose. Si la resta de ambiguos se llevara por delante a los
      // ausentes, esta prueba caería.
      return valorarEstructura(db, { ...base, acabadoCodigo: 'NO_TARIFADO' })
        .then((r) => {
          expect(r.ok).toBe(true)
          if (!r.ok) return
          expect(r.aviso).toContain('artículos sin precio en la tarifa')
        })
    })

    it('una tarifa distinta no presta su precio', async () => {
      await conPvpExtra([{ acabadoCodigo: 'UNI', precio: '5.0000' }], async () => {
        const r = await valorarEstructura(db, { ...base, acabadoCodigo: 'L', tarifa: 2 })

        expect(r.ok).toBe(true)
        if (!r.ok) return
        expect(r.precioUnitario).toBeNull()
      })
    })
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
