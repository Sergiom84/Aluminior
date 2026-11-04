import { afterAll, describe, expect, it } from 'vitest'
import { eq, inArray } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import {
  crearConfiguracionCerramiento, insertarModuloEnAnclaje, moduloDesdePlantilla, plantillaDiseno,
  type ConfiguracionCerramiento,
} from '@aluminior/core/estructuras'
import { esquemaLinea } from '../lineas/esquema-linea.ts'
import { altaCerramientoValorado } from './alta-valorada.ts'
import { actualizarCerramiento } from './editar-cerramiento.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
const rollback = new Error('rollback sintético de aceptación VA1')
afterAll(() => db.$client.end())

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
const materiales = {
  serieCodigo: 'QA-VA1-SERIE', vidrioCodigo: 'QA-VA1-VIDRIO', acabadoCodigo: 'QA-VA1-ACABADO',
}
const elemento = () => crearConfiguracionCerramiento(plantillaDiseno('2O')!)
const conUnionVacia = () => {
  const compuesto = insertarModuloEnAnclaje(elemento(), moduloDesdePlantilla(plantillaDiseno('0')!),
    { moduloId: 'modulo-1', lado: 'derecha' })
  return {
    ...compuesto,
    uniones: compuesto.uniones.map((union) => ({ ...union, codigo: '' })),
  }
}

async function documento(tx: Tx) {
  const [p] = await tx.insert(schema.presupuestos).values({ numero: 989541, serie: 'QA-VA1',
    revision: 0, fecha: '2026-11-04', nombreLibre: 'VA1 sintético', tarifa: 1 }).returning()
  return p
}

async function cuentas(tx: Tx, presupuestoId: string) {
  const filas = await tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, presupuestoId))
  const satelites = filas.length
    ? await tx.select().from(schema.lineasCerramiento)
      .where(inArray(schema.lineasCerramiento.lineaId, filas.map((fila) => fila.id)))
    : []
  return { lineas: filas.length, configuraciones: satelites.length, filas, satelites }
}

function alta(presupuestoId: string, configuracion: ConfiguracionCerramiento, vidrio: string | null) {
  return esquemaLinea.parse({
    presupuestoId, tipo: 'CERRAMIENTO', codigo: 'GRUPO', cantidad: 1,
    serieCodigo: materiales.serieCodigo, vidrioCodigo: vidrio ?? undefined,
    acabadoCodigo: materiales.acabadoCodigo,
    configuracionCerramiento: JSON.stringify(configuracion),
  })
}

describe('aceptar un cerramiento incompleto no escribe', () => {
  it('el alta rechazada no crea línea ni configuración y devuelve las faltas', async () => {
    try {
      await db.transaction(async tx => {
        const p = await documento(tx)
        const antes = await cuentas(tx, p.id)
        const sinVidrio = await altaCerramientoValorado(tx, alta(p.id, elemento(), null))
        const sinUnion = await altaCerramientoValorado(tx, alta(p.id, conUnionVacia(), materiales.vidrioCodigo))
        expect(sinVidrio.ok).toBe(false)
        expect(sinUnion.ok).toBe(false)
        if (sinVidrio.ok || sinUnion.ok) return
        expect(sinVidrio.errores.configuracionCerramiento.join(' ')).toContain('Datos incompletos para el Elemento')
        expect(sinVidrio.errores.configuracionCerramiento.join(' ')).toContain('falta vidrio')
        expect(sinUnion.errores.configuracionCerramiento.join(' ')).toContain('Debe seleccionar el Perfil de Unión y su Acabado')
        expect(await cuentas(tx, p.id)).toMatchObject(antes)
        throw rollback
      })
    } catch (error) { if (error !== rollback) throw error }
  })

  it('con materiales completos guarda; editar sin ellos no reescribe la línea', async () => {
    try {
      await db.transaction(async tx => {
        const p = await documento(tx)
        const configuracion = elemento()
        expect((await altaCerramientoValorado(tx, alta(p.id, configuracion, materiales.vidrioCodigo))).ok).toBe(true)
        const guardado = await cuentas(tx, p.id)
        expect(guardado.lineas).toBe(1)
        expect(guardado.configuraciones).toBe(1)
        expect(guardado.satelites[0]).toMatchObject(materiales)
        expect(guardado.satelites[0].configuracion).toEqual(configuracion)

        const rechazada = await actualizarCerramiento(tx, {
          presupuestoId: p.id, lineaId: guardado.filas[0].id,
          configuracionSerializada: JSON.stringify(configuracion),
          serieCodigo: materiales.serieCodigo, vidrioCodigo: null, acabadoCodigo: materiales.acabadoCodigo,
          varianteAcristalamiento: '2', referencia: 'NO DEBE GUARDARSE', cantidad: 4,
          horasFabricacion: '0', horasColocacion: '0',
        })
        expect(rechazada.ok).toBe(false)
        if (rechazada.ok) return
        expect(rechazada.errores.configuracionCerramiento.join(' ')).toContain('falta vidrio')
        expect(await cuentas(tx, p.id)).toEqual(guardado)

        const editada = await actualizarCerramiento(tx, {
          presupuestoId: p.id, lineaId: guardado.filas[0].id,
          configuracionSerializada: JSON.stringify(configuracion),
          ...materiales, varianteAcristalamiento: '2', referencia: 'REVISADO', cantidad: 2,
          horasFabricacion: '0', horasColocacion: '0',
        })
        expect(editada.ok).toBe(true)
        const despues = await cuentas(tx, p.id)
        expect(despues.filas[0]).toMatchObject({ id: guardado.filas[0].id, referencia: 'REVISADO', cantidad: '2.00' })
        expect(despues.configuraciones).toBe(1)
        throw rollback
      })
    } catch (error) { if (error !== rollback) throw error }
  })
})
