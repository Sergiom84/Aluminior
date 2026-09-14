import { afterAll, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { presupuestoIncompleto } from '@aluminior/core/precios'
import { actualizarArticulo } from '../articulos/edicion/editar'
import { contextoEdicion } from './edicion.fixture'

const c = contextoEdicion()
afterAll(c.cerrar)
it.each(['descuento', 'descuentoPp', 'recargoEquivalencia', 'retencion'] as const)(
  'cabecera con %s conserva referencia e importes y rechaza cantidad', async campo => {
    const { p, l } = await c.preparar()
    await c.db.update(schema.presupuestos).set({ [campo]: '5', baseImponible: '38', total: '45.98' })
      .where(eq(schema.presupuestos.id, p.id))
    const antes = await c.leer(p.id)
    expect((await actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '3', referencia: 'No' })).ok).toBe(false)
    expect(await c.leer(p.id)).toEqual(antes)
    expect((await actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '2', referencia: 'Sí' })).ok).toBe(true)
    expect(await c.leer(p.id)).toEqual({ cabecera: antes.cabecera, lineas: [{ ...l, referencia: 'Sí' }] })
  })
it('conserva bloqueoPrecios sin atribuirle una política nueva de cantidad', async () => {
  const { p, l } = await c.preparar()
  await c.db.update(schema.presupuestos).set({ bloqueoPrecios: true }).where(eq(schema.presupuestos.id, p.id))
  expect((await actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '3' })).ok).toBe(true)
  const despues = await c.leer(p.id)
  expect(despues.cabecera[0].bloqueoPrecios).toBe(true)
  expect(despues.lineas[0].precioUnitario).toBe('20.0000')
})
it('edita cantidad con PVP guardado aunque cambie catálogo; conserva identidad y contenido', async () => {
  const { p, l } = await c.preparar(), codigo = c.serie
  await c.db.insert(schema.articulos).values({ codigo, descripcion: 'Catálogo diferente', tipoMetraje: 'UD' })
  await c.db.insert(schema.articulosPvp).values({ articuloCodigo: codigo, acabadoCodigo: 'UNI', tarifa: 1, precio: '99' })
  try {
    await c.db.update(schema.lineas).set({ articuloCodigo: codigo }).where(eq(schema.lineas.id, l.id))
    const antes = await c.leer(p.id)
    expect((await actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '3', referencia: 'Después' })).ok).toBe(true)
    const despues = await c.leer(p.id)
    expect(despues.lineas[0]).toEqual({ ...antes.lineas[0], cantidad: '3.00', referencia: 'Después', total: '60.00' })
    expect(despues.cabecera[0]).toEqual({ ...antes.cabecera[0], subtotal: '60.00', baseImponible: '60.00', cuotaIva: '12.60', total: '72.60' })
  } finally {
    await c.db.update(schema.lineas).set({ articuloCodigo: null }).where(eq(schema.lineas.id, l.id))
    await c.db.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, codigo))
    await c.db.delete(schema.articulos).where(eq(schema.articulos.codigo, codigo))
  }
})
it.each([
  { descuento: '10', total: '36' }, { descuento2: '10', total: '36' }, { pvpManual: true },
  { costeManual: '1' }, { total: '39' }, { total: null },
])('histórico %j conserva importes al editar ubicación y rechaza cantidad', async cambios => {
  const { p, l } = await c.preparar()
  await c.db.update(schema.lineas).set(cambios).where(eq(schema.lineas.id, l.id))
  const antes = await c.leer(p.id)
  expect((await actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '3', referencia: 'No' })).ok).toBe(false)
  expect(await c.leer(p.id)).toEqual(antes)
  expect((await actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '2', referencia: 'Sólo ubicación' })).ok).toBe(true)
  expect(await c.leer(p.id)).toEqual({ cabecera: antes.cabecera,
    lineas: [{ ...antes.lineas[0], referencia: 'Sólo ubicación' }] })
})
it('preserva ausencia coherente y cero legítimo, y documento mixto incompleto', async () => {
  const { p, l } = await c.preparar()
  await c.db.update(schema.lineas).set({ precioUnitario: null, total: null, valoracionCompleta: false,
    avisoValoracion: 'Ausente' }).where(eq(schema.lineas.id, l.id))
  expect((await actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '3', referencia: 'Nulo' })).ok).toBe(true)
  expect((await c.leer(p.id)).lineas[0]).toMatchObject({ precioUnitario: null, total: null, valoracionCompleta: false, avisoValoracion: 'Ausente' })
  await c.db.update(schema.lineas).set({ precioUnitario: '0', total: '0', valoracionCompleta: true }).where(eq(schema.lineas.id, l.id))
  await c.db.insert(schema.lineas).values({ presupuestoId: p.id, orden: 8, tipo: 'CERRAMIENTO', descripcion: 'Incompleto', total: null, valoracionCompleta: false })
  expect((await actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '4', referencia: 'Cero' })).ok).toBe(true)
  const d = await c.leer(p.id)
  expect(d.lineas.find(f => f.id === l.id)).toMatchObject({ total: '0.00', precioUnitario: '0.0000' })
  expect(presupuestoIncompleto(d.lineas)).toBe(true)
})
it('rechaza presupuesto ajeno, tipo distinto, estado y campos monetarios sin escritura', async () => {
  const { p, l } = await c.preparar(), otro = await c.preparar()
  const d = { presupuestoId: p.id, lineaId: l.id, cantidad: '3' }
  expect((await actualizarArticulo(c.db, { ...d, presupuestoId: otro.p.id })).ok).toBe(false)
  expect((await actualizarArticulo(c.db, { ...d, precioUnitario: '1' })).ok).toBe(false)
  await c.db.update(schema.lineas).set({ tipo: 'ESTRUCTURA' }).where(eq(schema.lineas.id, l.id))
  expect((await actualizarArticulo(c.db, d)).ok).toBe(false)
  await c.db.update(schema.lineas).set({ tipo: 'ARTICULO' }).where(eq(schema.lineas.id, l.id))
  for (const estado of ['ACEPTADO', 'RECHAZADO', 'ANULADO']) {
    await c.db.update(schema.presupuestos).set({ estado }).where(eq(schema.presupuestos.id, p.id))
    const antes = await c.leer(p.id)
    expect((await actualizarArticulo(c.db, d)).ok).toBe(false)
    expect(await c.leer(p.id)).toEqual(antes)
  }
})
it('conserva política de redondeo vigente y rechaza importe fuera del rango SQL', async () => {
  const { p, l } = await c.preparar()
  await c.db.update(schema.lineas).set({ precioUnitario: '1.0050', total: '2.01' }).where(eq(schema.lineas.id, l.id))
  expect((await actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '3' })).ok).toBe(true)
  expect((await c.leer(p.id)).lineas[0]).toMatchObject({ precioUnitario: '1.0050', total: '3.01' })
  await c.db.update(schema.lineas).set({ cantidad: '1', precioUnitario: '99999999', total: '99999999' }).where(eq(schema.lineas.id, l.id))
  const antes = await c.leer(p.id)
  expect((await actualizarArticulo(c.db, { presupuestoId: p.id, lineaId: l.id, cantidad: '99999999' })).ok).toBe(false)
  expect(await c.leer(p.id)).toEqual(antes)
})
