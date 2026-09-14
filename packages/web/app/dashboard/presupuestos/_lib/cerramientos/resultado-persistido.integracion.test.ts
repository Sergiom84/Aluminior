import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { snapshotSintetico } from '../../../../../../core/src/estructuras/resultado-cerramiento/snapshot.fixture.ts'
import { leerResultadoCerramiento, persistirResultadoCerramiento } from './resultado-persistido.ts'

describe('persistencia J03 de snapshot por origen, PostgreSQL real', () => {
  const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
  let presupuestoId: string
  let lineaId: string
  beforeAll(async () => {
    const [p] = await db.insert(schema.presupuestos).values({ numero: 930003, serie: 'J03',
      fecha: '2026-09-08', nombreLibre: 'QA SNAPSHOT J03', tarifa: 1 }).returning()
    presupuestoId = p.id
    const [l] = await db.insert(schema.lineas).values({ presupuestoId, orden: 1,
      tipo: 'CERRAMIENTO', descripcion: 'QA J03', cantidad: '2' }).returning()
    lineaId = l.id
    await db.insert(schema.lineasCerramiento).values({ lineaId,
      configuracion: { ...snapshotSintetico().configuracion } })
  })
  afterAll(async () => {
    try { if (presupuestoId) await db.delete(schema.presupuestos).where(eq(schema.presupuestos.id, presupuestoId)) }
    finally { await db.$client.end({ timeout: 5 }) }
  })
  it('lee ausencia anterior; guarda y recarga sin perder duplicados entre orígenes', async () => {
    expect(await leerResultadoCerramiento(db, lineaId)).toBeNull()
    const s = snapshotSintetico()
    await persistirResultadoCerramiento(db, lineaId, s)
    expect(await leerResultadoCerramiento(db, lineaId)).toEqual(s)
    await db.insert(schema.lineasDespiece).values(s.origenes.flatMap(o => o.piezas.map(p => ({
      lineaId, articuloCodigo: p.articuloCodigo, cantidad: p.cantidad,
      origenTipo: o.origen.tipo, origenId: o.origen.id, origenOrdinal: p.ordinal,
    }))))
    const piezas = await db.select().from(schema.lineasDespiece).where(eq(schema.lineasDespiece.lineaId, lineaId))
    expect(piezas).toHaveLength(3)
    expect(piezas.map(p => p.origenId).sort()).toEqual(['modulo-1', 'modulo-2', 'union-1'])
  })
  it('rechaza configuración valorada que difiere de la guardada sin sustituir snapshot', async () => {
    const anterior = await leerResultadoCerramiento(db, lineaId)
    const s = snapshotSintetico()
    s.configuracion.modulos[0].anchoMm = 1100
    await expect(persistirResultadoCerramiento(db, lineaId, s)).rejects.toThrow('no coincide')
    expect(await leerResultadoCerramiento(db, lineaId)).toEqual(anterior)
  })
  it.each(['EXACTO_SIN_ACABADO', 'ORDINAL_FUERA_INTEGER'] as const)(
    'rechaza %s antes de escritura y conserva snapshot anterior', async defecto => {
      const anterior = await leerResultadoCerramiento(db, lineaId)
      expect(anterior).not.toBeNull()
      const s = snapshotSintetico()
      if (defecto === 'EXACTO_SIN_ACABADO') s.origenes[0].partidasValoracion[0].acabadoCodigo = null
      else s.origenes[0].piezas[0].ordinal = 2147483648
      await expect(persistirResultadoCerramiento(db, lineaId, s)).rejects.toThrow('no válido')
      expect(await leerResultadoCerramiento(db, lineaId)).toEqual(anterior)
    },
  )
  it('rechaza duplicado de identidad y origen parcial por constraints reales', async () => {
    await expect(db.insert(schema.lineasDespiece).values({ lineaId, articuloCodigo: 'QA-PERFIL',
      cantidad: '1', origenTipo: 'MODULO', origenId: 'modulo-1', origenOrdinal: 0 }))
      .rejects.toMatchObject({ cause: { code: '23505', constraint_name: 'despiece_origen_uq' } })
    await expect(db.insert(schema.lineasDespiece).values({ lineaId, articuloCodigo: 'QA-PERFIL',
      cantidad: '1', origenTipo: 'MODULO' }))
      .rejects.toMatchObject({ cause: { code: '23514', constraint_name: 'despiece_origen_check' } })
  })
  it('permite varias piezas anteriores con procedencia null sin inventarla', async () => {
    await db.insert(schema.lineasDespiece).values([1, 2].map(() => ({ lineaId,
      articuloCodigo: 'QA-ANTERIOR', cantidad: '1' })))
    const antiguas = await db.select().from(schema.lineasDespiece)
      .where(eq(schema.lineasDespiece.articuloCodigo, 'QA-ANTERIOR'))
    expect(antiguas).toHaveLength(2)
    expect(antiguas.every(p => p.origenTipo === null && p.origenId === null && p.origenOrdinal === null)).toBe(true)
  })
  it.each([{}, { version: null }, { version: '1' }, { version: 2 }])(
    'SQL rechaza versión JSON ausente, nula, textual o incoherente: %j', async resultado => {
      await expect(db.execute(sql`UPDATE lineas_cerramiento_resultados
        SET resultado = ${JSON.stringify(resultado)}::jsonb WHERE linea_id = ${lineaId}`))
        .rejects.toMatchObject({ cause: { code: '23514', constraint_name: 'cerramiento_resultado_json_check' } })
    },
  )
  it('lectura de JSON corrupto no lo presenta como documento antiguo sin snapshot', async () => {
    const original = await leerResultadoCerramiento(db, lineaId)
    try {
      await db.execute(sql`UPDATE lineas_cerramiento_resultados SET resultado = '{"version":1}'::jsonb WHERE linea_id = ${lineaId}`)
      await expect(leerResultadoCerramiento(db, lineaId)).rejects.toThrow('no válido')
    } finally { await persistirResultadoCerramiento(db, lineaId, original) }
  })
  it('FK impide snapshot de línea ajena inexistente', async () => {
    await expect(db.insert(schema.lineasCerramientoResultados).values({
      lineaId: '11111111-1111-4111-8111-111111111111', version: 1, resultado: snapshotSintetico(),
    })).rejects.toMatchObject({ cause: { code: '23503' } })
  })
})
