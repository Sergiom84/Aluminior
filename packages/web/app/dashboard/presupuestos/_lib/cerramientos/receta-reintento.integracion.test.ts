import { afterAll, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { esquemaLinea } from '../lineas/esquema-linea.ts'
import { altaCerramientoValorado } from './alta-valorada.ts'
import { guardarLineaValorada } from '../lineas/guardar-linea.ts'
import { leerDocumentoOrigen } from '../copia/leer-origen.ts'
import { J04, sembrarCatalogoJ04 } from './catalogo-j04.fixture.ts'
import { recetaSeisModulos } from './receta-seis-modulos.fixture.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const rollback = new Error('rollback fixture de aceptación')
afterAll(() => db.$client.end())

describe('receta de seis módulos e identidad de alta', () => {
  it('reenvío conserva una GRUPO valorada con todos sus satélites; rollback permite reintentar', async () => {
    try { await db.transaction(async tx => {
      await sembrarCatalogoJ04(tx)
      const [p] = await tx.insert(schema.presupuestos).values({ numero: 989506, serie: 'QA-F1',
        fecha: '2026-09-20', nombreLibre: 'ACEPTACIÓN SINTÉTICA SEIS MÓDULOS', tarifa: J04.tarifa }).returning()
      const entrada = esquemaLinea.parse({ presupuestoId: p.id, solicitudId: randomUUID(),
        tipo: 'CERRAMIENTO', codigo: 'GRUPO', cantidad: 1, serieCodigo: J04.serie,
        vidrioCodigo: J04.vidrio, acabadoCodigo: J04.acabado, varianteAcristalamiento: '2',
        configuracionCerramiento: JSON.stringify(recetaSeisModulos()) })
      const solicitud = { id: entrada.solicitudId!, alRepetir: () => {} }
      await expect(guardarLineaValorada(tx, p.id, async () => { throw new Error('fallo recuperable') }, solicitud))
        .rejects.toThrow('fallo recuperable')
      expect(await tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, p.id))).toHaveLength(0)
      expect((await altaCerramientoValorado(tx, entrada)).ok).toBe(true)
      const antes = await leerDocumentoOrigen(tx, p.id)
      expect(antes!.lineas).toHaveLength(1)
      expect(antes!.lineas[0].linea).toMatchObject({ id: entrada.solicitudId, anchoMm: 6640,
        altoMm: 1020, cantidad: '1.00', valoracionCompleta: true })
      expect(antes!.lineas[0].cerramiento?.configuracion).toEqual(recetaSeisModulos())
      expect(antes!.lineas[0].resultadoCerramiento).not.toBeNull()
      expect(antes!.lineas[0].despiece.length).toBeGreaterThan(0)
      expect((await altaCerramientoValorado(tx, entrada)).ok).toBe(true)
      expect(await leerDocumentoOrigen(tx, p.id)).toEqual(antes)
      const [otro] = await tx.insert(schema.presupuestos).values({ numero: 989507, serie: 'QA-F1',
        fecha: '2026-09-20', nombreLibre: 'OTRO SINTÉTICO', tarifa: J04.tarifa }).returning()
      await expect(altaCerramientoValorado(tx, { ...entrada, presupuestoId: otro.id }))
        .rejects.toThrow('otro presupuesto')
      const incompleta = { ...entrada, solicitudId: randomUUID(), serieCodigo: null }
      expect((await altaCerramientoValorado(tx, incompleta)).ok).toBe(true)
      const despues = await leerDocumentoOrigen(tx, p.id)
      expect(despues!.lineas[1].linea).toMatchObject({ valoracionCompleta: false, precioUnitario: null })
      throw rollback
    }) } catch (error) { if (error !== rollback) throw error }
  })

  it('dos solicitudes concurrentes bajo cabecera producen una única línea', async () => {
    const [p] = await db.insert(schema.presupuestos).values({ numero: 989508, serie: 'QA-F1',
      fecha: '2026-09-20', nombreLibre: 'CONCURRENCIA SINTÉTICA F1', tarifa: 1 }).returning()
    try {
      const entrada = esquemaLinea.parse({ presupuestoId: p.id, solicitudId: randomUUID(),
        tipo: 'CERRAMIENTO', codigo: 'GRUPO', cantidad: 1,
        configuracionCerramiento: JSON.stringify(recetaSeisModulos()) })
      const resultados = await Promise.all([altaCerramientoValorado(db, entrada), altaCerramientoValorado(db, entrada)])
      expect(resultados.every(r => r.ok)).toBe(true)
      const documento = await leerDocumentoOrigen(db, p.id)
      expect(documento!.lineas).toHaveLength(1)
      expect(documento!.lineas[0].cerramiento?.configuracion).toEqual(recetaSeisModulos())
      expect(documento!.lineas[0].linea.valoracionCompleta).toBe(false)
    } finally { await db.delete(schema.presupuestos).where(eq(schema.presupuestos.id, p.id)) }
  })
})
