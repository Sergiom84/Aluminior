/**
 * Caracterización del SQL real de la valoración de vidrio, contra el Postgres
 * EFÍMERO en Docker.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 *
 * `valoracion-vidrio.test.ts` prueba `resolverValoracionVidrio` con un doble de
 * cliente que devuelve filas fijas por orden de llamada: no ejercita el WHERE
 * por tarifa/artículo/acabado ni el ORDER BY de desempate reales. Aquí se
 * ejecuta la consulta de verdad, con datos propios de códigos `ZZ*` que no
 * existen en el catálogo real y se borran al terminar.
 *
 * NO se cambia la política de desempate (acabado exacto DESC, comodín `*`
 * DESC, alfabético) declarada en `valoracion-vidrio.ts`: sólo se demuestra.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { resolverValoracionVidrio } from './valoracion-vidrio.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)

const VIDRIO = 'ZZVID1'
/** Segundo artículo, con datos que ganarían el desempate si el WHERE por
 * artículo no filtrara — sirve para demostrar que sí filtra. */
const SENUELO = 'ZZVID2'
const PROVEEDOR = 'ZZPROV'
const CODIGOS = [VIDRIO, SENUELO]

const REGLAS = { metrajeMinimo: 0.5, multiploLargoCm: 1, multiploAnchoCm: 1 }

const entradaBase = {
  vidrioCodigo: VIDRIO,
  cristales: [{ largoMm: 1000, anchoMm: 500, cantidad: 1 }],
  reglasMetraje: REGLAS,
  tarifa: 1,
  acabadoCodigo: 'BLA',
}

describe('valoración del vidrio, SQL real contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>

  const limpiarFilas = async () => {
    await db.delete(schema.articulosPvp).where(inArray(schema.articulosPvp.articuloCodigo, CODIGOS))
    await db.delete(schema.articulosCoste).where(inArray(schema.articulosCoste.articuloCodigo, CODIGOS))
  }
  const limpiar = async () => {
    await limpiarFilas()
    await db.delete(schema.articulos).where(inArray(schema.articulos.codigo, CODIGOS))
  }

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()
    await db.insert(schema.articulos).values([
      { codigo: VIDRIO, descripcion: 'Vidrio de prueba ZZ' },
      { codigo: SENUELO, descripcion: 'Vidrio señuelo ZZ' },
    ])
  })

  afterAll(async () => {
    await limpiar()
    await db.$client.end({ timeout: 5 })
  })

  // Cada prueba siembra sus propias filas y las retira: comparten artículo y
  // tarifa entre describes, y una fila que sobreviviera contaminaría el
  // desempate de la siguiente.
  afterEach(limpiarFilas)

  describe('PVP: desempate por acabado', () => {
    it('gana el acabado exacto de la línea sobre el comodín y sobre el resto', async () => {
      await db.insert(schema.articulosPvp).values([
        { articuloCodigo: VIDRIO, acabadoCodigo: 'AAA', tarifa: 1, precio: '10.0000' },
        { articuloCodigo: VIDRIO, acabadoCodigo: '*', tarifa: 1, precio: '20.0000' },
        { articuloCodigo: VIDRIO, acabadoCodigo: 'BLA', tarifa: 1, precio: '30.0000' },
      ])

      const r = await resolverValoracionVidrio(db, entradaBase)

      expect(r.ok).toBe(true)
      if (!r.ok) return
      // precioM2 = 30 (BLA exacto); metraje de 1000x500 con REGLAS.
      expect(r.importe).toBeCloseTo(0.5 * 30, 10)
    })

    it('sin el acabado exacto pero con comodín: gana el comodín', async () => {
      await db.insert(schema.articulosPvp).values([
        { articuloCodigo: VIDRIO, acabadoCodigo: 'AAA', tarifa: 1, precio: '10.0000' },
        { articuloCodigo: VIDRIO, acabadoCodigo: '*', tarifa: 1, precio: '20.0000' },
      ])

      const r = await resolverValoracionVidrio(db, entradaBase)

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.importe).toBeCloseTo(0.5 * 20, 10)
    })

    it('sin exacto ni comodín: gana el primero por orden alfabético', async () => {
      // Ninguno de los dos casa con 'BLA' ni es '*': sólo queda el desempate
      // alfabético (ORDER BY ... acabado_codigo, ASC por defecto).
      await db.insert(schema.articulosPvp).values([
        { articuloCodigo: VIDRIO, acabadoCodigo: 'CCC', tarifa: 1, precio: '9.0000' },
        { articuloCodigo: VIDRIO, acabadoCodigo: 'BBB', tarifa: 1, precio: '7.0000' },
      ])

      const r = await resolverValoracionVidrio(db, entradaBase)

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.importe).toBeCloseTo(0.5 * 7, 10)
    })

    it('el comodín gana con prioridad explícita, aunque un acabado le preceda alfabéticamente', async () => {
      // '!ZZ' (0x21) es alfabéticamente ANTERIOR a '*' (0x2A). Si el desempate
      // dependiera sólo del orden alfabético, '!ZZ' ganaría; la cláusula
      // `(acabado_codigo = '*') DESC` es la que hace ganar al comodín.
      await db.insert(schema.articulosPvp).values([
        { articuloCodigo: VIDRIO, acabadoCodigo: '!ZZ', tarifa: 1, precio: '3.0000' },
        { articuloCodigo: VIDRIO, acabadoCodigo: '*', tarifa: 1, precio: '4.0000' },
      ])

      // Acabado sin fila exacta, para que sólo compitan comodín y alfabético.
      const r = await resolverValoracionVidrio(db, { ...entradaBase, acabadoCodigo: 'ZZZNOEXISTE' })

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.importe).toBeCloseTo(0.5 * 4, 10)
    })

    it('acabadoCodigo null no rompe la consulta y cae al comodín', async () => {
      await db.insert(schema.articulosPvp).values([
        { articuloCodigo: VIDRIO, acabadoCodigo: 'AAA', tarifa: 1, precio: '2.0000' },
        { articuloCodigo: VIDRIO, acabadoCodigo: '*', tarifa: 1, precio: '6.0000' },
      ])

      const r = await resolverValoracionVidrio(db, { ...entradaBase, acabadoCodigo: null })

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.importe).toBeCloseTo(0.5 * 6, 10)
    })
  })

  describe('coste: mismo desempate, probado por separado', () => {
    // `resolverValoracionVidrio` sólo lee coste si ya hay PVP: una fila BLA
    // exacta y sin ambigüedad en todas las pruebas de este bloque.
    const conPvp = async () => {
      await db.insert(schema.articulosPvp).values(
        { articuloCodigo: VIDRIO, acabadoCodigo: 'BLA', tarifa: 1, precio: '30.0000' },
      )
    }

    it('exacto: gana el acabado de la línea sobre el comodín y el resto', async () => {
      await conPvp()
      await db.insert(schema.articulosCoste).values([
        { articuloCodigo: VIDRIO, proveedorCodigo: PROVEEDOR, acabadoCodigo: 'AAA', coste: '5.0000' },
        { articuloCodigo: VIDRIO, proveedorCodigo: PROVEEDOR, acabadoCodigo: '*', coste: '8.0000' },
        { articuloCodigo: VIDRIO, proveedorCodigo: PROVEEDOR, acabadoCodigo: 'BLA', coste: '12.0000' },
      ])

      const r = await resolverValoracionVidrio(db, entradaBase)

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.piezas[0].costeUnitario).toBe('12')
    })

    it('comodín: gana sin fila exacta', async () => {
      await conPvp()
      await db.insert(schema.articulosCoste).values([
        { articuloCodigo: VIDRIO, proveedorCodigo: PROVEEDOR, acabadoCodigo: 'AAA', coste: '5.0000' },
        { articuloCodigo: VIDRIO, proveedorCodigo: PROVEEDOR, acabadoCodigo: '*', coste: '8.0000' },
      ])

      const r = await resolverValoracionVidrio(db, entradaBase)

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.piezas[0].costeUnitario).toBe('8')
    })

    it('fallback alfabético: gana el primero sin exacto ni comodín', async () => {
      await conPvp()
      await db.insert(schema.articulosCoste).values([
        { articuloCodigo: VIDRIO, proveedorCodigo: PROVEEDOR, acabadoCodigo: 'CCC', coste: '9.0000' },
        { articuloCodigo: VIDRIO, proveedorCodigo: PROVEEDOR, acabadoCodigo: 'BBB', coste: '7.0000' },
      ])

      const r = await resolverValoracionVidrio(db, entradaBase)

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.piezas[0].costeUnitario).toBe('7')
    })
  })

  describe('aislamiento por artículo', () => {
    it('el señuelo con filas más prioritarias no afecta a PVP ni a coste', async () => {
      // El señuelo tiene acabado EXACTO ('BLA') en ambas tablas, que ganaría
      // el desempate si el WHERE por artículo no filtrara. El vidrio real
      // sólo tiene un acabado que no es exacto ni comodín (fallback).
      await db.insert(schema.articulosPvp).values([
        { articuloCodigo: VIDRIO, acabadoCodigo: 'AAA', tarifa: 1, precio: '10.0000' },
        { articuloCodigo: SENUELO, acabadoCodigo: 'BLA', tarifa: 1, precio: '777.0000' },
      ])
      await db.insert(schema.articulosCoste).values([
        { articuloCodigo: VIDRIO, proveedorCodigo: PROVEEDOR, acabadoCodigo: 'AAA', coste: '5.0000' },
        { articuloCodigo: SENUELO, proveedorCodigo: PROVEEDOR, acabadoCodigo: 'BLA', coste: '777.0000' },
      ])

      const r = await resolverValoracionVidrio(db, entradaBase)

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.importe).toBeCloseTo(0.5 * 10, 10)
      expect(r.piezas[0].costeUnitario).toBe('5')
    })
  })

  describe('tarifa: sólo se lee la tarifa pedida', () => {
    it('el mismo artículo/acabado en otra tarifa no se lee', async () => {
      await db.insert(schema.articulosPvp).values([
        { articuloCodigo: VIDRIO, acabadoCodigo: 'BLA', tarifa: 1, precio: '30.0000' },
        { articuloCodigo: VIDRIO, acabadoCodigo: 'BLA', tarifa: 2, precio: '999.0000' },
      ])

      const r = await resolverValoracionVidrio(db, entradaBase)

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.importe).toBeCloseTo(0.5 * 30, 10)
    })

    it('sólo existe la tarifa 2: pedir la tarifa 1 da ok:false', async () => {
      await db.insert(schema.articulosPvp).values(
        { articuloCodigo: VIDRIO, acabadoCodigo: 'BLA', tarifa: 2, precio: '50.0000' },
      )

      const r = await resolverValoracionVidrio(db, entradaBase) // entradaBase pide tarifa 1

      expect(r).toEqual({
        ok: false,
        aviso: `vidrio sin valorar: ${VIDRIO} no tiene precio en la tarifa 1`,
      })
    })
  })

  describe('sin PVP en la tarifa', () => {
    it('ok:false con el aviso literal, contra datos reales', async () => {
      const r = await resolverValoracionVidrio(db, entradaBase)

      expect(r).toEqual({
        ok: false,
        aviso: `vidrio sin valorar: ${VIDRIO} no tiene precio en la tarifa 1`,
      })
    })
  })
})
