import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { crearConfiguracionCerramiento, plantillaDiseno } from '@aluminior/core/estructuras'
import { guardarLinea } from '../lineas/guardar-linea.ts'
import { prepararAltaCerramiento } from './alta-cerramiento.ts'
import { actualizarCerramiento, escribirEdicionCerramiento } from './editar-cerramiento.ts'
import type { SnapshotManoObra } from '../mano-obra/index.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE = 'PRUEBA AUTOMÁTICA EDICIÓN CERRAMIENTO'

const configuracion = (ancho: number, alto: number) => {
  const base = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
  return { ...base, modulos: [{ ...base.modulos[0], anchoMm: ancho, altoMm: alto }] }
}

const preparar = (ancho: number, alto: number) => {
  const resultado = prepararAltaCerramiento({
    configuracionSerializada: JSON.stringify(configuracion(ancho, alto)),
    serieCodigo: 'QA-RPT', vidrioCodigo: 'V420AGS4', acabadoCodigo: 'MAD',
    varianteAcristalamiento: '2',
  })
  if (!resultado.ok) throw new Error('Configuración de prueba no válida')
  return resultado.alta
}

const snapshot = (): SnapshotManoObra => ({
  concepto: 'COLOCACION', origen: 'MANUAL', horas: '1.00', minutos: '60.00',
  articuloCodigo: 'MOCOL', articuloDescripcion: 'MANO DE OBRA COLOCACIÓN',
  unidad: 'MINUTO', acabadoCodigo: 'UNI', tarifa: 1,
  precioMinuto: '0.5000', importe: '30.00', costeMinuto: '0.5000', costeTotal: '30.00',
  valoracionCompleta: true, motivoCodigo: null, motivoCosteCodigo: null,
})

describe('edición atómica de un CERRAMIENTO', () => {
  let db: ReturnType<typeof crearDb>
  let presupuestoId = ''
  let otroPresupuestoId = ''
  let lineaId = ''

  const limpiar = () => db.delete(schema.presupuestos).where(eq(schema.presupuestos.nombreLibre, NOMBRE))

  beforeAll(async () => {
    db = crearDb(urlPruebas)
    await limpiar()
    await db.insert(schema.articulos).values([
      { codigo: 'MO', descripcion: 'MANO DE OBRA TALLER', tipoMetraje: 'UD' },
      { codigo: 'MOCOL', descripcion: 'MANO DE OBRA COLOCACIÓN', tipoMetraje: 'UD' },
    ]).onConflictDoNothing()
    await db.insert(schema.articulosPvp).values([
      { articuloCodigo: 'MO', acabadoCodigo: 'UNI', tarifa: 1, precio: '0.5000' },
      { articuloCodigo: 'MOCOL', acabadoCodigo: 'UNI', tarifa: 1, precio: '0.5000' },
    ]).onConflictDoNothing()
    await db.insert(schema.articulosCoste).values([
      { articuloCodigo: 'MO', proveedorCodigo: 'PRUEBA-EDICION', acabadoCodigo: 'UNI', coste: '0.5000' },
      { articuloCodigo: 'MOCOL', proveedorCodigo: 'PRUEBA-EDICION', acabadoCodigo: 'UNI', coste: '0.5000' },
    ]).onConflictDoNothing()
    const documentos = await db.insert(schema.presupuestos).values([
      { numero: 999991, revision: 0, serie: 'A', fecha: '2026-08-15', nombreLibre: NOMBRE, tarifa: 1 },
      { numero: 999992, revision: 0, serie: 'A', fecha: '2026-08-15', nombreLibre: NOMBRE, tarifa: 1 },
    ]).returning({ id: schema.presupuestos.id })
    presupuestoId = documentos[0].id
    otroPresupuestoId = documentos[1].id
    const alta = preparar(1200, 1200)
    lineaId = await guardarLinea(db, {
      tipo: 'CERRAMIENTO',
      valores: {
        presupuestoId, orden: 7, descripcion: alta.descripcion, referencia: 'SALÓN', cantidad: '1',
        anchoMm: alta.anchoMm, altoMm: alta.altoMm, precioUnitario: null, total: null,
        valoracionCompleta: false, avisoValoracion: alta.aviso,
      },
      cerramiento: alta, manoObra: [],
    })
  }, 60_000)

  afterAll(async () => { await limpiar() })

  it('hidrata cambios sobre la misma línea, incluidos satélite y horas', async () => {
    const resultado = await actualizarCerramiento(db, {
      presupuestoId, lineaId, configuracionSerializada: JSON.stringify(configuracion(1800, 1450)),
      serieCodigo: 'QA-RPT', vidrioCodigo: 'V420AGS4', acabadoCodigo: 'MAD',
      varianteAcristalamiento: '1', referencia: 'COCINA', cantidad: 2,
      horasFabricacion: '1.25', horasColocacion: '0.50',
    })
    expect(resultado.ok).toBe(true)

    const lineas = await db.select().from(schema.lineas)
      .where(eq(schema.lineas.presupuestoId, presupuestoId))
    expect(lineas).toHaveLength(1)
    expect(lineas[0]).toMatchObject({
      id: lineaId, orden: 7, referencia: 'COCINA', cantidad: '2.00', anchoMm: 1800, altoMm: 1450,
      precioUnitario: null, total: null, valoracionCompleta: false,
    })
    const [satelite] = await db.select().from(schema.lineasCerramiento)
      .where(eq(schema.lineasCerramiento.lineaId, lineaId))
    expect(satelite).toMatchObject({
      serieCodigo: 'QA-RPT', vidrioCodigo: 'V420AGS4', acabadoCodigo: 'MAD',
      varianteAcristalamiento: '1', configuracion: configuracion(1800, 1450),
    })
    const horas = await db.select().from(schema.lineasManoObra)
      .where(eq(schema.lineasManoObra.lineaId, lineaId))
    expect(horas.map((fila) => [fila.concepto, fila.horas]).sort()).toEqual([
      ['COLOCACION', '0.50'], ['FABRICACION_ADICIONAL', '1.25'],
    ])
  })

  it('rechaza presupuesto ajeno y tipos distintos de CERRAMIENTO', async () => {
    const alta = preparar(1300, 1300)
    expect(await escribirEdicionCerramiento(db, {
      presupuestoId: otroPresupuestoId, lineaId, referencia: null, cantidad: 1,
      alta, manoObra: [], aviso: alta.aviso,
    })).toBe(false)

    const [articulo] = await db.insert(schema.lineas).values({
      presupuestoId, orden: 8, tipo: 'ARTICULO', descripcion: 'ARTÍCULO', cantidad: '1',
    }).returning({ id: schema.lineas.id })
    expect(await escribirEdicionCerramiento(db, {
      presupuestoId, lineaId: articulo.id, referencia: null, cantidad: 1,
      alta, manoObra: [], aviso: alta.aviso,
    })).toBe(false)
  })

  it('restaura línea y satélites si falla la segunda mano de obra', async () => {
    const antesLinea = await db.select().from(schema.lineas).where(eq(schema.lineas.id, lineaId))
    const antesCerramiento = await db.select().from(schema.lineasCerramiento)
      .where(eq(schema.lineasCerramiento.lineaId, lineaId))
    const antesHoras = await db.select().from(schema.lineasManoObra)
      .where(eq(schema.lineasManoObra.lineaId, lineaId))
    const alta = preparar(900, 900)

    await expect(escribirEdicionCerramiento(db, {
      presupuestoId, lineaId, referencia: 'FALLO', cantidad: 9,
      alta, manoObra: [snapshot(), snapshot()], aviso: alta.aviso,
    })).rejects.toThrow(/mano_obra_linea_concepto_uq/)

    expect(await db.select().from(schema.lineas).where(eq(schema.lineas.id, lineaId))).toEqual(antesLinea)
    expect(await db.select().from(schema.lineasCerramiento)
      .where(eq(schema.lineasCerramiento.lineaId, lineaId))).toEqual(antesCerramiento)
    expect(await db.select().from(schema.lineasManoObra)
      .where(eq(schema.lineasManoObra.lineaId, lineaId))).toEqual(antesHoras)
  })
})
