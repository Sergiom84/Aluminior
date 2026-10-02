import { afterAll, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { catalogoDespieceCargado } from './cargado.ts'
import { leerCatalogoLinea } from './leer-catalogo.ts'
import { prepararCortesCatalogo } from '../cortes-catalogo.ts'
import { TABLAS_MOTOR_CATALOGO } from './disponible.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const rollback = new Error('rollback del ensayo sin la migración del motor')
afterAll(() => db.$client.end({ timeout: 5 }))

// Una base migrada solo hasta 0022_catalogo_diseno, como Supabase antes de la 0023.
describe('motor de catálogo sin su migración', () => {
  it('degrada a la vía anterior sin abortar la transacción', async () => {
    await expect(db.transaction(async tx => {
      for (const tabla of TABLAS_MOTOR_CATALOGO) await tx.execute(sql.raw(`drop table "${tabla}" cascade`))

      expect(await catalogoDespieceCargado(tx)).toBe(false)
      expect(await leerCatalogoLinea(tx, { estructura: 'C2', serie: 'GMC400', vidrio: null, tarifa: 1 })).toBeNull()
      expect(await prepararCortesCatalogo(tx, { codigo: 'C2', serieCodigo: 'GMC400', anchoMm: 1500, altoMm: 1200 }, {}))
        .toBeUndefined()
      // La transacción sigue utilizable: ninguna consulta anterior falló.
      await tx.select().from(schema.estructuras).limit(1)
      throw rollback
    })).rejects.toBe(rollback)
  })

  it('reconoce la base migrada', async () => {
    expect(await catalogoDespieceCargado(db)).toBe(false)
    await expect(db.transaction(async tx => {
      await tx.insert(schema.conjuntoParametrosDespiece).values({ conjuntoCodigo: 'QA-SERIE', herrajes: {}, manoObra: {}, grosorMaximoSimple: '0', grosorMaximoDoble: '0' })
      expect(await catalogoDespieceCargado(tx)).toBe(true)
      throw rollback
    })).rejects.toBe(rollback)
  })
})
