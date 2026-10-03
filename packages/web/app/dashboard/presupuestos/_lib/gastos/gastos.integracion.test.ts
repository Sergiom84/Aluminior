/** Comisión de cabecera contra el Postgres efímero; cada caso se revierte. */
import { afterAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { precioConComision } from '@aluminior/core/precios'
import { esquemaLinea } from '../lineas/esquema-linea.ts'
import { guardarLinea } from '../lineas/guardar-linea.ts'
import { altaCerramientoValorado } from '../cerramientos/alta-valorada.ts'
import { actualizarCerramiento } from '../cerramientos/editar-cerramiento.ts'
import { J04, configuracionJ04, sembrarCatalogoJ04 } from '../cerramientos/catalogo-j04.fixture.ts'
import { copiarPresupuesto } from '../copia/copiar-presupuesto.ts'
import { OPCIONES_COPIA_IDENTICA } from '../copia/plan-copia.ts'
import { MAPA_VACIO } from '../copia/mapa-sustitucion.ts'
import { actualizarGastos, leerGastos, MENSAJE_COMISION_CON_LINEAS } from './index.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
const rollback = new Error('rollback de fixture de comisión')
const entrada = (presupuestoId: string, cantidad = 2) => esquemaLinea.parse({
  presupuestoId, tipo: 'CERRAMIENTO', codigo: 'GRUPO', cantidad,
  configuracionCerramiento: JSON.stringify(configuracionJ04()), serieCodigo: J04.serie,
  acabadoCodigo: J04.acabado, vidrioCodigo: J04.vidrio, varianteAcristalamiento: '1',
  horasFabricacion: '1', horasColocacion: '0', referencia: 'comisión sintética',
})
async function caso(fn: (tx: Tx, id: string) => Promise<void>) {
  try { await db.transaction(async tx => {
    await sembrarCatalogoJ04(tx)
    await tx.insert(schema.articulos).values({ codigo: 'MO', descripcion: 'MO sintética', tipoMetraje: 'UD' }).onConflictDoNothing()
    await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'MO', acabadoCodigo: 'UNI', tarifa: 9, precio: '0.5' })
    const [p] = await tx.insert(schema.presupuestos).values({ numero: 989527, serie: 'C27', revision: 0,
      fecha: '2026-10-03', nombreLibre: 'QA comisión reversible', tarifa: 9 }).returning()
    await fn(tx, p.id)
    throw rollback
  }) } catch (error) { if (error !== rollback) throw error }
}
const gastos = (tx: Tx, presupuestoId: string, comisionPorc: string, sumar: boolean) =>
  actualizarGastos(tx, { presupuestoId, comisionPorc, ...(sumar ? { sumarComision: 'on' } : {}) })
const lineas = (tx: Tx, id: string) => tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, id))
afterAll(() => db.$client.end())

describe('comisión sumada de la cabecera', () => {
  it('el GRUPO lleva el factor en precio y total; el resultado guardado queda en base', async () => {
    let base: { precioUnitario: string | null; total: string | null } | null = null
    let ventaBase: unknown = null
    await caso(async (tx, id) => {
      await altaCerramientoValorado(tx, entrada(id))
      const [l] = await lineas(tx, id)
      base = { precioUnitario: l.precioUnitario, total: l.total }
      ventaBase = (await tx.select().from(schema.lineasCerramientoResultados))
        .find(r => r.lineaId === l.id)?.resultado
    })
    expect(base!.precioUnitario).not.toBeNull()
    await caso(async (tx, id) => {
      expect(await gastos(tx, id, '-10', true)).toMatchObject({ ok: true })
      await altaCerramientoValorado(tx, entrada(id))
      const [l] = await lineas(tx, id)
      expect(Number(l.precioUnitario)).toBe(Number(precioConComision(base!.precioUnitario!, '-10')))
      expect(l.total).toBe(precioConComision(base!.total!, '-10'))
      const [r] = await tx.select().from(schema.lineasCerramientoResultados)
        .where(eq(schema.lineasCerramientoResultados.lineaId, l.id))
      expect(r.resultado).toEqual(ventaBase)
      const [p] = await tx.select().from(schema.presupuestos).where(eq(schema.presupuestos.id, id))
      expect(p.subtotal).toBe(l.total)

      const editada = await actualizarCerramiento(tx, { ...entrada(id, 3), lineaId: l.id,
        configuracionSerializada: JSON.stringify(configuracionJ04()) })
      expect(editada.ok).toBe(true)
      const [e] = await lineas(tx, id)
      expect(Number(e.precioUnitario)).toBe(Number(precioConComision(base!.precioUnitario!, '-10')))
    })
  })

  it('no cambia la comisión sumada con líneas valoradas; sí el porcentaje sin sumar', () => caso(async (tx, id) => {
    expect(await gastos(tx, id, '15', false)).toMatchObject({ ok: true })
    await altaCerramientoValorado(tx, entrada(id))
    const antes = await lineas(tx, id)
    expect(await gastos(tx, id, '15', true)).toEqual({ ok: false,
      errores: { comisionPorc: [MENSAJE_COMISION_CON_LINEAS] }, mensaje: 'Revisa los gastos' })
    expect(await gastos(tx, id, '20', false)).toMatchObject({ ok: true })
    expect(await leerGastos(tx, id)).toEqual({ comisionPorc: '20.00', sumarComision: false })
    expect(await lineas(tx, id)).toEqual(antes)
    await tx.delete(schema.lineas).where(eq(schema.lineas.presupuestoId, id))
    expect(await gastos(tx, id, '20', true)).toMatchObject({ ok: true })
  }))

  it('una estructura valorada con otra comisión no se escribe', () => caso(async (tx, id) => {
    await gastos(tx, id, '10', true)
    const escritura = (comisionPorc: string | null) => guardarLinea(tx, { tipo: 'ESTRUCTURA', comisionPorc,
      valores: { presupuestoId: id, descripcion: 'ESTRUCTURA SINTÉTICA', cantidad: '1', precioUnitario: '110.00', total: '110.00' },
      estructura: { serieCodigo: J04.serie, estructuraCodigo: 'SINTETICA', acabadoCodigo: null,
        piezas: [], acristalamiento: [], opcionesHerraje: [] } })
    await expect(escritura(null)).rejects.toThrow('comisión del presupuesto ha cambiado')
    await expect(escritura('10.00')).resolves.toEqual(expect.any(String))
  }))

  it('la copia conserva los gastos junto a los precios con comisión', () => caso(async (tx, id) => {
    await gastos(tx, id, '5', true)
    await altaCerramientoValorado(tx, entrada(id))
    const copia = await copiarPresupuesto(tx, { presupuestoId: id, destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO } })
    if (!copia.ok) throw new Error('Copia falló')
    expect(await leerGastos(tx, copia.presupuestoId)).toEqual({ comisionPorc: '5.00', sumarComision: true })
  }))
})
