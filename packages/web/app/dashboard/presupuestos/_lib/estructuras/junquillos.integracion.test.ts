/**
 * Selección de la tabla de acristalamiento y de su fila, contra el Postgres
 * EFÍMERO en Docker.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 *
 * Estas tres reglas viven en SQL —qué tabla corresponde al alojamiento, qué
 * fila gana para el grosor del vidrio y de qué tabla sale el ajuste— y un doble
 * de cliente sólo probaría el doble. Aquí se ejecuta la consulta de verdad.
 *
 * Los datos son PROPIOS de la prueba, con códigos `ZZ*` que no existen en el
 * catálogo real, y se borran al terminar. No dependen de que la base tenga
 * cargada ninguna serie concreta.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { piezasAcristalamiento, type CristalAcris } from './junquillos.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)

const SERIE = 'ZZJUNQ'
const TABLA_HOJAS = 'ZZTABH'
const TABLA_FIJOS = 'ZZTABF'

const cristal = (extra: Partial<CristalAcris> = {}): CristalAcris => ({
  slot: 1,
  contexto: 'HOJA',
  largoMm: 1000,
  anchoMm: 500,
  moduloLargoMm: 1100,
  moduloAnchoMm: 600,
  ...extra,
})

/** Artículo y largo de cada pieza, que es lo que estas pruebas distinguen. */
const resumen = (piezas: { articuloCodigo: string; largoMm: number | null }[]) =>
  piezas.map((p) => [p.articuloCodigo, p.largoMm])

describe('tabla y fila de acristalamiento, contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>

  const limpiar = async () => {
    await db.delete(schema.tacrisFilas)
      .where(inArray(schema.tacrisFilas.tabla, [TABLA_HOJAS, TABLA_FIJOS]))
    await db.delete(schema.junquilloAjustes)
      .where(eq(schema.junquilloAjustes.serieCodigo, SERIE))
    await db.delete(schema.junquilloAjustesFijo)
      .where(eq(schema.junquilloAjustesFijo.serieCodigo, SERIE))
    await db.delete(schema.conjuntos).where(eq(schema.conjuntos.codigo, SERIE))
  }

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()

    await db.insert(schema.conjuntos).values({
      codigo: SERIE, serieCodigo: SERIE,
      tablaHojas: TABLA_HOJAS, tablaFijos: TABLA_FIJOS,
    })
    // Tres grosores por tabla. El vidrio elige el MENOR que lo alcanza.
    await db.insert(schema.tacrisFilas).values([
      { tabla: TABLA_HOJAS, grosor: '4', junquillo: 'ZZJ-H4', juntaExterior: 'ZZE-H4', juntaInterior: null },
      { tabla: TABLA_HOJAS, grosor: '6', junquillo: 'ZZJ-H6', juntaExterior: 'ZZE-H6', juntaInterior: null },
      { tabla: TABLA_HOJAS, grosor: '8', junquillo: 'ZZJ-H8', juntaExterior: 'ZZE-H8', juntaInterior: null },
      { tabla: TABLA_FIJOS, grosor: '6', junquillo: 'ZZJ-F6', juntaExterior: 'ZZE-F6', juntaInterior: null },
    ])
    // Ajustes distintos para hoja y fijo, como ELEGANTPVC (−28/+16 y −50/0).
    await db.insert(schema.junquilloAjustes).values({
      serieCodigo: SERIE, ajusteLargoMm: '-28', ajusteAnchoMm: '16', muestras: 9,
    })
    await db.insert(schema.junquilloAjustesFijo).values({
      serieCodigo: SERIE, ajusteLargoMm: '-50', ajusteAnchoMm: '0', muestras: 9,
    })
  })

  afterAll(async () => {
    await limpiar()
    await db.$client.end({ timeout: 5 })
  })

  const resolver = (tamJunquillo: number, cristales: CristalAcris[], serie = SERIE) =>
    piezasAcristalamiento(db, { serieCodigo: serie, tamJunquillo, cristales })

  it('elige el menor grosor que alcanza el del vidrio', async () => {
    const { piezas } = await resolver(5, [cristal()])
    expect(piezas.map((p) => p.articuloCodigo)).toEqual(['ZZE-H6', 'ZZE-H6', 'ZZJ-H6', 'ZZJ-H6'])
  })

  it('el grosor exacto vale: la comparación incluye el igual', async () => {
    const { piezas } = await resolver(4, [cristal()])
    expect(piezas[0].articuloCodigo).toBe('ZZE-H4')
  })

  it('sin fila que alcance el grosor, la ranura avisa y no produce piezas', async () => {
    const { piezas, avisos } = await resolver(9, [cristal({ slot: 2 })])
    expect(piezas).toEqual([])
    expect(avisos).toEqual(['ranura 2: sin tabla de acristalamiento aplicable'])
  })

  // Sin `TamJunqGoma` no se consulta nada: no se puede elegir fila a ojo.
  it('un grosor desconocido (0) no elige ninguna fila', async () => {
    const { piezas, avisos } = await resolver(0, [cristal()])
    expect(piezas).toEqual([])
    expect(avisos).toEqual(['ranura 1: sin tabla de acristalamiento aplicable'])
  })

  // HOJA -> TablaHojas + junquillo_ajustes; FIJO -> TablaFijos + los de fijo.
  // Confundirlas cambia el artículo Y el corte.
  it('cada alojamiento usa su tabla y su ajuste', async () => {
    const hoja = await resolver(6, [cristal({ contexto: 'HOJA' })])
    expect(resumen(hoja.piezas)).toEqual([
      ['ZZE-H6', 1100], ['ZZE-H6', 600],
      ['ZZJ-H6', 972], ['ZZJ-H6', 516],
    ])

    const fijo = await resolver(6, [cristal({ contexto: 'FIJO' })])
    expect(resumen(fijo.piezas)).toEqual([
      ['ZZE-F6', 1100], ['ZZE-F6', 600],
      ['ZZJ-F6', 950], ['ZZJ-F6', 500],
    ])
  })

  it('una serie sin conjunto no tiene tablas: avisa por cada ranura', async () => {
    const { piezas, avisos } = await resolver(
      6, [cristal({ slot: 1 }), cristal({ slot: 2 })], 'ZZNOEXISTE',
    )
    expect(piezas).toEqual([])
    expect(avisos).toEqual([
      'ranura 1: sin tabla de acristalamiento aplicable',
      'ranura 2: sin tabla de acristalamiento aplicable',
    ])
  })

  it('varias ranuras conservan el orden de piezas y de avisos', async () => {
    const { piezas, avisos } = await resolver(6, [
      cristal({ slot: 1, contexto: 'HOJA' }),
      cristal({ slot: 2, contexto: 'FIJO', largoMm: 800, anchoMm: 400, moduloLargoMm: 900, moduloAnchoMm: 500 }),
    ])
    expect(resumen(piezas)).toEqual([
      ['ZZE-H6', 1100], ['ZZE-H6', 600], ['ZZJ-H6', 972], ['ZZJ-H6', 516],
      ['ZZE-F6', 900], ['ZZE-F6', 500], ['ZZJ-F6', 750], ['ZZJ-F6', 400],
    ])
    expect(avisos).toEqual([])
  })

  it('sin ajuste medido se pierden los junquillos, no las juntas', async () => {
    await db.delete(schema.junquilloAjustes)
      .where(eq(schema.junquilloAjustes.serieCodigo, SERIE))
    try {
      const { piezas, avisos } = await resolver(6, [cristal({ slot: 4 })])
      expect(resumen(piezas)).toEqual([['ZZE-H6', 1100], ['ZZE-H6', 600]])
      expect(avisos).toEqual(['ranura 4: sin ajuste medido de junquillo hoja'])
    } finally {
      await db.insert(schema.junquilloAjustes).values({
        serieCodigo: SERIE, ajusteLargoMm: '-28', ajusteAnchoMm: '16', muestras: 9,
      })
    }
  })
})
