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
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { resolverValoracionVidrio } from './valoracion-vidrio.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)

const VIDRIO = 'ZZVID1'
const PROVEEDOR = 'ZZPROV'

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

  const limpiar = async () => {
    await db.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, VIDRIO))
    await db.delete(schema.articulosCoste).where(eq(schema.articulosCoste.articuloCodigo, VIDRIO))
    await db.delete(schema.articulos).where(eq(schema.articulos.codigo, VIDRIO))
  }

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()
    await db.insert(schema.articulos).values({ codigo: VIDRIO, descripcion: 'Vidrio de prueba ZZ' })
  })

  afterAll(async () => {
    await limpiar()
    await db.$client.end({ timeout: 5 })
  })

  describe('PVP: desempate por acabado', () => {
    afterAll(async () => {
      await db.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, VIDRIO))
    })

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
      await db.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, VIDRIO))
      await db.insert(schema.articulosPvp).values([
        { articuloCodigo: VIDRIO, acabadoCodigo: 'AAA', tarifa: 1, precio: '10.0000' },
        { articuloCodigo: VIDRIO, acabadoCodigo: '*', tarifa: 1, precio: '20.0000' },
      ])

      const r = await resolverValoracionVidrio(db, entradaBase)

      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.importe).toBeCloseTo(0.5 * 20, 10)
    })
  })

  describe('coste: mismo desempate por acabado', () => {
    beforeAll(async () => {
      await db.insert(schema.articulosPvp).values(
        { articuloCodigo: VIDRIO, acabadoCodigo: 'BLA', tarifa: 1, precio: '30.0000' },
      )
    })
    afterAll(async () => {
      await db.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, VIDRIO))
      await db.delete(schema.articulosCoste).where(eq(schema.articulosCoste.articuloCodigo, VIDRIO))
    })

    it('gana el acabado exacto de la línea sobre el comodín, coste incluido', async () => {
      // proveedorCodigo fijo en las tres filas: no es parte del desempate actual
      // y variarlo introduciría una ambigüedad que el código no contempla.
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
  })

  describe('tarifa: sólo se lee la tarifa pedida', () => {
    afterAll(async () => {
      await db.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, VIDRIO))
    })

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
