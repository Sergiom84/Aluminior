import { afterAll, describe, expect, it } from 'vitest'
import { schema } from '@aluminior/db'
import { eq } from 'drizzle-orm'
import { pendientesDePrecio } from '@aluminior/core/estructuras'
import { altaLinea } from '../../lineas/alta-linea.ts'
import { valorarCerramiento } from '../../cerramientos/valorar-cerramiento.ts'
import { leerResultadoCerramiento } from '../../cerramientos/resultado-persistido.ts'
import { aplicarPreciosLinea } from '../../precios-manuales/index.ts'
import { caso, db, entrada } from './catalogo-qa-corr.fixture.ts'

afterAll(() => db.$client.end({ timeout: 5 }))

describe('piezas sin PVP y precio puesto por el operador', () => {
  it('el GRUPO deja el felpudo sin PVP pendiente de precio y el precio manual lo valora', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: 'C2', descripcion: 'Corredera de prueba' })
    await tx.update(schema.estructuraPlantillaCatalogo).set({ estructuraCodigo: 'C2' })
      .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'))
    await tx.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, 'QA-FELPUDO'))
    const base = { version: 1 as const, modulos: [{ id: 'sintetico', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1300 }], uniones: [] }
    const pendiente = await valorarCerramiento(tx, { ...entrada, configuracion: base })
    expect(pendiente.ventaMateriales.completo).toBe(false)
    const [felpudo, ...resto] = pendientesDePrecio(pendiente)
    expect(resto).toEqual([])
    expect(felpudo).toMatchObject({ articulo: 'QA-FELPUDO', tipoMetraje: 'ML' })
    const precios = [{ articulo: felpudo!.articulo, acabado: felpudo!.acabado, unidad: 'ML' as const, precio: 1 }]
    const valorado = await valorarCerramiento(tx, { ...entrada, configuracion: { ...base, preciosManuales: precios } })
    expect(valorado.ventaMateriales).toEqual({ completo: true, importe: '139.56' })
    expect(pendientesDePrecio(valorado)).toEqual([])
    expect(valorado.origenes[0]!.diagnosticos.find(d => d.codigo === 'AVISO_VALORACION')?.detalle)
      .toContain('precio puesto a mano: QA-FELPUDO')
  }))
  it('el operador pone precio en la obra o en la tarifa y la línea se revalora', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: 'C2', descripcion: 'Corredera de prueba' })
    await tx.update(schema.estructuraPlantillaCatalogo).set({ estructuraCodigo: 'C2' })
      .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'))
    await tx.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, 'QA-FELPUDO'))
    const [presupuesto] = await tx.insert(schema.presupuestos).values({ numero: 999997, revision: 0, serie: 'A',
      fecha: '2026-11-10', nombreLibre: 'QA PRECIO MANUAL', obraTexto: 'QA', tarifa: 1, estado: 'PENDIENTE' })
      .returning({ id: schema.presupuestos.id })
    const configuracion = { version: 1, modulos: [{ id: 'm1', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1300 }], uniones: [] }
    const alta = await altaLinea(tx as unknown as Parameters<typeof altaLinea>[0], {
      presupuestoId: presupuesto!.id, tipo: 'CERRAMIENTO', codigo: 'GRUPO', serieCodigo: 'QA-SERIE', referencia: null,
      vidrioCodigo: 'QA-VIDRIO', opcionAcristalamiento: 1, varianteAcristalamiento: '2', cantidad: 1, anchoMm: 1200,
      altoMm: 1300, acabadoCodigo: 'L', configuracionCerramiento: JSON.stringify(configuracion), horasFabricacion: '0', horasColocacion: '0',
    }, ['QA-HERR|1'])
    expect(alta.ok).toBe(true)
    const [linea] = await tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, presupuesto!.id))
    expect(linea!.valoracionCompleta).toBe(false)
    const resultado = await leerResultadoCerramiento(tx, linea!.id)
    const [felpudo] = pendientesDePrecio(resultado!)
    const precio = { articulo: 'QA-FELPUDO', acabado: felpudo!.acabado, unidad: 'ML' as const, precio: 1 }
    const base = { presupuestoId: presupuesto!.id, lineaId: linea!.id }

    expect(await aplicarPreciosLinea(tx, { ...base, destino: 'TARIFA', precios: [{ ...precio, unidad: 'UD' }] }))
      .toMatchObject({ ok: false })
    expect(await aplicarPreciosLinea(tx, { ...base, destino: 'OBRA', precios: [precio] })).toMatchObject({ ok: true })
    const [enObra] = await tx.select().from(schema.lineas).where(eq(schema.lineas.id, linea!.id))
    expect(enObra).toMatchObject({ valoracionCompleta: true, precioUnitario: '139.5600' })
    expect(await tx.select().from(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, 'QA-FELPUDO'))).toEqual([])
    const [guardada] = await tx.select().from(schema.lineasCerramiento).where(eq(schema.lineasCerramiento.lineaId, linea!.id))
    expect(guardada!.configuracion).toMatchObject({ preciosManuales: [{ articulo: 'QA-FELPUDO', precio: 1 }] })

    await tx.update(schema.lineasCerramiento).set({ configuracion }).where(eq(schema.lineasCerramiento.lineaId, linea!.id))
    expect(await aplicarPreciosLinea(tx, { ...base, destino: 'TARIFA', precios: [precio] })).toMatchObject({ ok: true })
    const [enTarifa] = await tx.select().from(schema.lineas).where(eq(schema.lineas.id, linea!.id))
    expect(enTarifa).toMatchObject({ valoracionCompleta: true, precioUnitario: '139.5600' })
    expect(await tx.select({ precio: schema.articulosPvp.precio, deUsuario: schema.articulosPvp.deUsuario }).from(schema.articulosPvp)
      .where(eq(schema.articulosPvp.articuloCodigo, 'QA-FELPUDO'))).toEqual([{ precio: '1.0000', deUsuario: true }])
    await aplicarPreciosLinea(tx, { ...base, destino: 'TARIFA', precios: [{ ...precio, precio: 5 }] })
    expect((await tx.select({ precio: schema.articulosPvp.precio }).from(schema.articulosPvp)
      .where(eq(schema.articulosPvp.articuloCodigo, 'QA-FELPUDO')))[0]!.precio).toBe('1.0000')
  }))
})
