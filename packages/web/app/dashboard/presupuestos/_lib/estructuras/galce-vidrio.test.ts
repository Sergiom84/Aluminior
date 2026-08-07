/**
 * Lectura del delta de galce, contra el Postgres EFÍMERO en Docker.
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 *
 * Qué tabla corresponde al contexto y si el WHERE filtra por perfil de verdad
 * son reglas de SQL: un doble de cliente sólo probaría el doble. Aquí se
 * ejecuta la consulta real.
 *
 * Los datos son PROPIOS de la prueba, con códigos `ZZ*` que no existen en el
 * catálogo real, y se borran al terminar.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { leerGalceVidrio } from './galce-vidrio.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)

const SERIE = 'ZZGALCE'
const SERIE_SIN_PERFIL = 'ZZGALCE2'
const PERFIL_1 = 'ZZ-PERF-1'
const PERFIL_2 = 'ZZ-PERF-2'

describe('delta de galce del vidrio, contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>

  const limpiar = async () => {
    await db.delete(schema.vidrioGalce).where(eq(schema.vidrioGalce.serieCodigo, SERIE))
    await db.delete(schema.vidrioGalceFijo).where(eq(schema.vidrioGalceFijo.serieCodigo, SERIE))
    await db.delete(schema.vidrioGalce).where(eq(schema.vidrioGalce.serieCodigo, SERIE_SIN_PERFIL))
  }

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()

    // Misma serie/perfil en AMBAS tablas, con deltas DISTINTOS: cada contexto
    // debe leer la suya, no confundirlas.
    await db.insert(schema.vidrioGalce).values([
      { serieCodigo: SERIE, perfilCodigo: PERFIL_1, deltaMm: '12.5', muestras: 5 },
      { serieCodigo: SERIE, perfilCodigo: PERFIL_2, deltaMm: '20', muestras: 3 },
    ])
    await db.insert(schema.vidrioGalceFijo).values({
      serieCodigo: SERIE, perfilCodigo: PERFIL_1, deltaMm: '30.25', muestras: 4,
    })
    // Serie con un único perfil sembrado, para probar "perfil inexistente".
    await db.insert(schema.vidrioGalce).values({
      serieCodigo: SERIE_SIN_PERFIL, perfilCodigo: PERFIL_1, deltaMm: '7', muestras: 3,
    })
  })

  afterAll(async () => {
    await limpiar()
    await db.$client.end({ timeout: 5 })
  })

  it('HOJA lee de vidrio_galce', async () => {
    const delta = await leerGalceVidrio(db, 'HOJA', SERIE, PERFIL_1)
    expect(delta).toBe(12.5)
  })

  it('FIJO lee de vidrio_galce_fijo, con un delta distinto al de HOJA', async () => {
    const delta = await leerGalceVidrio(db, 'FIJO', SERIE, PERFIL_1)
    expect(delta).toBe(30.25)
  })

  it('serie inexistente devuelve null', async () => {
    const delta = await leerGalceVidrio(db, 'HOJA', 'ZZNOEXISTE', PERFIL_1)
    expect(delta).toBeNull()
  })

  it('perfil inexistente en una serie con otro perfil sembrado devuelve null', async () => {
    const delta = await leerGalceVidrio(db, 'HOJA', SERIE_SIN_PERFIL, PERFIL_2)
    expect(delta).toBeNull()
  })

  it('el WHERE filtra por perfil de verdad: pedir el primero no trae el segundo', async () => {
    const delta = await leerGalceVidrio(db, 'HOJA', SERIE, PERFIL_1)
    expect(delta).toBe(12.5)
    expect(delta).not.toBe(20)
  })
})
