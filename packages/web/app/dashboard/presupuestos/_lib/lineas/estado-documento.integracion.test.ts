import { afterAll, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { borrarLineaDePresupuesto } from './borrar-linea.ts'
import { guardarLinea, guardarLineaValorada } from './guardar-linea.ts'
import { actualizarCerramiento } from '../cerramientos/editar-cerramiento.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const rollback = new Error('rollback sintético de estado documental')
afterAll(() => db.$client.end({ timeout: 5 }))

describe('el estado del presupuesto se comprueba dentro de la transacción', () => {
  it.each(['ACEPTADO', 'RECHAZADO', 'ANULADO'] as const)('protege las líneas de un presupuesto %s', async estado => {
    try {
      await db.transaction(async tx => {
        const [p] = await tx.insert(schema.presupuestos).values({ numero: 989519, serie: 'QA-EST',
          revision: 0, fecha: '2026-10-09', nombreLibre: 'QA estado reversible', tarifa: 1, estado,
          subtotal: '20', total: '24.20', cuotaIva: '4.20', baseImponible: '20' }).returning()
        const [l] = await tx.insert(schema.lineas).values({ presupuestoId: p!.id, orden: 1,
          tipo: 'CERRAMIENTO', descripcion: 'GRUPO sintético', cantidad: '1', precioUnitario: '20', total: '20',
        }).returning()
        const configuracion = { version: 1,
          modulos: [{ id: 'm1', estructuraCodigo: '0', anchoMm: 1000, altoMm: 1200 }], uniones: [] }
        await tx.insert(schema.lineasCerramiento).values({ lineaId: l!.id, configuracion })
        const editar = await actualizarCerramiento(tx, { presupuestoId: p!.id, lineaId: l!.id,
          configuracionSerializada: JSON.stringify(configuracion), serieCodigo: null, vidrioCodigo: null,
          acabadoCodigo: null, varianteAcristalamiento: '1', referencia: null, cantidad: 2,
          horasFabricacion: '0', horasColocacion: '0' })
        expect(editar).toMatchObject({ ok: false, mensaje: 'Sólo se puede editar un presupuesto pendiente' })
        expect(await borrarLineaDePresupuesto(tx as unknown as Parameters<typeof borrarLineaDePresupuesto>[0], l!.id, p!.id))
          .toMatchObject({ ok: false, mensaje: 'Sólo se pueden borrar líneas de un presupuesto pendiente' })
        await expect(guardarLinea(tx, { tipo: 'ARTICULO', valores: {
          presupuestoId: p!.id, descripcion: 'Artículo nuevo', cantidad: '1', precioUnitario: '10', total: '10',
        } })).rejects.toThrow('Sólo se pueden añadir líneas a un presupuesto pendiente')
        const preparar = vi.fn()
        await expect(guardarLineaValorada(tx, p!.id, preparar))
          .rejects.toThrow('Sólo se pueden añadir líneas a un presupuesto pendiente')
        expect(preparar).not.toHaveBeenCalled()
        expect(await tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, p!.id))).toEqual([l])
        expect(await tx.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, p!.id))).toEqual([p])
        expect(await tx.select().from(schema.lineasCerramiento).where(eq(schema.lineasCerramiento.lineaId, l!.id))).toHaveLength(1)
        throw rollback
      })
    } catch (e) { if (e !== rollback) throw e }
  })
})
