import { afterAll, describe, expect, it } from 'vitest'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { eq, sql } from 'drizzle-orm'
import { esquemaLinea } from '../lineas/esquema-linea.ts'
import { altaCerramientoValorado } from './alta-valorada.ts'
import { prepararAltaCerramiento } from './alta-cerramiento.ts'
import { actualizarCerramiento, escribirEdicionCerramiento } from './editar-cerramiento.ts'
import { leerDocumentoOrigen } from '../copia/leer-origen.ts'
import { copiarPresupuesto } from '../copia/copiar-presupuesto.ts'
import { OPCIONES_COPIA_IDENTICA } from '../copia/plan-copia.ts'
import { MAPA_VACIO, normalizarMapa } from '../copia/mapa-sustitucion.ts'
import { J04, configuracionJ04, sembrarCatalogoJ04 } from './catalogo-j04.fixture.ts'

const db = crearDb(urlDePruebasValidada(process.env.TEST_DATABASE_URL))
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
const rollback = new Error('J05 rollback de fixture')
export const entradaJ05 = (presupuestoId: string, cantidad = 2) => esquemaLinea.parse({
  presupuestoId, tipo: 'CERRAMIENTO', codigo: 'GRUPO', cantidad,
  configuracionCerramiento: JSON.stringify(configuracionJ04()), serieCodigo: J04.serie,
  acabadoCodigo: J04.acabado, vidrioCodigo: J04.vidrio, varianteAcristalamiento: '1',
  horasFabricacion: '1', horasColocacion: '0', referencia: 'J05 sintético',
})
async function caso(fn: (tx: Tx, id: string) => Promise<void>) {
  try { await db.transaction(async tx => {
    await sembrarCatalogoJ04(tx)
    await tx.insert(schema.articulos).values({ codigo: 'MO', descripcion: 'MO sintética', tipoMetraje: 'UD' }).onConflictDoNothing()
    await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'MO', acabadoCodigo: 'UNI', tarifa: 9, precio: '0.5' })
    const [p] = await tx.insert(schema.presupuestos).values({ numero: 989505, serie: 'J05', revision: 0,
      fecha: '2026-09-08', nombreLibre: 'QA J05 reversible', tarifa: 9 }).returning()
    await fn(tx, p.id)
    throw rollback
  }) } catch (error) { if (error !== rollback) throw error }
}
const documento = async (tx: Tx, id: string) => {
  const d = await leerDocumentoOrigen(tx, id)
  if (!d) throw new Error('Documento esperado ausente')
  return d
}
afterAll(() => db.$client.end())

describe('J05 línea valorada: servicio productivo y PostgreSQL', () => {
  it.each([[2, '311.66'], [3, '452.49']])('cantidad %s conserva MO de toda la línea', (cantidad, total) => caso(async (tx, id) => {
    expect((await altaCerramientoValorado(tx, entradaJ05(id, Number(cantidad)))).ok).toBe(true)
    const d = await documento(tx, id); const l = d.lineas[0]
    expect(l.linea).toMatchObject({ precioUnitario: '140.8300', total, valoracionCompleta: true })
    expect(l.resultadoCerramiento?.costeMateriales).toEqual({ completo: true, importe: '53.6720' })
    expect(l.despiece).toHaveLength(20)
    expect(l.despiece.filter(p => p.origenId === 'm1')).toHaveLength(9)
    expect(l.despiece.filter(p => p.origenId === 'm2')).toHaveLength(9)
    expect(l.despiece.filter(p => p.origenTipo === 'UNION')).toHaveLength(2)
    expect(l.despiece.find(p => p.origenId === 'm1' && p.origenOrdinal === 0)?.cantidad).toBe('2.000')
    expect(l.manoObra).toHaveLength(1)
    expect(l.manoObra[0]).toMatchObject({ horas: '1.00', minutos: '60.00', importe: '30.00' })
    expect(d.presupuesto.subtotal).toBe(total)
  }))
  it('cantidad 3 no reconstruye el total repartiendo un ajuste de un euro', () => caso(async (tx, id) => {
    await tx.update(schema.articulosPvp).set({ precio: '0.0167' }).where(eq(schema.articulosPvp.articuloCodigo, 'MO'))
    await altaCerramientoValorado(tx, entradaJ05(id, 3))
    const l = (await documento(tx, id)).lineas[0]
    expect(l.manoObra[0].importe).toBe('1.00')
    expect(l.linea.precioUnitario).toBe('140.8300')
    expect(l.linea.total).toBe('423.49')
  }))
  it('edición completa→incompleta→completa conserva identidad y elimina piezas antiguas', () => caso(async (tx, id) => {
    await altaCerramientoValorado(tx, entradaJ05(id))
    const original = (await documento(tx, id)).lineas[0]
    const e = { ...entradaJ05(id, 3), lineaId: original.linea.id,
      configuracionSerializada: JSON.stringify(configuracionJ04()), acabadoCodigo: 'INEXISTENTE' }
    expect((await actualizarCerramiento(tx, e)).ok).toBe(true)
    const incompleta = (await documento(tx, id)).lineas[0]
    expect(incompleta.linea).toMatchObject({ id: original.linea.id, orden: original.linea.orden, total: null, valoracionCompleta: false })
    expect(incompleta.resultadoCerramiento?.ventaMateriales).toEqual({ completo: false, importe: null })
    expect(incompleta.despiece.every(p => !original.despiece.some(o => o.id === p.id))).toBe(true)
    const cfg = configuracionJ04(); cfg.modulos[0].anchoMm = 1000
    expect((await actualizarCerramiento(tx, { ...e, acabadoCodigo: J04.acabado,
      configuracionSerializada: JSON.stringify(cfg), horasFabricacion: '0' })).ok).toBe(true)
    const final = (await documento(tx, id)).lineas[0]
    expect(final.linea).toMatchObject({ id: original.linea.id, orden: original.linea.orden, valoracionCompleta: true, cantidad: '3.00' })
    expect(final.resultadoCerramiento?.configuracion).toEqual(cfg)
    expect(final.despiece.some(p => p.origenId === 'm1' && p.largoCorteMm === '1200.00')).toBe(false)
    expect(final.manoObra).toEqual([])
    // m1 67.44 + m2 53.59 + unión 10.40 = 131.43, cantidad 3.
    expect(final.linea.total).toBe('394.29')
  }))
  it('MO pendiente y PVP_CERO conservan el diagnóstico del motor vigente', () => caso(async (tx, id) => {
    await tx.delete(schema.articulosPvp).where(eq(schema.articulosPvp.tarifa, 9))
    // Reponer materiales, manteniendo sólo MO sin precio.
    const precios = [['P','10'],['J','2'],['E','1'],['I','0.5'],['V','25'],['U','12'],['T','0.2']]
    await tx.insert(schema.articulosPvp).values(precios.map(([c, precio]) => ({ articuloCodigo: `QA-J04-${c}`, acabadoCodigo: J04.acabado, tarifa: 9, precio })))
    await altaCerramientoValorado(tx, entradaJ05(id))
    const l = (await documento(tx, id)).lineas[0]
    expect(l.linea.total).toBeNull(); expect(l.manoObra).toHaveLength(1)
    expect(l.manoObra[0].importe).toBeNull()
    await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'MO', acabadoCodigo: 'UNI', tarifa: 9, precio: '0' })
    await actualizarCerramiento(tx, { ...entradaJ05(id), lineaId: l.linea.id, configuracionSerializada: JSON.stringify(configuracionJ04()) })
    const cero = (await documento(tx, id)).lineas[0]
    expect(cero.linea.total).toBeNull()
    expect(cero.manoObra[0].motivoCodigo).toBe('PVP_CERO')
  }))
  it('restricción real tras satélites revierte edición y alta en todas las tablas', () => caso(async (tx, id) => {
    await altaCerramientoValorado(tx, entradaJ05(id))
    const antes = await documento(tx, id)
    // El fallo ocurre al escribir MO, después de configuración/snapshot/despiece.
    await tx.execute(sql`ALTER TABLE lineas_mano_obra ADD CONSTRAINT j05_fallo CHECK (horas <> 2) NOT VALID`)
    const e = { ...entradaJ05(id), horasFabricacion: '2' }
    await expect(actualizarCerramiento(tx, { ...e, lineaId: antes.lineas[0].linea.id,
      configuracionSerializada: e.configuracionCerramiento })).rejects.toThrow()
    expect(await documento(tx, id)).toEqual(antes)
    await expect(altaCerramientoValorado(tx, e)).rejects.toThrow()
    expect(await documento(tx, id)).toEqual(antes)
  }))
  it('copia exacta congela valoración incluso si cambia el catálogo y remapea sólo claves técnicas', () => caso(async (tx, id) => {
    await altaCerramientoValorado(tx, entradaJ05(id))
    const antes = await documento(tx, id)
    await tx.update(schema.articulosPvp).set({ precio: '999' }).where(eq(schema.articulosPvp.tarifa, 9))
    const copia = await copiarPresupuesto(tx, { presupuestoId: id, destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO }, creadoPor: 'qa-j05@local.test' })
    expect(copia.ok).toBe(true); if (!copia.ok) throw new Error('Copia falló')
    const d = await documento(tx, copia.presupuestoId)
    expect(await documento(tx, id)).toEqual({ ...antes, revisionesUsadas: [0, 1] })
    const l = d.lineas[0], o = antes.lineas[0]
    expect(l.linea.id).not.toBe(o.linea.id)
    expect(l.linea.total).toBe('311.66'); expect(l.resultadoCerramiento).toEqual(o.resultadoCerramiento)
    expect(d.presupuesto).toMatchObject({ revision: 1, creadoPor: 'qa-j05@local.test', subtotal: '311.66' })
    const sinIds = (filas: readonly { id: string; lineaId: string }[]) => filas.map(({ id: _id, lineaId: _lineaId, ...r }) => r)
    expect(sinIds(l.despiece)).toEqual(sinIds(o.despiece))
    expect(sinIds(l.manoObra)).toEqual(sinIds(o.manoObra))
    expect(l.manoObra[0].id).not.toBe(o.manoObra[0].id)
  }))
  it('el escritor heredado no puede dejar snapshot y geometría contradictorios', () => caso(async (tx, id) => {
    await altaCerramientoValorado(tx, entradaJ05(id))
    const antes = await documento(tx, id)
    const cfg = configuracionJ04(); cfg.modulos[0].anchoMm = 900
    const alta = prepararAltaCerramiento({ ...entradaJ05(id), configuracionSerializada: JSON.stringify(cfg) })
    if (!alta.ok) throw new Error('Alta de prueba no válida')
    await expect(escribirEdicionCerramiento(tx, { presupuestoId: id, lineaId: antes.lineas[0].linea.id,
      referencia: null, cantidad: 2, alta: alta.alta, manoObra: [], aviso: '' })).rejects.toThrow('revaloración completa')
    expect(await documento(tx, id)).toEqual(antes)
  }))
  it('rechaza sustitución obsoleta y descuentos antes de escribir', () => caso(async (tx, id) => {
    await altaCerramientoValorado(tx, entradaJ05(id))
    const antes = await documento(tx, id)
    const mapa = normalizarMapa([{ ambito: 'SERIE', origen: J04.serie, destino: 'OTRA' }])
    if (!mapa.ok) throw new Error('Mapa inválido')
    const copia = await copiarPresupuesto(tx, { presupuestoId: id, destino: { estrategia: 'MISMO_NUMERO_NUEVA_REVISION' },
      opciones: { ...OPCIONES_COPIA_IDENTICA, mapa: mapa.mapa } })
    expect(copia.ok).toBe(false); expect(await documento(tx, id)).toEqual(antes)
    await tx.update(schema.lineas).set({ descuento: '5' }).where(eq(schema.lineas.id, antes.lineas[0].linea.id))
    const descontado = await documento(tx, id)
    await expect(actualizarCerramiento(tx, { ...entradaJ05(id), lineaId: antes.lineas[0].linea.id,
      configuracionSerializada: JSON.stringify(configuracionJ04()) })).rejects.toThrow('descuentos')
    expect(await documento(tx, id)).toEqual(descontado)
  }))
})
